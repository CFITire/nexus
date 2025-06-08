namespace cfi.inspections;
using Microsoft.Foundation.NoSeries;
using System.Environment;

codeunit 50810 "CFI Inspection Setup"
{
    procedure InitializeInspectionTypes()
    var
        InspectionType: Record "CFI Inspection Type";
    begin
        // Used Tire Inspection
        if not InspectionType.Get('USED-TIRE') then begin
            InspectionType.Init();
            InspectionType.Code := 'USED-TIRE';
            InspectionType.Description := 'Used Tire Inspection';
            InspectionType.Category := InspectionType.Category::Tire;
            InspectionType."Require SO/PO" := false;
            InspectionType."Auto-fill from SO" := true;
            InspectionType.Active := true;
            InspectionType.Insert();
        end;

        // Used Track Inspection
        if not InspectionType.Get('USED-TRACK') then begin
            InspectionType.Init();
            InspectionType.Code := 'USED-TRACK';
            InspectionType.Description := 'Used Track Inspection';
            InspectionType.Category := InspectionType.Category::Track;
            InspectionType."Require SO/PO" := false;
            InspectionType."Auto-fill from SO" := true;
            InspectionType.Active := true;
            InspectionType.Insert();
        end;

        // Used Wheel Inspection
        if not InspectionType.Get('USED-WHEEL') then begin
            InspectionType.Init();
            InspectionType.Code := 'USED-WHEEL';
            InspectionType.Description := 'Used Wheel Inspection';
            InspectionType.Category := InspectionType.Category::Wheel;
            InspectionType."Require SO/PO" := false;
            InspectionType."Auto-fill from SO" := true;
            InspectionType.Active := true;
            InspectionType.Insert();
        end;

        // Assembly Inspection
        if not InspectionType.Get('ASSEMBLY') then begin
            InspectionType.Init();
            InspectionType.Code := 'ASSEMBLY';
            InspectionType.Description := 'Assembly Inspection';
            InspectionType.Category := InspectionType.Category::Assembly;
            InspectionType."Require SO/PO" := false;
            InspectionType."Auto-fill from SO" := true;
            InspectionType.Active := true;
            InspectionType.Insert();
        end;

        // Service Truck Checklist
        if not InspectionType.Get('SERVICE-TRUCK') then begin
            InspectionType.Init();
            InspectionType.Code := 'SERVICE-TRUCK';
            InspectionType.Description := 'Service Truck Checklist';
            InspectionType.Category := InspectionType.Category::Checklist;
            InspectionType."Require SO/PO" := false;
            InspectionType."Auto-fill from SO" := false;
            InspectionType.Active := true;
            InspectionType.Insert();
        end;

        // Hardware Inspection
        if not InspectionType.Get('HARDWARE') then begin
            InspectionType.Init();
            InspectionType.Code := 'HARDWARE';
            InspectionType.Description := 'Hardware Inspection';
            InspectionType.Category := InspectionType.Category::Hardware;
            InspectionType."Require SO/PO" := false;
            InspectionType."Auto-fill from SO" := true;
            InspectionType.Active := true;
            InspectionType.Insert();
        end;
    end;

    procedure SetupNoSeries()
    var
        NoSeries: Record "No. Series";
        NoSeriesLine: Record "No. Series Line";
    begin
        // Create No. Series for Inspections
        if not NoSeries.Get('INSPECT') then begin
            NoSeries.Init();
            NoSeries.Code := 'INSPECT';
            NoSeries.Description := 'Inspection Numbers';
            NoSeries."Default Nos." := true;
            NoSeries.Insert();

            // Create No. Series Line
            NoSeriesLine.Init();
            NoSeriesLine."Series Code" := 'INSPECT';
            NoSeriesLine."Line No." := 10000;
            NoSeriesLine."Starting No." := 'INS00001';
            NoSeriesLine."Ending No." := 'INS99999';
            NoSeriesLine."Increment-by No." := 1;
            NoSeriesLine.Insert();
        end;
    end;

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Company Triggers", 'OnCompanyOpen', '', false, false)]
    local procedure OnCompanyInitialize()
    begin
        SetupNoSeries();
        InitializeInspectionTypes();
    end;

    procedure UpdateActionImages()
    begin
        // This is a placeholder for updating action images to valid values if needed in the future.
        // For example, use 'Checkmark', 'Approve', or other valid images from the official list.
    end;
}

namespace cfi.inspections;

enum 50820 "CFI Inspection Category"
{
    Caption = 'CFI Inspection Category';
    Extensible = true;

    value(0; " ")
    {
        Caption = ' ';
    }
    value(1; "Tire")
    {
        Caption = 'Tire';
    }
    value(2; "Track")
    {
        Caption = 'Track';
    }
    value(3; "Wheel")
    {
        Caption = 'Wheel';
    }
    value(4; "Assembly")
    {
        Caption = 'Assembly';
    }
    value(5; "Service")
    {
        Caption = 'Service';
    }
    value(6; "Checklist")
    {
        Caption = 'Checklist';
    }
    value(7; "Hardware")
    {
        Caption = 'Hardware';
    }
    value(8; "Other")
    {
        Caption = 'Other';
    }
}

