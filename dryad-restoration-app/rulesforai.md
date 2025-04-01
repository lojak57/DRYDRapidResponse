# AI Coding Assistant Guidelines (RulesForAI.md)

Welcome, AI Assistant! This file outlines the key conventions and guidelines for contributing to the `dryad-restoration-app` project. Please adhere to these rules to ensure consistency, maintainability, and quality.

## 1. Core Technologies

*   **Framework:** SvelteKit
*   **Language:** TypeScript (Strict Mode)
*   **Styling:** Tailwind CSS with custom colors (`dryd-blue`, `dryd-burgundy`, `dryd-gradient`)
*   **State Management:** Svelte Stores with derived stores for filtered data
*   **Build/Dev:** Vite
*   **Mock Data:** JSON-based service layer mocking a real API

## 2. Project Structure (`src/lib/`)

*   **`assets/`**: Static assets (images, fonts, etc.).
*   **`components/`**: Reusable Svelte components.
    *   **`common/`**: Shared UI elements like `Logo`, `RoleSwitcher`.
    *   **`field/`**: Field tech components like `ActivityLogFeed`, `AddNoteForm`, `AddReadingForm`, `AddPhotoForm`, `AddEquipmentLogForm`.
    *   **`jobs/`**: Job management components like `JobCard`, `JobList`, `MultiStepJobForm`, `JobCompletionModal`.
    *   **`ui/`**: Basic UI elements like `PageHeader`.
    *   **`layout/`**: Navigation and layout components like `Nav`.
    *   **`jobs/steps/`**: Multi-step form components for job creation process including `JobInfoStep`, `SiteInfoStep`, `SchedulingStep`, `InsuranceStep`, `ReviewStep`.
*   **`config/`**: Static configuration data (e.g., `equipmentRates.ts` for daily rates).
*   **`mock/`**: Static JSON files containing mock data:
    *   `customers.json`: Customer records with contact information
    *   `equipment.json`: Restoration equipment inventory
    *   `jobs.json`: Job records with their details and status
    *   `laborEntries.json`: Labor tracking entries
    *   `logEntries.json`: Activity log entries (notes, readings, photos, equipment logs)
    *   `users.json`: User accounts with roles (ADMIN, OFFICE, TECH)
*   **`services/`**: API simulation functions:
    *   `customers.ts`: Customer data operations
    *   `equipment.ts`: Equipment inventory management
    *   `jobs.ts`: Job CRUD operations including status updates
    *   `laborEntries.ts`: Labor tracking functions
    *   `logEntries.ts`: Functions for adding activity logs
    *   `users.ts`: User authentication and management
*   **`stores/`**: Svelte stores:
    *   `authStore.ts`: Authentication state and user info
    *   `customerStore.ts`: Customer data and filtering
    *   `jobStore.ts`: Job data with role-based filtering and dashboard views
    *   `laborStore.ts`: Labor entries management
    *   `logEntryStore.ts`: Activity log entries management
    *   `userStore.ts`: User management
*   **`types/`**: TypeScript interfaces and types:
    *   `Customer.ts`: Customer data structure with Address type
    *   `Equipment.ts`: Equipment inventory types
    *   `Job.ts`: Job data with status enum and related types
    *   `LaborEntry.ts`: Labor tracking records
    *   `LogEntry.ts`: Activity log types including notes, readings, photos
    *   `User.ts`: User profiles with role enum
*   **`utils/`**: Utility functions:
    *   `billingUtils.ts`: Billing calculations for jobs and equipment
    *   `dateUtils.ts`: Date formatting and manipulation
    *   `formatters.ts`: Display formatting helpers

## 3. Current Application Features

### 3.1 Authentication & User Roles

The app currently has a `RoleSwitcher` component to simulate different user roles:

* **ADMIN**: Full access to all features
* **OFFICE**: Can manage jobs, create jobs, and complete jobs
* **TECH**: Field technicians with access to their assigned jobs only

### 3.2 Dashboard & Job Management

