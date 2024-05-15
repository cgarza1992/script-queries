import currency from 'currency.js';

class PlanDataFormat {
    constructor() {
        this.currencyFormats = {
            USD: { symbol: '$', precision: 2 },
            GBP: { symbol: '£', precision: 2 },
            EUR: { symbol: '€', precision: 2 },
        };
    
        this.formatCurrency = this.formatCurrency.bind(this);
        this.formatNumbersAsCurrency = this.formatNumbersAsCurrency.bind(this);
    }

    formatCurrency(value, currencyCode, type = 'subscription') {
        const { symbol, precision } = this.currencyFormats[currencyCode] || this.currencyFormats.USD;
        const formattedPrecision = type === 'subscription' ? 0 : 3;
        return currency(value, { symbol, precision: formattedPrecision, formatWithSymbol: true }).format();
    }

    formatNumbersAsCurrency(data) {
        const formattedData = { ...data }; // Create a new object to avoid modifying the original
        for (const plan in formattedData) {
            for (const currencyCode in formattedData[plan]) {
                const tierData = formattedData[plan][currencyCode];
                for (const tierKey in tierData) {
                    const monthlyData = tierData[tierKey].monthly;

                    for (const key in monthlyData) {
                        if (typeof monthlyData[key] === 'number') {
                            monthlyData[key] = this.formatCurrency(monthlyData[key], currencyCode, key);
                        }
                    }
                }
            }
        }

        return formattedData; // Return the modified object
    }
}

export default PlanDataFormat;