namespace cfi.inspections;

enum 50821 "CFI Inspection Status"
{
    Caption = 'CFI Inspection Status';
    Extensible = true;

    value(0; "Open")
    {
        Caption = 'Open';
    }
    value(1; "In Progress")
    {
        Caption = 'In Progress';
    }
    value(2; "Completed")
    {
        Caption = 'Completed';
    }
    value(3; "Approved")
    {
        Caption = 'Approved';
    }
    value(4; "Rejected")
    {
        Caption = 'Rejected';
    }
    value(5; "Cancelled")
    {
        Caption = 'Cancelled';
    }
}

namespace cfi.inspections;

page 50820 "CFI Inspection Types"
{
    Caption = 'CFI Inspection Types';
    PageType = List;
    SourceTable = "CFI Inspection Type";
    UsageCategory = Lists;
    ApplicationArea = All;

    layout
    {
        area(Content)
        {
            repeater(Group)
            {
                field("Code"; Rec."Code")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the unique code for this inspection type.';
                }
                field(Description; Rec.Description)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the description of the inspection type.';
                }
                field(Category; Rec.Category)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the category of inspection (Tire, Track, Wheel, etc.).';
                }
                field("Default Location Code"; Rec."Default Location Code")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the default location for inspections of this type.';
                }
                field("Require SO/PO"; Rec."Require SO/PO")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies if a Sales Order or Purchase Order is required.';
                }
                field("Auto-fill from SO"; Rec."Auto-fill from SO")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies if fields should be auto-filled from Sales Order.';
                }
                field(Active; Rec.Active)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies if this inspection type is active.';
                }
                field("No. Series"; Rec."No. Series")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the number series for inspection numbers.';
                }
            }
        }
    }

    actions
    {
        area(Processing)
        {
            action(NewInspection)
            {
                Caption = 'New Inspection';
                Image = New;
                ApplicationArea = All;
                ToolTip = 'Create a new inspection of this type.';

                trigger OnAction()
                var
                    InspectionHeader: Record "CFI Inspection Header";
                    InspectionCard: Page "CFI Inspection Card";
                begin
                    InspectionHeader.Init();
                    InspectionHeader."Inspection Type" := Rec.Code;
                    InspectionHeader.Insert(true);
                    InspectionCard.SetRecord(InspectionHeader);
                    InspectionCard.Run();
                end;
            }
        }
    }
}

namespace cfi.inspections;

page 50821 "CFI Inspection List"
{
    Caption = 'CFI Inspection List';
    PageType = List;
    SourceTable = "CFI Inspection Header";
    UsageCategory = Lists;
    ApplicationArea = All;
    CardPageId = "CFI Inspection Card";
    Editable = false;

    layout
    {
        area(Content)
        {
            repeater(Group)
            {
                field("No."; Rec."No.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the inspection number.';
                }
                field("Inspection Type"; Rec."Inspection Type")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the type of inspection.';
                }
                field("Inspection Category"; Rec."Inspection Category")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the category of inspection.';
                }
                field("Inspection Date"; Rec."Inspection Date")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the date of inspection.';
                }
                field("Inspector Name"; Rec."Inspector Name")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the name of the inspector.';
                }
                field("Sales Order No."; Rec."Sales Order No.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the related sales order number.';
                }
                field("Customer No."; Rec."Customer No.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the customer number.';
                }
                field("Customer Name"; Rec."Customer Name")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the customer name.';
                }
                field("Status"; Rec."Status")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the status of the inspection.';
                }
                field("Location Code"; Rec."Location Code")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the location code.';
                }
            }
        }
        area(FactBoxes)
        {
            systempart(Notes; Notes)
            {
                ApplicationArea = All;
            }
            systempart(Links; Links)
            {
                ApplicationArea = All;
            }
        }
    }

    actions
    {
        area(Processing)
        {
            action(NewInspection)
            {
                Caption = 'New';
                Image = New;
                ApplicationArea = All;
                ToolTip = 'Create a new inspection.';

                trigger OnAction()
                var
                    InspectionHeader: Record "CFI Inspection Header";
                    InspectionCard: Page "CFI Inspection Card";
                begin
                    InspectionHeader.Init();
                    InspectionHeader.Insert(true);
                    InspectionCard.SetRecord(InspectionHeader);
                    InspectionCard.Run();
                end;
            }
        }
        area(Navigation)
        {
            action(InspectionLines)
            {
                Caption = 'Inspection Lines';
                Image = AllLines;
                ApplicationArea = All;
                ToolTip = 'View the inspection lines.';

                trigger OnAction()
                var
                    InspectionLine: Record "CFI Inspection Line";
                    InspectionLines: Page "CFI Inspection Lines";
                begin
                    InspectionLine.SetRange("Inspection No.", Rec."No.");
                    InspectionLines.SetTableView(InspectionLine);
                    InspectionLines.Run();
                end;
            }
        }
    }
}


