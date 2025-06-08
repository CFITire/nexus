import { FormTemplate } from "@/components/form-template"

export default function UsedHardwareForm() {
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
      options: ["Excellent", "Good", "Fair", "Poor", "Needs repair"],
      required: true
    },
    {
      id: "description",
      label: "Description",
      type: "textarea" as const,
      placeholder: "Detailed description of the hardware...",
      required: true
    },
    {
      id: "brand",
      label: "Brand",
      type: "text" as const,
      placeholder: "Enter brand/manufacturer",
      required: false
    },
    {
      id: "size",
      label: "Size",
      type: "text" as const,
      placeholder: "Enter size specifications",
      required: true
    },
    {
      id: "type",
      label: "Type",
      type: "text" as const,
      placeholder: "Enter hardware type",
      required: true
    },
    {
      id: "boltHoles",
      label: "Bolt Holes",
      type: "text" as const,
      placeholder: "Number and configuration of bolt holes",
      required: false
    },
    {
      id: "boltCircle",
      label: "Bolt Circle",
      type: "text" as const,
      placeholder: "Bolt circle diameter",
      required: false
    },
    {
      id: "pilotHoleSize",
      label: "Pilot Hole Size",
      type: "text" as const,
      placeholder: "Pilot hole diameter",
      required: false
    },
    {
      id: "color",
      label: "Color",
      type: "text" as const,
      placeholder: "Enter color",
      required: false
    },
    {
      id: "paint",
      label: "Paint",
      type: "select" as const,
      options: ["Yes", "No", "Partially painted", "Needs repainting"],
      required: false
    },
    {
      id: "note",
      label: "Note",
      type: "textarea" as const,
      placeholder: "Additional notes or observations...",
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
    <FormTemplate
      title="Used Hardware Form"
      description="Inspection and documentation form for used hardware components."
      fields={fields}
    />
  );
}