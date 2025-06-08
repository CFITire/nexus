namespace cfi.inspections;

page 50830 "CFI Inspection Types API"
{
    APIGroup = 'cfi';
    APIPublisher = 'cfisolutions';
    APIVersion = 'v1.0';
    ApplicationArea = All;
    Caption = 'CFI Inspection Types API';
    DelayedInsert = true;
    EntityName = 'inspectionType';
    EntitySetName = 'inspectionTypes';
    PageType = API;
    SourceTable = "CFI Inspection Type";
    ODataKeyFields = SystemId;

    layout
    {
        area(Content)
        {
            repeater(Group)
            {
                field(systemId; Rec.SystemId)
                {
                    Caption = 'System Id';
                    Editable = false;
                }
                field(code; Rec."Code")
                {
                    Caption = 'Code';
                }
                field(description; Rec.Description)
                {
                    Caption = 'Description';
                }
                field(category; Rec.Category)
                {
                    Caption = 'Category';
                }
                field(defaultLocationCode; Rec."Default Location Code")
                {
                    Caption = 'Default Location Code';
                }
                field(requireSOPO; Rec."Require SO/PO")
                {
                    Caption = 'Require SO/PO';
                }
                field(autoFillFromSO; Rec."Auto-fill from SO")
                {
                    Caption = 'Auto-fill from SO';
                }
                field(active; Rec.Active)
                {
                    Caption = 'Active';
                }
                field(noSeries; Rec."No. Series")
                {
                    Caption = 'No. Series';
                }
                field(createdDate; Rec."Created Date")
                {
                    Caption = 'Created Date';
                    Editable = false;
                }
                field(createdBy; Rec."Created By")
                {
                    Caption = 'Created By';
                    Editable = false;
                }
                field(modifiedDate; Rec."Modified Date")
                {
                    Caption = 'Modified Date';
                    Editable = false;
                }
                field(modifiedBy; Rec."Modified By")
                {
                    Caption = 'Modified By';
                    Editable = false;
                }
            }
        }
    }
}

namespace cfi.inspections;

