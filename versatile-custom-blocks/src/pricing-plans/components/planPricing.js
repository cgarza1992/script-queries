import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useBlockProps } from '@wordpress/block-editor';
import pricingData from '../data/pricingData.json';
import PlanDataFormat from '../../helpers/planDataFormat';

export default function PlanPricing({ attributes, setAttributes }) {
    const planDataFormat = new PlanDataFormat();
    const { planPrice, selectedCurrency, selectedPlanType, selectedTier } = attributes;
    const [isEditing, setIsEditing] = useState(false);

    // Retrieve the selected currency from the global variable or fallback to the attribute value
    const currency = window.selectedCurrency || selectedCurrency;

    // Get the block's clientId using useBlockProps
    const blockProps = useBlockProps();

    // Function to handle plan type selection
    const handlePlanTypeChange = (event) => {
        const newPlanType = event.target.value;
        // Update the block's attributes with the selected plan type
        setAttributes({ selectedPlanType: newPlanType });
    };

    // Function to handle pricing tier selection
    const handleTierChange = (event) => {
        const newTier = event.target.value;
        // Update the block's attributes with the selected tier
        setAttributes({ selectedTier: newTier });
    };

    // Function to toggle editing mode
    const toggleEdit = () => {
        setIsEditing((prevIsEditing) => !prevIsEditing);
    };

    if (selectedPlanType === 'enterprise' && pricingData[selectedPlanType] && pricingData[selectedPlanType].custom) {
        setAttributes({ planPrice: pricingData[selectedPlanType].custom });
    } else {
        setAttributes({ planTierData: pricingData[attributes.planName.toLowerCase()] });
    }

    // Use useEffect to handle initial state setup and attribute updates
    useEffect(() => {
        // Update the block's attributes with the selected plan type and tier
        setAttributes({ selectedPlanType, selectedTier });

        const handleCurrencyChange = (event) => {
            const newCurrency = event.detail;
            // Update the block's attributes with the selected currency
            setAttributes({ selectedCurrency: newCurrency });
        };

        // Add an event listener to listen for currency changes
        document.addEventListener('currencyChange', handleCurrencyChange);

        // Cleanup the event listener when the component unmounts
        return () => {
            document.removeEventListener('currencyChange', handleCurrencyChange);
        };
    }, [selectedPlanType, selectedTier]);

    // Fetch the pricing data for the selected plan type and currency
    const selectedPlan = pricingData[selectedPlanType] || {};

    const selectedTierData = selectedPlan[currency] ? selectedPlan[currency][selectedTier] : null;

    // Generate the options for the pricing tiers based on the selected plan type and currency
    const tierOptions =
        selectedPlanType !== 'enterprise' && selectedPlan[currency]
            ? Object.keys(selectedPlan[currency]).map((tier) => (
                  <option key={tier} value={tier}>
                      {tier}
                  </option>
              ))
            : null;

    // Update the planPrice attribute when tier or currency changes
    useEffect(() => {
        if (selectedTierData && selectedTierData.monthly) {
            const subscriptionPrice = selectedTierData.monthly.subscription;
            if (subscriptionPrice !== undefined || subscriptionPrice !== null) {
                const formattedPrice = planDataFormat.formatCurrency(subscriptionPrice, currency, 'subscription');
                if ( selectedPlanType !== 'enterprise' ) {
                    setAttributes({ planPrice: formattedPrice });
                    setAttributes({ planTierData: pricingData[attributes.planName.toLowerCase()] });
                } else {
                    setAttributes({ planPrice: selectedPlan.custom });
                }
            }
        }
    }, [selectedTierData, selectedCurrency, planPrice, selectedPlanType]);

    return (
        <div {...blockProps} className="planPrice">
            {isEditing ? (
                <>
                    <p>
                        <select value={selectedPlanType} onChange={handlePlanTypeChange}>
                            {Object.keys(pricingData).map((planType) => (
                                <option key={planType} value={planType}>
                                    {planType}
                                </option>
                            ))}
                        </select>
                    </p>
                    {selectedPlanType !== 'enterprise' && (
                        <>
                            <div>
                                <select value={selectedTier} onChange={handleTierChange}>
                                    {tierOptions}
                                </select>
                            </div>
                            <div>
                                {selectedTierData && (
                                    <>
                                        {selectedPlanType === 'free' && (
                                            <h2>{planDataFormat.formatCurrency(selectedTierData.monthly.subscription, currency, 'subscription')}</h2>
                                        )}
                                        {selectedPlanType === 'advanced' && (
                                            <h2>{planDataFormat.formatCurrency(selectedTierData.monthly.subscription, currency, 'subscription')}</h2>
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    )}
                    {selectedPlanType === 'enterprise' && (
                        <>
                            <div>
                                <h2>{selectedPlan.custom}</h2>
                            </div>
                        </>
                    )}
                </>
            ) : (
                <>
                    {selectedPlanType === 'enterprise' ? (
                        <>
                            <div>
                                <h2>{selectedPlan.custom}</h2>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <p>
                                    {selectedTierData && (
                                        <>
                                            {selectedPlanType === 'free' && (
                                                <h2>{planDataFormat.formatCurrency(selectedTierData.monthly.subscription, currency, 'subscription')}</h2>
                                            )}
                                            {selectedPlanType === 'advanced' && (
                                                <h2>{planDataFormat.formatCurrency(selectedTierData.monthly.subscription, currency, 'subscription')}</h2>
                                            )}
                                        </>
                                    )}
                                </p>
                            </div>
                        </>
                    )}
                </>
            )}
            <Button onClick={toggleEdit}>
            {isEditing ? __('Save', 'versatile') : __('Edit', 'versatile')}
            </Button>
        </div>
    );
}
