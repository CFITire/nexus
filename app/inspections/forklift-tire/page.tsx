import { FormTemplate } from "@/components/form-template"

export default function ForkliftTireForm() {
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
      label: "Salesman",
      type: "text" as const,
      placeholder: "Enter salesman name",
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
      label: "Part No. :",
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
      id: "size",
      label: "Size",
      type: "text" as const,
      placeholder: "Enter tire size",
      required: false
    },
    {
      id: "brand",
      label: "Brand",
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
      id: "rimWidth",
      label: "Rim Width",
      type: "text" as const,
      placeholder: "Enter rim width",
      required: false
    },
    {
      id: "color",
      label: "Color",
      type: "text" as const,
      placeholder: "Enter color",
      required: false
    }
  ];

  return (
    <FormTemplate
      title="Forklift Tire Inspection"
      description="Complete this inspection to document forklift tire details and specifications."
      fields={fields}
    />
  );
}