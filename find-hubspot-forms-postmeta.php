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
$csvFilePath = 'hubspot_forms_postmeta.csv';
$csvFile = fopen($csvFilePath, 'w');
if ($csvFile === false) {
    die('Error opening the file ' . $csvFilePath);
}

// Write CSV header
fputcsv($csvFile, ['Site ID', 'Post ID', 'Title', 'Location', 'Type', 'Post Name', 'Post Status']);

// Query to get all site IDs from the wp_blogs table
$siteQuery = "SELECT blog_id FROM wp_blogs WHERE public = 1 AND archived = '0' AND deleted = '0'";
$result = $mysqli->query($siteQuery);

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $blogId = $row['blog_id'];
        $tablePrefix = 'wp_' . ($blogId == 1 ? '' : $blogId . '_');

        // Correcting the $query to ensure it's properly formatted for SQL execution
        $query = "post_content LIKE id='hbspt-form-' AND post_status = 'publish'";
        // Search in wp_posts for all fields
        $searchQueryPosts = "SELECT * FROM {$tablePrefix}posts WHERE {$query}";
        $searchResultPosts = $mysqli->query($searchQueryPosts);

        if ($searchResultPosts && $searchResultPosts->num_rows > 0) {
            while ($post = $searchResultPosts->fetch_assoc()) {
                // Filtering based on $post['guid'] and specific post types
                // Array of values to check in $post['guid']
                $valuesToCheckSlug = ['-test', '?p=', '?post_type=', '?page_id=', '?mt_pp='];
                $valuesToCheckPostType = [ 'wp_navigation', 'wp_global_styles', 'videos', 'webinars', 'fl-builder-template', 'lp-component', 'attachment', 'revision', 'nav_menu_item', 'custom_css','oembed_cache', 'wp_block'];

                // Flag to indicate if any of the values were found
                $skipWrite = false;

                foreach ($valuesToCheckSlug as $value) {
                    if (str_contains($post['guid'], $value)) {
                        $skipWrite = true;
                        break; // Exit the loop early as we found a match
                    }
                }

                foreach ($valuesToCheckPostType as $value) {
                    if ($post['post_type'] === $value) {
                        $skipWrite = true;
                        break; // Exit the loop early as we found a match
                    }
                }

                // Only write to file if none of the values were found
                if (!$skipWrite) {
                    if (!str_contains($post['guid'], '?')) {
                        $updatedPostGuid = str_replace('.local', '.com', $post['guid']);
                        // Ensure $blogId is captured correctly at this point for each site
                        fputcsv($csvFile, [$blogId, $post['ID'], $post['post_title'], $updatedPostGuid, $post['post_type'], $post['post_name'], $post['post_status']]);
                    }
                }
            }
        }
    }
}

// Close resources
fclose($csvFile);
$mysqli->close();

echo "CSV file has been generated: " . $csvFilePath;
