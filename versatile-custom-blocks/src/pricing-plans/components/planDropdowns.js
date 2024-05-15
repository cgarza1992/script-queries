import { Button, TextareaControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import pricingData from '../data/pricingData.json';
import PricingDropdown from './pricingDropdown';

export default function PlanDropdowns({attributes, setAttributes}){
    const { displayType, content, selectedPlanType, selectedTier, selectedCurrency } = attributes;
	
	// Define handleTierChange to update the selectedTier attribute
	const handleTierChange = (event) => {
	setAttributes({ selectedTier: event.target.value });
	};

    return (
		<div className="dropdownSection">
			<h4>
					<>
						{displayType === 'content' ? (
							<>
								<TextareaControl
									label="Enter Text"
									value={content}
									onChange={(newValue) => setAttributes({ content: newValue })}
								/>
							</>
						) : (
							<>
							{/* Use the PricingDropdown component here */}
								<PricingDropdown
									selectedPlanType={selectedPlanType}
									selectedCurrency={selectedCurrency}
									selectedTier={selectedTier}
									pricingData={pricingData}
									handleTierChange={handleTierChange}
									attributes={attributes}
									setAttributes={setAttributes}
								/>
							</>
						)}
						{displayType === 'content' ? (
							<Button onClick={() => setAttributes({ displayType: 'dropdown' })}>
								Switch to Dropdowns
							</Button>
						) : (
							<Button onClick={() => setAttributes({ displayType: 'content' })}>
								Switch to Content
							</Button>
						)}
					</>
			</h4>
		</div>
    );
}