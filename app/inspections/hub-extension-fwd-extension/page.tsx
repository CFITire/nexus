import { FormTemplate } from "@/components/form-template"

export default function HubExtensionFwdExtensionForm() {
  const fields = [
    {
      id: "dateQuestion",
      label: "Date Question",
      type: "datetime-local" as const,
      autoFill: "datetime" as const,
      required: true
    },
    {
      id: "inspectorName",
      label: "Inspector's Name",
      type: "text" as const,
      placeholder: "Enter inspector's name",
      autoFill: "inspector" as const,
      required: true
    },
    {
      id: "soNo",
      label: "SO No.:",
      type: "text" as const,
      placeholder: "Enter SO number",
      required: false
    },
    {
      id: "poNo",
      label: "PO No.:",
      type: "text" as const,
      placeholder: "Enter PO number",
      required: false
    },
    {
      id: "salesman",
      label: "Salesman:",
      type: "text" as const,
      placeholder: "Enter salesman name",
      required: false
    },
    {
      id: "location",
      label: "Location",
      type: "text" as const,
      placeholder: "Enter location",
      required: false
    },
    {
      id: "partNo",
      label: "Part No.:",
      type: "text" as const,
      placeholder: "Enter part number",
      required: true
    },
    {
      id: "quantity",
      label: "Quantity:",
      type: "number" as const,
      placeholder: "Enter quantity",
      required: true
    },
    {
      id: "condition",
      label: "Condition:",
      type: "text" as const,
      placeholder: "Enter condition",
      required: false
    },
    {
      id: "size",
      label: "Size:",
      type: "text" as const,
      placeholder: "Enter size",
      required: false
    },
    {
      id: "extensionType",
      label: "Extension Type :",
      type: "text" as const,
      placeholder: "Hub Extension or FWD Extension",
      required: false
    },
    {
      id: "boltPatternFWD6Spacer",
      label: "Bolt Pattern for FWD w/ 6\" Spacer",
      type: "text" as const,
      placeholder: "Enter bolt pattern for FWD with 6\" spacer",
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
      id: "color",
      label: "Color:",
      type: "text" as const,
      placeholder: "Enter color",
      required: false
    },
    {
      id: "note",
      label: "Note:",
      type: "textarea" as const,
      placeholder: "Enter notes...",
      required: false
    },
    {
      id: "productPhotos",
      label: "Product Photos",
      type: "text" as const,
      placeholder: "Photo references or file names",
      required: false
    },
    {
      id: "image",
      label: "Image",
      type: "text" as const,
      placeholder: "Image reference or file name",
      required: false
    }
  ];

  return (
    <FormTemplate
      title="Hub Extension & FWD Extension Inspection"
      description="Complete this inspection to document hub and forward extension specifications."
      fields={fields}
    />
  );
}