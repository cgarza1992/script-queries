import { useState } from 'react';
import { Button, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function PlanName({ attributes, setAttributes }) {
  const { planName } = attributes;

  // State for editing plan name
  const [isEditingPlanName, setIsEditingPlanName] = useState(false);
  const [editedPlanName, setEditedPlanName] = useState(planName);

  const handleEditPlanNameClick = () => {
    setIsEditingPlanName(true);
  };

  const handleSavePlanNameClick = () => {
    setAttributes({ planName: editedPlanName });
    setIsEditingPlanName(false);
  };

  return (
    <div className="planName">
      <h3>
        {isEditingPlanName ? (
          <>
            <TextControl
              label="Plan Name"
              value={editedPlanName}
              onChange={(newPlanName) => setEditedPlanName(newPlanName)}
            />
            <Button onClick={handleSavePlanNameClick}>Save</Button>
          </>
        ) : (
          <>
            {planName}
            <Button onClick={handleEditPlanNameClick}>Edit</Button>
          </>
        )}
      </h3>
    </div>
  );
}
