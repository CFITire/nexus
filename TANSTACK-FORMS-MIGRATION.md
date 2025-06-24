# TanStack Form Migration Guide

This guide documents the migration from manual React form state management to TanStack Form with comprehensive validation, auto-save, and better UX.

## ✅ Migration Status

### **Completed**
- ✅ **TanStack Form Setup**: Installed `@tanstack/react-form` and `@tanstack/zod-form-adapter`
- ✅ **Form Helper Hooks**: Created reusable hooks in `/hooks/use-form-helpers.ts`
- ✅ **Inspection Forms**: Updated assembly form as example in `/app/inspections/assembly-form/page.tsx`
- ✅ **Vault Forms**: Created TanStack version in `/components/add-password-dialog-tanstack.tsx`
- ✅ **CRM Forms**: Created contact form in `/components/contact-form-tanstack.tsx`
- ✅ **Reusable Components**: Created form field components in `/components/form-field.tsx`
- ✅ **User Management**: Created user form example in `/components/user-form-tanstack.tsx`
- ✅ **Zod Validation**: Comprehensive validation schemas with custom rules
- ✅ **Auto-save**: Automatic draft saving for inspection forms

### **Remaining Forms to Migrate**
- ✅ **Other 13 Inspection Forms**: All inspection forms migrated to TanStack Form
- ✅ **Edit Password Dialog**: Created `/components/edit-password-dialog-tanstack.tsx`
- ✅ **Folder Dialog**: Created `/components/folder-dialog-tanstack.tsx`
- 🔄 **Share Dialogs**: Update sharing forms
- 🔄 **Settings Forms**: Update RBAC settings and other config forms

## 🚀 Key Benefits Achieved

### **Enhanced Validation**
- **Type-safe schemas** with Zod integration
- **Real-time validation** with field-level feedback  
- **Custom validation rules** for business logic
- **Cross-field validation** support

### **Better User Experience**
- **Auto-save functionality** for long forms (inspections)
- **Loading states** and submission feedback
- **Error recovery** with clear error messages
- **Form state persistence** between page refreshes

### **Developer Experience**
- **Reduced boilerplate** with reusable hooks
- **Consistent patterns** across all forms
- **Type safety** throughout form handling
- **Easy testing** with predictable form state

## 📋 Migration Pattern

### **Before (Manual State Management)**
```typescript
// Old pattern - manual state management
const [formData, setFormData] = useState<Record<string, string>>({})
const [errors, setErrors] = useState<Record<string, string>>({})
const [loading, setLoading] = useState(false)

const handleInputChange = (fieldId: string, value: string) => {
  setFormData(prev => ({ ...prev, [fieldId]: value }))
}

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  // Manual validation
  // Manual API calls
  // Manual error handling
}
```

### **After (TanStack Form)**
```typescript
// New pattern - TanStack Form with hooks
import { useInspectionForm } from '@/hooks/use-form-helpers'

const { form, isSubmitting, submitError, isAutoSaving } = useInspectionForm(
  fields, 
  'inspection-type',
  {
    enableAutoSave: true,
    autoSaveInterval: 30000,
    onSubmitSuccess: (data) => console.log('Success!'),
    onSubmitError: (error) => console.error('Error:', error)
  }
)

// Automatic validation, submission, error handling, auto-save
```

## 🛠️ Form Types and Examples

### **1. Inspection Forms**
**File**: `/components/tanstack-form-template.tsx`
**Features**: Auto-save, Business Central integration, field dependencies
```typescript
<TanStackFormTemplate
  title="Assembly Inspection"
  description="Complete inspection documentation"
  fields={fields}
  inspectionType="assembly-form"
  enableAutoSave={true}
  autoSaveInterval={30000}
/>
```

### **2. Vault Password Forms**
**File**: `/components/add-password-dialog-tanstack.tsx`
**Features**: Password generation, category management, security validation
```typescript
<AddPasswordDialogTanStack
  open={open}
  onOpenChange={setOpen}
  folders={folders}
  selectedFolderId={folderId}
/>
```

### **3. CRM Contact Forms**
**File**: `/components/contact-form-tanstack.tsx` 
**Features**: Address validation, email validation, optimistic updates
```typescript
<ContactFormTanStack
  initialData={contact}
  mode="edit"
  onSuccess={handleSuccess}
  onCancel={handleCancel}
/>
```

### **4. User Management Forms**
**File**: `/components/user-form-tanstack.tsx`
**Features**: Group selection, role management, status controls
```typescript
<UserFormTanStack
  initialData={user}
  mode="create"
  onSuccess={handleUserCreated}
/>
```

## 🔧 Reusable Components

### **Form Field Components**
**File**: `/components/form-field.tsx`
```typescript
import { TextField, SelectField, CheckboxField, FormSection, FormActions } from './form-field'

// Instead of manual Input components
<TextField
  label="First Name"
  required
  value={value}
  onChange={onChange}
  error={error}
  isTouched={isTouched}
/>
```

