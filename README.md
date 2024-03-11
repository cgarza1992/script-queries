# PHP Script for Exporting and Validating URLs

These PHP scripts connect to a WordPress database, and retrieve specific posts based on criteria (including custom post templates and content containing HubSpot forms or gravity forms), and exports relevant post information to a CSV file. It also checks the accessibility of URLs in bulk and creates a separate CSV file for valid URLs depending on the script being used.

## Prerequisites

- PHP environment with MySQLi extension enabled.
- Access to a MySQL database with WordPress data.
- CURL extension enabled for PHP (for URL accessibility checks).

## How to Use

1. **Database Configuration**: Modify the `$hostname`, `$username`, `$password`, and `$database` variables at the beginning of the script to match your database connection details. Do not run this in a production environment as it is not a secure way of connecting to your database.

2. **Execution**: Run the script in a PHP-enabled environment. This can be done through a command line interface or by accessing the script via a web server.

3. **CSV Files**: The script will generate two CSV files in the directory where the script is located:
   - `hubspot_forms_postmeta_valid_urls.csv` - Contains exported posts before URL validation.
   - `valid_hubspot_forms_postmeta_valid_urls.csv` - Contains posts with URLs that passed the accessibility check.

4. **URL Accessibility Check**: The script checks each URL for accessibility based on HTTP status codes and specific content. Adjust the `checkUrlsAccessibility` function as necessary to match your validation criteria.

## Functionality Overview

- **Database Connection**: The script connects to your WordPress database to fetch posts.
- **Export to CSV**: Filters and exports posts to a CSV file. It looks for posts with specific characteristics and excludes certain post types and URLs based on defined criteria.
- **URL Validation**: Performs a bulk check of URLs for accessibility, filtering out invalid ones based on HTTP status codes and page content.
- **Export Valid URLs**: Generates a new CSV file containing only the posts with valid URLs.

## Customization

- Modify the SQL queries to adjust which posts are selected based on your requirements.
- Adjust the URL filtering criteria in the `checkUrlsAccessibility` function to customize what is considered a valid URL.

## Troubleshooting

- Ensure your PHP environment has the MySQLi and CURL extensions enabled.
- Check database connection details for accuracy.
- Verify write permissions in the directory where the script is executed for CSV file creation.

---

This README provides a comprehensive guide for running and customizing the script based on your specific needs. Modify it as necessary to fit your project's documentation standards.