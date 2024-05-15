import Utils from "../utils/utils";
import CurrencySelection from './helpers/currencySelection';

document.addEventListener('DOMContentLoaded', function () {
    const currencySelect = document.getElementById('currency-select');
    const currencyOptions = document.getElementById('currency-options');
    const currencyOptionItems = currencyOptions.getElementsByClassName('currency-option');

    // Initialize the currency selection.
    const currencySelection = new CurrencySelection(currencySelect, currencyOptions, currencyOptionItems);

    // Check if a previously selected currency is stored in a cookie
    const utils = new Utils();
    const prevSelectedCurrencyData = utils.getCookie('currencyData');
    let initialCurrency;

    if (prevSelectedCurrencyData) {
        initialCurrency = JSON.parse(prevSelectedCurrencyData);
        currencySelect.querySelector('.currency-label').textContent = initialCurrency.currencySymbol + ' ' + initialCurrency.currencyCode;

        // Find the corresponding option and add the 'selected' class
        for (const option of currencyOptionItems) {
            const selectedValue = option.getAttribute('data-value');
            if (selectedValue === initialCurrency.currencyCode) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected'); // Remove 'selected' class from other options
            }
        }
    } else {
        // Set the initial currency based on the value of the currency select element
        initialCurrency = currencySelect.querySelector('.currency-label').textContent;
        // Set the text content for the currency label element
        currencySelect.querySelector('.currency-label').textContent = initialCurrency;
    }
});
