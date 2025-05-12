<?php
// Include the database connection file
require_once 'db_connect.php';

header('Content-Type: application/json');

try {
    // Prepare the SQL statement
    $sql = "SELECT * FROM civic_engagement_posts ORDER BY Created_At DESC";
    $stmt = $pdo->prepare($sql);
    
    // Execute the statement
    $stmt->execute();
    
    // Fetch all posts as associative array
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Output posts as JSON
    echo json_encode($posts);
    
} catch(PDOException $e) {
    // Return error message if something goes wrong
    echo json_encode(['error' => $e->getMessage()]);
}

// Close connection
unset($pdo);
?>