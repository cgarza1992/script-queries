<?php
/**
 * Render Pricing Plans.
 */
function render_pricing_plans($attributes, $content, $block) {
    // Plans Attributes
    $uniqueID = $attributes['uniqueID'] ?? '';
    $planName = $attributes['planName'] ?? 'Free';
    $planHeaderDesc = $attributes['planHeaderDesc'] ?? 'Unlock discounted carrier rates coupled with essential API access.';
    $planPrice = $attributes['planPrice'] ?? '$0.00';
    $planDesc = $attributes['planDesc'] ?? '';
    $selectedCurrency = $attributes['selectedCurrency'] ?? 'USD';
    $selectedTier = $attributes['selectedTier'] ?? 'firstTier';
    $planTierData = $attributes['planTierData'] ?? [];
    // Initialize selectedTierData with the default value or the block attribute value
    $selectedTierData = isset($attributes['planTierData'][$selectedCurrency][$selectedTier])
    ? $attributes['planTierData'][$selectedCurrency][$selectedTier]
    : null;
    $formattedOveragePrice = $attributes['formattedOveragePrice'] ?? '$0.00';

    $recommendedClass = $attributes['customAttribute']['recommendedClass'] ? 'recommended' : '';
    $customCopy = $attributes['customAttribute']['customCopy'];

    // Ensure the data is not empty before localizing
    if (!empty($planName) && !empty($planTierData)) {
        // Grab the plugin url.
        $plugin_url = plugins_url('/', __FILE__);
        $planDataFile = $plugin_url . 'data/planData.js';
        $localObjectName = 'planData' . $planName;

        // Enqueue your JavaScript file with dependencies
        wp_enqueue_script('plan-data-script', $planDataFile, [], '1.0', false);

        $localized_data = array(
            'planName' => $planName,
            'planTierData' => $planTierData,
        );

        // Localize the script.
        wp_localize_script('plan-data-script', $localObjectName, $localized_data);
    }

    // Dropdown or show Content Attributes
    $displayType = isset($attributes['displayType']) ? $attributes['displayType'] : 'dropdown';
    $planPriceMobileCopy = (strtolower($planName) !== 'enterprise' && strtolower($planName) !== 'free') ? 'From ' : '';
    $planPriceSubscriptionCopy = strtolower($planName) !== 'enterprise' ? '/month ' : '';
    $content = isset($attributes['content']) ? $attributes['content'] : '';

    // Button Attributes
    $buttonText = isset($attributes['buttonData']['text']) ? $attributes['buttonData']['text'] : '';
    $buttonUrl = isset($attributes['buttonData']['url']) ? $attributes['buttonData']['url'] : '#';
    // Add a unique identifier for each button based on the planName
    $buttonId = 'pricing-button-' . sanitize_title( strtolower( $planName ));
    $buttonStyle = isset($attributes['buttonData']['style']) ? $attributes['buttonData']['style'] : 'primary';

    $openLinkIn = isset($attributes['buttonData']['openLinkIn']) ? $attributes['buttonData']['openLinkIn'] : '_self';
    $target = '';

    if ($openLinkIn === '_blank') {
        $target = $openLinkIn;
    } else if ($openLinkIn === '_self') {
        $target = $openLinkIn;
    } else {
        $target = '';
    }

    // Features Attributes
    $featuresTitle = isset($attributes['featuresTitle']) ? $attributes['featuresTitle'] : '';
    $features = isset($attributes['features']) ? $attributes['features'] : [];

    // Create a select dropdown using planTierData
    $dropdownOptions = '';
    $selectedTierData = null ; // Initialize selected tier data with null

    if ($displayType === 'dropdown') {
        // Initialize selectedTierData with the default value or the block attribute value
        $selectedTierData = isset($attributes['planTierData'][$selectedCurrency][$selectedTier])
            ? $attributes['planTierData'][$selectedCurrency][$selectedTier]
            : null;

        $tiers = array_keys($planTierData[$selectedCurrency]);

        foreach ($tiers as $tier) {
            $tierData = $planTierData[$selectedCurrency][$tier];
            $selected = '';
            $code = '';

            if ($tier === $selectedTier) {
                $selected = 'selected="selected"';
                $selectedTierData = $tierData; // Set selected tier data
                $code = $tierData['monthly']['code'];
            }


            $dropdownOptions .= '<li tabindex="0" data-tier="' . esc_attr($tier) . '" data-code="' . esc_attr($code) . '" class="dropdown-item ' . $selected . '">
                <div tabindex="0" class="monthlyLabel" aria-label="Monthly Label Count ' . esc_html($tierData['monthly']['label']) . '">' . esc_html($tierData['monthly']['label']) . '</div>
                <div tabindex="0" class="overageLabel" aria-label="The additional overage price per label is ' . esc_html($tierData['monthly']['overagePrice']) . '">+<span class="overagePrice">+' . esc_html($tierData['monthly']['overagePrice']) . '</span> per additional label</div>
            </li>';
        }
    }

    // Display overage pricing based on selectedTierData
    $overageInfo = '';

    if (!empty($selectedTierData)) {
        $overagePrice = $selectedTierData['monthly']['overagePrice'];
        $overageCurrency = $selectedCurrency; // Replace with the desired currency
        $overageUrl = esc_url("https://help.versatile.com/hc/en-us/articles/19326502173851");

        $overagePriceHtml = '<span class="overagePrice" tabindex="0" aria-label="Overage Price">' . esc_html($formattedOveragePrice) . '</span>';
        $additionalLabelHtml = 'per additional label';
        $overagesLinkHtml = '<a href="' . $overageUrl . '">see overages</a>';

        $overageInfo = "+$overagePriceHtml $additionalLabelHtml $overagesLinkHtml";
    }

    ob_start();
    ?>
    <div class="planBannerContainer <?php echo esc_attr($recommendedClass) ?>" data-plan-name="<?php echo esc_attr( $planName); ?>" data-uuid="<?php echo esc_attr( $uniqueID ); ?>" tabindex="0">
        <?php if ( $attributes['customAttribute']['recommendedClass'] ) : ?>
            <div class="planBanner"><span class="planBannerCopy"><?php echo esc_html($customCopy) ?></span></div>
        <?php else: ?>
            <!-- add in padding to keep the spacing consistent -->
            <div class="planBanner"></div>
        <?php endif; ?>
        <div class="pricing-plans <?php echo strtolower($planName) ?>" data-plan-name="<?php echo esc_attr( $planName); ?>" tabindex="0" aria-label="<?php echo esc_attr( $planName ) ?> plan">
            <div class="planHeader" tabindex="0">
                <div class="planName" tabindex="0">
                    <h3>
                       <span class="planTitle"> <?php echo esc_html($planName) ?></span>
                        <?php if ( $attributes['customAttribute']['recommendedClass'] ) : ?>
                            <span class="mobileBanner">
                                <span class="bannerText"><?php echo esc_html($customCopy) ?></span>
                            </span>
                        <?php endif; ?>
                    </h3>
                </div>
                <div class="planPriceMobileSection" tabindex="0" aria-label="Plan Mobile Section">
                    <p>
                        <?php echo esc_html($planPriceMobileCopy) . '<span class="planPriceMobile">' . esc_html($planPrice) . '</span><span class="planPriceMobileSubscription">' . esc_html($planPriceSubscriptionCopy) . '</span>'; ?>
                    </p>
                </div>
                <div class="planHeaderDesc" tabindex="0" aria-label="Plan Description">
                    <p>
                        <?php echo esc_html($planHeaderDesc) ?>
                    </p>
                </div>
                <div class="show-more-chevron" tabindex="0" aria-label="show more icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M14.7493 7.25C14.416 6.91667 13.916 6.91667 13.5827 7.25L9.91602 10.8333L6.33268 7.25C5.99935 6.91667 5.49935 6.91667 5.16602 7.25C4.83268 7.58333 4.83268 8.08333 5.16602 8.41667L9.33268 12.6667C9.49935 12.8333 9.74935 12.9167 9.91602 12.9167C10.166 12.9167 10.3327 12.8333 10.4993 12.6667L14.666 8.41667C15.0827 8.08333 15.0827 7.58333 14.7493 7.25Z" fill="#5F27CD"/>
                    </svg>
                </div>
            </div>
            <div class="planDetails" data-plan-name="<?php echo esc_attr( $planName); ?>" tabindex="0" aria-label="Plan Section">
                <div class="planPrice" tabindex="0" aria-label="Plan Price">
                    <h2>
                        <span class="pricing"><?php echo esc_html($planPrice) ?></span><span class="planPriceSubscription"><?php echo esc_html($planPriceSubscriptionCopy) ?></span>
                    </h2>
                </div>
                <div class="planTier">
                <?php
                    if ($displayType === 'dropdown'):
                        ?>
                        <div class="planDropdown" aria-label="Additional Label Pricing and Overages" role="combobox" aria-haspopup="listbox" aria-expanded="false">
                            <div class="dropdown-container" tabindex="0">
                                <div class="selected-tier" data-tier="<?= esc_attr($selectedTier) ?>" role="textbox" aria-autocomplete="both" aria-controls="pricing-options" aria-haspopup="listbox"><?= esc_html($selectedTierData['monthly']['minCount']) ?> labels per month</div>
                                <div class="dropdown-arrow" role="button" aria-label="Toggle dropdown">
                                    <svg tabindex="0" class="rotate-icon" xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                                        <path d="M13.7136 4.29756C13.3165 3.90049 12.7209 3.90049 12.3238 4.29756L7.95605 8.56606L3.68755 4.29756C3.29048 3.90049 2.69487 3.90049 2.2978 4.29756C1.90073 4.69463 1.90073 5.29023 2.2978 5.68730L7.26118 10.7499C7.45971 10.9485 7.75752 11.0478 7.95605 11.0478C8.25385 11.0478 8.45239 10.9485 8.65093 10.7499L13.6143 5.68730C14.1106 5.29023 14.1106 4.69463 13.7136 4.29756Z" fill="#5F27CD"></path>
                                    </svg>
                                </div>
                            </div>
                            <ul id="pricing-options" class="pricing-plans__ul <?= $planName ?>" role="listbox" aria-hidden="true">
                                <?= $dropdownOptions ?>
                            </ul>
                            <div id="result" class="overages" tabindex="0" aria-label="overage pricing">
                                <?= $overageInfo ?>
                            </div>
                        </div>
                    <?php endif;

                    if ($displayType === 'content' && !empty($content)):
                        ?>
                        <div class="planContent" tabindex="0" aria-label="Plan Content Description">
                            <?php echo wp_kses_post($content); ?>
                        </div>
                    <?php endif;
                ?>
                </div>
                <div class="plansButton <?php echo esc_attr( $buttonStyle ); ?>" tabindex="0" aria-label="<?php echo esc_attr( $planName )?> plan button">
                    <a id="<?php echo esc_attr( $buttonId ); ?>" href="<?php echo esc_url($buttonUrl); ?>" target="<?php echo esc_attr($target); ?>">
                        <?php echo esc_html($buttonText); ?>
                    </a>
                </div>
                <div class="features" tabindex="0" aria-label="Features Section">
                    <div class="featuresTitle" tabindex="0" aria-label="Features Title">
                        <h5>
                            <?php echo esc_html($featuresTitle); ?>
                        </h5>
                    </div>
                    <div class="featuresList">
                        <ul>
                            <?php
                            foreach ($features as $feature) {
                                echo '<li tabindex="0" aria-label="feature">' . esc_html($feature['content']) . '</li>';
                            }
                            ?>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php

    return ob_get_clean();
}
