<?php
/**
 * WARNING: This script will drop tables from the database. Use with extreme caution.
 * Ensure that you have backed up your database before running this script.
 */

// Include WordPress for functionality access
require_once('wp-load.php');
global $wpdb;

// Get all tables in the database
$tables = $wpdb->get_results("SHOW TABLES", ARRAY_N);

// Pattern to match tables that are not part of the main site.
// Adjust the pattern depending on your WordPress table prefix and main site's table structure.
// This example assumes 'wp_' as the prefix for the main site.
$table_prefix = $wpdb->base_prefix; // Typically 'wp_'
$pattern = '/^' . preg_quote($table_prefix, '/') . '\d+_/';

foreach ($tables as $table) {
    $table_name = $table[0];
    if (preg_match($pattern, $table_name)) {
        // SQL to drop table, use with caution
        $sql = "DROP TABLE IF EXISTS $table_name";
        $wpdb->query($sql);
        echo "Dropped table: $table_name<br/>";
    }
}

echo "Operation completed. All subsite tables have been dropped.";
?>
