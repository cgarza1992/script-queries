class CurrencySelection {
    constructor(currencySelect, currencyOptions, currencyOptionItems ) {
        this.currencySelect = currencySelect;
        this.currencyOptions = currencyOptions;
        this.currencyOptionItems = currencyOptionItems;
        this.lastSelectedOption = null;
        this.activeOptionIndex = -1;

        this.setupClickHandlers();

        // Add some accessibility features to our dropdown.
        this.initializeKeyboardNavigation();
    }

    /**
     * Setup our event handlers.
     */
    setupClickHandlers() {
        this.currencySelect.addEventListener('click', () => {
            this.toggleCountryListDropdown();
        });

        for (const option of this.currencyOptionItems) {
            option.addEventListener('click', () => {
                this.handleOptionSelection(option);
            });

            option.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    this.handleOptionSelection(option);
                }
            });
        }

        document.addEventListener('click', (event) => {
            if (!this.currencySelect.contains(event.target) && !this.currencyOptions.contains(event.target)) {
                this.closeDropdown();
            }
        });
    }

    /**
     * Setup keyboard navigation for the currency select and options.
     */
    initializeKeyboardNavigation() {
        this.currencyOptionsList = document.getElementById('currency-options');
        this.allCurrencyOptions = this.currencyOptionsList.querySelectorAll('.currency-option');
        this.currencySelect.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.toggleCountryListDropdown();
            }
        });

        this.currencyOptionsList.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowUp':
                    event.preventDefault();
                    this.focusPreviousOption();
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    this.focusNextOption();
                    break;
                case 'Enter':
                    event.preventDefault();
                    this.selectOption();
                    break;
                case 'Escape':
                    this.closeDropdown();
                    break;
            }
        });
    }

    /**
     * Focus the next option in the list.
     */
    focusNextOption() {
        if (this.activeOptionIndex < this.allCurrencyOptions.length - 1) {
            if (this.activeOptionIndex >= 0) {
                this.deactivateOption(this.activeOptionIndex);
            }
            this.activeOptionIndex++;
            this.activateOption(this.activeOptionIndex);
        }
    }

    /**
     * Focus the previous option in the list.
     */
    focusPreviousOption() {
        if (this.activeOptionIndex > 0) {
            if (this.activeOptionIndex >= 0) {
                this.deactivateOption(this.activeOptionIndex);
            }
            this.activeOptionIndex--;
            this.activateOption(this.activeOptionIndex);
        }
    }

    /**
     * Activate our option.
     * @param {integer} index The index of the option to activate.
     */
    activateOption(index) {
        this.allCurrencyOptions[index].focus();
        this.currencyOptionsList.setAttribute('aria-activedescendant', `selected-currency-option${index}`);
    }

    /**
     * Deactivate our option.
     * @param {integer} index The index of the option to deactivate.
     */
    deactivateOption(index) {
        this.allCurrencyOptions[index].blur();
    }

    /**
     * Select the currently active option.
     */
    selectOption() {
        if (this.activeOptionIndex >= 0 && this.activeOptionIndex < this.allCurrencyOptions.length) {
            this.handleOptionSelection(this.allCurrencyOptions[this.activeOptionIndex]);
        }
    }

    /**
     * Toggle the dropdown list open.
     */
    toggleCountryListDropdown() {
        this.currencyOptions.classList.toggle('open');
        this.currencySelect.classList.toggle('openSelect');
        const arrowIcon = this.currencySelect.querySelector('.rotate-icon');
        arrowIcon.classList.toggle('rotate-icon-clicked');
    }

    handleOptionSelection(option) {
        const selectedValue = option.getAttribute('data-value');
        const selectedSymbol = option.getAttribute('data-symbol');
        this.currencySelect.querySelector('.currency-label').textContent = selectedSymbol + ' ' + selectedValue;

        this.currencyOptions.classList.remove('open');
        this.currencySelect.classList.remove('openSelect');
        
        for (const item of this.currencyOptionItems) {
            item.classList.remove('selected');
        }
        
        option.classList.add('selected');
        this.lastSelectedOption = option;
        
        const currencyChangeEvent = new CustomEvent('changeCurrency', {
            detail: { currencyCode: selectedValue },
        });
        document.dispatchEvent(currencyChangeEvent);
        
        let currencyData = {
            currencyCode: selectedValue,
            currencySymbol: selectedSymbol,
        };
        
        document.cookie = 'currencyData=' + JSON.stringify(currencyData) + '; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/';
    }

    /**
     * Close the dropdown list.
     */
    closeDropdown() {
        this.currencyOptions.classList.remove('open');
        this.currencySelect.classList.remove('openSelect');
    }
}

export default CurrencySelection;
