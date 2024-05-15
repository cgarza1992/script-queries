import React, { useEffect, useState } from 'react';
import PlanDataFormat from '../../helpers/planDataFormat';

const PricingDropdown = ({
  selectedPlanType,
  selectedCurrency,
  pricingData,
  handleTierChange,
  selectedTier,
  setAttributes,
}) => {
  // Initialize formattedOveragePrice state
  const [formattedOveragePrice, setFormattedOveragePrice] = useState('');
  const planDataFormat = new PlanDataFormat();

  const formattedPricingData = planDataFormat.formatNumbersAsCurrency(pricingData);

  useEffect(() => {
    // Function to update block attributes with pricingData[selectedPlanType]
    const updateAttributesWithPricingData = () => {
      // Replace 'pricingData[selectedPlanType]' with the desired data source
      const planTierData = formattedPricingData[selectedPlanType];

      const selectedTierData = planTierData?.[selectedCurrency]?.[selectedTier];

      if (selectedTierData) {
        // Access the formatted overage price directly from the formatted data
        const overagePrice = selectedTierData.monthly.overagePrice;

        // Format the overage price based on the selected currency
        const formattedPrice = planDataFormat.formatCurrency(overagePrice, selectedCurrency, 'overagePrice');

        // Set the formattedOveragePrice state
        setFormattedOveragePrice(formattedPrice);

        // Pass the planTierData as an attribute
        setAttributes({ planTierData, formattedOveragePrice: formattedPrice });
      }
    };

    // Run the update function when the component mounts and whenever selectedTier changes
    updateAttributesWithPricingData();
  }, [selectedPlanType, selectedCurrency, selectedTier, setAttributes ]);

  if (selectedPlanType === 'advanced') {
    const pricingDataDropdown = formattedPricingData?.[selectedPlanType]?.[selectedCurrency];
    const tiers = ['firstTier', 'secondTier', 'thirdTier'];

    return (
      <div>
        <select onChange={handleTierChange} value={selectedTier}>
          {tiers.map((tier) => {
            const tierData = pricingDataDropdown?.[tier];
            return (
              <option key={tier} value={tier}>
                {tierData?.monthly?.label}
              </option>
            );
          })}
        </select>

        {/* Display overage pricing below the select dropdown */}
        <div>
          <p>
            +{formattedOveragePrice} per additional label{' '}
            <a href="https://help.versatile.com/hc/en-us/articles/19326502173851">see overages</a>
          </p>
        </div>
      </div>
    );
  } else {
    return <div>Select a plan type first</div>;
  }
};

export default PricingDropdown;
