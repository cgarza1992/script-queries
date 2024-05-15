<?php
/**
 * Plugin Name:       versatile Custom Blocks Plugin
 * Description:       Custom Blocks for versatile.
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       versatile-custom-blocks
 *
 * @package           create-block
 */

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/block-editor/tutorials/block-tutorial/writing-your-first-block-type/
 */

// Require our dynamic pricing plans block.
require_once( plugin_dir_path( __FILE__ ) . 'src/pricing-plans/pricing-plans.php' );
require_once( plugin_dir_path( __FILE__ ) . 'src/currency-selector/currency-selector.php' );

function versatile_custom_blocks_init() {
	// Register our dynamic pricing plans block.
	register_block_type(
		plugin_dir_path( __FILE__ ) . 'build/pricing-plans/',
		[ 'render_callback' => 'render_pricing_plans' ]
	);

    register_block_type(
		plugin_dir_path( __FILE__ ) . 'build/currency-selector/',
		[ 'render_callback' => 'render_currency_selector_block' ]
	);
}



add_action( 'init', 'versatile_custom_blocks_init' );
