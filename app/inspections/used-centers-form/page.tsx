import { TanStackFormTemplate } from "@/components/tanstack-form-template"

export default function UsedCentersForm() {
  const fields = [
    {
      id: "partNo",
      label: "Part No.",
      type: "text" as const,
      placeholder: "Enter part number",
      required: true
    },
    {
      id: "od",
      label: "OD\"",
      type: "text" as const,
      placeholder: "Enter outer diameter in inches",
      required: true
    },
    {
      id: "boltPattern",
      label: "Bolt Pattern",
      type: "text" as const,
      placeholder: "Enter bolt pattern specification",
      required: true
    },
    {
      id: "boltHoleSize",
      label: "Bolt Hole Size",
      type: "text" as const,
      placeholder: "Enter bolt hole size",
      required: true
    },
    {
      id: "draw",
      label: "Draw",
      type: "text" as const,
      placeholder: "Enter draw specification",
      required: true
    },
    {
      id: "thickness",
      label: "Thickness",
      type: "text" as const,
      placeholder: "Enter thickness measurement",
      required: true
    },
    {
      id: "formedStampedFlat",
      label: "Formed/Stamped Or Flat",
      type: "select" as const,
      options: ["Formed", "Stamped", "Flat"],
      required: true
    },
    {
      id: "weightHolesChain",
      label: "Weight Holes or Chain",
      type: "select" as const,
      options: ["Weight Holes", "Chain", "Neither", "Both"],
      required: true
    },
    {
      id: "note",
      label: "Note",
      type: "textarea" as const,
      placeholder: "Enter any additional notes or specifications...",
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
    },
    {
      id: "photo2",
      label: "Photo 2",
      type: "text" as const,
      placeholder: "Second photo reference or file name",
      required: false
    }
  ];

  return (
    <TanStackFormTemplate
      title="Used Centers"
      description="Specification and documentation form for used center components."
      fields={fields}
      inspectionType="used-centers-form"
      enableAutoSave={true}
      autoSaveInterval={30000}
    />
  )
}
