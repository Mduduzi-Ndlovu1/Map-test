const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Import CORS middleware
const cloudinary = require('cloudinary').v2; // Import Cloudinary
const app = express();

// Set up Cloudinary configuration
 // Configuration
 cloudinary.config({ 
  cloud_name: 'dcbd1eavw', 
  api_key: '613477935675545', 
  api_secret: 'eLIUoc8MEntQCo68oWvyNCItc9U' // Click 'View API Keys' above to copy your API secret
});

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all origins (can be restricted to a specific origin later)

// MongoDB setup
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://mduduzindlovu02:maqGSNqbUEhh6KFJ@notesmanagerv2.1gdnh.mongodb.net/?';
mongoose.connect(mongoURI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
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

// API Routes
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts', error: err.message });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { name, surname, description, latitude, longitude } = req.body;

    // Upload image to Cloudinary
    if (req.files && req.files.image) {
      const image = req.files.image;
      cloudinary.uploader.upload(image.tempFilePath, { folder: 'posts' }, async (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to upload image', error: err.message });
        }
        const imageUrl = result.secure_url; // Get the image URL from Cloudinary response

        const newPost = new Post({
          name,
          surname,
          description,
          latitude,
          longitude,
          imageUrl,
          comments: [],
        });

        await newPost.save();
        res.json({ post: newPost });
      });
    } else {
      // Handle case where no image is provided
      const newPost = new Post({
        name,
        surname,
        description,
        latitude,
        longitude,
        imageUrl: '',
        comments: [],
      });

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
  console.log(`Server running on ${process.env.PUBLIC_URL}:${port}`);
});