namespace cfi.inspections;

page 50822 "CFI Inspection Card"
{
    Caption = 'CFI Inspection Card';
    PageType = Document;
    SourceTable = "CFI Inspection Header";
    UsageCategory = Documents;
    ApplicationArea = All;

    layout
    {
        area(Content)
        {
            group(General)
            {
                Caption = 'General';
                field("No."; Rec."No.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the inspection number.';
                }
                field("Inspection Type"; Rec."Inspection Type")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the type of inspection.';
                }
                field("Inspection Category"; Rec."Inspection Category")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the category of inspection.';
                }
                field("Inspection Date"; Rec."Inspection Date")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the date of inspection.';
                }
                field("Inspection Time"; Rec."Inspection Time")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the time of inspection.';
                }
                field("Inspector Name"; Rec."Inspector Name")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the name of the inspector.';
                }
                field("Technician Inspector"; Rec."Technician Inspector")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the technician inspector.';
                }
                field("Status"; Rec."Status")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the status of the inspection.';
                }
                field("Location Code"; Rec."Location Code")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the location code.';
                }
            }
            group("Order Information")
            {
                Caption = 'Order Information';
                field("Sales Order No."; Rec."Sales Order No.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the related sales order number.';
                }
                field("Purchase Order No."; Rec."Purchase Order No.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the related purchase order number.';
                }
                field("Customer PO No."; Rec."Customer PO No.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the customer purchase order number.';
                }
                field("Salesperson Code"; Rec."Salesperson Code")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the salesperson code.';
                }
                field("Job Priority"; Rec."Job Priority")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the job priority.';
                }
            }
            group("Customer Information")
            {
                Caption = 'Customer Information';
                field("Customer No."; Rec."Customer No.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the customer number.';
                }
                field("Customer Name"; Rec."Customer Name")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the customer name.';
                }
                field("Contact Name"; Rec."Contact Name")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the contact name.';
                }
                field("Contact Phone"; Rec."Contact Phone")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the contact phone number.';
                }
            }
            group("Photos and Notes")
            {
                Caption = 'Photos and Notes';
                field("Photos Taken"; Rec."Photos Taken")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies if photos were taken during inspection.';
                }
                field("Photo References"; Rec."Photo References")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies references to photo files.';
                }
                field("Additional Notes"; Rec."Additional Notes")
                {
                    ApplicationArea = All;
                    MultiLine = true;
                    ToolTip = 'Specifies additional notes for the inspection.';
                }
                field("Nexus-Notes"; Rec."Notes")
                {
                    ApplicationArea = All;
                    MultiLine = true;
                    ToolTip = 'Specifies general notes for the inspection.';
                }
            }
            part("Nexus-InspectionLines"; "CFI Inspection Lines")
            {
                ApplicationArea = All;
                SubPageLink = "Inspection No." = field("No.");
                UpdatePropagation = Both;
            }
        }
        area(FactBoxes)
        {
            systempart(Notes; Notes)
            {
                ApplicationArea = All;
            }
            systempart(Links; Links)
            {
                ApplicationArea = All;
            }
        }
    }

    actions
    {
        area(Processing)
        {
            action(Complete)
            {
                Caption = 'Complete';
                ApplicationArea = All;
                ToolTip = 'Mark the inspection as completed.';

                trigger OnAction()
                begin
                    Rec."Status" := Rec."Status"::Completed;
                    Rec.Modify();
                end;
            }
            action(Approve)
            {
                Caption = 'Approve';
                Image = Approve;
                ApplicationArea = All;
                ToolTip = 'Approve the inspection.';

                trigger OnAction()
                begin
                    Rec."Status" := Rec."Status"::Approved;
                    Rec.Modify();
                end;
            }
        }
        area(Navigation)
        {
            action(InspectionLines)
            {
                Caption = 'Inspection Lines';
                Image = AllLines;
                ApplicationArea = All;
                ToolTip = 'View the inspection lines.';
                RunObject = page "CFI Inspection Lines";
                RunPageLink = "Inspection No." = field("No.");
            }
        }
    }
}

namespace cfi.inspections;

