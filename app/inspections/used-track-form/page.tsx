import { TanStackFormTemplate } from "@/components/tanstack-form-template"

export default function UsedTrackForm() {
  const fields = [
    {
      id: "dateTime",
      label: "Date & Time",
      type: "datetime-local" as const,
      autoFill: "datetime" as const,
      required: true
    },
    {
      id: "inspectorName",
      label: "Inspector's Name",
      type: "text" as const,
      placeholder: "Enter inspector name",
      autoFill: "inspector" as const,
      required: true
    },
    {
      id: "soNo",
      label: "SO No.",
      type: "text" as const,
      placeholder: "Enter sales order number",
      required: false
    },
    {
      id: "poNo",
      label: "PO No.",
      type: "text" as const,
      placeholder: "Enter purchase order number",
      required: false
    },
    {
      id: "salesperson",
      label: "Salesperson",
      type: "text" as const,
      placeholder: "Enter salesperson name",
      required: false
    },
    {
      id: "location",
      label: "Location",
      type: "location-lookup" as const,
      placeholder: "Select location",
      required: false
    },
    {
      id: "partNo",
      label: "Part No.",
      type: "text" as const,
      placeholder: "Enter part number",
      required: true
    },
    {
      id: "quantity",
      label: "Quantity",
      type: "number" as const,
      placeholder: "Enter quantity",
      required: true
    },
    {
      id: "condition",
      label: "Condition",
      type: "select" as const,
      options: ["Excellent", "Good", "Fair", "Poor", "Scrap"],
      required: true
    },
    {
      id: "width",
      label: "Width",
      type: "text" as const,
      placeholder: "Enter track width",
      required: true
    },
    {
      id: "brand",
      label: "Brand",
      type: "text" as const,
      placeholder: "Enter track brand",
      required: true
    },
    {
      id: "machineMakeModel",
      label: "Machine Make/Model",
      type: "text" as const,
      placeholder: "Enter machine make and model",
      required: true
    },
    {
      id: "trackSeries",
      label: "Track Series",
      type: "text" as const,
      placeholder: "Enter track series",
      required: false
    },
    {
      id: "serialNo",
      label: "Serial No.",
      type: "text" as const,
      placeholder: "Enter track serial number",
      required: false
    },
    {
      id: "noOfGuideLugs",
      label: "No. of Guide Lugs",
      type: "number" as const,
      placeholder: "Enter number of guide lugs",
      required: true
    },
    {
      id: "pitchSize",
      label: "Pitch size",
      type: "text" as const,
      placeholder: "Enter pitch size",
      required: true
    },
    {
      id: "numberMissingGuideLugs",
      label: "Number of missing guide lugs",
      type: "number" as const,
      placeholder: "Enter number of missing guide lugs",
      required: true
    },
    {
      id: "treadDepth",
      label: "Tread Depth",
      type: "text" as const,
      placeholder: "Enter tread depth measurement",
      required: true
    },
    {
      id: "cutsOutsideTread",
      label: "Cuts (Outside Tread)",
      type: "select" as const,
      options: ["None", "Minor", "Moderate", "Severe"],
      required: true
    },
    {
      id: "chunkingOutsideTread",
      label: "Chunking (Outside Tread)",
      type: "select" as const,
      options: ["None", "Minor", "Moderate", "Severe"],
      required: true
    },
    {
      id: "cordsExposedOutsideTread",
      label: "Cords Exposed (Outside Tread)",
      type: "select" as const,
      options: ["None", "Minor", "Moderate", "Severe"],
      required: true
    },
    {
      id: "laminatingOutsideTread",
      label: "Laminating (Outside Tread)",
      type: "select" as const,
      options: ["None", "Minor", "Moderate", "Severe"],
      required: true
    },
    {
      id: "stubbleOutsideTread",
      label: "Stubble (Outside Tread)",
      type: "select" as const,
      options: ["None", "Minor", "Moderate", "Severe"],
      required: true
    },
    {
      id: "cordsExposedInsideTread",
      label: "Cords Exposed (Inside Tread)",
      type: "select" as const,
      options: ["None", "Minor", "Moderate", "Severe"],
      required: true
    },
    {
      id: "sideWearGuideLugs",
      label: "Side Wear (Guide Lugs)",
      type: "select" as const,
      options: ["None", "Minor", "Moderate", "Severe"],
      required: true
    },
    {
      id: "topWearGuideLugs",
      label: "Top Wear (Guide Lugs)",
      type: "select" as const,
      options: ["None", "Minor", "Moderate", "Severe"],
      required: true
    },
    {
      id: "rollerPath",
      label: "Roller Path",
      type: "select" as const,
      options: ["Good", "Fair", "Poor", "Severe wear"],
      required: true
    },
    {
      id: "carcassThickness",
      label: "Carcass Thickness",
      type: "text" as const,
      placeholder: "Enter carcass thickness measurement",
      required: false
    },
    {
      id: "note",
      label: "Note",
      type: "textarea" as const,
      placeholder: "Additional notes and observations...",
      required: false
    },
    {
      id: "productPhotos",
      label: "Product Photos",
      type: "select" as const,
      options: ["Yes", "No"],
      required: false
    },
    {
      id: "photo",
      label: "Photo",
      type: "text" as const,
      placeholder: "Photo reference or file name",
      required: false
    }
  ];

  return (
    <TanStackFormTemplate
      title="Used Track"
      description="Comprehensive track inspection and condition assessment form."
      fields={fields}
      inspectionType="used-track-form"
      enableAutoSave={true}
      autoSaveInterval={30000}
    />
  )
}
