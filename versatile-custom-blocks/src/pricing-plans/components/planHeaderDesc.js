
import { useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { Button, TextareaControl } from "@wordpress/components";

export default function PlanHeaderDesc({attributes, setAttributes}) {
    const { planHeaderDesc } = attributes;

    // Plan Header Description Editing.
	const [isEditingDesc, setIsEditingDesc] = useState(false);
	const [editedPlanHeaderDesc, setEditedPlanHeaderDesc] = useState(planHeaderDesc);

	const handleEditDescClick = () => {
		setIsEditingDesc(true);
	};

	const handleSaveDescClick = () => {
		setAttributes({ planHeaderDesc: editedPlanHeaderDesc });
		setIsEditingDesc(false);
	};

    return (
        <div className="planHeaderDesc">
        <p>
            {isEditingDesc ? (
                <>
                    <TextareaControl
                        label={__("Plan Header Description", 'versatile-custom-blocks')}
                        help="Enter your plan header description here."
                        value={editedPlanHeaderDesc}
                        onChange={(newPlanHeaderDesc) =>
                            setEditedPlanHeaderDesc(newPlanHeaderDesc)
                        }
                    />
                    <Button onClick={handleSaveDescClick}>Save</Button>
                </>
            ) : (
                <>
                    {planHeaderDesc}
                    <Button onClick={handleEditDescClick}>Edit</Button>
                </>
            )}
        </p>
    </div>
    );
}