page 50823 "CFI Inspection Lines"
{
    Caption = 'CFI Inspection Lines';
    PageType = ListPart;
    SourceTable = "CFI Inspection Line";
    AutoSplitKey = true;

    layout
    {
        area(Content)
        {
            repeater(Group)
            {
                field("Item No."; Rec."Item No.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the item number.';
                }
                field("Part No."; Rec."Part No.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the part number.';
                }
                field(Description; Rec.Description)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the description.';
                }
                field("Serial No."; Rec."Serial No.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the serial number.';
                }
                field(Quantity; Rec.Quantity)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the quantity.';
                }
                field("Unit of Measure Code"; Rec."Unit of Measure Code")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the unit of measure.';
                }
                field(Brand; Rec.Brand)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the brand.';
                }
                field("Condition"; Rec."Condition")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the condition.';
                }
                field(Position; Rec.Position)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the position.';
                }
                field(Location; Rec.Location)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the location.';
                }
                field(Size; Rec.Size)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the size.';
                }
                field(Type; Rec.Type)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the type.';
                }
                field("Overall Condition"; Rec."Overall Condition")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the overall condition.';
                }
                field("Recommended Action"; Rec."Recommended Action")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the recommended action.';
                }
                field("Line Notes"; Rec."Line Notes")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies notes for this line.';
                }
            }
        }
    }

    actions
    {
        area(Processing)
        {
            action(TireDetails)
            {
                Caption = 'Tire Details';
                Image = Item;
                ApplicationArea = All;
                ToolTip = 'View tire-specific details.';
                Visible = IsTireInspection;

                trigger OnAction()
                var
                    TireDetailsPage: Page "CFI Tire Details";
                begin
                    TireDetailsPage.SetInspectionLine(Rec);
                    TireDetailsPage.RunModal();
                end;
            }
            action(TrackDetails)
            {
                Caption = 'Track Details';
                Image = Item;
                ApplicationArea = All;
                ToolTip = 'View track-specific details.';
                Visible = IsTrackInspection;

                trigger OnAction()
                var
                    TrackDetailsPage: Page "CFI Track Details";
                begin
                    TrackDetailsPage.SetInspectionLine(Rec);
                    TrackDetailsPage.RunModal();
                end;
            }
            action(WheelDetails)
            {
                Caption = 'Wheel Details';
                Image = Item;
                ApplicationArea = All;
                ToolTip = 'View wheel-specific details.';
                Visible = IsWheelInspection;

                trigger OnAction()
                var
                    WheelDetailsPage: Page "CFI Wheel Details";
                begin
                    WheelDetailsPage.SetInspectionLine(Rec);
                    WheelDetailsPage.RunModal();
                end;
            }
        }
    }

    var
        IsTireInspection: Boolean;
        IsTrackInspection: Boolean;
        IsWheelInspection: Boolean;

    trigger OnAfterGetCurrRecord()
    var
        InspectionHeader: Record "CFI Inspection Header";
    begin
        if InspectionHeader.Get(Rec."Inspection No.") then begin
            IsTireInspection := InspectionHeader."Inspection Category" = InspectionHeader."Inspection Category"::Tire;
            IsTrackInspection := InspectionHeader."Inspection Category" = InspectionHeader."Inspection Category"::Track;
            IsWheelInspection := InspectionHeader."Inspection Category" = InspectionHeader."Inspection Category"::Wheel;
        end;
    end;
}


namespace cfi.inspections;

page 50824 "CFI Tire Details"
{
    Caption = 'Tire Details';
    PageType = Card;
    SourceTable = "CFI Inspection Line";

    layout
    {
        area(Content)
        {
            group("Basic Information")
            {
                Caption = 'Basic Information';
                field("Item No."; Rec."Item No.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the item number.';
                }
                field("Part No."; Rec."Part No.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the part number.';
                }
                field(Description; Rec.Description)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the description.';
                }
                field(Brand; Rec.Brand)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the brand.';
                }
                field("Condition"; Rec."Condition")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the condition.';
                }
            }
            group("Tire Specifications")
            {
                Caption = 'Tire Specifications';
                field("Tire Section Width"; Rec."Tire Section Width")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the tire section width.';
                }
                field("Tire Aspect Ratio"; Rec."Tire Aspect Ratio")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the tire aspect ratio.';
                }
                field("Tire Rim Diameter"; Rec."Tire Rim Diameter")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the tire rim diameter.';
                }
                field("Tire Rim Width"; Rec."Tire Rim Width")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the tire rim width.';
                }
                field("Tire Overall Diameter"; Rec."Tire Overall Diameter")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the tire overall diameter.';
                }
                field("Tire Tread Depth"; Rec."Tire Tread Depth")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the tire tread depth.';
                }
                field("Tire Tread Pattern"; Rec."Tire Tread Pattern")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the tire tread pattern.';
                }
            }
            group("Assessment")
            {
                Caption = 'Assessment';
                field("Overall Condition"; Rec."Overall Condition")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the overall tire condition.';
                }
                field("Recommended Action"; Rec."Recommended Action")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the recommended action.';
                }
                field("Estimated Service Life"; Rec."Estimated Service Life")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the estimated service life.';
                }
                field("Line Notes"; Rec."Line Notes")
                {
                    ApplicationArea = All;
                    MultiLine = true;
                    ToolTip = 'Specifies notes for this tire.';
                }
            }
        }
    }

    var
        InspectionLineRec: Record "CFI Inspection Line";

    procedure SetInspectionLine(var InspectionLine: Record "CFI Inspection Line")
    begin
        InspectionLineRec := InspectionLine;
        Rec := InspectionLineRec;
        CurrPage.Update(false);
    end;
}


