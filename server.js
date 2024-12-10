const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // 
const app = express();

const cloudinary = require('cloudinary').v2;

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); 

// Set up Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up static folder for images
// Replace with public URL for production
const publicUrl = process.env.PUBLIC_URL || 'https://map-test-xid1.onrender.com'; // Set your public URL here
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadImageToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'posts',
      resource_type: 'auto',
    });
    return result.secure_url;  // Return the image URL from Cloudinary
  } catch (err) {
    console.error('Error uploading to Cloudinary:', err);  // Log error
    throw err;
  }
};

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
  latitude: {
    type: Number,
    required: true,
    validate: {
      validator: (value) => !isNaN(value),
      message: 'Latitude must be a valid number'
    }
  },
  longitude: {
    type: Number,
    required: true,
    validate: {
      validator: (value) => !isNaN(value),
      message: 'Longitude must be a valid number'
    }
  },
  comments: [{ author: String, text: String }],
});

const Post = mongoose.model('Post', postSchema);

// Set up file upload
const storage = multer.memoryStorage();

const upload = multer({ storage });

// API Routes
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    
    // Validate coordinates before sending the response
    const validPosts = posts.filter(post => 
      typeof post.latitude === 'number' && typeof post.longitude === 'number'
    );

    res.json(validPosts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts', error: err.message });
  }
});

app.post('/api/posts', upload.single('image'), async (req, res) => {
  try {
    const { name, surname, description, latitude, longitude } = req.body;

    // Validate latitude and longitude
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: 'Invalid latitude or longitude' });
    }

    // Use Cloudinary for image URL
    const imageUrl = req.file ? await uploadImageToCloudinary(req.file) : ''; // Save image URL from Cloudinary

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
  } catch (err) {
    console.error('Error creating post:', err);  // Log error
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
  console.log(`Server running on ${publicUrl}:${port}`);
});
