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
$csvFilePath = 'hubspot_forms_posts.csv';
$csvFile = fopen($csvFilePath, 'w');

// Check if file is opened successfully
if ($csvFile === false) {
    die('Error opening the file ' . $csvFilePath);
}

// Write CSV header
fputcsv($csvFile, ['Site ID', 'Post ID', 'Title', 'Location', 'Type', 'Post Name', 'Post Template', 'Post Status']);

$resultsFound = false;

// Prepare to collect all GUIDs for bulk URL accessibility check
$guidsToCheck = [];

// Query to get all site IDs from the wp_blogs table
$siteQuery = "SELECT blog_id FROM wp_blogs";

if ($result = $mysqli->query($siteQuery)) {
    while ($row = $result->fetch_assoc()) {
        $blogId = $row['blog_id'];
        // Adjust the prefix pattern according to your WP Multisite setup
        $tablePrefix = 'wp_' . ($blogId == 1 ? '' : $blogId . '_');
        $query = 'id="hbspt-form-"';

        
        // Simplified query to search in wp_posts only
        $searchQueryPosts = "
            SELECT * 
            FROM {$tablePrefix}posts 
            WHERE post_content LIKE {$query} OR 'hubspot' OR post_content LIKE 'hbspt' AND post_status = 'publish'
        ";

        $searchResultPosts = $mysqli->query($searchQueryPosts);

        if ($searchResultPosts && $searchResultPosts->num_rows > 0) {
            $resultsFound = true;

            while ($post = $searchResultPosts->fetch_assoc()) {
                $valuesToCheckSlug = ['-test', '?mt_pp='];
                $valuesToCheckPostType = [
                    'wp_navigation',
                    'wp_global_styles',
                    'videos', 'webinars',
                    'fl-builder-template',
                    'lp-component',
                    'attachment',
                    'revision',
                    'nav_menu_item',
                    'custom_css',
                    'oembed_cache',
                    'wp_block'
                ];

                // For each post found, get the page template from wp_postmeta
                $postMetaQuery = "
                    SELECT meta_value 
                    FROM {$tablePrefix}postmeta 
                    WHERE post_id = {$post['ID']} AND meta_key = '_wp_page_template'
                ";
                $postMetaResult = $mysqli->query($postMetaQuery);

                $template = 'default'; // Assume default if not set

                if ($postMetaResult && $meta = $postMetaResult->fetch_assoc()) {
                    $template = $meta['meta_value'];
                }

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
                    // if (!str_contains($post['guid'], '?')) {
                        $updatedPostGuid = str_replace('.local', '.com', $post['guid']);
                        $updatedPostGuid = str_replace('https://', 'https://www.', $updatedPostGuid);
                        // Ensure $blogId is captured correctly at this point for each site
                        fputcsv(
                            $csvFile,
                            [$blogId,
                            $post['ID'],
                            $post['post_title'],
                            $updatedPostGuid,
                            $post['post_type'],
                            $post['post_name'],
                            $template,
                            $post['post_status']
                        ]);
                        $guidsToCheck[$post['ID']] = $updatedPostGuid;
                    // }
                }
            }
        }
    }
}

if (!$resultsFound) {
    fputcsv($csvFile, ['No results found in any posts.']);
}

// Close the CSV file and MySQL connection
fclose($csvFile);
$mysqli->close();

function checkUrlsAccessibility($urls) {
    $batchSize = 10000; // Number of URLs to process per batch
    $timeout = 30; // Increase timeout to avoid 403 responses
    $result = [];

    $processed = 0; // Counter to track processed URLs within the batch
    foreach ($urls as $id => $url) {
        // Process the URL
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, $timeout); // Set the increased timeout
        // Set user agent if necessary to prevent 403 errors
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');

        $content = curl_exec($ch);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // Check for specific content indicating a valid page (adjust as needed)
        $isValid = ($statusCode == 200) && (strpos($content, 'Oops!') === false);
        $result[$id] = $isValid;

        echo "Processed URL ($id): $url - Status: " . ($isValid ? 'Valid' : 'Invalid') . "\n";

        $processed++;
        // Check if we've reached the batch size and break if so
        if ($processed >= $batchSize) {
            break;
        }
    }

    return $result;
}

$urlCheckResults = checkUrlsAccessibility($guidsToCheck);

// Open the original CSV file
$originalCsvHandle = fopen($csvFilePath, 'r');
if (!$originalCsvHandle) {
    die('Failed to open original CSV for reading.');
}

// Create a new CSV file for valid URLs
$validUrlsCsvFilePath = 'validated_' . $csvFilePath;
$validUrlsCsvHandle = fopen($validUrlsCsvFilePath, 'w');
if (!$validUrlsCsvHandle) {
    die('Failed to create new CSV file for valid URLs.');
}

// Copy the header row
$headers = fgetcsv($originalCsvHandle);
fputcsv($validUrlsCsvHandle, $headers);

// Iterate through each row of the original CSV
while (($row = fgetcsv($originalCsvHandle)) !== FALSE) {
    $postID = $row[1]; // Adjust based on your CSV structure, assuming post ID is the second column

    // Write the row to the new CSV file if the URL check passed
    if (isset($urlCheckResults[$postID]) && $urlCheckResults[$postID] === true) {
        fputcsv($validUrlsCsvHandle, $row);
    }
}

// Close file handles
fclose($originalCsvHandle);
fclose($validUrlsCsvHandle);

echo "New CSV with valid URLs created: $validUrlsCsvFilePath\n";