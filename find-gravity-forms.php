<?php
// Database connection parameters
$hostname = 'localhost';
$username = 'root';
$password = 'root';
$database = 'local';

// Create a new database connection
$mysqli = new mysqli($hostname, $username, $password, $database);

// Check connection
if ($mysqli->connect_error) {
    die('Connect Error (' . $mysqli->connect_errno . ') ' . $mysqli->connect_error);
}

// Open a file in write mode ('w') for the CSV output
$csvFilePath = 'hubspot_forms_found.csv';
$csvFile = fopen($csvFilePath, 'w');

// Check if file is opened successfully
if ($csvFile === false) {
    die('Error opening the file ' . $csvFilePath);
}

// Write CSV header
fputcsv($csvFile, ['Site ID', 'Post ID', 'Title', 'Location', 'Type', 'Post Name', 'Post Status']);

$resultsFound = false;

// Query to get all site IDs from the wp_blogs table
$siteQuery = "SELECT blog_id FROM wp_blogs";

if ($result = $mysqli->query($siteQuery)) {
    while ($row = $result->fetch_assoc()) {
        $blogId = $row['blog_id'];
        // Adjust the prefix pattern according to your WP Multisite setup
        $tablePrefix = 'wp_' . ($blogId == 1 ? '' : $blogId . '_');
        $query = "id='hbspt-form-'";

        // Search in wp_posts for all fields
        $searchQueryPosts = "SELECT * FROM {$tablePrefix}posts WHERE post_content LIKE {$query} AND post_status = 'publish'";
        $searchResultPosts = $mysqli->query($searchQueryPosts);
        if ($searchResultPosts && $searchResultPosts->num_rows > 0) {
            $resultsFound = true;
            while ($post = $searchResultPosts->fetch_assoc()) {
                // Example of massaging data output - Adjust as needed
                // Here, using var_dump() to display all post fields for demonstration; replace with fputcsv() for actual CSV writing
                var_dump($post); // This line is for debugging, showing all fields of the post
                // Replace or complement the var_dump() with fputcsv() to write necessary fields to CSV
                // For example, to include the slug (post_name) in the CSV:
                fputcsv($csvFile, [$blogId, $post['ID'], $post['post_title'], $post['guid'], $post['post_type'], $post['post_name'], $post['post_status']] );
                
                // die(); // Remove die() when you're ready to process all posts
            }

            // while ($post = $searchResultPosts->fetch_assoc()) {
            //     // Fetch postmeta for the current post
            //     $postMetaQuery = "SELECT meta_key, meta_value FROM {$tablePrefix}postmeta WHERE post_id = {$post['ID']}";
            //     $postMetaResult = $mysqli->query($postMetaQuery);
            //     if ($postMetaResult && $postMetaResult->num_rows > 0) {
            //         while ($postMeta = $postMetaResult->fetch_assoc()) {
            //             // Example: Write post details and each postmeta key-value pair to the CSV
            //             fputcsv($csvFile, [$blogId, $post['ID'], $post['post_title'], $post['post_type'], $post['guid'], $postMeta['meta_key'], $postMeta['meta_value']]);
            //         }
            //     } else {
            //         // If no postmeta found, still write post details to CSV
            //         fputcsv($csvFile, [$blogId, $post['ID'], $post['post_title'], $post['post_name'], 'No postmeta', '']);
            //     }
            // }
        }

        // Include additional logic here for wp_postmeta or other needs
    }
}

if (!$resultsFound) {
    fputcsv($csvFile, ['No results found in any posts or postmeta.']);
}

// Close the CSV file and MySQL connection
fclose($csvFile);
$mysqli->close();

echo "CSV file has been generated: " . $csvFilePath;
?>
