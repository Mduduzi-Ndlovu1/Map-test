const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Import CORS middleware
const cloudinary = require('cloudinary').v2; // Import Cloudinary SDK
const app = express();

// Cloudinary Configuration
cloudinary.config({ 
  cloud_name: 'dcbd1eavw', 
  api_key: '613477935675545', 
  api_secret: 'eLIUoc8MEntQCo68oWvyNCItc9U' 
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

// Set up multer to handle image uploads (in-memory storage for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

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
    let imageUrl = '';

    if (req.file) {
      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'auto'
      });

      imageUrl = result.secure_url;
    }

    const newPost = new Post({ 
      name, 
      surname, 
      description, 
      latitude, 
      longitude, 
      imageUrl, 
      comments: [] 
    });

    await newPost.save();
    res.json({ post: newPost });
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
  try {
    const { author, text } = req.body;
    
    if (!author || !text) {
      return res.status(400).json({ message: 'Author and text are required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({ author, text });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment', error: err.message });
  }
});

// Start server
const port = process.env.PORT || 5000;
const publicUrl = process.env.PUBLIC_URL || 'https://map-test-1.netlify.app'; // Set your public URL here
app.listen(port, () => {
  console.log(`Server running on ${publicUrl}:${port}`);
});
