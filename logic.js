// Initialize the map with a light theme
let map = L.map('map',{zoomControl: false}).setView([-26.2041, 28.0473], 18);

// Tile layer for light mode
let lightLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://carto.com">CARTO</a>',
    maxZoom: 20
}).addTo(map);

// Tile layer for dark mode
let darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors'
});

// Add the default light layer
lightLayer.addTo(map);

// Custom "You Are Here" icon using a PNG
  const youAreHereIcon = L.icon({
    iconUrl: 'https://1pulse.online/images/user-here.png', // Replace with your PNG URL
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });

  // Define icons for each incident type
const markerIcon = {
    'Good Deeds': L.icon({ iconUrl: 'https://1pulse.online/images/good deed icon.png', iconSize: [30, 30],  iconAnchor: [15, 30],
      popupAnchor: [0, -30]}),
    'Health': L.icon({ iconUrl: 'https://1pulse.online/images/Health-location.png', iconSize: [30, 30],  iconAnchor: [15, 30],
      popupAnchor: [0, -30]}),
    'Property Damage': L.icon({ iconUrl: 'https://1pulse.online/images/property.png', iconSize: [30, 30],  iconAnchor: [15, 30],
      popupAnchor: [0, -30]}),
    'Violent Crime': L.icon({ iconUrl: 'https://1pulse.online/images/violent-crime.png', iconSize: [30, 30],  iconAnchor: [15, 30],
      popupAnchor: [0, -30]}),
    'Looting': L.icon({ iconUrl: 'https://1pulse.online/images/looting.png', iconSize: [30, 30],  iconAnchor: [15, 30],
      popupAnchor: [0, -30]}),
    'Xenophobia': L.icon({ iconUrl: 'https://1pulse.online/images/xenophobia.png', iconSize: [30, 30], iconAnchor: [15, 30],
      popupAnchor: [0, -30] })
  };

// Call the function to set the user's location when the page loads
setUserLocation();

let darkMode = false;

 const logos = document.querySelectorAll(".logo"); // Get all the logo divs

const logoWidth = logos[0].offsetWidth + 16; // Account for margin (8px on each side)
let currentPosition = 0;

// All fuctions from here onwards
// Function to get user's location and set the map view
function setUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                // Center the map on the user's location
                map.setView([userLat, userLng], 18);

                // Add marker for the user's location
                let userMarker = L.marker([userLat, userLng],{ icon: youAreHereIcon }).addTo(map);

                // Reverse geocode the coordinates to get the address
                fetch(`https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLng}&format=json`)
                    .then(response => response.json())
                    .then(data => {
                        // If the geocoding request returns a valid address
                        const address = data.display_name;
                        userMarker.bindPopup("Your current location is: " + address).openPopup();
                    })
                    .catch(error => {
                        console.error('Error fetching address:', error);
                        userMarker.bindPopup('Your position').openPopup();
                    });
            },
            (error) => {
                console.log(error);
                // Fallback to a default location if geolocation fails
                map.setView([-26.2041, 28.0473], 18);
            }
        );
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

// Function to toggle between light and dark mode
function toggleDarkMode() {
    darkMode = !darkMode;
    if (darkMode) {
        map.removeLayer(lightLayer);
        darkLayer.addTo(map);
        document.body.classList.add('dark-mode');
        updateMarkers('dark-marker.png');
    } else {
        map.removeLayer(darkLayer);
        lightLayer.addTo(map);
        document.body.classList.remove('dark-mode');
        updateMarkers('light-marker.png');
    }
}

// Floating button modal functionality
function openModal() {
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Function to update marker icon dynamically
function updateMarkers(iconUrl) {
    marker.setIcon(L.icon({
        iconUrl: iconUrl,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    }));
}

// Add event listener for map click to create a new post
map.on('click', function (event) {
    // Get the latitude and longitude of the clicked point
    const lat = event.latlng.lat;
    const lng = event.latlng.lng;

    // Call the openPostModal function and pass the coordinates
    openPostModal(lat, lng);
});

// Open modal to create a post
function openPostModal(lat, lng) {
    selectedLatLng = { lat, lng };
    console.log('Map clicked at:', lat, lng);  // Check if lat/lng are logged correctly

    document.getElementById('modal-overlay').classList.add('active');
    document.getElementById('modal').classList.add('active');
}

// Close modal
// Close modal and clear the form
function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.getElementById('modal').classList.remove('active');
    document.getElementById('viewModal-overlay').classList.remove('active');
    document.getElementById('viewModal').classList.remove('active');

    // Reset the form fields
    document.getElementById('postForm').reset();
}

// Close modal when clicking anywhere outside of it (on the overlay)
document.getElementById('modal-overlay').addEventListener('click', function () {
    closeModal();
});

// Close view modal when clicking anywhere outside of it (on the overlay)
document.getElementById('viewModal-overlay').addEventListener('click', function () {
    closeModal();
});

// Prevent closing modal when clicking inside the modal (on the modal content)
document.getElementById('modal').addEventListener('click', function (event) {
    event.stopPropagation(); // Prevent event from propagating to overlay
});

document.getElementById('viewModal').addEventListener('click', function (event) {
    event.stopPropagation(); // Prevent event from propagating to overlay
});