page 50831 "CFI Inspection Header API"
{
    APIGroup = 'cfi';
    APIPublisher = 'cfisolutions';
    APIVersion = 'v1.0';
    ApplicationArea = All;
    Caption = 'CFI Inspection Header API';
    DelayedInsert = true;
    EntityName = 'inspectionHeader';
    EntitySetName = 'inspectionHeaders';
    PageType = API;
    SourceTable = "CFI Inspection Header";
    ODataKeyFields = SystemId;

    layout
    {
        area(Content)
        {
            repeater(Group)
            {
                field(systemId; Rec.SystemId)
                {
                    Caption = 'System Id';
                    Editable = false;
                }
                field(no; Rec."No.")
                {
                    Caption = 'No.';
                    Editable = false;
                }
                field(inspectionType; Rec."Inspection Type")
                {
                    Caption = 'Inspection Type';
                }
                field(inspectionCategory; Rec."Inspection Category")
                {
                    Caption = 'Inspection Category';
                }
                field(inspectionDate; Rec."Inspection Date")
                {
                    Caption = 'Inspection Date';
                }
                field(inspectionTime; Rec."Inspection Time")
                {
                    Caption = 'Inspection Time';
                }
                field(inspectorName; Rec."Inspector Name")
                {
                    Caption = 'Inspector Name';
                }
                field(technicianInspector; Rec."Technician Inspector")
                {
                    Caption = 'Technician Inspector';
                }
                field(salesOrderNo; Rec."Sales Order No.")
                {
                    Caption = 'Sales Order No.';
                }
                field(purchaseOrderNo; Rec."Purchase Order No.")
                {
                    Caption = 'Purchase Order No.';
                }
                field(customerPONo; Rec."Customer PO No.")
                {
                    Caption = 'Customer PO No.';
                }
                field(customerNo; Rec."Customer No.")
                {
                    Caption = 'Customer No.';
                }
                field(customerName; Rec."Customer Name")
                {
                    Caption = 'Customer Name';
                }
                field(contactName; Rec."Contact Name")
                {
                    Caption = 'Contact Name';
                }
                field(contactPhone; Rec."Contact Phone")
                {
                    Caption = 'Contact Phone';
                }
                field(salespersonCode; Rec."Salesperson Code")
                {
                    Caption = 'Salesperson Code';
                }
                field(locationCode; Rec."Location Code")
                {
                    Caption = 'Location Code';
                }
                field(status; Rec.Status)
                {
                    Caption = 'Status';
                }
                field(jobPriority; Rec."Job Priority")
                {
                    Caption = 'Job Priority';
                }
                field(additionalNotes; Rec."Additional Notes")
                {
                    Caption = 'Additional Notes';
                }
                field(notes; Rec.Notes)
                {
                    Caption = 'Notes';
                }
                field(photosTaken; Rec."Photos Taken")
                {
                    Caption = 'Photos Taken';
                }
                field(photoReferences; Rec."Photo References")
                {
                    Caption = 'Photo References';
                }
                field(customFieldsJSON; CustomFieldsJSONText)
                {
                    Caption = 'Custom Fields JSON';
                }
                field(createdDate; Rec."Created Date")
                {
                    Caption = 'Created Date';
                    Editable = false;
                }
                field(createdBy; Rec."Created By")
                {
                    Caption = 'Created By';
                    Editable = false;
                }
                field(modifiedDate; Rec."Modified Date")
                {
                    Caption = 'Modified Date';
                    Editable = false;
                }
                field(modifiedBy; Rec."Modified By")
                {
                    Caption = 'Modified By';
                    Editable = false;
                }
                part(inspectionLines; "CFI Inspection Lines API")
                {
                    ApplicationArea = All;
                    Caption = 'Inspection Lines';
                    EntityName = 'inspectionLine';
                    EntitySetName = 'inspectionLines';
                    SubPageLink = "Inspection No." = field("No.");
                }
            }
        }
    }

    var
        CustomFieldsJSONText: Text;

    trigger OnAfterGetRecord()
    begin
        CustomFieldsJSONText := Rec.GetCustomFieldsJSON();
    end;

    trigger OnInsertRecord(BelowxRec: Boolean): Boolean
    begin
        if CustomFieldsJSONText <> '' then
            Rec.SetCustomFieldsJSON(CustomFieldsJSONText);
    end;

    trigger OnModifyRecord(): Boolean
    begin
        if CustomFieldsJSONText <> '' then
            Rec.SetCustomFieldsJSON(CustomFieldsJSONText);
    end;
}

namespace cfi.inspections;

