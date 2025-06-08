import { FormTemplate } from "@/components/form-template"

export default function ServiceTruckChecklistForm() {
  const fields = [
    {
      id: "technicianInspector",
      label: "Technician/Truck Inspector",
      type: "text" as const,
      placeholder: "Enter technician or inspector name",
      autoFill: "inspector" as const,
      required: true
    },
    {
      id: "dateTime",
      label: "Date + Time",
      type: "datetime-local" as const,
      autoFill: "datetime" as const,
      required: true
    },
    {
      id: "cabWindowsDashFloor",
      label: "Cab/windows/dash/floor clean/organized and free of garbage?",
      type: "select" as const,
      options: ["Yes", "No", "Needs attention"],
      required: true
    },
    {
      id: "toolCompartments",
      label: "Tool compartments are clean and organized?",
      type: "select" as const,
      options: ["Yes", "No", "Needs attention"],
      required: true
    },
    {
      id: "toolsCondition",
      label: "All tools are cleaned and properly maintained/in working condition?",
      type: "select" as const,
      options: ["Yes", "No", "Needs attention"],
      required: true
    },
    {
      id: "compartmentDoors",
      label: "Compartment doors closed and latched?",
      type: "select" as const,
      options: ["Yes", "No", "Needs attention"],
      required: true
    },
    {
      id: "truckBed",
      label: "Truck bed is clean and organized?",
      type: "select" as const,
      options: ["Yes", "No", "Needs attention"],
      required: true
    },
    {
      id: "liftGate",
      label: "Lift-gate is up and secure?",
      type: "select" as const,
      options: ["Yes", "No", "Needs attention"],
      required: true
    },
    {
      id: "cranePosition",
      label: "Crane is stored in correct position?",
      type: "select" as const,
      options: ["Yes", "No", "Needs attention"],
      required: true
    },
    {
      id: "truckExterior",
      label: "Truck exterior is clean?",
      type: "select" as const,
      options: ["Yes", "No", "Needs attention"],
      required: true
    },
    {
      id: "skidCansPails",
      label: "Skid cans/murphy grease pails are filled and ready to use?",
      type: "select" as const,
      options: ["Yes", "No", "Needs attention"],
      required: true
    },
    {
      id: "commonTools",
      label: "Common tools are present on truck and easy to find?",
      type: "select" as const,
      options: ["Yes", "No", "Needs attention"],
      required: true
    }
  ];

  return (
    <FormTemplate
      title="Service Truck Checklist"
      description="Daily service truck inspection checklist for technicians."
      fields={fields}
    />
  );
}