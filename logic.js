document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map with a light theme
    let map = L.map('map', { zoomControl: true }).setView([-26.2041, 28.0473], 18);

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
                    let userMarker = L.marker([userLat, userLng], { icon: youAreHereIcon }).addTo(map);

                    // Reverse geocode the coordinates to get the address
                    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLng}&format=json`)
                        .then(response => response.json())
                        .then(data => {
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
                    map.setView([-26.2041, 28.0473], 18); // Fallback to a default location
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    }

    // Call the function to set the user's location when the page loads
    setUserLocation();

    let darkMode = false;

    // Function to toggle between light and dark mode
    function toggleDarkMode() {
        darkMode = !darkMode;
        if (darkMode) {
            map.removeLayer(lightLayer);
            darkLayer.addTo(map);
            document.body.classList.add('dark-mode');
        } else {
            map.removeLayer(darkLayer);
            lightLayer.addTo(map);
            document.body.classList.remove('dark-mode');
        }
    }

    // Fetch posts from backend
    async function fetchPosts() {
        const response = await fetch('https://map-test-xid1.onrender.com/api/posts');
        const posts = await response.json();
        displayPosts(posts);
    }

    // Display posts on the map
    function displayPosts(posts) {
        posts.forEach((post) => {
            const { latitude, longitude, name, surname, description, imageUrl, _id } = post;
            const marker = L.marker([latitude, longitude]).addTo(map);
            marker.bindPopup(`
                <b>${name} ${surname}</b><br>
                ${description}<br>
                <img src="${imageUrl}" width="100px" height="100px"><br>
                <button onclick="openViewPostModal('${_id}')">View Post</button>
            `);
        });
    }

    // Open modal to view post and add comments
    async function openViewPostModal(postId) {
        currentPostId = postId;

        const response = await fetch(`https://map-test-xid1.onrender.com/api/posts/${postId}`);
        const post = await response.json();

        document.getElementById('viewModal-overlay').classList.add('active');
        document.getElementById('viewModal').classList.add('active');

        document.getElementById('postDetails').innerHTML = `
            <b>${post.name} ${post.surname}</b><br>
            ${post.description}<br>
            <img src="${post.imageUrl}" width="200px" height="200px"><br>
        `;

        const commentsList = document.getElementById('commentsList');
        commentsList.innerHTML = '';
        post.comments.forEach((comment) => {
            commentsList.innerHTML += `<li>${comment.text}</li>`;
        });
    }

    // Add a comment to the post
    document.getElementById('addCommentForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        const commentText = document.getElementById('commentText').value;

        if (commentText.trim()) {
            const response = await fetch(`https://map-test-xid1.onrender.com/api/posts/${currentPostId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: commentText }),
            });

            if (response.ok) {
                openViewPostModal(currentPostId);  // Refresh the post details and comments
            } else {
                alert('Error adding comment');
            }
        }
    });

    // Handle post form submission
    document.getElementById('postForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const name = document.getElementById('postName').value;
        const surname = document.getElementById('postSurname').value;
        const description = document.getElementById('postDescription').value;
        const image = document.getElementById('postImage').files[0];

        const postData = new FormData();
        postData.append('name', name);
        postData.append('surname', surname);
        postData.append('description', description);
        postData.append('latitude', selectedLatLng.lat);
        postData.append('longitude', selectedLatLng.lng);
        postData.append('image', image);

        const response = await fetch('https://map-test-xid1.onrender.com/api/posts', {
            method: 'POST',
            body: postData,
        });

        if (response.ok) {
            fetchPosts();
            closeModal();
        } else {
            alert('Error creating post!');
        }
    });

    // Initialize posts
    fetchPosts();
});
