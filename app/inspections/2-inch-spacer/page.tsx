import { FormTemplate } from "@/components/form-template"

export default function TwoInchSpacerForm() {
  const fields = [
    {
      id: "date",
      label: "Date",
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
      label: "SO No.",
      type: "so-lookup" as const,
      required: false
    },
    {
      id: "poNo",
      label: "PO No.",
      type: "po-lookup" as const,
      required: false
    },
    {
      id: "salesperson",
      label: "Salesperson",
      type: "salesperson-lookup" as const,
      required: false,
      autoFillFrom: "soNo"
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
      type: "text" as const,
      placeholder: "Enter condition",
      required: false
    },
    {
      id: "newTakeOffSelection",
      label: "New / Take-Off Spacer Part Number Selection",
      type: "text" as const,
      placeholder: "Enter new/take-off part number",
      required: false
    },
    {
      id: "usedSelection",
      label: "Used Spacer Part Number Selection",
      type: "text" as const,
      placeholder: "Enter used part number",
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
      id: "notes",
      label: "Notes",
      type: "textarea" as const,
      placeholder: "Enter additional notes...",
      required: false
    },
    {
      id: "attachImage",
      label: "Attach Image",
      type: "text" as const,
      placeholder: "Image file name or reference",
      required: false
    }
  ];

  return (
    <FormTemplate
      title='2" Spacer Inspection'
      description="Complete this inspection to document 2-inch spacer inspection and selection."
      fields={fields}
    />
  );
}