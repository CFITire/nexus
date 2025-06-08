import { FormTemplate } from "@/components/form-template"

export default function FrameExtensionForm() {
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
      id: "salesperson",
      label: "Salesperson :",
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
      label: "Part No. :",
      type: "text" as const,
      placeholder: "Enter part number",
      required: true
    },
    {
      id: "condition",
      label: "Condition :",
      type: "text" as const,
      placeholder: "Enter condition",
      required: false
    },
    {
      id: "description",
      label: "Description :",
      type: "textarea" as const,
      placeholder: "Enter description...",
      required: false
    },
    {
      id: "brand",
      label: "Brand.:",
      type: "text" as const,
      placeholder: "Enter brand",
      required: false
    },
    {
      id: "quantity",
      label: "Quantity :",
      type: "number" as const,
      placeholder: "Enter quantity",
      required: true
    },
    {
      id: "color",
      label: "Color :",
      type: "text" as const,
      placeholder: "Enter color",
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
      id: "partNumberSelection",
      label: "Part Number Selection:",
      type: "text" as const,
      placeholder: "Enter part number selection",
      required: false
    },
    {
      id: "numberOfAxleShafts",
      label: "Number of Axle Shafts:",
      type: "number" as const,
      placeholder: "Enter number of axle shafts",
      required: false
    },
    {
      id: "axleShaftLengthSpline",
      label: "Axle Shaft Length & Spline Selection :",
      type: "text" as const,
      placeholder: "Enter axle shaft length and spline selection",
      required: false
    },
    {
      id: "trussRodSelection",
      label: "Truss Rod Selection :",
      type: "text" as const,
      placeholder: "Enter truss rod selection",
      required: false
    },
    {
      id: "notes",
      label: "Notes:",
      type: "textarea" as const,
      placeholder: "Enter additional notes...",
      required: false
    },
    {
      id: "productPhotos",
      label: "Product photos",
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
      title="Frame Extension Inspection"
      description="Complete this inspection to document frame extension specifications and details."
      fields={fields}
    />
  );
}