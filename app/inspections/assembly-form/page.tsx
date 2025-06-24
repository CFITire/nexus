import { TanStackFormTemplate } from "@/components/tanstack-form-template"

export default function AssemblyFormPage() {
  // Enhanced field definitions with validation
  const fields = [
    // Basic Information
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
      placeholder: "Enter inspector's name",
      required: true,
      autoFill: "inspector" as const
    },
    {
      id: "soNo",
      label: "SO No.",
      type: "text" as const,
      placeholder: "Enter SO number",
      required: false
    },
    {
      id: "poNo",
      label: "PO No.",
      type: "text" as const,
      placeholder: "Enter PO number",
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
      required: true,
      customValidation: "positive-number"
    },

    // Tire Information
    {
      id: "tireInformation",
      label: "Tire Information",
      type: "text" as const,
      placeholder: "General tire information",
      required: false
    },
    {
      id: "tireBuild",
      label: "Tire Build",
      type: "text" as const,
      placeholder: "Enter tire build",
      required: false
    },
    {
      id: "tireCondition",
      label: "Condition",
      type: "text" as const,
      placeholder: "Tire condition",
      required: false
    },
    {
      id: "sectionWidth",
      label: "Section Width",
      type: "text" as const,
      placeholder: "Enter section width",
      required: false
    },
    {
      id: "aspectRatio",
      label: "Aspect Ratio",
      type: "text" as const,
      placeholder: "Enter aspect ratio",
      required: false
    },
    {
      id: "rimDiameter",
      label: "Rim Diameter",
      type: "text" as const,
      placeholder: "Enter rim diameter",
      required: false
    },
    {
      id: "englishWidth",
      label: "English Width",
      type: "text" as const,
      placeholder: "Enter English width",
      required: false
    },
    {
      id: "overallDiameter",
      label: "Overall Diameter",
      type: "text" as const,
      placeholder: "Enter overall diameter",
      required: false
    },
    {
      id: "plyLoadRating",
      label: "Ply / Load Rating",
      type: "text" as const,
      placeholder: "Enter ply/load rating",
      required: false
    },
    {
      id: "tireBrand",
      label: "Tire Brand",
      type: "text" as const,
      placeholder: "Enter tire brand",
      required: false
    },
    {
      id: "description",
      label: "Description",
      type: "textarea" as const,
      placeholder: "Enter tire description...",
      required: false
    },
    {
      id: "tubelessTubeType",
      label: "Tubeless/Tube Type",
      type: "text" as const,
      placeholder: "Tubeless or Tube Type",
      required: false
    },
    {
      id: "treadPattern",
      label: "Tread Pattern",
      type: "text" as const,
      placeholder: "Enter tread pattern",
      required: false
    },
    {
      id: "treadDepth",
      label: "Tread Depth",
      type: "text" as const,
      placeholder: "Enter tread depth",
      required: false
    },
    {
      id: "weatherChecking",
      label: "Weather Checking",
      type: "text" as const,
      placeholder: "Yes/No - Details",
      required: false
    },
    {
      id: "delamination",
      label: "Delamination",
      type: "text" as const,
      placeholder: "Yes/No - Details",
      required: false
    },
    {
      id: "treadChunking",
      label: "Tread Chunking",
      type: "text" as const,
      placeholder: "Yes/No - Details",
      required: false
    },
    {
      id: "beadDamage",
      label: "Bead Damage",
      type: "text" as const,
      placeholder: "Yes/No - Details",
      required: false
    },
    {
      id: "cutsInTire",
      label: "Cuts in Tire",
      type: "text" as const,
      placeholder: "Yes/No - Details",
      required: false
    },
    {
      id: "stubbleDamage",
      label: "Stubble Damage",
      type: "text" as const,
      placeholder: "Yes/No - Details",
      required: false
    },
    {
      id: "serialNumber",
      label: "Serial #",
      type: "text" as const,
      placeholder: "Enter serial number",
      required: false
    },
    {
      id: "manufacturerPartNumber",
      label: "Manufacturer Part #",
      type: "text" as const,
      placeholder: "Enter manufacturer part number",
      required: false
    },
    {
      id: "overallTireCondition",
      label: "Overall tire condition:",
      type: "textarea" as const,
      placeholder: "Describe overall tire condition...",
      required: false
    },
    {
      id: "tireNotes",
      label: "Notes or other issues",
      type: "textarea" as const,
      placeholder: "Additional tire notes...",
      required: false
    },

    // Wheel Information
    {
      id: "wheelInformation",
      label: "Wheel Information",
      type: "text" as const,
      placeholder: "General wheel information",
      required: false
    },
    {
      id: "wheelCondition",
      label: "Condition",
      type: "text" as const,
      placeholder: "Wheel condition",
      required: false
    },
    {
      id: "rimWidth",
      label: "Rim Width",
      type: "text" as const,
      placeholder: "Enter rim width",
      required: false
    },
    {
      id: "wheelRimDiameter",
      label: "Rim Diameter",
      type: "text" as const,
      placeholder: "Enter rim diameter",
      required: false
    },
    {
      id: "wheelBrand",
      label: "Wheel Brand",
      type: "text" as const,
      placeholder: "Enter wheel brand",
      required: false
    },
    {
      id: "boltPattern",
      label: "Bolt Pattern",
      type: "text" as const,
      placeholder: "Enter bolt pattern",
      required: false
    },
    {
      id: "boltDiameter",
      label: "Bolt Diameter",
      type: "text" as const,
      placeholder: "Enter bolt diameter",
      required: false
    },
    {
      id: "wheelType",
      label: "Wheel Type",
      type: "text" as const,
      placeholder: "Enter wheel type",
      required: false
    },
    {
      id: "overallWidth",
      label: "Overall Width (OW)",
      type: "text" as const,
      placeholder: "Enter overall width",
      required: false
    },
    {
      id: "valveSide",
      label: "Valve Side",
      type: "text" as const,
      placeholder: "Enter valve side",
      required: false
    },
    {
      id: "centerThickness",
      label: "Center Thickness",
      type: "text" as const,
      placeholder: "Enter center thickness",
      required: false
    },
    {
      id: "bentRimFlange",
      label: "Bent Rim Flange",
      type: "text" as const,
      placeholder: "Yes/No - Details",
      required: false
    },
    {
      id: "bentCenter",
      label: "Bent Center",
      type: "text" as const,
      placeholder: "Yes/No - Details",
      required: false
    },
    {
      id: "rusty",
      label: "Rusty",
      type: "text" as const,
      placeholder: "Yes/No - Details",
      required: false
    },
    {
      id: "paint",
      label: "Paint",
      type: "text" as const,
      placeholder: "Paint condition",
      required: false
    },
    {
      id: "wheelNotes",
      label: "Notes",
      type: "textarea" as const,
      placeholder: "Additional wheel notes...",
      required: false
    },
    {
      id: "hasDisc",
      label: "Does the wheel have a disc?",
      type: "text" as const,
      placeholder: "Yes/No",
      required: false
    },
    {
      id: "freeTextQuestion",
      label: "Free Text Question",
      type: "textarea" as const,
      placeholder: "Enter free text response...",
      required: false
    },
    {
      id: "color",
      label: "Color",
      type: "text" as const,
      placeholder: "Enter color",
      required: false
    },

    // Disc Information
    {
      id: "discInformation",
      label: "Disc Information",
      type: "text" as const,
      placeholder: "General disc information",
      required: false
    },
    {
      id: "discCondition",
      label: "Condition",
      type: "text" as const,
      placeholder: "Disc condition",
      required: false
    },
    {
      id: "discBrand",
      label: "Disc Brand",
      type: "text" as const,
      placeholder: "Enter disc brand",
      required: false
    },
    {
      id: "discSize",
      label: "Disc Size",
      type: "text" as const,
      placeholder: "Enter disc size",
      required: false
    },
    {
      id: "discBoltPattern",
      label: "Disc Bolt Pattern",
      type: "text" as const,
      placeholder: "Enter disc bolt pattern",
      required: false
    },
    {
      id: "discType",
      label: "Disc Type",
      type: "text" as const,
      placeholder: "Enter disc type",
      required: false
    },
    {
      id: "discColor",
      label: "Color",
      type: "text" as const,
      placeholder: "Enter disc color",
      required: false
    },
    {
      id: "discBentCenter",
      label: "Bent Center",
      type: "text" as const,
      placeholder: "Yes/No - Details",
      required: false
    },
    {
      id: "draw",
      label: "Draw",
      type: "text" as const,
      placeholder: "Enter draw details",
      required: false
    },
    {
      id: "discRusty",
      label: "Rusty",
      type: "text" as const,
      placeholder: "Yes/No - Details",
      required: false
    },
    {
      id: "discPaint",
      label: "Paint",
      type: "text" as const,
      placeholder: "Paint condition",
      required: false
    },
    {
      id: "weight",
      label: "Weight:",
      type: "text" as const,
      placeholder: "Enter weight",
      required: false
    },
    {
      id: "overallWheelDiscCondition",
      label: "Overall wheel and disc condition:",
      type: "textarea" as const,
      placeholder: "Describe overall wheel and disc condition...",
      required: false
    },
    {
      id: "discNotes",
      label: "Notes and other issues :",
      type: "textarea" as const,
      placeholder: "Additional disc notes and issues...",
      required: false
    },
    {
      id: "productPhotos",
      label: "Product Photos",
      type: "text" as const,
      placeholder: "Photo references or file names",
      required: false
    }
  ]

  return (
    <TanStackFormTemplate
      title="Assembly Inspection"
      description="Complete this inspection to document tire, wheel, and disc assembly details."
      fields={fields}
      inspectionType="assembly-form"
      enableAutoSave={true}
      autoSaveInterval={30000}
    />
  )
}

