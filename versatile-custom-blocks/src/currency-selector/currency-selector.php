<?php
function render_currency_selector_block($attributes) {
    // Set a default country code so that empty country codes don't break the block.
    $country_code = '';
	$selectedCurreny = 'USD';

    // Check if WPEngine\GeoIP class exists
    if (class_exists('WPEngine\GeoIP')) {
        $country_code = do_shortcode('[geoip-country]');

        if (empty($country_code)) {
            $country_code = 'US';
        }
    }

    // Define an array of country-to-currency mappings.
    $countryCurrencyMapping = array(
        'US' => 'USD', // Default for US, CA, AUS
        'GB' => 'GBP',
        'DE' => 'EUR',
        'FR' => 'EUR',
        // Add mappings for other countries as needed.
    );

	// Determine the default currency based on the country code
	$selectedCurrency = isset($countryCurrencyMapping[$country_code]) ? $countryCurrencyMapping[$country_code] : 'USD';

	// Check if our country code is in the country currency mapping array.
	if( ! array_key_exists( $country_code, $countryCurrencyMapping ) ) {
		$get_continent = do_shortcode('[geoip-continent]');

		// allow mapping of continents to currencies for EU countries that need to be in EUROS.
		if ( ! empty( $get_continent ) && $get_continent == 'EU' ) {
			$continentCurrencyMapping = array(
				'EU' => 'EUR',
			);

			// Override the default currency based on the continent code if we have a country that isn't in our country currency mapping array.
			$selectedCurrency = isset($continentCurrencyMapping[$get_continent]) ? $continentCurrencyMapping[$get_continent] : 'USD';
		}
	}

    // Modify the $currencyOptions array to store both the currency code and its respective symbol
    $currencyOptions = array(
        'USD' => array(
            'code' => 'USD',
            'symbol' => '$',
            'label' => '$ USD'
        ),
        'GBP' => array(
            'code' => 'GBP',
            'symbol' => '£',
            'label' => '£ GBP'
        ),
        'EUR' => array(
            'code' => 'EUR',
            'symbol' => '€',
            'label' => '€ EUR'
        ),
        // Add other currency options as needed
    );

    ob_start();
    ?>
	<div class="currency-selector-block">
			<div class="currencySelector">
				<?php
				// Retrieve the currency symbol for the default selected value
					$selectedCurrencyData = $currencyOptions[$selectedCurrency];
					$selectedCurrencySymbol = $selectedCurrencyData['symbol'];
				?>
				<div class="currency-select" id="currency-select" data-selected-currency="<?= esc_attr($selectedCurrency) ?>" data-selected-symbol="<?= esc_attr($selectedCurrencySymbol) ?>" role="combobox" aria-haspopup="listbox" aria-expanded="false" tabindex="0">
					<div class="currency-label-container">
						<span class="currency-label">
							<?= esc_html($selectedCurrencySymbol) ?> <?= esc_html($selectedCurrency) ?>
						</span>
					</div>
					<div class="dropdown-arrow" tabindex="1">
						<span>
							<!-- Add the dropdown arrow SVG here -->
							<svg class="rotate-icon" xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
								<path d="M13.7136 4.29756C13.3165 3.90049 12.7209 3.90049 12.3238 4.29756L7.95605 8.56606L3.68755 4.29756C3.29048 3.90049 2.69487 3.90049 2.2978 4.29756C1.90073 4.69463 1.90073 5.29023 2.2978 5.68730L7.26118 10.7499C7.45971 10.9485 7.75752 11.0478 7.95605 11.0478C8.25385 11.0478 8.45239 10.9485 8.65093 10.7499L13.6143 5.68730C14.1106 5.29023 14.1106 4.69463 13.7136 4.29756Z" fill="#5F27CD"/>
							</svg>
						</span>
					</div>
				</div>
				<ul class="currency-options" id="currency-options" role="listbox" aria-labelledby="currency-select">
					<?php
					$index = 0;
					foreach ($currencyOptions as $currencyData) {
						$currencyCode = $currencyData['code'];
						$currencySymbol = $currencyData['symbol'];
						$currencyLabel = $currencyData['label'];

						$selectedClass = ($selectedCurrency === $currencyCode) ? 'selected' : '';
						$ariaSelected = ($selectedCurrency === $currencyCode) ? 'true' : 'false';
						?>
						<li class="currency-option <?= esc_attr($selectedClass) ?>"
							data-value="<?= esc_attr($currencyCode) ?>"
							data-symbol="<?= esc_attr($currencySymbol) ?>"
							tabindex="0"
							role="option"
							id="selected-currency-option<?= $index ?>"
							aria-selected="<?= $ariaSelected ?>">
							<?= esc_html($currencyLabel) ?>
						</li>
						<?php
						$index++;
					}
					?>
				</ul>
			</div>
		</div>
		<?php
		return ob_get_clean();
		}
	?>
