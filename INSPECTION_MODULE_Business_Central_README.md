# CFI Inspection Module Documentation

## Overview

The CFI Inspection Module provides a comprehensive solution for managing various types of inspections in Business Central, designed specifically to support your Next.js inspection forms.

## Architecture

### Core Tables

#### CFI Inspection Type (50800)
- Defines different types of inspections (Used Tire, Used Track, Used Wheel, Assembly, Service Truck Checklist, Hardware)
- Configurable per inspection type (require SO/PO, auto-fill settings, default location)
- Support for custom number series per type

#### CFI Inspection Header (50801)
- Main inspection record with all header-level information
- Auto-fill functionality from Sales Orders
- Custom JSON field for extensible form fields
- Status tracking (Open, In Progress, Completed, Approved, Rejected, Cancelled)

#### CFI Inspection Line (50802)
- Detailed inspection items with specialized fields for different categories
- Tire-specific fields (section width, aspect ratio, tread depth, etc.)
- Track-specific fields (width, pitch size, guide lugs, etc.)
- Wheel-specific fields (rim diameter, bolt pattern, etc.)
- Custom JSON field for additional form fields

### API Endpoints

All inspection data is exposed via OData/REST APIs:

- **Inspection Types**: `/api/cfisolutions/cfi/v1.0/inspectionTypes`
- **Inspection Headers**: `/api/cfisolutions/cfi/v1.0/inspectionHeaders`
- **Inspection Lines**: `/api/cfisolutions/cfi/v1.0/inspectionLines`

### Pages

- **CFI Inspection Types** (50800): Manage inspection type configuration
- **CFI Inspection List** (50801): List view of all inspections
- **CFI Inspection Card** (50802): Main inspection document page
- **CFI Inspection Lines** (50803): Subpage for inspection line items
- **CFI Tire Details** (50804): Tire-specific detail page
- **CFI Track Details** (50805): Track-specific detail page
- **CFI Wheel Details** (50806): Wheel-specific detail page

## Integration with Next.js Forms

### Field Mapping

The module supports all fields identified in your inspection forms:

#### Standard Fields
- `dateTime` → Inspection Date + Inspection Time
- `inspectorName` → Inspector Name
- `soNo` → Sales Order No.
- `poNo` → Purchase Order No.
- `salesperson` → Salesperson Code (auto-filled from SO)

#### Item/Part Fields
- `partNo` → Part No.
- `itemNo` → Item No.
- `description` → Description
- `serialNo` → Serial No.
- `brand` → Brand
- `condition` → Condition

#### Tire-Specific Fields
- `sectionWidth` → Tire Section Width
- `aspectRatio` → Tire Aspect Ratio
- `rimDiameter` → Tire Rim Diameter
- `treadDepth` → Tire Tread Depth
- etc.

#### Track-Specific Fields
- `width` → Track Width
- `pitchSize` → Track Pitch Size
- `noOfGuideLugs` → Track Guide Lugs
- etc.

#### Wheel-Specific Fields
- `rimDiameter` → Wheel Rim Diameter
- `rimWidth` → Wheel Rim Width
- `boltPattern` → Wheel Bolt Pattern
- etc.

### Custom Fields Support

For fields not explicitly defined in the table structure, use the `customFieldsJSON` field in both header and line APIs. This allows for complete flexibility in form design.

Example JSON structure:
```json
{
  "weatherChecking": "Good",
  "delamination": "None",
  "treadChunking": "Minor",
  "beadDamage": "None",
  "cutsInTire": "None",
  "stubbleDamage": "None"
}
```

## API Usage Examples

### Create New Inspection

```http
POST /api/cfisolutions/cfi/v1.0/inspectionHeaders
Content-Type: application/json

{
  "inspectionType": "USED-TIRE",
  "inspectionDate": "2024-01-15",
  "inspectionTime": "14:30:00",
  "inspectorName": "John Smith",
  "salesOrderNo": "SO001234",
  "customFieldsJSON": "{\"weatherChecking\":\"Good\",\"delamination\":\"None\"}"
}
```

### Add Inspection Line

```http
POST /api/cfisolutions/cfi/v1.0/inspectionLines
Content-Type: application/json

{
  "inspectionNo": "INS00001",
  "itemNo": "TIRE-001",
  "partNo": "295/75R22.5",
  "quantity": 1,
  "condition": "Good",
  "tireSectionWidth": "295",
  "tireAspectRatio": "75",
  "tireRimDiameter": "22.5",
  "tireTreadDepth": "15/32",
  "overallCondition": "Acceptable",
  "customFieldsJSON": "{\"weatherChecking\":\"Good\",\"beadDamage\":\"None\"}"
}
```

### Get Inspections

```http
GET /api/cfisolutions/cfi/v1.0/inspectionHeaders?$expand=inspectionLines
```

## Extensibility

### Adding New Inspection Types

1. Add new enum value to `CFI Inspection Category` (50800)
2. Create new inspection type record via `CFI Inspection Types` page
3. Add specific detail page if needed (similar to Tire/Track/Wheel details)

### Adding New Fields

#### For Standard Fields
1. Add field to appropriate table (Header: 50801, Line: 50802)
2. Add field to corresponding API page
3. Update UI pages as needed

#### For Custom Fields
Use the `customFieldsJSON` field - no code changes required.

### Integration Points

#### Sales Order Integration
- Auto-fill customer and salesperson information
- Link inspections to sales orders for tracking

#### Item Integration
- Lookup to Item master for part information
- Auto-fill item description and brand

## Setup and Configuration

### Initial Setup

1. **Number Series**: The system automatically creates the 'INSPECT' number series
2. **Inspection Types**: Default inspection types are created during company initialization
3. **Permissions**: Grant 'CFI Permissions' permission set to users

### Configuring Inspection Types

1. Navigate to CFI Inspection Types page
2. Modify existing types or create new ones
3. Configure default location, SO/PO requirements, and auto-fill settings

## Best Practices

1. **Use Inspection Types**: Always assign appropriate inspection type for proper categorization
2. **Leverage Auto-fill**: Configure inspection types to auto-fill from Sales Orders when possible
3. **Custom Fields**: Use JSON custom fields for form-specific requirements rather than adding table fields
4. **Status Management**: Use status field to track inspection workflow
5. **Photo References**: Store photo file paths/URLs in the Photo References field

## Troubleshooting

### Common Issues

1. **API Access**: Ensure proper authentication and permission set assignment
2. **Custom JSON**: Validate JSON structure before sending to API
3. **Auto-fill Not Working**: Verify Sales Order exists and inspection type is configured correctly
4. **Number Series**: Check that 'INSPECT' number series is properly configured

### Support

For technical support or customization requests, contact CFI Solutions development team.