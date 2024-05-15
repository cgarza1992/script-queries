import { useState } from 'react';
import { Button, TextareaControl } from '@wordpress/components';
import { RichText } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export default function planFeatures({attributes, setAttributes}){
    const { featuresTitle } = attributes;

	// Features Section Editing.
	const [isEditingFeatures, setIsEditingFeatures] = useState(false);

	const features = attributes.features || [];
	const toggleFeaturesEditing = () => {
		setIsEditingFeatures(!isEditingFeatures);
	};

	/**
	 * Update a feature content.
	 *
	 * @param {number} index The index of the feature to update.
	 * @param {string} newContent The new content for the feature.
	 */
	const updateFeatureContent = (index, newContent) => {
		const updatedFeatures = [...features];
		updatedFeatures[index].content = newContent;
		setAttributes({ features: updatedFeatures });
	};

	/**
	 * Add a new feature.
	 */
	const addFeature = () => {
		const updatedFeatures = [...features, { content: '' }];
		setAttributes({ features: updatedFeatures });
	};

	/**
	 * Remove a feature.
	 *
	 * @param {number} index The index of the feature to remove.
	 */
	const removeFeature = (index) => {
		const updatedFeatures = [...features];
		updatedFeatures.splice(index, 1);
		setAttributes({ features: updatedFeatures });
	};

    return (
        <div className="planFeatures">
            <h5>
                {/* Editable Features Title */}
                <RichText
                    tagName="h4"
                    value={featuresTitle}
                    onChange={(newTitle) => setAttributes({ featuresTitle: newTitle })}
                    placeholder="Enter features title"
                />
                {isEditingFeatures ? (
                <>
                    <Button onClick={toggleFeaturesEditing}>Done Editing</Button>
                </>
                ) : (
                <>
                    <Button onClick={toggleFeaturesEditing}>Edit</Button>
                </>
                )}
            </h5>

            {isEditingFeatures ? (
                <ul>
                    {features.map((feature, index) => (
                    <li key={index}>
                        <TextareaControl
                        label={__('Feature Content')}
                        value={feature.content}
                        onChange={(newContent) => updateFeatureContent(index, newContent)}
                        placeholder={__('Enter feature content')}
                        />
                        <Button onClick={() => removeFeature(index)}>Remove</Button>
                    </li>
                    ))}
                    <div>
                    <Button onClick={addFeature}>Add Feature</Button>
                    </div>
                </ul>
                ) : (
                <ul>
                    {features.map((feature, index) => (
                    <li key={index}>
                        <RichText.Content value={feature.content} />
                    </li>
                    ))}
                </ul>
                )}
        </div>
    );
}