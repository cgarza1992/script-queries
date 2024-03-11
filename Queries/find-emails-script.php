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
$csvFilePath = 'posts_with_specific_emails.csv';
$csvFile = fopen($csvFilePath, 'w');

// Check if file is opened successfully
if ($csvFile === false) {
    die('Error opening the file ' . $csvFilePath);
}

// Write CSV header
fputcsv($csvFile, ['Site ID', 'Post ID', 'Title', 'Found Emails', 'Post Status']);

$resultsFound = false;

// List of specific emails to search for
$emailsToSearch = [
    'upsready@shipstation.com',
    'trials@shipstation.com',
    'salesinbox@shipstation.com',
    'sales@shipstation.com',
    'trials@shipstation.com',
    'sales@shipstation.ca',
];

// Query to get all site IDs from the wp_blogs table
$siteQuery = "SELECT blog_id FROM wp_blogs";

if ($result = $mysqli->query($siteQuery)) {
    while ($row = $result->fetch_assoc()) {
        $blogId = $row['blog_id'];
        // Adjust the prefix pattern according to your WP Multisite setup
        $tablePrefix = 'wp_' . ($blogId == 1 ? '' : $blogId . '_');

        foreach ($emailsToSearch as $email) {
            // Escape email for use in LIKE statement
            $escapedEmail = $mysqli->real_escape_string($email);

            var_dump( $escapedEmail);

            // Query to search for the specific email in wp_posts
            $searchQuery = "
                SELECT ID, post_title, post_content, post_status
                FROM {$tablePrefix}posts
                WHERE post_content LIKE '%$escapedEmail%' AND post_status = 'publish'
            ";

            $searchResult = $mysqli->query($searchQuery);

            if ($searchResult && $searchResult->num_rows > 0) {
                $resultsFound = true;

                while ($post = $searchResult->fetch_assoc()) {
                    fputcsv($csvFile, [
                        $blogId,
                        $post['ID'],
                        $post['post_title'],
                        $email,
                        $post['post_status']
                    ]);
                }
            }
        }
    }
}

if (!$resultsFound) {
    fputcsv($csvFile, ['No specific emails found in any posts.']);
}

// Close the CSV file and MySQL connection
fclose($csvFile);
$mysqli->close();
