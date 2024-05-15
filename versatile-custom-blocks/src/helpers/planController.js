import Utils from '../utils/utils';

class PlanController {
    constructor(planBannerContainers, pricingCards, planDetails, planData){
        
        // Set the initial state
        this.planData = planData;
        this.planBannerContainers = planBannerContainers;
        this.pricingCards = pricingCards;
        this.planDetails = planDetails;
        this.utils = new Utils();

        // Card Mode Variables
        this.openPlanIndex = -1;
        this.isCardMode = false;
        this.prevIsCardMode = false;

        // Bind functions
        this.readCurrencyDataFromCookie = this.readCurrencyDataFromCookie.bind(this);
        this.setButtonParams = this.setButtonParams.bind(this);
        this.updatePlanContent = this.updatePlanContent.bind(this);
        this.applyCardMode = this.applyCardMode.bind(this);
        this.togglePlanVisibility = this.togglePlanVisibility.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.openFreePlanByDefault = this.openFreePlanByDefault.bind(this);

        // Get the plan data from the 'planData' attribute
        this.freePlan = {};
        this.advancedPlan = {};
    }

    init() {
        if( this.utils.isMobile() ) {
            this.openFreePlanByDefault();
        }

        // Add event listener for debounced window resize
        let resizeTimeout;

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250); // Adjust the debounce time as needed
        });
    }

    /**
     * Function to open the Free plan by default in card mode
     */
    openFreePlanByDefault() {
        this.planBannerContainers.forEach((container) => {
            const planName = container.getAttribute('data-plan-name');
            if (planName && planName.toLowerCase() === 'free') {
                const index = Array.from(this.planBannerContainers).indexOf(container);
                // Open the Free plan
                this.togglePlanVisibility(index);
            }
        });
    }

    /**
     * Function to handle the resize event and apply the card mode styling.
     */
    handleResize() {
        const newIsCardMode = this.utils.isMobile();
    
        if (newIsCardMode !== this.isCardMode) {
            this.isCardMode = newIsCardMode;
    
            // Loop through pricing cards and plan details to update their classes
            this.pricingCards.forEach((card, i) => {
                if (this.isCardMode) {
                    // In card mode, open the Free plan by default
                    card.classList.toggle('open', i === this.openPlanIndex);
                    card.classList.toggle('collapsed', i !== this.openPlanIndex);
                } else if ( this.prevIsCardMode && !this.isCardMode ) {
                    // In desktop mode, remove the 'open' and 'collapsed' classes
                    card.classList.remove('open', 'collapsed');
                } 

                // Handle Edge Case for when the user is on desktop and resizes to mobile or goes from mobile to desktop.
                if ( !this.prevIsCardMode && this.isCardMode ) {
                    card.classList.remove('open', 'collapsed');
                    this.openFreePlanByDefault();
                }
            });
    
            this.prevIsCardMode = this.isCardMode;
            this.applyCardMode(this.isCardMode);
        }
    }

    /**
     * Function to toggle the classes for pricing-plans and planDetails.
     * @param {number} index Determines which plan to open/close.
     */
    togglePlanVisibility(index) {
        // Check if it's not a mobile view, in which case, return without doing anything
        if (!this.utils.isMobile()) {
            return;
        }
    
        // Check if the plan at the given index is already open
        const isOpen = this.openPlanIndex === index;
        
        // Determine whether the plan should be opened
        const shouldOpen = !isOpen && index !== -1;
    
        // Loop through pricing cards and toggle classes based on the logic
        this.pricingCards.forEach((card, i) => {
            card.classList.toggle('open', i === index && shouldOpen);
            card.classList.toggle('collapsed', i !== index || !shouldOpen);
        });
    
        // Loop through plan details and toggle classes based on the logic
        this.planDetails.forEach((details, i) => {
            details.classList.toggle('open', i === index && shouldOpen);
            details.classList.toggle('collapsed', i !== index || !shouldOpen);
        });
    
        // Update the openPlanIndex based on whether the plan is opened or closed
        this.openPlanIndex = shouldOpen ? index : -1;
    }    

    /**
     * 
     * @param {function} callback The callback function to execute when the currency data is found.
     * @returns {object}          Returns the currency data object. Call the provided callback function with the extracted data.
     */
    readCurrencyDataFromCookie(callback) {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'currencyData') {
                try {
                    const currencyData = JSON.parse(decodeURIComponent(value));
                    return callback(currencyData);
                } catch (error) {
                    console.error('Error parsing currencyData cookie:', error);
                }
            }
        }
        return null; // Return null if the cookie is not found or cannot be parsed
    }

    /**
     * Update plan prices based on the selected currency and tier and then set our cookie/update our cookie when a selection changes.
     *
     * @param {string} currency              The currency code. This can be 'USD', 'GBP', or 'EUR'.
     * @param {string} tier                  The tier. This can be 'firstTier', 'secondTier', or 'thirdTier'.
     * @param {Element} planBannerContainers The plan banner containers to perform our updates on.
     * @param {object} planData              The plan data to use for our updates.
     */
    updatePlanContent(currency, tier) {
        // Check for our localized data to do our currency/data swap.
        if (typeof planDataFree !== 'undefined' && typeof planDataAdvanced !== 'undefined') {
            this.freePlan = planDataFree;
            this.advancedPlan = planDataAdvanced;

            // Define planData object with Free and Advanced plans
            this.planData['Free'] = this.freePlan;
            this.planData['Advanced'] = this.advancedPlan;
        }

        // Initialize plan prices with the selected currency and tier
        const freePlanPrice = document.querySelector('.pricing-plans.free .planPrice .pricing');
        const freePlanPriceMobile = document.querySelector( '.pricing-plans.free .planPriceMobile');
        const advancedPlanPrice = document.querySelector('.pricing-plans.advanced .planPrice .pricing');
        const advancedPlanPriceMobile = document.querySelector('.pricing-plans.advanced .planPriceMobile');
        const currencyOptions = document.getElementById('currency-options');

        // Map of currency codes to symbols as a fallback in case our symbol is not found.
        const symbolMap = {
            'USD': '$',
            'GBP': '£',
            'EUR': '€',
        };

        // If there is no currency selected, default to $ for the default USD currency.
        const selectedSymbol = currencyOptions
            ? currencyOptions.querySelector(`[data-value="${currency}"]`)?.getAttribute('data-symbol')
            : this.readCurrencyDataFromCookie((currencyData) => currencyData.currencySymbol) || symbolMap[currency];

        // Update our button parameters.
        this.setButtonParams(currency, tier, this.planBannerContainers, this.planData);

        if (
            this.freePlan &&
            this.freePlan.planTierData &&
            this.freePlan.planTierData[currency] &&
            this.freePlan.planTierData[currency][tier] &&
            this.freePlan.planTierData[currency][tier].monthly
        ) {
            freePlanPrice.textContent = this.freePlan.planTierData[currency][tier].monthly.subscription;
            freePlanPriceMobile.textContent = this.freePlan.planTierData[currency][tier].monthly.subscription;
        } else {
            freePlanPrice.textContent = this.freePlan.planTierData[currency]['firstTier'].monthly.subscription;
            freePlanPriceMobile.textContent = this.freePlan.planTierData[currency]['firstTier'].monthly.subscription;
        }

        if (
            this.advancedPlan &&
            this.advancedPlan.planTierData &&
            this.advancedPlan.planTierData[currency] &&
            this.advancedPlan.planTierData[currency][tier] &&
            this.advancedPlan.planTierData[currency][tier].monthly
        ) {
            advancedPlanPrice.textContent = this.advancedPlan.planTierData[currency][tier].monthly.subscription;
            advancedPlanPriceMobile.textContent = this.advancedPlan.planTierData[currency][tier].monthly.subscription;

            // Create a new anchor element
            let overagesLinkElement = document.createElement('a');

            // Set the link URL and text content
            overagesLinkElement.href = 'https://help.versatile.com/hc/en-us/articles/19326502173851';
            overagesLinkElement.target = '_blank';
            overagesLinkElement.textContent = 'see overages';

            // Update the overage prices for below the dropdown.
            let resultElement = document.querySelector('#result');
            resultElement.textContent = this.advancedPlan.planTierData[currency][tier].monthly.overagePrice + ' per additional label ';
            resultElement.appendChild(overagesLinkElement);
        }

        // Add the selected currency symbol to the currencyData object
        let currencyData = {
            currencyCode: currency,
            currencySymbol: selectedSymbol,
        };

        // Update the 'currencyData' cookie with the selected currency
        document.cookie = 'currencyData=' + JSON.stringify(currencyData) + '; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/';
    }

    /**
     * 
     * @param {string} selectedCurrency The selected currency. This can be 'USD', 'GBP', or 'EUR'.
     * @param {string} selectedTier The selected tier. This can be 'firstTier', 'secondTier', or 'thirdTier'.
     * @param {array} containers An array of DOM elements that contain the plan buttons.
     * @param {object} data An object containing the plan data.
     */
    setButtonParams(selectedCurrency, selectedTier, containers, data) {
        containers.forEach((container) => {
            const planName = container.getAttribute('data-plan-name');
            const button = container.querySelector(`[id^="pricing-button-${planName.toLowerCase()}"]`);
    
            if (planName && selectedTier && selectedCurrency && data[planName]) {
                const planTierData = data[planName].planTierData[selectedCurrency];
                
                if (planTierData) {
                    const tier = planName === 'Advanced' ? selectedTier : 'firstTier';
                    const planSku = planTierData[tier]?.monthly?.code;
    
                    if (planSku && planSku !== button.getAttribute('data-planSku')) {
                        const queryParams = 'code=' + planSku;
                        const href = button.href.replace(/(\?|&)code=[^&]+/, ''); // Remove existing 'code' parameter
                        button.href = href + (href.includes('?') ? '&' : '?') + queryParams; // Add the new 'code' parameter
    
                        // Find the comparison table plan button
                        const comparisonTablePlanButton = document.querySelector(`[id^="pricing-button-${planName.toLowerCase()}-comparison-table"]`);
    
                        if (comparisonTablePlanButton) {
                            const comparisonHref = comparisonTablePlanButton.href.replace(/(\?|&)code=[^&]+/, ''); // Remove existing 'code' parameter
                            comparisonTablePlanButton.href = comparisonHref + (comparisonHref.includes('?') ? '&' : '?') + queryParams; // Add the new 'code' parameter;
                        }
    
                        // Update the data attribute to store the current planSku value
                        button.setAttribute('data-planSku', planSku);
                    }
                }
            }
        });
    }

    /**
     * A function that cleans up CSS selectors for styling when the viewport width is in different viewports.
     * 
     * @param {boolean} isCardMode A variable to decide whether or not to apply a cleanup function for styling.
     */
    applyCardMode(isCardMode) {
        if (isCardMode) {
            // Apply the "collapsed" class to the other pricing plans initially.
            this.pricingCards.forEach((card) => {
                let planName = card.getAttribute('data-plan-name').toLowerCase();
                if (planName !== 'free') {
                    card.classList.add('collapsed');
                }
            });

            this.planDetails.forEach((details) => {
                let planName = details.getAttribute('data-plan-name').toLowerCase();

                if (planName !== 'free') {
                    details.classList.add('collapsed');
                }
            });
        } else {
            // Apply the "collapsed" class to all pricing plans when transitioning to non-card mode
            this.pricingCards.forEach((card) => {
                card.classList.remove('open');
                card.classList.remove('collapsed');
            });

            this.planDetails.forEach((details) => {
                details.classList.remove('open');
                details.classList.remove('collapsed');
            });
        }
    }
}

export default PlanController;
