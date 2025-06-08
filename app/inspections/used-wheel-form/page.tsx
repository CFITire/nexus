import { FormTemplate } from "@/components/form-template"

export default function UsedWheelForm() {
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
      type: "text" as const,
      placeholder: "Current wheel location",
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
      id: "rimWidth",
      label: "Rim Width",
      type: "text" as const,
      placeholder: "Enter rim width",
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
      id: "brand",
      label: "Brand",
      type: "text" as const,
      placeholder: "Enter wheel brand",
      required: true
    },
    {
      id: "type",
      label: "Type",
      type: "text" as const,
      placeholder: "Enter wheel type",
      required: true
    },
    {
      id: "color",
      label: "Color",
      type: "text" as const,
      placeholder: "Enter wheel color",
      required: false
    },
    {
      id: "boltDiameter",
      label: "Bolt Diameter",
      type: "text" as const,
      placeholder: "Enter bolt diameter",
      required: true
    },
    {
      id: "overallWidth",
      label: "Overall Width (OW)",
      type: "text" as const,
      placeholder: "Enter overall width",
      required: true
    },
    {
      id: "valveSide",
      label: "Valve Side (VS)",
      type: "text" as const,
      placeholder: "Enter valve side measurement",
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
      id: "boltPattern",
      label: "Bolt Pattern",
      type: "text" as const,
      placeholder: "Enter bolt pattern",
      required: true
    },
    {
      id: "bentRimFlange",
      label: "Bent Rim Flange",
      type: "select" as const,
      options: ["No", "Yes - Minor", "Yes - Moderate", "Yes - Severe"],
      required: true
    },
    {
      id: "bentCenter",
      label: "Bent Center",
      type: "select" as const,
      options: ["No", "Yes - Minor", "Yes - Moderate", "Yes - Severe"],
      required: true
    },
    {
      id: "rusty",
      label: "Rusty",
      type: "select" as const,
      options: ["No", "Light rust", "Moderate rust", "Heavy rust"],
      required: true
    },
    {
      id: "paint",
      label: "Paint",
      type: "select" as const,
      options: ["Good", "Fair", "Poor", "None"],
      required: true
    },
    {
      id: "hasDisc",
      label: "Does the wheel have a disc?",
      type: "select" as const,
      options: ["Yes", "No"],
      required: true
    },
    {
      id: "discInformation",
      label: "Disc Information",
      type: "textarea" as const,
      placeholder: "Enter disc information if applicable...",
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
      id: "discType",
      label: "Disc Type",
      type: "text" as const,
      placeholder: "Enter disc type",
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
      id: "discColor",
      label: "Disc Color",
      type: "text" as const,
      placeholder: "Enter disc color",
      required: false
    },
    {
      id: "discBentCenter",
      label: "Bent Center",
      type: "select" as const,
      options: ["No", "Yes - Minor", "Yes - Moderate", "Yes - Severe"],
      required: false
    },
    {
      id: "discRusty",
      label: "Rusty",
      type: "select" as const,
      options: ["No", "Light rust", "Moderate rust", "Heavy rust"],
      required: false
    },
    {
      id: "discPaint",
      label: "Paint",
      type: "select" as const,
      options: ["Good", "Fair", "Poor", "None"],
      required: false
    },
    {
      id: "weight",
      label: "Weight:",
      type: "text" as const,
      placeholder: "Enter wheel weight",
      required: false
    },
    {
      id: "overallCondition",
      label: "Overall wheel and disc condition:",
      type: "textarea" as const,
      placeholder: "Summary of overall condition...",
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
    <FormTemplate
      title="Used Wheel Form"
      description="Comprehensive wheel and disc inspection and condition assessment form."
      fields={fields}
    />
  );
}