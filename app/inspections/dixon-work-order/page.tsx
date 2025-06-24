import { TanStackFormTemplate } from "@/components/tanstack-form-template"

export default function DixonWorkOrderPage() {
  const fields = [
    {
      id: "rep",
      label: "Rep",
      type: "text" as const,
      placeholder: "Enter rep name",
      required: true
    },
    {
      id: "companyCustomerName",
      label: "Company/Customer Name",
      type: "text" as const,
      placeholder: "Enter company/customer name",
      required: true
    },
    {
      id: "contactName",
      label: "Contact Name",
      type: "text" as const,
      placeholder: "Enter contact name",
      required: true
    },
    {
      id: "contactPhoneNumber",
      label: "Contact Phone Number",
      type: "tel" as const,
      placeholder: "(555) 123-4567",
      required: true
    },
    {
      id: "jobAddressDirections",
      label: "Job Address/Directions",
      type: "textarea" as const,
      placeholder: "Enter job address and directions...",
      required: true
    },
    {
      id: "customerPO",
      label: "Customer PO#",
      type: "text" as const,
      placeholder: "Enter customer PO number",
      required: false
    },
    {
      id: "jobPriority",
      label: "Job Priority",
      type: "text" as const,
      placeholder: "High, Medium, Low, Emergency",
      required: true
    },
    {
      id: "makeModelUnit",
      label: "Make/Model/Unit #",
      type: "text" as const,
      placeholder: "Enter make, model, and unit number",
      required: true
    },
    {
      id: "position",
      label: "Position",
      type: "text" as const,
      placeholder: "Enter position",
      required: false
    },
    {
      id: "itemsUsed",
      label: "Items Used",
      type: "textarea" as const,
      placeholder: "List items used...",
      required: false
    },
    {
      id: "itemsQty",
      label: "Qty:",
      type: "number" as const,
      placeholder: "Enter quantity",
      required: false
    },
    {
      id: "partBarcode",
      label: "Part Barcode",
      type: "text" as const,
      placeholder: "Enter part barcode",
      required: false
    },
    {
      id: "labor",
      label: "Labor",
      type: "textarea" as const,
      placeholder: "Describe labor performed...",
      required: false
    },
    {
      id: "laborQty",
      label: "Qty",
      type: "number" as const,
      placeholder: "Enter labor quantity/hours",
      required: false
    },
    {
      id: "laborCode",
      label: "Labor Code",
      type: "text" as const,
      placeholder: "Enter labor code",
      required: false
    },
    {
      id: "scrapTireDisposal",
      label: "Scrap tire disposal?",
      type: "text" as const,
      placeholder: "Yes/No - Details",
      required: false
    },
    {
      id: "salesOrderNumber",
      label: "Sales Order #",
      type: "text" as const,
      placeholder: "Enter sales order number",
      required: false
    },
    {
      id: "additionalNotes",
      label: "Additional notes",
      type: "textarea" as const,
      placeholder: "Enter additional notes...",
      required: false
    },
    {
      id: "technicianStartEndTime",
      label: "Technician/Start-End Time",
      type: "text" as const,
      placeholder: "Technician name and start-end times",
      required: false
    },
    {
      id: "pictureProblemCause",
      label: "Picture of problem/cause of failure",
      type: "text" as const,
      placeholder: "Photo reference or file name",
      required: false
    },
    {
      id: "pictureWorkCompleted",
      label: "Picture of work completed",
      type: "text" as const,
      placeholder: "Photo reference or file name",
      required: false
    },
    {
      id: "signatureQuestion",
      label: "Signature Question",
      type: "text" as const,
      placeholder: "Customer signature confirmation",
      required: false
    }
  ]

  return (
    <TanStackFormTemplate
      title="Dixon Work Order Inspection"
      description="Create and document Dixon equipment service work order details."
      fields={fields}
      inspectionType="dixon-work-order"
      enableAutoSave={true}
      autoSaveInterval={30000}
    />
  )
}

