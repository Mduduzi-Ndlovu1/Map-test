const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Import CORS middleware
const { v2: cloudinary } = require('cloudinary');
const app = express();

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'dcbd1eavw',
  api_key: '613477935675545',
  api_secret: 'eLIUoc8MEntQCo68oWvyNCItc9U',
});

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all origins (can be restricted to a specific origin later)

// MongoDB setup
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://mduduzindlovu02:maqGSNqbUEhh6KFJ@notesmanagerv2.1gdnh.mongodb.net/?';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

// Define Post schema
const postSchema = new mongoose.Schema({
  name: String,
  surname: String,
  description: String,
  imageUrl: String,
  latitude: Number,
  longitude: Number,
  comments: [{ author: String, text: String }],
});

const Post = mongoose.model('Post', postSchema);

// Set up multer storage (temporary storage before uploading to Cloudinary)
const storage = multer.memoryStorage(); // Store image in memory temporarily
const upload = multer({ storage }); // Using memory storage for faster uploads

// API Routes
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts', error: err.message });
  }
});

app.post('/api/posts', upload.single('image'), async (req, res) => {
  try {
    const { name, surname, description, latitude, longitude } = req.body;

    if (req.file) {
      // Upload the image to Cloudinary from memory
      const result = await cloudinary.uploader.upload_stream({ 
        resource_type: 'image',
        folder: 'uploads', // Optional: set a folder for Cloudinary
      }, async (error, result) => {
        if (error) {
          return res.status(500).json({ message: 'Cloudinary upload failed', error: error.message });
        }
        
        const imageUrl = result.secure_url; // Cloudinary image URL
        const newPost = new Post({ name, surname, description, latitude, longitude, imageUrl, comments: [] });
        
        await newPost.save();
        res.json({ post: newPost });
      });

      // Create a readable stream from the buffer and pipe it to Cloudinary
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer); // Convert the buffer to a stream
      bufferStream.pipe(result);
    } else {
      const newPost = new Post({ name, surname, description, latitude, longitude, imageUrl: '', comments: [] });
      await newPost.save();
      res.json({ post: newPost });
    }

  } catch (err) {
    res.status(500).json({ message: 'Failed to create post', error: err.message });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch post', error: err.message });
  }
});

app.post('/api/posts/:id/comments', async (req, res) => {
  const { author, text } = req.body;
  
  if (!author || !text) {
    return res.status(400).json({ message: 'Author and text are required' });
  }

  const post = await Post.findById(req.params.id);
  post.comments.push({ author, text });
  await post.save();
  res.json(post);
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