* **Dashboard**: Role-specific view showing statistics and jobs
  * Technicians see only their assigned jobs
  * Office/Admin users see active jobs filtered by status
* **Job Creation**: Multi-step form process with validation
  * Structured input with dropdowns and templates for complete data
  * Job Info step: Collects basic information with structured description fields
  * Site Info step: Address and access information
  * Scheduling step: Start and completion dates
  * Insurance step: Insurance claim details 
  * Review step: Summary before submission

### 3.3 Job Details & Activity Logging

* **Job Detail Page**: Comprehensive view with access to activity logs
* **Activity Logging**: Multiple specialized forms
  * **Notes**: Categorized with templates (Status Update, Customer Contact, Issue, Resolution, etc.)
  * **Moisture Readings**: Structured form with material selection, reference ranges, and assessment
  * **Photos**: Image upload with captions
  * **Equipment**: Placement and removal logging

### 3.4 Job Completion

* **Job Completion Flow**: Office/Admin users can mark jobs as complete
* **Completion Report**: Summary of all activity, labor, and equipment usage
* **Billing Summary**: Calculation of equipment costs based on duration

## 4. Application Patterns & Conventions

### 4.1 TypeScript Usage

*   **Strict Typing:** Use TypeScript with proper type definitions
*   **Type Definitions:** Found in `src/lib/types/` directory
*   **Index Signatures:** Use `{ [key: string]: Type }` for objects with dynamic keys
*   **Union Types:** Use for values with multiple possible types
*   **Type Extension:** Extend existing types when needed with `&` operator

```typescript
// Example from AddReadingForm.svelte
const moistureData: MoistureReadingData & { assessmentLevel?: MoistureLevel } = {
  location: fullLocation,
  material: fullMaterial,
  value: readingValue,
  assessmentLevel: moistureLevel !== 'unknown' ? moistureLevel : undefined
};
```

### 4.2 State Management

*   **Role-Based Filtering:** Filter data based on current user role

```typescript
// Example from jobStore.ts
export const dashboardJobs = derived(
  [jobs, currentUser],
  ([$jobs, $currentUser]) => {
    if (!$currentUser) return [];
    
    let result = [...$jobs];
    
    // Role-specific filtering
    if ($currentUser.role === Role.TECH) {
      // Technicians see only jobs assigned to them
      result = result.filter(job => 
        job.assignedUserIds?.includes($currentUser.id)
      );
    } else {
      // Office/Admin users see non-completed jobs
      result = result.filter(job => 
        job.status !== JobStatus.COMPLETED && 
        job.status !== JobStatus.CANCELLED
      );
    }
    
    // Sort by creation date descending
    result.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return result;
  }
);
```

### 4.3 Form Design Patterns

*   **Structured Data Entry:** Use dropdowns, categorized options, and templates
*   **Validation:** Client-side validation with error messages
*   **Template-Based Input:** For consistent data entry
*   **Custom Reference Data:** Material-specific ranges, categorized templates

```svelte
<!-- Example from AddNoteForm.svelte -->
<div>
  <label for="note-category" class="block text-sm font-medium text-gray-700 mb-1">Note Type</label>
  <select
    id="note-category"
    bind:value={noteCategory}
    on:change={handleCategoryChange}
    class="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-transparent"
    disabled={isSubmitting}
  >
    <option value="">-- Select Note Type --</option>
    {#each noteCategories as category}
      <option value={category.value}>{category.label}</option>
    {/each}
  </select>
</div>
```

### 4.4 Event Handling

*   **Event Dispatching:** Use `createEventDispatcher` for communication between components
*   **Form Submission:** Handle with standardized patterns, including loading states

```typescript
// Example pattern for form submission
async function handleSubmit() {
  if (!validateForm()) return;
  
  isSubmitting = true;
  errorMessage = '';
  
  try {
    const result = await serviceFunction(formData);
    dispatch('event:nameOfEvent', result);
    resetForm();
  } catch (err) {
    console.error('Error:', err);
    errorMessage = 'Error message to display';
  } finally {
    isSubmitting = false;
  }
}
```

