import { TanStackFormTemplate } from "@/components/tanstack-form-template"

export default function UsedTireForm() {
  const fields = [
    {
      id: "dateTime",
      label: "Date & Time",
      type: "datetime-local" as const,
      required: true,
      autoFill: "datetime" as const
    },
    {
      id: "inspectorName",
      label: "Inspector's Name",
      type: "text" as const,
      placeholder: "Enter inspector name",
      required: true,
      autoFill: "inspector" as const
    },
    {
      id: "soNo",
      label: "SO No.",
      type: "so-lookup" as const,
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
      required: false,
      autoFillFrom: "soNo" as const
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
      id: "tireBuild",
      label: "Tire Build",
      type: "text" as const,
      placeholder: "Enter tire build specification",
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
      id: "sectionWidth",
      label: "Section Width",
      type: "text" as const,
      placeholder: "Enter section width",
      required: true
    },
    {
      id: "aspectRatio",
      label: "Aspect Ratio",
      type: "text" as const,
      placeholder: "Enter aspect ratio",
      required: true
    },
    {
      id: "rimDiameter",
      label: "Rim Diameter",
      type: "text" as const,
      placeholder: "Enter rim diameter",
      required: true
    },
    {
      id: "englishWidth",
      label: "English Width",
      type: "text" as const,
      placeholder: "Enter width in inches",
      required: false
    },
    {
      id: "overallDiameter",
      label: "Overall Diameter",
      type: "text" as const,
      placeholder: "Enter overall diameter",
      required: true
    },
    {
      id: "plyRatingLoadIndex",
      label: "Ply Rating / Load Index",
      type: "text" as const,
      placeholder: "Enter ply rating or load index",
      required: true
    },
    {
      id: "brand",
      label: "Brand",
      type: "text" as const,
      placeholder: "Enter tire brand",
      required: true
    },
    {
      id: "description",
      label: "Description",
      type: "textarea" as const,
      placeholder: "Detailed tire description...",
      required: true
    },
    {
      id: "tubelessTubeType",
      label: "Tubeless/Tube Type",
      type: "select" as const,
      options: ["Tubeless", "Tube Type"],
      required: true
    },
    {
      id: "treadPattern",
      label: "Tread Pattern",
      type: "text" as const,
      placeholder: "Enter tread pattern description",
      required: false
    },
    {
      id: "treadDepth",
      label: "Tread Depth",
      type: "text" as const,
      placeholder: "Enter tread depth measurement",
      required: true
    },
    {
      id: "weatherChecking",
      label: "Weather Checking",
      type: "select" as const,
      options: ["None", "Minor", "Moderate", "Severe"],
      required: true
    },
    {
      id: "delamination",
      label: "Delamination",
      type: "select" as const,
      options: ["None", "Minor", "Moderate", "Severe"],
      required: true
    },
    {
      id: "treadChunking",
      label: "Tread Chunking",
      type: "select" as const,
      options: ["None", "Minor", "Moderate", "Severe"],
      required: true
    },
    {
      id: "beadDamage",
      label: "Bead Damage",
      type: "select" as const,
      options: ["None", "Minor", "Moderate", "Severe"],
      required: true
    },
    {
      id: "cutsInTire",
      label: "Cuts in Tire",
      type: "select" as const,
      options: ["None", "Minor", "Moderate", "Severe"],
      required: true
    },
    {
      id: "stubbleDamage",
      label: "Stubble Damage",
      type: "select" as const,
      options: ["None", "Minor", "Moderate", "Severe"],
      required: true
    },
    {
      id: "serialNo",
      label: "Serial No.",
      type: "text" as const,
      placeholder: "Enter tire serial number",
      required: false
    },
    {
      id: "manufacturersPartNo",
      label: "Manufacturers Part No.",
      type: "text" as const,
      placeholder: "Enter manufacturer part number",
      required: false
    },
    {
      id: "weight",
      label: "Weight",
      type: "text" as const,
      placeholder: "Enter tire weight",
      required: false
    },
    {
      id: "overallTireCondition",
      label: "Overall tire condition",
      type: "textarea" as const,
      placeholder: "Summary of overall tire condition...",
      required: true
    },
    {
      id: "notesOtherIssues",
      label: "Notes and other issues:",
      type: "textarea" as const,
      placeholder: "Additional notes and issues...",
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
      id: "productPhoto",
      label: "Product Photo",
      type: "text" as const,
      placeholder: "Photo reference or file name",
      required: false
    }
  ];

  return (
    <TanStackFormTemplate
      title="Used Tire"
      description="Comprehensive tire inspection and documentation form."
      fields={fields}
      inspectionType="used-tire-form"
      enableAutoSave={true}
      autoSaveInterval={30000}
    />
  )
}
