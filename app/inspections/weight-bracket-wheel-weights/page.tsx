import { FormTemplate } from "@/components/form-template"

export default function WeightBracketWheelWeightsForm() {
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
      label: "SO NO. :",
      type: "text" as const,
      placeholder: "Enter sales order number",
      required: false
    },
    {
      id: "poNo",
      label: "PO NO. :",
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
      id: "quantity",
      label: "Quantity",
      type: "number" as const,
      placeholder: "Enter quantity",
      required: true
    },
    {
      id: "condition",
      label: "Condition :",
      type: "select" as const,
      options: ["Excellent", "Good", "Fair", "Poor", "Needs repair"],
      required: true
    },
    {
      id: "description",
      label: "Description :",
      type: "textarea" as const,
      placeholder: "Detailed description of the weight bracket/wheel weights...",
      required: true
    },
    {
      id: "notes",
      label: "Notes:",
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
      id: "photos",
      label: "Photos",
      type: "text" as const,
      placeholder: "Photo reference or file name",
      required: false
    }
  ];

  return (
    <FormTemplate
      title="Weight Bracket / Wheel Weights"
      description="Inspection and documentation form for weight brackets and wheel weights."
      fields={fields}
    />
  );
}