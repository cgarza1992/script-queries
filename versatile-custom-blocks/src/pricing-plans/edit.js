

// Plan Components
import PlanName from './components/planName';
import PlanHeaderDesc from './components/planHeaderDesc';
import PlanPricing from './components/planPricing';
import PlanDropdowns from './components/planDropdowns';
import PlanButtons from './components/planButtons';
import PlanFeatures from './components/planFeatures';
import { ToggleControl } from '@wordpress/components';
import { useEffect } from 'react';

// Internationalization
import { __ } from '@wordpress/i18n';

// Block Editor Components
import { useBlockProps } from '@wordpress/block-editor';

// Editor Styles
import './editor.scss';

export default function Edit({ attributes, setAttributes }) {
    let { uniqueID } = attributes;

    useEffect(() => {
        // Generate a new unique ID when the component mounts
        if (!uniqueID) {    
            if (self.crypto && self.crypto.randomUUID) {
                const uuid = self.crypto.randomUUID();
                setAttributes({ uniqueID: uuid });
              } else {
                console.error("Web Crypto API not supported.");
              }
        }
    }, []);

	const defaultStyle = {
		border: '1px solid #FF69B4',
	};

	const blockProps = useBlockProps({ style: defaultStyle });

	return (
		<div {...blockProps}>
			<div className="planContainer" data-uuid={uniqueID}>
                {/* Recommended Class Toggle */}
                <ToggleControl
                    label={__('Recommended Class', 'versatile')}
                    checked={attributes.customAttribute.recommendedClass}
                    onChange={(recommendedClass) =>
                        setAttributes({
                            customAttribute: {
                                ...attributes.customAttribute,
                                recommendedClass,
                            },
                        })
                    }
                    help={__('Enable this option to apply the "recommended" class to the block container.', 'versatile')}
                />

                {/* Custom Copy Input */}
                <input
                    type="text"
                    placeholder={__('Enter custom copy', 'versatile')}
                    value={attributes.customAttribute.customCopy}
                    onChange={(event) =>
                        setAttributes({
                            customAttribute: {
                                ...attributes.customAttribute,
                                customCopy: event.target.value,
                            },
                        })
                    }
                />

				{/* Plan Name Section */}
        		<PlanName attributes={attributes} setAttributes={setAttributes} />

				{/* Plan Header Description Section */}
				<PlanHeaderDesc attributes={attributes} setAttributes={setAttributes} />

				{/* Display the pricing section */}
				<PlanPricing attributes={attributes} setAttributes={setAttributes} />

				{/* Dropdown or Content Section */}
				<PlanDropdowns attributes={attributes} setAttributes={setAttributes} />

				{/* Button Section */}
				<PlanButtons attributes={attributes} setAttributes={setAttributes} />

				{/* Features Section */}
				<PlanFeatures attributes={attributes} setAttributes={setAttributes} />
			</div>
		</div>
	);
}
