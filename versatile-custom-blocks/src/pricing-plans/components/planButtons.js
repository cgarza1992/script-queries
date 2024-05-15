import React, { useState } from 'react';
import { Button, TextControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function PlanButtons({ attributes, setAttributes }) {
    const { buttonData } = attributes;

    // Button Section.
    const [isEditingButton, setIsEditingButton] = useState(false);
    const [editedButtonData, setEditedButtonData] = useState(buttonData);

    const handleEditButtonClick = () => {
        setIsEditingButton(true);
    };

    const handleSaveButtonClick = () => {
        // Update the button data within the existing 'attributes' object
        setAttributes({ ...attributes, buttonData: editedButtonData });
        setIsEditingButton(false);
    };

    return (
        <div className="buttonSection">
            <h4>
                {isEditingButton ? (
                    <>
                        <TextControl
                            label="Button Text"
                            value={editedButtonData.text}
                            onChange={(newText) =>
                                setEditedButtonData({ ...editedButtonData, text: newText })
                            }
                            placeholder="Button Text"
                        />
                        <TextControl
                            label="Button URL"
                            value={editedButtonData.url}
                            onChange={(newUrl) =>
                                setEditedButtonData({ ...editedButtonData, url: newUrl })
                            }
                            placeholder="Button URL"
                        />
                        <SelectControl
                            label="Open Link In"
                            value={editedButtonData.openLinkIn}
                            options={[
                                { label: 'Current Tab', value: '_self' },
                                { label: 'New Tab', value: '_blank' },
                            ]}
                            onChange={(newOpenLinkIn) =>
                                setEditedButtonData({ ...editedButtonData, openLinkIn: newOpenLinkIn })
                            }
                        />
                        <SelectControl
                            label="Button Style"
                            value={editedButtonData.style}
                            options={[
                                { label: 'Primary', value: 'primary' },
                                { label: 'Secondary', value: 'secondary' },
                            ]}
                            onChange={(newStyle) =>
                                setEditedButtonData({ ...editedButtonData, style: newStyle })
                            }
                        />
                        <Button onClick={handleSaveButtonClick}>Save</Button>
                    </>
                ) : (
                    <>
                        {buttonData.text && (
                            <Button
                                href={buttonData.url}
                                target={buttonData.openLinkIn}
                                className={buttonData.style}
                            >
                                {buttonData.text}
                            </Button>
                        )}
                        <Button onClick={handleEditButtonClick}>Edit</Button>
                    </>
                )}
            </h4>
        </div>
    );
}