namespace cfi.inspections;

page 50825 "CFI Track Details"
{
    Caption = 'Track Details';
    PageType = Card;
    SourceTable = "CFI Inspection Line";

    layout
    {
        area(Content)
        {
            group("Basic Information")
            {
                Caption = 'Basic Information';
                field("Item No."; Rec."Item No.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the item number.';
                }
                field("Part No."; Rec."Part No.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the part number.';
                }
                field(Description; Rec.Description)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the description.';
                }
                field(Brand; Rec.Brand)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the brand.';
                }
                field("Condition"; Rec."Condition")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the condition.';
                }
            }
            group("Track Specifications")
            {
                Caption = 'Track Specifications';
                field("Track Width"; Rec."Track Width")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the track width.';
                }
                field("Track Pitch Size"; Rec."Track Pitch Size")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the track pitch size.';
                }
                field("Track Guide Lugs"; Rec."Track Guide Lugs")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the number of track guide lugs.';
                }
                field("Tire Tread Depth"; Rec."Tire Tread Depth")
                {
                    ApplicationArea = All;
                    Caption = 'Tread Depth';
                    ToolTip = 'Specifies the track tread depth.';
                }
            }
            group("Assessment")
            {
                Caption = 'Assessment';
                field("Overall Condition"; Rec."Overall Condition")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the overall track condition.';
                }
                field("Recommended Action"; Rec."Recommended Action")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the recommended action.';
                }
                field("Estimated Service Life"; Rec."Estimated Service Life")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the estimated service life.';
                }
                field("Line Notes"; Rec."Line Notes")
                {
                    ApplicationArea = All;
                    MultiLine = true;
                    ToolTip = 'Specifies notes for this track.';
                }
            }
        }
    }

    var
        InspectionLineRec: Record "CFI Inspection Line";

    procedure SetInspectionLine(var InspectionLine: Record "CFI Inspection Line")
    begin
        InspectionLineRec := InspectionLine;
        Rec := InspectionLineRec;
        CurrPage.Update(false);
    end;
}


namespace cfi.inspections;

page 50826 "CFI Wheel Details"
{
    Caption = 'Wheel Details';
    PageType = Card;
    SourceTable = "CFI Inspection Line";

    layout
    {
        area(Content)
        {
            group("Basic Information")
            {
                Caption = 'Basic Information';
                field("Item No."; Rec."Item No.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the item number.';
                }
                field("Part No."; Rec."Part No.")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the part number.';
                }
                field(Description; Rec.Description)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the description.';
                }
                field(Brand; Rec.Brand)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the brand.';
                }
                field("Condition"; Rec."Condition")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the condition.';
                }
            }
            group("Wheel Specifications")
            {
                Caption = 'Wheel Specifications';
                field("Wheel Rim Diameter"; Rec."Wheel Rim Diameter")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the wheel rim diameter.';
                }
                field("Wheel Rim Width"; Rec."Wheel Rim Width")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the wheel rim width.';
                }
                field("Wheel Bolt Pattern"; Rec."Wheel Bolt Pattern")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the wheel bolt pattern.';
                }
                field(Weight; Rec.Weight)
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the wheel weight.';
                }
            }
            group("Assessment")
            {
                Caption = 'Assessment';
                field("Overall Condition"; Rec."Overall Condition")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the overall wheel condition.';
                }
                field("Recommended Action"; Rec."Recommended Action")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the recommended action.';
                }
                field("Estimated Service Life"; Rec."Estimated Service Life")
                {
                    ApplicationArea = All;
                    ToolTip = 'Specifies the estimated service life.';
                }
                field("Line Notes"; Rec."Line Notes")
                {
                    ApplicationArea = All;
                    MultiLine = true;
                    ToolTip = 'Specifies notes for this wheel.';
                }
            }
        }
    }

    var
        InspectionLineRec: Record "CFI Inspection Line";

    procedure SetInspectionLine(var InspectionLine: Record "CFI Inspection Line")
    begin
        InspectionLineRec := InspectionLine;
        Rec := InspectionLineRec;
        CurrPage.Update(false);
    end;
}

namespace cfi.inspections;
using Microsoft.Inventory.Location;
using Microsoft.Foundation.NoSeries;

