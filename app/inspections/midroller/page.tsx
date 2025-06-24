import { TanStackFormTemplate } from "@/components/tanstack-form-template"

export default function MidrollerForm() {
  const fields = [
    {
      id: "equipmentModel",
      label: "Equipment Model",
      type: "text" as const,
      placeholder: "Enter equipment model",
      required: true
    },
    {
      id: "serialNumber",
      label: "Equipment Serial Number",
      type: "text" as const,
      placeholder: "Enter serial number",
      required: true
    },
    {
      id: "inspectionDate",
      label: "Inspection Date",
      type: "datetime-local" as const,
      autoFill: "datetime" as const,
      required: true
    },
    {
      id: "inspector",
      label: "Inspector Name",
      type: "text" as const,
      placeholder: "Enter inspector name",
      autoFill: "inspector" as const,
      required: true
    },
    {
      id: "midrollerCount",
      label: "Total Midroller Count",
      type: "number" as const,
      placeholder: "Enter total number of midrollers",
      required: true
    },
    {
      id: "wearPattern",
      label: "Wear Pattern Observed",
      type: "select" as const,
      options: ["Even wear", "Uneven wear", "Excessive wear", "Minimal wear", "No visible wear"],
      required: true
    },
    {
      id: "rubberCondition",
      label: "Rubber Condition",
      type: "select" as const,
      options: ["Excellent", "Good", "Fair", "Poor", "Needs replacement"],
      required: true
    },
    {
      id: "crackingPresent",
      label: "Cracking Present",
      type: "select" as const,
      options: ["None", "Minor surface cracks", "Moderate cracking", "Severe cracking"],
      required: true
    },
    {
      id: "chunkingDamage",
      label: "Chunking Damage",
      type: "select" as const,
      options: ["None", "Minor chunking", "Moderate chunking", "Severe chunking"],
      required: true
    },
    {
      id: "greaseLubricationStatus",
      label: "Grease/Lubrication Status",
      type: "select" as const,
      options: ["Well lubricated", "Adequate", "Insufficient", "Dry/needs lubrication"],
      required: true
    },
    {
      id: "boltTorque",
      label: "Bolt Torque Check",
      type: "select" as const,
      options: ["Within spec", "Loose", "Over-torqued", "Missing bolts"],
      required: true
    },
    {
      id: "alignmentCheck",
      label: "Alignment Check",
      type: "select" as const,
      options: ["Proper alignment", "Slight misalignment", "Significant misalignment"],
      required: true
    },
    {
      id: "recommendedAction",
      label: "Recommended Action",
      type: "select" as const,
      options: ["Continue service", "Monitor closely", "Schedule replacement", "Immediate replacement required"],
      required: true
    },
    {
      id: "estimatedServiceLife",
      label: "Estimated Remaining Service Life",
      type: "select" as const,
      options: ["0-3 months", "3-6 months", "6-12 months", "12+ months"],
      required: false
    },
    {
      id: "notes",
      label: "Additional Notes",
      type: "textarea" as const,
      placeholder: "Enter any additional observations or recommendations...",
      required: false
    },
    {
      id: "photosTaken",
      label: "Photos Taken",
      type: "select" as const,
      options: ["Yes", "No"],
      required: false
    }
  ];

  return (
    <TanStackFormTemplate
      title="Midroller Inspection"
      description="Comprehensive midroller inspection form for track equipment maintenance assessment."
      fields={fields}
      inspectionType="midroller"
      enableAutoSave={true}
      autoSaveInterval={30000}
    />
  )
}
