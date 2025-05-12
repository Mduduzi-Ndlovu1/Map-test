<?php
// Include the database connection at the top
require_once 'db_connect.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Civic Engagement Posts</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <style>
        /* Your existing CSS styles here */
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        /* ... rest of your CSS ... */
    </style>
</head>
<body>
    <div class="container">
        <h1>Civic Engagement Posts</h1>
        
        <div class="filters">
            <select id="type-filter">
                <option value="">All Types</option>
                <option value="Property Damage">Property Damage</option>
                <option value="Health">Health</option>
                <option value="Good Deeds">Good Deeds</option>
                <option value="Looting">Looting</option>
                <option value="Non-compliance">Non-compliance</option>
                <option value="Service Delivery">Service Delivery</option>
                <option value="Violent Crime">Violent Crime</option>
            </select>
            
            <button id="apply-filter">Apply Filter</button>
            <button id="reset-filter">Reset</button>
        </div>
        
        <div id="posts-container">
            <?php
            try {
                $sql = "SELECT * FROM civic_engagement_posts ORDER BY Created_At DESC LIMIT 50";
                $result = $pdo->query($sql);
                
                if ($result->rowCount() > 0) {
                    while($row = $result->fetch(PDO::FETCH_ASSOC)) {
                        echo '<div class="post" data-type="' . htmlspecialchars($row['Type']) . '" 
                              data-lat="' . htmlspecialchars($row['Latitude']) . '" 
                              data-lng="' . htmlspecialchars($row['Longitude']) . '">';
                        echo '<h2>' . htmlspecialchars($row['Type']) . '</h2>';
                        echo '<div class="post-meta">';
                        echo '<strong>' . htmlspecialchars($row['Name']) . ' ' . htmlspecialchars($row['Surname']) . '</strong> · ';
                        echo htmlspecialchars($row['Created_At']);
                        echo '</div>';
                        echo '<p>' . nl2br(htmlspecialchars($row['Description'])) . '</p>';
                        
                        if (!empty($row['Image_URL'])) {
                            echo '<img src="' . htmlspecialchars($row['Image_URL']) . '" alt="Post image">';
                        }
                        
                        echo '</div>';
                    }
                } else {
                    echo '<div class="post"><p>No posts found.</p></div>';
                }
            } catch(PDOException $e) {
                echo '<div class="post"><p>Error loading posts: ' . htmlspecialchars($e->getMessage()) . '</p></div>';
            }
            ?>
        </div>
        
        <div class="map-container" id="map"></div>
    </div>

    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
    <script>
        // Initialize map
        function initMap() {
            // Default to Johannesburg coordinates if no posts exist
            const defaultLat = -26.2041;
            const defaultLng = 28.0473;
            
            const map = L.map('map').setView([defaultLat, defaultLng], 12);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            // Add markers for each post
            document.querySelectorAll('.post').forEach(post => {
                const lat = parseFloat(post.dataset.lat);
                const lng = parseFloat(post.dataset.lng);
                
                if (!isNaN(lat) && !isNaN(lng)) {
                    const marker = L.marker([lat, lng]).addTo(map);
                    marker.bindPopup(post.querySelector('h2').textContent);
                }
            });
        }
        
        // Filter functionality
        document.getElementById('apply-filter').addEventListener('click', function() {
            const filterValue = document.getElementById('type-filter').value;
            const posts = document.querySelectorAll('.post');
            
            posts.forEach(post => {
                if (filterValue === '' || post.dataset.type === filterValue) {
                    post.style.display = 'block';
                } else {
                    post.style.display = 'none';
                }
            });
        });
        
        document.getElementById('reset-filter').addEventListener('click', function() {
            document.getElementById('type-filter').value = '';
            const posts = document.querySelectorAll('.post');
            posts.forEach(post => {
                post.style.display = 'block';
            });
        });
        
        // Initialize map when page loads
        window.onload = initMap;
    </script>
    
    <?php
    // Close connection
    unset($pdo);
    ?>
</body>
</html>