table 50820 "CFI Inspection Type"
{
    Caption = 'CFI Inspection Type';
    DataClassification = CustomerContent;
    DrillDownPageId = "CFI Inspection Types";
    LookupPageId = "CFI Inspection Types";

    fields
    {
        field(1; "Code"; Code[20])
        {
            Caption = 'Code';
            NotBlank = true;
        }
        field(2; Description; Text[100])
        {
            Caption = 'Description';
        }
        field(3; "Category"; Enum "CFI Inspection Category")
        {
            Caption = 'Category';
        }
        field(4; "Default Location Code"; Code[10])
        {
            Caption = 'Default Location Code';
            TableRelation = Location.Code;
        }
        field(5; "Require SO/PO"; Boolean)
        {
            Caption = 'Require SO/PO';
        }
        field(6; "Auto-fill from SO"; Boolean)
        {
            Caption = 'Auto-fill from SO';
        }
        field(10; "Active"; Boolean)
        {
            Caption = 'Active';
            InitValue = true;
        }
        field(20; "No. Series"; Code[20])
        {
            Caption = 'No. Series';
            TableRelation = "No. Series".Code;
        }
        field(100; "Created Date"; DateTime)
        {
            Caption = 'Created Date';
            Editable = false;
        }
        field(101; "Created By"; Code[50])
        {
            Caption = 'Created By';
            Editable = false;
        }
        field(102; "Modified Date"; DateTime)
        {
            Caption = 'Modified Date';
            Editable = false;
        }
        field(103; "Modified By"; Code[50])
        {
            Caption = 'Modified By';
            Editable = false;
        }
    }

    keys
    {
        key(PK; "Code")
        {
            Clustered = true;
        }
        key(Category; "Category", Description)
        {
        }
    }

    trigger OnInsert()
    begin
        "Created Date" := CurrentDateTime();
        "Created By" := CopyStr(UserId(), 1, MaxStrLen("Created By"));
        "Modified Date" := "Created Date";
        "Modified By" := "Created By";
    end;

    trigger OnModify()
    begin
        "Modified Date" := CurrentDateTime();
        "Modified By" := CopyStr(UserId(), 1, MaxStrLen("Modified By"));
    end;
}

namespace cfi.inspections;
using Microsoft.Sales.Document;
using Microsoft.CRM.Team;
using Microsoft.Inventory.Location;
using Microsoft.Sales.Customer;
using Microsoft.Purchases.Document;
using Microsoft.Foundation.NoSeries;
using System.Utilities;