page 50832 "CFI Inspection Lines API"
{
    APIGroup = 'cfi';
    APIPublisher = 'cfisolutions';
    APIVersion = 'v1.0';
    ApplicationArea = All;
    Caption = 'CFI Inspection Lines API';
    DelayedInsert = true;
    EntityName = 'inspectionLine';
    EntitySetName = 'inspectionLines';
    PageType = API;
    SourceTable = "CFI Inspection Line";
    ODataKeyFields = SystemId;

    layout
    {
        area(Content)
        {
            repeater(Group)
            {
                field(systemId; Rec.SystemId)
                {
                    Caption = 'System Id';
                    Editable = false;
                }
                field(inspectionNo; Rec."Inspection No.")
                {
                    Caption = 'Inspection No.';
                }
                field(lineNo; Rec."Line No.")
                {
                    Caption = 'Line No.';
                }
                field(itemNo; Rec."Item No.")
                {
                    Caption = 'Item No.';
                }
                field(partNo; Rec."Part No.")
                {
                    Caption = 'Part No.';
                }
                field(manufacturerPartNo; Rec."Manufacturer Part No.")
                {
                    Caption = 'Manufacturer Part No.';
                }
                field(description; Rec.Description)
                {
                    Caption = 'Description';
                }
                field(serialNo; Rec."Serial No.")
                {
                    Caption = 'Serial No.';
                }
                field(quantity; Rec.Quantity)
                {
                    Caption = 'Quantity';
                }
                field(unitOfMeasureCode; Rec."Unit of Measure Code")
                {
                    Caption = 'Unit of Measure Code';
                }
                field(brand; Rec.Brand)
                {
                    Caption = 'Brand';
                }
                field(condition; Rec."Condition")
                {
                    Caption = 'Condition';
                }
                field(position; Rec.Position)
                {
                    Caption = 'Position';
                }
                field(location; Rec.Location)
                {
                    Caption = 'Location';
                }
                field(size; Rec.Size)
                {
                    Caption = 'Size';
                }
                field(type; Rec.Type)
                {
                    Caption = 'Type';
                }
                field(weight; Rec.Weight)
                {
                    Caption = 'Weight';
                }
                field(tireSectionWidth; Rec."Tire Section Width")
                {
                    Caption = 'Tire Section Width';
                }
                field(tireAspectRatio; Rec."Tire Aspect Ratio")
                {
                    Caption = 'Tire Aspect Ratio';
                }
                field(tireRimDiameter; Rec."Tire Rim Diameter")
                {
                    Caption = 'Tire Rim Diameter';
                }
                field(tireRimWidth; Rec."Tire Rim Width")
                {
                    Caption = 'Tire Rim Width';
                }
                field(tireOverallDiameter; Rec."Tire Overall Diameter")
                {
                    Caption = 'Tire Overall Diameter';
                }
                field(tireTreadDepth; Rec."Tire Tread Depth")
                {
                    Caption = 'Tire Tread Depth';
                }
                field(tireTreadPattern; Rec."Tire Tread Pattern")
                {
                    Caption = 'Tire Tread Pattern';
                }
                field(trackWidth; Rec."Track Width")
                {
                    Caption = 'Track Width';
                }
                field(trackPitchSize; Rec."Track Pitch Size")
                {
                    Caption = 'Track Pitch Size';
                }
                field(trackGuideLugs; Rec."Track Guide Lugs")
                {
                    Caption = 'Track Guide Lugs';
                }
                field(wheelRimDiameter; Rec."Wheel Rim Diameter")
                {
                    Caption = 'Wheel Rim Diameter';
                }
                field(wheelRimWidth; Rec."Wheel Rim Width")
                {
                    Caption = 'Wheel Rim Width';
                }
                field(wheelBoltPattern; Rec."Wheel Bolt Pattern")
                {
                    Caption = 'Wheel Bolt Pattern';
                }
                field(laborCode; Rec."Labor Code")
                {
                    Caption = 'Labor Code';
                }
                field(laborQuantity; Rec."Labor Quantity")
                {
                    Caption = 'Labor Quantity';
                }
                field(overallCondition; Rec."Overall Condition")
                {
                    Caption = 'Overall Condition';
                }
                field(recommendedAction; Rec."Recommended Action")
                {
                    Caption = 'Recommended Action';
                }
                field(estimatedServiceLife; Rec."Estimated Service Life")
                {
                    Caption = 'Estimated Service Life';
                }
                field(lineNotes; Rec."Line Notes")
                {
                    Caption = 'Line Notes';
                }
                field(customFieldsJSON; CustomFieldsJSONText)
                {
                    Caption = 'Custom Fields JSON';
                }
                field(createdDate; Rec."Created Date")
                {
                    Caption = 'Created Date';
                    Editable = false;
                }
                field(createdBy; Rec."Created By")
                {
                    Caption = 'Created By';
                    Editable = false;
                }
                field(modifiedDate; Rec."Modified Date")
                {
                    Caption = 'Modified Date';
                    Editable = false;
                }
                field(modifiedBy; Rec."Modified By")
                {
                    Caption = 'Modified By';
                    Editable = false;
                }
            }
        }
    }

    var
        CustomFieldsJSONText: Text;

    trigger OnAfterGetRecord()
    begin
        CustomFieldsJSONText := Rec.GetCustomFieldsJSON();
    end;

    trigger OnInsertRecord(BelowxRec: Boolean): Boolean
    begin
        if CustomFieldsJSONText <> '' then
            Rec.SetCustomFieldsJSON(CustomFieldsJSONText);
    end;

    trigger OnModifyRecord(): Boolean
    begin
        if CustomFieldsJSONText <> '' then
            Rec.SetCustomFieldsJSON(CustomFieldsJSONText);
    end;
}