### 4.5 UI Styling Patterns

*   **Color Coding:** Use consistent colors for different log/form types
    * Blue for notes
    * Purple for photos
    * Indigo/Yellow for readings
    * Green for equipment
*   **Card-Based Layout:** Consistent card styling for all major components
*   **Responsive Grid:** Mobile-first design with responsive breakpoints
*   **Status Indicators:** Color-coded indicators for job status

## 5. Current Development Status

*   **Job Creation Flow:** Complete with multi-step form
*   **Dashboard:** Role-aware job listing with statistics
*   **Activity Logging:** Enhanced with structured input forms
    * Notes with categorization and templates
    * Moisture readings with material reference data
    * Equipment logs
    * Photo uploads
*   **Job Detail View:** Comprehensive with activity log access
*   **Job Completion:** Functional with billing summary

## 6. Code Styling & Linting

*   **Tailwind Classes:** Group related classes (positioning, colors, spacing)
*   **Component Structure:** Script section first, then markup
*   **Button States:** Include disabled, hover, focus, and active states
*   **Form Validation:** Client-side validation with error messages
*   **Loading States:** Show loading indicators during async operations

## 7. Best Practices When Extending

*   **Follow Existing Patterns:** Match the style and structure of existing components
*   **Role-Based Access:** Ensure features respect user roles
*   **State Management:** Leverage existing stores; add derived stores as needed
*   **Form Components:** Maintain consistency with existing form styles and validation
*   **Error Handling:** Include proper error handling for all async operations
*   **Mobile Responsiveness:** Ensure all new UIs work well on both desktop and mobile
*   **Component Modularity:** Create focused components and compose them together
*   **Documentation:** Add relevant JSDoc comments for complex functions

## 8. Current Limitations & TODOs

*   **Mock Data:** The app uses mock data instead of real API endpoints
*   **Image Handling:** Photo uploads are simulated (URLs in mock data)
*   **Offline Support:** Not yet implemented
*   **Testing:** Test coverage is not yet comprehensive

## 9. Recent Updates & Learnings

### 9.1 Enhanced Role Switching

The app now includes an improved user switcher functionality:
* **User Selection Dropdown:** Replaced simple role buttons with a full user selection dropdown
* **User Grouping:** Users are organized by role type (Admin, Office, Tech)
* **Complete User Testing:** Allows testing the full job workflow by switching between specific users

### 9.2 Quote Creation Enhancements

* **Emergency Labor Rate:** Added an "Emergency Response" labor rate of $175/hr for after-hours service calls
* **Labor Rate Organization:** Rates are displayed in descending price order for better visibility of premium options

### 9.3 Styling Considerations

* **Button Text Contrast:** Some buttons may have contrast issues with white text on light backgrounds
* **Button Component:** The `Button.svelte` component in `src/lib/components/ui/Button.svelte` should be used whenever possible for consistent styling
* **CSS Classes:** When using custom buttons or links styled as buttons, ensure proper text contrast with appropriate classes:
  * Dark backgrounds should include `text-white`
  * Light backgrounds should include `text-gray-700` or `text-gray-800`
* **Tailwind Configuration:** Custom colors are defined in `tailwind.config.js` and include:
  * `dryd-blue` (light: #61C3E2, DEFAULT: #2980B9, dark: #264F8E)
  * `dryd-burgundy` (light: #9A3667, DEFAULT: #8A2755, dark: #751D44)

### 9.4 Areas for Enhancement

* **Technician Assignment:** Need to add functionality for office/admin staff to assign technicians to jobs from the job details page
* **Role-Based UI:** Continue ensuring UI elements are appropriately visible/hidden based on user role

## Golden Rule

Think about maintainability and readability for the future human developers (including your future self!). Keep code clean, well-structured, and appropriately typed. Follow the established patterns in the codebase to maintain consistency.

---

Thank you for helping build the Dryad Restoration app! 