// Fetch posts from backend
async function fetchPosts() {
    try {
      const response = await fetch('https://map-test-xid1.onrender.com/api/posts');  // Updated URL
      const posts = await response.json();
      
      // Filter posts to ensure each has valid latitude and longitude
      const validPosts = posts.filter(post => typeof post.latitude === 'number' && typeof post.longitude === 'number');
      
      displayPosts(validPosts);
      console.log('Fetched posts:', validPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }

// Display posts on the map
function displayPosts(posts) {
    posts.forEach((post) => {
      const { latitude, longitude, name, surname, description, imageUrl, type, _id } = post;
  
//Please check the icon.type error Mr Ndlovu. 
      // Check if latitude and longitude are valid numbers before proceeding
      if (typeof latitude === 'number' && typeof longitude === 'number') {
        const marker = L.marker([latitude, longitude], { icon: markerIcon[type] }).addTo(map);
        marker.bindPopup(`
          <b>${name} ${surname}</b><br>
          <i> Type: ${type}</i><br>
          ${description}<br>
          <img src="${imageUrl}" width="100px" height="100px"><br>
          <button onclick="openViewPostModal('${_id}')">View Post</button>
        `);
      } else {
        console.error(`Invalid coordinates for post: ${_id} - (${latitude}, ${longitude})`);
      }
    });
  }

// Open modal to view post and add comments
async function openViewPostModal(postId) {
    currentPostId = postId;

    const response = await fetch(`https://map-test-xid1.onrender.com/api/posts/${postId}`);  // Updated URL
    const post = await response.json();

    document.getElementById('viewModal-overlay').classList.add('active');
    document.getElementById('viewModal').classList.add('active');

    document.getElementById('postDetails').innerHTML = `
        <b>${post.name} ${post.surname}</b><br>
        <i>Type: ${post.type}</i><br>
        ${post.description}<br>
        <img src="${post.imageUrl}" width="200px" height="200px"><br>
    `;

    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '';
    post.comments.forEach((comment) => {
        commentsList.innerHTML += `
            <div class="comment">
                <div class="comment-author"><b>${comment.author}</b></div>
                <div>${comment.text}</div>
            </div>
        `;
    });
}

// Add new comment
document.getElementById('commentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const commentName = document.getElementById('commentName').value;
    const commentText = document.getElementById('commentText').value;

    if (!commentName || !commentText) {
        alert('Please fill in both fields!');
        return;
    }

    const response = await fetch(`https://map-test-xid1.onrender.com/api/posts/${currentPostId}/comments`, {  // Updated URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ author: commentName, text: commentText }),
    });

    if (response.ok) {
        fetchPosts();
        closeModal();
    } else {
        alert('Error adding comment!');
    }
});

// Handle form submission for creating a post
document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const name = formData.get('name');
    const surname = formData.get('surname');
    const description = formData.get('description');
    const image = formData.get('image');
    const type = formData.get('type')

    if (!name || !surname || !description || !image || !type) {
        alert('Please fill in all fields!');
        return;
    }

    const postData = new FormData();
    postData.append('name', name);
    postData.append('surname', surname);
    postData.append('description', description);
    postData.append('image', image);
    postData.append('latitude', selectedLatLng.lat);
    postData.append('longitude', selectedLatLng.lng);
    postData.append('type', type);

    const response = await fetch('https://map-test-xid1.onrender.com/api/posts', {  // Updated URL
        method: 'POST',
        body: postData,
    });

    if (response.ok) {
        closeModal();
        fetchPosts();
    } else {
        alert('Error creating post!');
    }
});

// Close modal when clicking anywhere outside of it (on the overlay)
document.getElementById('modal-overlay').addEventListener('click', function () {
    closeModal();
});

// Close view modal when clicking anywhere outside of it (on the overlay)
document.getElementById('viewModal-overlay').addEventListener('click', function () {
    closeModal();
});

// Prevent closing modal when clicking inside the modal (on the modal content)
document.getElementById('modal').addEventListener('click', function (event) {
    event.stopPropagation(); // Prevent event from propagating to overlay
});

document.getElementById('viewModal').addEventListener('click', function (event) {
    event.stopPropagation(); // Prevent event from propagating to overlay
});

// Initial fetch of posts
fetchPosts();




//Mr Ndlovu, please use this schema to reflect what on our db. 
// sampleData.forEach(data => {
//   const marker = L.marker(data.location, { icon: icons[data.type] }).addTo(map);
//   marker.bindPopup(`
//           <div class="card-header">
//           <span class="type">${data.type}</span>
//         </div>
//    <span class="timestamp">Updated ${data.updated}</span>(<em>${data.date} ${data.time}</em>)
//     <div class="card-content">
//           <p class="caption">"${data.caption}"</p>
//           <div class="media">
//             <img src="${data.imageUrl}" alt="${data.type} Image">
//           </div>
//         </div>
//          <span class="author">Posted by: ${data.author}</span>
//     <div class="rating">
//             <span>Rating: ${data.rating}</span>
//           </div>
          
//     <p>Learn More: <a href="https://wa.me/${data.number}?text=May%20I%20enquire%20about%20this%20alert" 
//       class="contact-icon" style="font-size: 11px;" target="_blank">
//       <i class="fab fa-whatsapp"></i> </a></p>

      
//   `);
// });