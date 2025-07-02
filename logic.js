// Show loading animation on the "Save Post" button
const postButton = document.querySelector('button[type="submit"]');
if (postButton) {
  postButton.addEventListener('click', function(e) {
    // Add 'loading' class to button to show spinner
    postButton.classList.add('loading');
    
    // Simulate post submission delay (replace with actual event handling logic)
    setTimeout(function() {
      // After the submission is processed, remove the loading spinner
      postButton.classList.remove('loading');
    }, 2000); // Simulate a 2-second post submission delay
  });
}























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
    'Good Deeds': L.icon({ iconUrl: 'https://1pulse.online/images/good%20deed%20icon.png', iconSize: [30, 30],  iconAnchor: [15, 30],
      popupAnchor: [0, -30]}),
    'Health': L.icon({ iconUrl: 'https://1pulse.online/images/Health-location.png', iconSize: [30, 30],  iconAnchor: [15, 30],
      popupAnchor: [0, -30]}),
    'Service Delivery': L.icon({ iconUrl: 'https://1pulse.online/images/property.png', iconSize: [30, 30],  iconAnchor: [15, 30],
      popupAnchor: [0, -30]}),
    'Violent Crime': L.icon({ iconUrl: 'https://1pulse.online/images/crime.png', iconSize: [30, 30],  iconAnchor: [15, 30],
      popupAnchor: [0, -30]}),
    'Looting': L.icon({ iconUrl: 'https://1pulse.online/images/looting.png', iconSize: [30, 30],  iconAnchor: [15, 30],
      popupAnchor: [0, -30]}),
    'Non-compliance': L.icon({ iconUrl: 'xenophobia.png', iconSize: [30, 30], iconAnchor: [15, 30],
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
          async (position) => {
              const userLat = position.coords.latitude;
              const userLng = position.coords.longitude;

              // Center the map on the user's location
              map.setView([userLat, userLng], 18);

              // Add marker for the user's location
              let userMarker = L.marker([userLat, userLng], { icon: youAreHereIcon }).addTo(map);

              // Fetch and show popup with councilor details
              await showPopup(userMarker, userLat, userLng);
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

// Function to get address from coordinates
async function getAddress(userLat, userLng) {
  try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLng}&format=json`);
      const data = await response.json();

      // Extract address details
      const address = data.display_name;
      const streetName = data.address.road || 'Unknown Street';
      const suburbName = data.address.suburb || 'Unknown Suburb';

      return { address, streetName, suburbName };
  } catch (error) {
      console.error('Error fetching address:', error);
      return { address: 'Unknown Address', streetName: 'Unknown Street', suburbName: 'Unknown Suburb' };
  }
}

// Function to get councilor data
async function getCouncilorData(streetName, suburbName) {
  try {
      const response = await fetch('wardCouncillors.js'); // Ensure wardCouncillors.js is properly structured
      const councilors = await response.json();

      // Search for a match based on suburb or street
      const matchingCouncilors = councilors.filter(councilor =>
          councilor.wardSuburbs.includes(suburbName) || councilor.wardSuburbs.includes(streetName)
      );

      return matchingCouncilors.length > 0 ? matchingCouncilors[0] : null;
  } catch (error) {
      console.error('Error fetching councilor data:', error);
      return null;
  }
}

// Function to show popup with councillor details
async function showPopup(userMarker, userLat, userLng) {
  const { address, streetName, suburbName } = await getAddress(userLat, userLng);
  const councilor = await getCouncilorData(streetName, suburbName);

  let popupContent = `<p>You are currently in ${streetName}, ${suburbName}.You can rate or contact your councilor here.</p>
 <button class="call" onclick="window.location.href='https://1pulse.online/dashboard'">Contact Councillor</button>
            <button class="rate" onclick="window.location.href='https://1pulse.online/dashboard'">Rate Councillor</button>
          <button class="post" id="createPostBtn">What's Happening?</button>`;

  if (councilor) {
      popupContent += `
          <p><strong>Councillor:</strong> ${councilor.councillorName}</p>
          <p><strong>Contact:</strong> <a href="tel:${councilor.cllrCont}">${councilor.cllrCont}</a></p>
     
      `;
  } else {
      popupContent += `<p></p>`;
  }

  // Bind popup to the marker and open it
  userMarker.bindPopup(popupContent).openPopup();

  // Wait for the popup to open, then add event listener to the button
  setTimeout(() => {
      const postButton = document.getElementById('createPostBtn');
      if (postButton) {
          postButton.addEventListener('click', function () {
              openPostModal(userLat, userLng);
          });
      }
  }, 100);
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
const urlParams = new URLSearchParams(window.location.search);
  const highlightId = urlParams.get('highlight_post_id');
  posts.forEach((post) => {
    const {
      latitude,
      longitude,
      name,
      surname,
      description,
      imageUrl,
      type,
      createdAt
    } = post;

    const postId = post._id || post.id;
    if (!postId) {
      console.warn("Missing postId for:", post);
      return;
    }

    const updated = createdAt
      ? new Date(createdAt).toLocaleString()
      : 'Unknown date';

    const icon = markerIcon[type] || markerIcon["Good Deeds"];

    const marker = L.marker([latitude, longitude], { icon }).addTo(map);

    marker.bindPopup(`
      <div class="card-popup">
        <div class="card-header">
          <span class="type">${type || 'Unknown Type'}</span>
        </div>

        <iframe 
          src="https://poweroffive.co.za/1pulse.online/users/response-bar.php?post_id=${encodeURIComponent(postId)}" 
          style="width: 100%; height: 90px; border: none; overflow: hidden; border-radius: 8px;" 
          scrolling="no" 
          loading="lazy">
        </iframe>

        <div class="header">
          <div>
            <div class="username">by ${name || 'Unknown'} ${surname || ''}</div>
            <div class="posted-on">${updated}</div>
          </div>
        </div>

        <div class="card-content">
          <div class="description">
            ${description ? `"${description}"` : 'No description available'}
          </div>
          <div class="image">
            <img class="image" src="${imageUrl || '#'}" alt="${type || 'Image'}" />
          </div>
        </div>

        <button class="ok-button" onclick="openViewPostModal('${postId}')">View Post</button>
      </div>
    `);
    
  });
}

// ✅ Listen for login request from iframe
window.addEventListener('message', function(event) {
  const msg = event.data;
  if (msg?.type === 'login_required' && msg.postId) {
    showLoginDialog(msg.postId);
  }
});

// ✅ Show login overlay
function showLoginDialog(postId) {
  const existing = document.getElementById('loginOverlay');
  if (existing) existing.remove(); // avoid stacking multiple overlays

  const dialog = document.createElement("div");
  dialog.innerHTML = `
    <style>
      .overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }
      .login-dialog {
        background: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        font-family: sans-serif;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
      }
      .login-dialog button {
        margin: 8px;
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
      }
      .login-btn {
        background: #007bff;
        color: white;
      }
      .cancel-btn {
        background: #ccc;
      }
    </style>
    <div class="overlay" id="loginOverlay">
      <div class="login-dialog">
        <p>You need to log in to join this case.</p>
        <button class="login-btn" onclick="window.location.href='http://poweroffive.co.za/1pulse.online/users/login.php?post_id=${encodeURIComponent(postId)}'">Login</button>
        <button class="cancel-btn" onclick="document.getElementById('loginOverlay').remove()">Okay</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);
}
  const iframe = document.querySelector('iframe');
iframe.onload = () => {
  iframe.contentWindow.postMessage({
    type: "loadResponseBar",
    responders: [
      { name: "Bah", avatar: "https://..." },
      { name: "Jozi", avatar: "https://..." }
    ]
  }, "https://poweroffive.co.za");
};

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
        <img src="${post.imageUrl}" width="220px" height="auto" border-radius="10px"><br>
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

  const spinner = document.getElementById('spinner'); // Reference to the spinner
  spinner.style.display = 'block'; // Show the spinner

  const formData = new FormData(e.target);
  const name = formData.get('name');
  const surname = formData.get('surname');
  const description = formData.get('description');
  const type = formData.get('type');
  const imageInput = document.querySelector('input[name="image"]');
  const image = imageInput.files[0]; // Ensure this is the actual file

  // Validation for required fields
  if (!name || !surname || !description || !image || !type) {
      alert('Please fill in all fields!');
      spinner.style.display = 'none'; // Hide the spinner if validation fails
      return;
  }

  // Ensure valid coordinates are selected
  if (!selectedLatLng || typeof selectedLatLng.lat !== 'number' || typeof selectedLatLng.lng !== 'number') {
      alert('Please select a valid location on the map.');
      spinner.style.display = 'none'; // Hide the spinner if validation fails
      return;
  }

  // Prepare post data
  const postData = new FormData();
  postData.append('name', name);
  postData.append('surname', surname);
  postData.append('description', description);
  postData.append('image', image);
  postData.append('latitude', selectedLatLng.lat);
  postData.append('longitude', selectedLatLng.lng);
  postData.append('type', type);

  try {
      const response = await fetch('https://map-test-xid1.onrender.com/api/posts', {
          method: 'POST',
          body: postData,
      });

      if (response.ok) {
          console.log('Post created successfully!');
          closeModal(); // Close the modal if successful
          fetchPosts(); // Refresh posts
      } else {
          // Handle response errors
          let errorData;
          try {
              errorData = await response.json();
          } catch (parseError) {
              console.error('Error parsing response:', parseError);
              errorData = { message: 'Unknown error occurred.' };
          }
          console.error('Response error:', errorData);
          alert(`Error: ${errorData.message || 'An error occurred while creating the post.'}`);
      }
  } catch (error) {
      console.error('Fetch error:', error);
      alert('There was an error submitting the form. Please try again later.');
  } finally {
      spinner.style.display = 'none'; // Always hide the spinner, even if there's an error
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



document.addEventListener("DOMContentLoaded", function() {
  // Modal and its content elements
  var modal_brah = document.getElementById("myModal");
  var modalTitle = document.querySelector(".modal-title-brah");
  var modalDescription = document.querySelector(".modal-description-brah");
  var modalImage = document.querySelector(".modal-image-brah");
  
  // Ensure the close button exists
  var closeButton = document.getElementsByClassName("close-brah")[0];

  // Data for each logo's modal content
  var modalData = {
    1: {
   title: "Errand Camel - Mother to 1pulse and Whatsnext",
    description: "Sustainable energy solutions provider.",
    image: "https://1pulse.online/images/errand%20camel%20logo.png",
    email: "contact@errandcamel.co.za",
    phone: "+27 11 345 1234",
    location: "Johannesburg"
    },
    2: {
      title: "Bonizluu",
      description: "BoniZulu is a fashion brand committed to uniting designers for fabric sourcing and promoting the elderly through crocheting programs.",
      image: "https://1pulse.online/images/bonizluu-fav.png"
    },
    3: {
      title: "Hillbrow",
      description: "Hillbrow is a diverse and vibrant neighborhood in Johannesburg, known for its rich culture and mix of residential and commercial spaces.",
      image: "https://1pulse.online/images/hillbrow.jpeg"
    },
    4: {
      title: "CPF - Community Policing Forum",
      description: "CPF works closely with SAPS to improve safety and security in communities, promoting cooperation between police and residents.",
      image: "https://1pulse.online/images/Africa%20City.png"
    },
    5: {
      title: "Pulse",
      description: "Pulse is an initiative dedicated to monitoring street activities, overseeing public services, and tracking community-driven efforts for safer environments.",
      image: "https://1pulse.online/images/pulse.jpeg"
    },
    6: {
      title: "Tae Trax",
      description: "Tae-Trax by Siya Percy is an initiative dedicated to monitoring street activities, overseeing public services, and tracking community-driven efforts for safer environments.",
      image: "https://1pulse.online/images/Tae-Trax-Logo.png"
    }
  };

  // Get all logo elements in the navbar
  var logos = document.querySelectorAll(".logo");

  // When a logo is clicked, open the modal and update content
  logos.forEach(function(logo) {
    logo.onclick = function() {
      var modalId = logo.getAttribute("data-modal-id");
      var data = modalData[modalId];

      // Update modal content dynamically
      if (modalTitle && modalDescription && modalImage) {
        modalTitle.textContent = data.title;
        modalDescription.textContent = data.description;
        modalImage.src = data.image;
      }

      // Display the modal
      modal_brah.style.display = "block";
    };
  });

  // Close modal functionality
  if (closeButton) {
    closeButton.onclick = function() {
      modal_brah.style.display = "none";
    };
  }

  // Close modal if clicked outside of modal
  window.onclick = function(event) {
    if (event.target == modal_brah) {
      modal_brah.style.display = "none";
    }
  };
});



// Function to open the modal
function pulseopenModal() {
    // Show the modal
    document.getElementById('gjnoModal').style.display = 'block';
  
    // Get the container to insert images
    const modalImagesContainer = document.getElementById('modal-images-container');
  
    // Logo data from the navigation section (should be inserted dynamically)
    const logos = [
      {src: 'https://1pulse.online/images/errand%20camel%20logo.png', alt: 'Logo 1'},
      {src: 'https://1pulse.online/images/bonizluu-fav.png', alt: 'Logo 2'},
      {src: 'https://1pulse.online/images/hillbrow.jpeg', alt: 'Logo 3'},
      {src: 'https://1pulse.online/images/Africa%20City.png', alt: 'Logo 4'},
      {src: 'https://1pulse.online/images/pulse.jpeg', alt: 'Logo 5'},
      {src: 'https://1pulse.online/images/Tae-Trax-Logo.png', alt: 'Logo 6'}
    ];
  
    // Clear any existing images
    modalImagesContainer.innerHTML = '';
  
    // Loop through logos and add them to the modal dynamically
    logos.forEach(logo => {
        const imgElement = document.createElement('img');
        imgElement.src = logo.src;
        imgElement.alt = logo.alt;
        modalImagesContainer.appendChild(imgElement);
      });
  }
  
  // Close the modal when the "x" button is clicked
  document.querySelector('.gjno-close').onclick = function() {
    document.getElementById('gjnoModal').style.display = 'none';
  };
  
  // Close the modal when clicking outside of the modal
  window.onclick = function(event) {
    if (event.target === document.getElementById('gjnoModal')) {
      document.getElementById('gjnoModal').style.display = 'none';
    }
  };
  
  