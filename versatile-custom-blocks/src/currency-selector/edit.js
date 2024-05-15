import { __ } from '@wordpress/i18n';
import {
    SelectControl,
} from '@wordpress/components';
import './editor.scss';

export default function Edit({ attributes, setAttributes }) {
    const { selectedCurrency } = attributes;

    // Function to handle the currency selection change
    const handleCurrencyChange = (newCurrency) => {
        setAttributes({ selectedCurrency: newCurrency });

        // Create a custom event to trigger currency changes
        const currencyChangeEvent = new CustomEvent('currencyChange', {
            detail: newCurrency,
        });

        // Dispatch the custom event to notify other blocks
        document.dispatchEvent(currencyChangeEvent);
    };

    return (
        <div className="currency-selector-block">
            <SelectControl
                label="Select Currency"
                value={selectedCurrency}
                options={[
                    { label: 'USD', value: 'USD' },
                    { label: 'GBP', value: 'GBP' },
                    { label: 'EUR', value: 'EUR' },
                    // Add other currency options as needed
                ]}
                onChange={handleCurrencyChange}
            />
        </div>
    );
}