### **Form Helper Hooks**
**File**: `/hooks/use-form-helpers.ts`
```typescript
// Specialized hooks for different form types
const inspectionForm = useInspectionForm(fields, type, options)
const passwordForm = usePasswordForm(initialValues, onSubmit)
const contactForm = useContactForm(initialValues, onSubmit)
const folderForm = useFolderForm(initialValues, onSubmit)
```

## 📊 Validation Schemas

### **Inspection Form Validation**
```typescript
const assemblySchema = z.object({
  dateTime: z.string().min(1, 'Inspection date is required'),
  inspector: z.string().min(1, 'Inspector name is required'),
  partNo: z.string().min(1, 'Part number is required'),
  quantity: z.string()
    .min(1, "Quantity is required")
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, 
      "Quantity must be a positive number"),
  // ... other fields
})
```

### **Password Form Validation**
```typescript
const passwordSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain uppercase, lowercase, and number'),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  // ... other fields
})
```

### **Contact Form Validation**
```typescript
const contactSchema = z.object({
  firstname: z.string().min(1, 'First name is required').max(50, 'Name too long'),
  lastname: z.string().min(1, 'Last name is required').max(50, 'Name too long'),
  emailaddress1: z.string().email('Must be a valid email').optional().or(z.literal('')),
  telephone1: z.string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Must be a valid phone number')
    .optional().or(z.literal('')),
  // ... other fields
})
```

## 🔄 Auto-save Implementation

### **How Auto-save Works**
1. **Enabled by default** for inspection forms
2. **Saves every 30 seconds** when form is touched
3. **Uses TanStack Query mutations** for persistence
4. **Visual feedback** with save indicators
5. **Error handling** for failed auto-saves

### **Auto-save Configuration**
```typescript
const { form, isAutoSaving, autoSaveError } = useInspectionForm(fields, type, {
  enableAutoSave: true,
  autoSaveInterval: 30000, // 30 seconds
})

// Auto-save status in UI
{isAutoSaving ? (
  <div className="flex items-center gap-2">
    <Loader2 className="h-4 w-4 animate-spin" />
    Saving draft...
  </div>
) : (
  <div className="flex items-center gap-2">
    <CheckCircle2 className="h-4 w-4 text-green-500" />
    Draft saved
  </div>
)}
```

## 🎯 Next Steps

### **1. ✅ Complete Remaining Inspections** 
**COMPLETED**: All 14 inspection forms have been migrated to TanStack Form:
- ✅ assembly-form, dixon-work-order, used-centers-form, midroller
- ✅ service-truck-checklist, used-hardware-form, weight-bracket-wheel-weights
- ✅ used-tire-form, 2-inch-spacer, used-wheel-form, used-track-form
- ✅ hub-extension-fwd-extension, forklift-tire, frame-extension

### **2. ✅ Update Core Vault Forms**
**COMPLETED**: Created TanStack versions of main vault dialogs:
- ✅ `/components/add-password-dialog-tanstack.tsx`
- ✅ `/components/edit-password-dialog-tanstack.tsx`
- ✅ `/components/folder-dialog-tanstack.tsx`

### **3. Remaining Vault Sharing Forms**
Replace existing dialogs with TanStack versions:
```bash
# Update these files:
/components/share-password-dialog.tsx
/components/share-folder-dialog.tsx
```

### **3. Enhance Validation**
Add business-specific validation rules:
- Part number format validation
- Cross-field dependencies (SO → Salesperson)
- File upload validation
- Custom business rules

### **4. Add More Features**
- **Conditional fields** based on form values
- **Multi-step forms** for complex workflows
- **Form templates** for common inspection types
- **Bulk operations** for multiple records

## 🧪 Testing Forms

### **Form State Testing**
```typescript
// Test form validation
expect(form.getFieldInfo('email').meta.errors).toContain('Must be a valid email')

// Test form submission
await form.handleSubmit()
expect(onSubmit).toHaveBeenCalledWith(expectedData)

// Test auto-save
jest.advanceTimersByTime(30000)
expect(saveDraftMutation).toHaveBeenCalled()
```

### **Integration Testing**
- Test form submission with real APIs
- Test auto-save persistence across page refreshes
- Test error recovery and retry logic
- Test accessibility and keyboard navigation

## 📚 Resources

- [TanStack Form Documentation](https://tanstack.com/form/latest)
- [Zod Validation Library](https://zod.dev/)
- [Form Accessibility Guidelines](https://www.w3.org/WAI/tutorials/forms/)
- [React Hook Form Migration Guide](https://react-hook-form.com/migrate-v6-to-v7)

---

**Migration Status**: ✅ **Largely Complete**  
**Completion**: **90%** (All major forms migrated to TanStack Form)  
**Next**: Migrate remaining share dialogs and settings forms