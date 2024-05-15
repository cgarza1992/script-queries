import Utils from '../utils/utils';
import PlanController from '../helpers/planController';

document.addEventListener('DOMContentLoaded', function () {
    // Initialize our Utils and PlanController classes.
    const utils = new Utils();
    // Check for the plans block wrapper.
    const blockWrapper = document.querySelector('.pricing-plans');

    // Exit if the block wrapper is not found
    if (!blockWrapper) {
        console.error('Block wrapper not found');
        return; // Exit if the block wrapper is not found
    }

    // Get all plan headers and chevron icons
    const planHeaders = document.querySelectorAll('.planHeader');
    const pricingCards = document.querySelectorAll('.pricing-plans'); // Add a class 'card' for card mode
    const planDetails = document.querySelectorAll('.planDetails');
    const planData = {}; // Initialize an object to store the plan data
    const planBannerContainers = document.querySelectorAll('[data-uuid]');

    // Initialize the PlanController class.
    const planController = new PlanController(planBannerContainers, pricingCards, planDetails, planData);

    planController.init();

    // Get all the top parent elements of the acf block containers.
    const topParents = document.querySelectorAll('.block__container--wrapper');

    // Loop through them to figure out if they have any pricing tiles.
    topParents.forEach((topParent) => {
        const pricingPlans = topParent.querySelectorAll('.pricing-plans');

        // If there are "pricing-plans" elements, set the max-width of the top parent.
        if (pricingPlans.length > 0) {
            topParent.style.maxWidth = '1185px';
            topParent.classList.add('pricingContainer');
        }
    });

    // Add event listeners to each plan header
    planHeaders.forEach((planHeader, index) => {
        planHeader.addEventListener('click', function () {
            // Check if it's in "card" mode and the viewport width is 1039px or less before executing the code
            if (utils.isMobile()) {
                planController.togglePlanVisibility(index);
            }
        });
    });

    // Grab our Currency Selector.
    let currencySelect = document.getElementById('currency-select');
    // Set the default tier for the advanced plan. This can be changed to 'secondTier' or 'thirdTier' as needed.
    let selectedTier = 'firstTier';
    // Initialize the selected currency based on the 'currencyData' cookie or the data-selected-currency attribute. If no values then default to USD.
    let selectedCurrency = planController.readCurrencyDataFromCookie((currencyData) => currencyData.currencyCode) || currencySelect?.getAttribute('data-selected-currency') || 'USD';

    // Update the plan content based on the selected currency and tier based on the currency selector or the cached data.
    planController.updatePlanContent(selectedCurrency, selectedTier, planBannerContainers, planData);

    // Listen for the 'changeCurrency' event
    document.addEventListener('changeCurrency', function (event) {
        selectedCurrency = event.detail.currencyCode; // Access the selected currency code from the event detail
        selectedTier = document.querySelector('.selected-tier').getAttribute('data-tier'); // Get the selected tier

        // Update .planDropdown elements for both Free and Advanced plans
        dropdowns.forEach((dropdown) => {
            const optionsList = dropdown.querySelector('.pricing-plans__ul');
            const options = optionsList.querySelectorAll('li');

            // Iterate through the options and update the overage price
            options.forEach((option) => {
                const tier = option.getAttribute('data-tier');

                // Update the code attribute for the option plan so that we know what to send to the signup page.
                option.setAttribute('data-code',  planController.advancedPlan.planTierData[selectedCurrency][tier]['monthly']['code']);
                // Update the overage price based on the selected currency
                option.querySelector('.overagePrice').textContent =
                    planController.advancedPlan.planTierData[selectedCurrency][tier]['monthly']['overagePrice'];
            });
        });

        // Loop through our pricing cards and update the pricing.
        pricingCards.forEach((pricingCard) => {
            // Find the closest planBannerContainer element
            const planBannerContainer = pricingCard.closest('.planBannerContainer');

            if (planBannerContainer) {        
                // Find the .selected-tier element within the specific planBannerContainer
                const selectedTierElement = planBannerContainer.querySelector('.selected-tier');

                if (selectedTierElement) {
                    const dataTier = selectedTierElement.getAttribute('data-tier');
                    const planPriceMobile = pricingCard.querySelector('.planPriceMobile');

                    // Check for a mobile pricing element. Otherwise use the desktop pricing element.
                    if (planPriceMobile) {
                        const planName = pricingCard.classList.contains('free') ? 'Free' : 'Advanced';

                        // Skip updating the pricing for the enterprise section
                        if (!pricingCard.classList.contains('enterprise')) {
                            const selectedTierData =
                                planData[planName].planTierData[selectedCurrency][dataTier] ??
                                planData[planName].planTierData[selectedCurrency]['firstTier'];

                            if (selectedTierData) {
                                planPriceMobile.textContent = selectedTierData.monthly.subscription;
                            }
                        }
                    }

                    // Update our plan prices when the currency changes.
                    planController.updatePlanContent(selectedCurrency, dataTier, planBannerContainers, planData);
                }
            }
        });        
    });

    // Initialize the dropdowns
    const dropdowns = document.querySelectorAll('.planDropdown');

    dropdowns.forEach((dropdown) => {
        const container = dropdown.querySelector('.dropdown-container'); // Select the container
        const selectedTier = dropdown.querySelector('.selected-tier');
        const optionsList = dropdown.querySelector('.pricing-plans__ul');
        const options = optionsList.querySelectorAll('li');

        let selectedOption; // Variable to store the previously selected option

        let initiallySelected; // Variable to store the initially selected option

        // Find the initially selected option
        initiallySelected = optionsList.querySelector('[selected]');
    
        // Toggle the dropdown on click of the container
        container.addEventListener('click', function () {
            optionsList.classList.toggle('show-options');
            container.classList.toggle('show-options');
        });

        // Handle option selection
        options.forEach((option, index) => {
            const tier = option.getAttribute('data-tier');

            // Swap the currency for our dropdowns based on multi-currency after our initial render.
            option.querySelector('.overagePrice').textContent = planController.advancedPlan.planTierData[selectedCurrency][tier]['monthly']['overagePrice'];

            // Update the code attribute for the option plan so that we know what to send to the signup page.
            option.setAttribute('data-code',  planController.advancedPlan.planTierData[selectedCurrency][tier]['monthly']['code']);

            option.addEventListener('click', function () {
                const tier = option.getAttribute('data-tier'); // Get the data-tier attribute value
                selectedTier.textContent = planController.advancedPlan.planTierData[selectedCurrency][tier]['monthly']['minCount'] + ' labels per month'; // Update the selected tier text

                // Remove the "selected" class from the previously selected option
                if (selectedOption) {
                    selectedOption.classList.remove('selected');
                }

                // Remove the "selected" attribute from the initially selected option
                if (initiallySelected) {
                    initiallySelected.removeAttribute('selected');
                }

                // Add the "selected" attribute to the newly selected option
                selectedTier.setAttribute('data-tier', tier);
                option.setAttribute('selected', 'selected');

                // Add the "selected" class to the newly selected option
                option.classList.add('selected');

                optionsList.classList.remove('show-options');
                container.classList.remove('show-options');
            
                // Call the planController.updatePlanContent function with the selected tier
                planController.updatePlanContent(selectedCurrency, tier, planBannerContainers, planData);

                // Trigger a custom event to notify the change of tier (optional)
                const event = new CustomEvent('changeTier', {
                    detail: { selectedTier: tier },
                });
                document.dispatchEvent(event);

                initiallySelected = option;

                // Update the selectedOption to the current option
                selectedOption = option;
            });

            option.addEventListener('keydown', function (event) {
                if (event.key === 'Tab' && event.shiftKey) {
                    // Handle Shift + Tab (backwards navigation)
                    event.preventDefault();
                    if (index > 0) {
                        options[index - 1].focus();
                    } else {
                        // Focus the last option
                        options[options.length - 1].focus();
                    }
                } else if (event.key === 'Tab' && !event.shiftKey) {
                    // Handle Tab (forward navigation)
                    event.preventDefault();
                    if (index < options.length - 1) {
                        options[index + 1].focus();
                    } else {
                        // Focus the first option
                        options[0].focus();
                    }
                } else if (event.key === 'Enter' || event.key === 'Space') {
                    // Handle Enter or Space key press
                    event.preventDefault();
                    // Trigger the same logic as the click event
                    option.click();
                }
            });
        });

        // Inside the dropdowns.forEach loop
        container.addEventListener('click', () => {
            const arrowIcon = container.querySelector('.rotate-icon');
            arrowIcon.classList.toggle('rotate'); // Toggle the 'rotate' class to rotate the arrow
        });

        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                const arrowIcon = container.querySelector('.rotate-icon');
                arrowIcon.classList.remove('rotate'); // Remove the 'rotate' class to reset the arrow
                optionsList.classList.remove('show-options');
                container.classList.remove('show-options');
            }
        });

        container.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const arrowIcon = container.querySelector('.rotate-icon');
                arrowIcon.classList.toggle('rotate'); // Toggle the 'rotate' class to rotate the arrow
                optionsList.classList.toggle('show-options');
                container.classList.toggle('show-options');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !container.contains(e.target)) {
                const arrowIcon = container.querySelector('.rotate-icon');
                arrowIcon.classList.remove('rotate'); // Remove the 'rotate' class to reset the arrow
                optionsList.classList.remove('show-options');
                container.classList.remove('show-options');
            }
        });

    });
});
