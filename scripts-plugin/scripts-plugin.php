<?php
/*
Plugin Name: Custom Scripts Finder Plugin (Auctane)
Plugin URI: http://example.com
Description: This plugin finds specific data in posts and generates a CSV file based on user-defined queries.
Version: 1.0
Author: Christopher Garza
*/

defined('ABSPATH') or die('Direct access forbidden.');

function cta_finder_add_admin_page() {
    add_management_page('Custom Finder', 'Custom Finder', 'manage_options', 'custom-finder', 'custom_finder_admin_page');
}

add_action('admin_menu', 'cta_finder_add_admin_page');

function custom_finder_admin_page() {
    ?>
    <div class="wrap">
        <h2>Custom Data Finder</h2>
        <form method="post">
            <label for="query_type">Select Query Type:</label>
            <select name="query_type" id="query_type" required>
                <option value="">Select a Type</option>
                <option value="email">Email</option>
                <option value="cta">CTA</option>
                <option value="general">General</option>
                <option value="regex">Regex</option>
            </select><br><br>

            <label for="search_items">Enter Items to Search (comma-separated, use regex if 'Regex' is selected):</label>
            <textarea name="search_items" id="search_items" required></textarea><br><br>

            <input type="submit" value="Generate CSV" name="custom_finder_run" class="button-primary">
        </form>

        <?php
        if (isset($_POST['custom_finder_run'])) {
            custom_finder_generate_csv(sanitize_text_field($_POST['query_type']), sanitize_textarea_field($_POST['search_items']));
        }
        ?>
    </div>
    <?php
}

function custom_finder_generate_csv($query_type, $search_items) {
    global $wpdb;

    $csvFileName = 'custom_search_results.csv';
    $csvFilePath = plugin_dir_path(__FILE__) . $csvFileName;
    $csvFile = fopen($csvFilePath, 'w');

    if ($csvFile === false) {
        wp_die('Error opening file ' . $csvFilePath);
    }

    $headers = ['Site ID', 'Post ID', 'Title', 'Found Item', 'Post Status', 'URL', 'Meta Key'];
    fputcsv($csvFile, $headers);

    $items = array_map('trim', explode(',', $search_items));
    $resultsFound = false;

<<<<<<< HEAD
    $sites = $wpdb->get_results("SELECT blog_id FROM {$wpdb->base_prefix}blogs");

    foreach ($sites as $site) {
        $blogId = $site->blog_id;
        switch_to_blog($blogId);

        foreach ($items as $item) {
            if ($query_type == 'regex') {
                // Directly use the regex provided by the user for regex query type
                $like = $item; 
            } else {
                $escapedItem = esc_sql($item);
                $like = "%$escapedItem%";
            }

            // Modify the post content and title search to incorporate regex if specified
            if ($query_type == 'regex') {
                $query = $wpdb->prepare(
                    "SELECT ID, post_title, post_status, post_content FROM {$wpdb->prefix}posts WHERE post_content REGEXP %s AND post_status = 'publish'",
                    $like
                );
            } else {
                $query = $wpdb->prepare(
                    "SELECT ID, post_title, post_status FROM {$wpdb->prefix}posts WHERE post_content LIKE %s AND post_status = 'publish'",
                    $like
                );
            }

            $searchResults = $wpdb->get_results($query);

            if ($searchResults) {
                $resultsFound = true;
                foreach ($searchResults as $post) {
                    $permalink = get_permalink($post->ID);
                    fputcsv($csvFile, [
                        $blogId,
                        $post->ID,
                        $post->post_title,
                        $item,
                        $post->post_status,
                        $permalink,
                        '' // No meta key for post content
                    ]);
                }
            }

            // Search in post meta, applying regex if needed
            $metaQuery = $wpdb->prepare(
                "SELECT post_id FROM {$wpdb->prefix}postmeta WHERE meta_value LIKE %s OR meta_value REGEXP %s",
                $like, $like
            );
            $metaResults = $wpdb->get_results($metaQuery);

            if ($metaResults) {
                $resultsFound = true;
                foreach ($metaResults as $meta) {
                    $post = get_post($meta->post_id);
                    $permalink = get_permalink($meta->post_id);
                    $metaKey = get_post_meta($meta->post_id, $item, true);
                    fputcsv($csvFile, [
                        $blogId,
                        $post->ID,
                        $post->post_title,
                        $item,
                        $post->post_status,
                        $permalink,
                        $metaKey // Meta key where the item was found
                    ]);
                }
            }
=======
    // Check if multisite
    if (is_multisite()) {
        $sites = get_sites();
        foreach ($sites as $site) {
            $results = search_site_content($site->blog_id, $items, $query_type, $wpdb);
            write_results_to_csv($results, $csvFile, $site->blog_id);
            $resultsFound = $resultsFound || !empty($results);
>>>>>>> ab222a7 (feature: add in search/formatting changes.)
        }
    } else {
        // Single site
        $results = search_site_content(1, $items, $query_type, $wpdb);
        write_results_to_csv($results, $csvFile, 1);
        $resultsFound = !empty($results);
    }

    if (!$resultsFound) {
        fputcsv($csvFile, ['No specific items found in any posts or post meta.']);
    }

    fclose($csvFile);
    echo '<p>CSV file created: <a href="' . plugin_dir_url(__FILE__) . $csvFileName . '">' . $csvFileName . '</a></p>';
}

<<<<<<< HEAD
=======
function search_site_content($blog_id, $items, $query_type, $wpdb) {
    $results = [];
    
    if (is_multisite()) {
        switch_to_blog($blog_id);
    }

    foreach ($items as $item) {
        $escapedItem = esc_sql($item);
        $like = "%$escapedItem%";

        // Search in posts
        $query = $wpdb->prepare(
            "SELECT ID, post_title, post_status FROM {$wpdb->prefix}posts WHERE post_content LIKE %s AND post_status = 'publish'",
            $like
        );

        if ($query_type == 'general') {
            $query = $wpdb->prepare(
                "SELECT ID, post_title, post_status FROM {$wpdb->prefix}posts WHERE (post_content LIKE %s OR post_title LIKE %s) AND post_status = 'publish'",
                $like, $like
            );
        }

        $posts = $wpdb->get_results($query);
        foreach ($posts as $post) {
            $results[] = [
                'post_id' => $post->ID,
                'title' => $post->post_title,
                'found_item' => $item,
                'status' => $post->post_status,
                'url' => get_permalink($post->ID),
                'meta_key' => ''
            ];
        }

        // Search in post meta
        $meta_results = $wpdb->get_results($wpdb->prepare(
            "SELECT post_id FROM {$wpdb->prefix}postmeta WHERE meta_value LIKE %s",
            $like
        ));

        foreach ($meta_results as $meta) {
            $post = get_post($meta->post_id);
            if ($post) {
                $results[] = [
                    'post_id' => $post->ID,
                    'title' => $post->post_title,
                    'found_item' => $item,
                    'status' => $post->post_status,
                    'url' => get_permalink($post->ID),
                    'meta_key' => get_post_meta($meta->post_id, $item, true)
                ];
            }
        }
    }

    if (is_multisite()) {
        restore_current_blog();
    }

    return $results;
}

function write_results_to_csv($results, $csvFile, $blog_id) {
    foreach ($results as $result) {
        fputcsv($csvFile, [
            $blog_id,
            $result['post_id'],
            $result['title'],
            $result['found_item'],
            $result['status'],
            $result['url'],
            $result['meta_key']
        ]);
    }
}
?>
>>>>>>> ab222a7 (feature: add in search/formatting changes.)
