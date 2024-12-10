const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // Import CORS middleware
const app = express();

const cloudinary = require('cloudinary').v2;

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); 

// Set up Cloudinary configuration
cloudinary.config({
  cloud_name: dcbd1eavw,
  api_key: 613477935675545,
  api_secret: eLIUoc8MEntQCo68oWvyNCItc9U
});

// Set up static folder for images
// Replace with public URL for production
const publicUrl = process.env.PUBLIC_URL || 'https://map-test-xid1.onrender.com'; // Set your public URL here
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
const storage = multer();

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

    let imageUrl = '';
    if (req.file) {
      // Upload image to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'posts_images',  // Optional: set a folder for the images
        use_filename: true,       // Use original filename
        unique_filename: true     // Ensure unique filename
      });

      imageUrl = uploadResult.secure_url; // Get the secure URL from Cloudinary
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