table 50821 "CFI Inspection Header"
{
    Caption = 'CFI Inspection Header';
    DataClassification = CustomerContent;
    DrillDownPageId = "CFI Inspection List";
    LookupPageId = "CFI Inspection List";

    fields
    {
        field(1; "No."; Code[20])
        {
            Caption = 'No.';
            Editable = false;
        }
        field(2; "Inspection Type"; Code[20])
        {
            Caption = 'Inspection Type';
            TableRelation = "CFI Inspection Type".Code where(Active = const(true));
            NotBlank = true;

            trigger OnValidate()
            var
                InspectionType: Record "CFI Inspection Type";
            begin
                if InspectionType.Get("Inspection Type") then begin
                    "Inspection Category" := InspectionType.Category;
                    if "Location Code" = '' then
                        "Location Code" := InspectionType."Default Location Code";
                end;
            end;
        }
        field(3; "Inspection Category"; Enum "CFI Inspection Category")
        {
            Caption = 'Inspection Category';
            Editable = false;
        }
        field(4; "Inspection Date"; Date)
        {
            Caption = 'Inspection Date';
        }
        field(5; "Inspection Time"; Time)
        {
            Caption = 'Inspection Time';
        }
        field(6; "Inspector Name"; Text[100])
        {
            Caption = 'Inspector Name';
        }
        field(7; "Technician Inspector"; Text[100])
        {
            Caption = 'Technician Inspector';
        }
        field(10; "Sales Order No."; Code[20])
        {
            Caption = 'Sales Order No.';
            TableRelation = "Sales Header"."No." where("Document Type" = const(Order));

            trigger OnValidate()
            var
                SalesHeader: Record "Sales Header";
            begin
                if "Sales Order No." <> '' then begin
                    if SalesHeader.Get(SalesHeader."Document Type"::Order, "Sales Order No.") then begin
                        "Customer No." := SalesHeader."Sell-to Customer No.";
                        "Customer Name" := SalesHeader."Sell-to Customer Name";
                        "Contact Name" := SalesHeader."Sell-to Contact";
                        "Salesperson Code" := SalesHeader."Salesperson Code";
                        if SalesHeader."Sell-to Phone No." <> '' then
                            "Contact Phone" := SalesHeader."Sell-to Phone No.";
                    end;
                end else begin
                    Clear("Customer No.");
                    Clear("Customer Name");
                    Clear("Contact Name");
                    Clear("Salesperson Code");
                    Clear("Contact Phone");
                end;
            end;
        }
        field(11; "Purchase Order No."; Code[20])
        {
            Caption = 'Purchase Order No.';
            TableRelation = "Purchase Header"."No." where("Document Type" = const(Order));
        }
        field(12; "Customer PO No."; Text[50])
        {
            Caption = 'Customer PO No.';
        }
        field(15; "Customer No."; Code[20])
        {
            Caption = 'Customer No.';
            TableRelation = Customer."No.";
        }
        field(16; "Customer Name"; Text[100])
        {
            Caption = 'Customer Name';
        }
        field(17; "Contact Name"; Text[100])
        {
            Caption = 'Contact Name';
        }
        field(18; "Contact Phone"; Text[30])
        {
            Caption = 'Contact Phone';
        }
        field(19; "Salesperson Code"; Code[20])
        {
            Caption = 'Salesperson Code';
            TableRelation = "Salesperson/Purchaser".Code;
        }
        field(20; "Location Code"; Code[10])
        {
            Caption = 'Location Code';
            TableRelation = Location.Code;
        }
        field(25; "Status"; Enum "CFI Inspection Status")
        {
            Caption = 'Status';
        }
        field(30; "Job Priority"; Text[50])
        {
            Caption = 'Job Priority';
        }
        field(40; "Additional Notes"; Text[2048])
        {
            Caption = 'Additional Notes';
        }
        field(41; "Notes"; Text[2048])
        {
            Caption = 'Notes';
        }
        field(50; "Photos Taken"; Boolean)
        {
            Caption = 'Photos Taken';
        }
        field(51; "Photo References"; Text[500])
        {
            Caption = 'Photo References';
        }
        field(60; "Custom Fields JSON"; Blob)
        {
            Caption = 'Custom Fields JSON';
            DataClassification = CustomerContent;
        }
        field(100; "Created Date"; DateTime)
        {
            Caption = 'Created Date';
            Editable = false;
        }
        field(101; "Created By"; Code[50])
        {
            Caption = 'Created By';
            Editable = false;
        }
        field(102; "Modified Date"; DateTime)
        {
            Caption = 'Modified Date';
            Editable = false;
        }
        field(103; "Modified By"; Code[50])
        {
            Caption = 'Modified By';
            Editable = false;
        }
    }

    keys
    {
        key(PK; "No.")
        {
            Clustered = true;
        }
        key(InspectionType; "Inspection Type", "Inspection Date")
        {
        }
        key(Customer; "Customer No.", "Inspection Date")
        {
        }
        key(SalesOrder; "Sales Order No.")
        {
        }
    }
    trigger OnInsert()
    var
        NoSeries: Codeunit "No. Series";
        InspectionType: Record "CFI Inspection Type";
    begin
        if "No." = '' then begin
            if InspectionType.Get("Inspection Type") and (InspectionType."No. Series" <> '') then
                "No." := NoSeries.GetNextNo(InspectionType."No. Series", WorkDate(), true)
            else
                "No." := NoSeries.GetNextNo('INSPECT', WorkDate(), true);
        end;

        if "Inspection Date" = 0D then
            "Inspection Date" := WorkDate();
        if "Inspection Time" = 0T then
            "Inspection Time" := Time();

        "Created Date" := CurrentDateTime();
        "Created By" := CopyStr(UserId(), 1, MaxStrLen("Created By"));
        "Modified Date" := "Created Date";
        "Modified By" := "Created By";
        "Status" := "Status"::Open;
    end;

    trigger OnModify()
    begin
        "Modified Date" := CurrentDateTime();
        "Modified By" := CopyStr(UserId(), 1, MaxStrLen("Modified By"));
    end;

    procedure GetCustomFieldsJSON(): Text
    var
        InStream: InStream;
        JSONText: Text;
    begin
        CalcFields("Custom Fields JSON");
        "Custom Fields JSON".CreateInStream(InStream, TextEncoding::UTF8);
        InStream.ReadText(JSONText);
        exit(JSONText);
    end;

    procedure SetCustomFieldsJSON(JSONText: Text)
    var
        OutStream: OutStream;
    begin
        Clear("Custom Fields JSON");
        "Custom Fields JSON".CreateOutStream(OutStream, TextEncoding::UTF8);
        OutStream.WriteText(JSONText);
        Modify();
    end;
}

namespace cfi.inspections;
using Microsoft.Inventory.Item;
using Microsoft.Foundation.UOM;

