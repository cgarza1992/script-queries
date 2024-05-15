import currency from 'currency.js';

export default function multiCurrency( price, country ) {

    let defaultCurrency = currency( price, { symbol: '$' } );
    country ?? 'US';

    return {
        localizedCurrency: defaultCurrency,
        country: country
    }
}