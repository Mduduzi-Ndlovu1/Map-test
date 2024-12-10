const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Import CORS middleware
const { v2: cloudinary } = require('cloudinary');
const app = express();

// Cloudinary Configuration
cloudinary.config({ 
  cloud_name: 'dcbd1eavw', 
  api_key: '613477935675545', 
  api_secret: 'eLIUoc8MEntQCo68oWvyNCItc9U' // Use your actual Cloudinary API credentials
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

// Updated post creation route to use Cloudinary for image storage
app.post('/api/posts', async (req, res) => {
  try {
    const { name, surname, description, latitude, longitude, image } = req.body;

    // If an image is provided, upload it to Cloudinary
    let imageUrl = '';
    if (image) {
      // Upload image to Cloudinary (assumes base64 encoded image)
      const uploadedImage = await cloudinary.uploader.upload(image, {
        folder: 'post_images', // Optional: Organize images into a folder in Cloudinary
      });
      imageUrl = uploadedImage.secure_url; // Cloudinary URL
    }

    const newPost = new Post({
      name,
      surname,
      description,
      latitude,
      longitude,
      imageUrl, // Store the Cloudinary image URL
      comments: [],
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