table 50822 "CFI Inspection Line"
{
    Caption = 'CFI Inspection Line';
    DataClassification = CustomerContent;

    fields
    {
        field(1; "Inspection No."; Code[20])
        {
            Caption = 'Inspection No.';
            TableRelation = "CFI Inspection Header"."No.";
        }
        field(2; "Line No."; Integer)
        {
            Caption = 'Line No.';
        }
        field(3; "Item No."; Code[20])
        {
            Caption = 'Item No.';
            TableRelation = Item."No.";

            trigger OnValidate()
            var
                Item: Record Item;
            begin
                if Item.Get("Item No.") then begin
                    Description := Item.Description;
                    "Unit of Measure Code" := Item."Base Unit of Measure";
                    Brand := Item.Brand;
                end;
            end;
        }
        field(4; "Part No."; Text[50])
        {
            Caption = 'Part No.';
        }
        field(5; "Manufacturer Part No."; Text[50])
        {
            Caption = 'Manufacturer Part No.';
        }
        field(6; Description; Text[100])
        {
            Caption = 'Description';
        }
        field(7; "Serial No."; Text[50])
        {
            Caption = 'Serial No.';
        }
        field(8; Quantity; Decimal)
        {
            Caption = 'Quantity';
            DecimalPlaces = 0 : 5;
        }
        field(9; "Unit of Measure Code"; Code[10])
        {
            Caption = 'Unit of Measure Code';
            TableRelation = "Unit of Measure".Code;
        }
        field(10; Brand; Text[50])
        {
            Caption = 'Brand';
        }
        field(11; "Condition"; Text[50])
        {
            Caption = 'Condition';
        }
        field(12; Position; Text[50])
        {
            Caption = 'Position';
        }
        field(13; Location; Text[50])
        {
            Caption = 'Location';
        }
        field(14; Size; Text[50])
        {
            Caption = 'Size';
        }
        field(15; Type; Text[50])
        {
            Caption = 'Type';
        }
        field(16; Weight; Decimal)
        {
            Caption = 'Weight';
            DecimalPlaces = 0 : 5;
        }
        field(20; "Tire Section Width"; Text[20])
        {
            Caption = 'Tire Section Width';
        }
        field(21; "Tire Aspect Ratio"; Text[20])
        {
            Caption = 'Tire Aspect Ratio';
        }
        field(22; "Tire Rim Diameter"; Text[20])
        {
            Caption = 'Tire Rim Diameter';
        }
        field(23; "Tire Rim Width"; Text[20])
        {
            Caption = 'Tire Rim Width';
        }
        field(24; "Tire Overall Diameter"; Text[20])
        {
            Caption = 'Tire Overall Diameter';
        }
        field(25; "Tire Tread Depth"; Text[20])
        {
            Caption = 'Tire Tread Depth';
        }
        field(26; "Tire Tread Pattern"; Text[50])
        {
            Caption = 'Tire Tread Pattern';
        }
        field(30; "Track Width"; Text[20])
        {
            Caption = 'Track Width';
        }
        field(31; "Track Pitch Size"; Text[20])
        {
            Caption = 'Track Pitch Size';
        }
        field(32; "Track Guide Lugs"; Integer)
        {
            Caption = 'Track Guide Lugs';
        }
        field(40; "Wheel Rim Diameter"; Text[20])
        {
            Caption = 'Wheel Rim Diameter';
        }
        field(41; "Wheel Rim Width"; Text[20])
        {
            Caption = 'Wheel Rim Width';
        }
        field(42; "Wheel Bolt Pattern"; Text[20])
        {
            Caption = 'Wheel Bolt Pattern';
        }
        field(50; "Labor Code"; Code[20])
        {
            Caption = 'Labor Code';
        }
        field(51; "Labor Quantity"; Decimal)
        {
            Caption = 'Labor Quantity';
            DecimalPlaces = 0 : 5;
        }
        field(60; "Overall Condition"; Text[50])
        {
            Caption = 'Overall Condition';
        }
        field(61; "Recommended Action"; Text[100])
        {
            Caption = 'Recommended Action';
        }
        field(62; "Estimated Service Life"; Text[50])
        {
            Caption = 'Estimated Service Life';
        }
        field(70; "Line Notes"; Text[2048])
        {
            Caption = 'Line Notes';
        }
        field(80; "Custom Fields JSON"; Blob)
        {
            Caption = 'Custom Fields JSON';
            DataClassification = CustomerContent;
        }
        field(100; "Created Date"; DateTime)
        {
            Caption = 'Created Date';
            Editable = false;
        }
        field(101; "Created By"; Code[50])
        {
            Caption = 'Created By';
            Editable = false;
        }
        field(102; "Modified Date"; DateTime)
        {
            Caption = 'Modified Date';
            Editable = false;
        }
        field(103; "Modified By"; Code[50])
        {
            Caption = 'Modified By';
            Editable = false;
        }
    }

    keys
    {
        key(PK; "Inspection No.", "Line No.")
        {
            Clustered = true;
        }
        key(Item; "Item No.")
        {
        }
        key(PartNo; "Part No.")
        {
        }
    }

    trigger OnInsert()
    begin
        "Created Date" := CurrentDateTime();
        "Created By" := CopyStr(UserId(), 1, MaxStrLen("Created By"));
        "Modified Date" := "Created Date";
        "Modified By" := "Created By";
    end;

    trigger OnModify()
    begin
        "Modified Date" := CurrentDateTime();
        "Modified By" := CopyStr(UserId(), 1, MaxStrLen("Modified By"));
    end;

    procedure GetCustomFieldsJSON(): Text
    var
        InStream: InStream;
        JSONText: Text;
    begin
        CalcFields("Custom Fields JSON");
        "Custom Fields JSON".CreateInStream(InStream, TextEncoding::UTF8);
        InStream.ReadText(JSONText);
        exit(JSONText);
    end;

    procedure SetCustomFieldsJSON(JSONText: Text)
    var
        OutStream: OutStream;
    begin
        Clear("Custom Fields JSON");
        "Custom Fields JSON".CreateOutStream(OutStream, TextEncoding::UTF8);
        OutStream.WriteText(JSONText);
        Modify();
    end;
}

