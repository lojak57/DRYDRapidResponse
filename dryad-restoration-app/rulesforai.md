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

## 5. Workflow Architecture & Data Flow

### 5.1 Core Workflow System Architecture

The DRYD Restoration application implements a comprehensive workflow-driven architecture centered around job management with a clear separation of concerns:

#### 5.1.1 Workflow Layer Hierarchy

1. **Presentation Layer**: UI Components
   - Job cards, forms, modals, and interactive elements
   - Task-specific components that interact with workflow-defined tasks

2. **Workflow Logic Layer**: 
   - `workflowConfig.ts`: Defines all possible tasks, transitions, and requirements
   - `JobWorkflowStepper.svelte`: Displays and manages workflow tasks
   - `TaskActionModal.svelte`: Orchestrates task-specific actions and forms

3. **State Management Layer**:
   - Store modules with custom interfaces for workflow state
   - Derived stores that filter and transform data for specific workflows

4. **Service Layer**:
   - Task-specific service functions that update job states
   - Generic CRUD operations that maintain data integrity

5. **Data Persistence Layer**:
   - Mock data with strict typing (future: real API endpoints)
   - Data transformation utilities for converting between API and application formats

### 5.2 Job Workflow System

#### 5.2.1 Core Workflow Definition

The job workflow system is built around a state machine pattern defined in `workflowConfig.ts`:

```typescript
// Simplified example of the workflow configuration
export const jobWorkflow = {
  steps: [
    {
      id: "job_created",
      label: "Job Created",
      tasks: [
        {
          id: "schedule_job",
          label: "Schedule Job",
          required: true,
          requiredRoles: [Role.ADMIN, Role.OFFICE],
          completeAction: (job) => ({
            ...job,
            status: JobStatus.SCHEDULED
          })
        },
        {
          id: "assign_techs",
          label: "Assign Technicians",
          required: true,
          requiredRoles: [Role.ADMIN, Role.OFFICE]
        }
      ]
    },
    {
      id: "job_scheduled",
      label: "Job Scheduled",
      tasks: [
        {
          id: "confirm_dispatch",
          label: "Confirm Technician Dispatch",
          required: true,
          requiredRoles: [Role.ADMIN, Role.OFFICE],
          completeAction: (job) => ({
            ...job,
            status: JobStatus.IN_PROGRESS
          })
        }
      ]
    },
    // Additional workflow steps...
  ]
};
```

#### 5.2.2 Data Flow Through Workflow Stages

The workflow system processes jobs through distinct stages with well-defined data transformations:

1. **Job Creation**
   - `MultiStepJobForm.svelte` collects data through multiple specialized steps
   - Validation occurs at each step with type checking
   - On submission, `createJob()` service function generates a new job with `JobStatus.NEW`
   - Job is added to the `jobStore` which triggers derived store updates
   - UI displays the new job with pending initial tasks

2. **Job Progression**
   - `JobWorkflowStepper.svelte` examines the job's status to determine available tasks
   - User clicks on a task, triggering `TaskActionModal.svelte` with the task's ID
   - Task-specific forms collect data (e.g., `AssignTechnicianForm.svelte`)
   - On submission, service function updates job status and metadata
   - Task is marked as complete in `completionTasks` object
   - An activity log entry is created recording the action
   - UI automatically updates to show next available tasks

3. **Job Finalization**
   - When all required tasks are complete, job can be finalized
   - `JobFinalizeForm.svelte` collects cost information and line items
   - Data is processed through the service layer and stored on the job object
   - Job status is updated to `JobStatus.COMPLETED`
   - Invoice data is generated from the job object with costs and line items

4. **Invoice Creation**
   - Invoice data flows from completed job object
   - `InvoicePreview.svelte` pulls data directly from job properties
   - Status updated to `JobStatus.INVOICED` on approval

### 5.3 Component Interaction & Data Exchange

#### 5.3.1 Key Data Interfaces

```
[User Interface] <-> [Svelte Stores] <-> [Service Layer] <-> [Mock Data]
```

This architecture ensures:
- Components only access data through stores
- Services handle all data mutation logic
- Stores maintain application state
- Mock data layer simulates API persistence

#### 5.3.2 Data Flow Sequence

1. **Component Initialization**
   - Component mounts and subscribes to relevant stores
   - `onMount()` lifecycle hook triggers data loading if needed
   - Service functions fetch data and populate stores
   - Component reactively renders based on store values

2. **User Action Processing**
   - User interacts with component (e.g., submits form)
   - Component dispatches event or calls service directly
   - Service function processes data, updates mock data
   - Service updates store with new data
   - All subscribed components reactive update

3. **Cross-Component Communication**
   - Components communicate via stores (primary method)
   - Parent-child communication uses props and events
   - Complex workflows use the TaskActionModal as orchestrator

#### 5.3.3 Store Update Patterns

The application follows specific patterns for store updates that maintain data integrity:

```typescript
// Example pattern from jobs.ts service
export async function updateJob(jobId: string, updateData: Partial<Job>): Promise<Job | null> {
  // 1. Find the job in store data
  const jobsData = get(_jobs);
  const jobIndex = jobsData.findIndex(j => j.id === jobId);
  
  if (jobIndex === -1) return null;
  
  // 2. Create updated job object with type safety
  const updatedJob: Job = {
    ...jobsData[jobIndex],
    ...updateData
  };
  
  // 3. Update mock data (simulates API)
  const mockIndex = mockJobs.findIndex(j => j.id === jobId);
  if (mockIndex !== -1) {
    mockJobs[mockIndex] = { ...mockJobs[mockIndex], ...updateData };
  }
  
  // 4. Update the store atomically
  _jobs.update(currentJobs => {
    const newJobs = [...currentJobs];
    newJobs[jobIndex] = updatedJob;
    return newJobs;
  });
  
  // 5. Return updated entity for further processing
  return JSON.parse(JSON.stringify(updatedJob));
}
```

### 5.4 Detailed Component Interactions

#### 5.4.1 Task Completion Flow

The TaskActionModal handles task completion with a consistent pattern:

1. User selects a task from JobWorkflowStepper
2. TaskActionModal loads with task-specific form
3. User completes form and submits
4. `handleTaskSubmit()` processes form data
5. Data flows to appropriate service function
6. Job status and properties are updated
7. Activity log entry is created
8. UI refreshes to show completed task and next steps

```
JobWorkflowStepper -> TaskActionModal -> TaskSpecificForm -> 
Service Function -> Store Update -> LogEntry Creation -> UI Update
```

#### 5.4.2 Job Finalization Data Flow

The job finalization flow demonstrates complex data movement:

1. **Finalize Job Task**
   - JobWorkflowStepper shows "Finalize Job" task when prior tasks complete
   - TaskActionModal loads JobFinalizeForm component
   - Form presents costs and line item collection interface
   - Quote data is loaded if job originated from quote

2. **Cost Data Collection**
   - User enters labor, materials, equipment costs
   - User adds custom line items
   - Form calculates totals and validates entries

3. **Job Update & Invoice Preparation**
   - On submission, job object is updated with:
     - laborCost, materialsCost, equipmentCost properties
     - lineItems array with custom items
     - finalNotes for additional documentation
   - Job status is updated to COMPLETED
   - createInvoice task becomes available

4. **Invoice Generation**
   - Invoice preview displays data directly from job object
   - Cost calculations use job properties and line items
   - On approval, status updates to INVOICED

This pattern ensures that all financial data is properly stored in the job object for consistency and future reporting.

### 5.5 Integration Architecture for Future Modules

#### 5.5.1 Data Analysis Workflow Integration

The current architecture provides clear integration points for data analysis:

1. **Job Data Extraction**
   - Job entities contain all data needed for analysis
   - Consistent status transitions provide reliable filtering
   - TypeScript ensures data structure consistency

2. **Analysis Module Interface**
   - Future analysis modules should subscribe to job store
   - Derived stores can filter jobs for analysis-specific views
   - Service functions can be extended for analysis operations

3. **Implementation Pattern**
   ```typescript
   // Example pattern for analysis integration
   export const jobAnalysisData = derived(
     [jobs, laborEntries, logEntries],
     ([$jobs, $laborEntries, $logEntries]) => {
       // Transform and correlate job data for analysis
       return $jobs.map(job => {
         // Job-specific labor entries
         const jobLabor = $laborEntries.filter(entry => entry.jobId === job.id);
         // Job-specific activity logs
         const jobLogs = $logEntries.filter(entry => entry.jobId === job.id);
         
         // Calculate metrics
         return {
           jobId: job.id,
           jobNumber: job.jobNumber,
           duration: calculateJobDuration(job),
           laborHours: calculateTotalLaborHours(jobLabor),
           laborCost: job.laborCost || 0,
           materialsCost: job.materialsCost || 0,
           equipmentCost: job.equipmentCost || 0,
           totalCost: calculateTotalCost(job),
           profit: calculateProfit(job),
           activityBreakdown: analyzeActivityLogs(jobLogs)
         };
       });
     }
   );
   ```

#### 5.5.2 Asset Tracking Integration

The application is designed to extend to asset tracking:

1. **Equipment-Job Relationship**
   - Jobs record equipment IDs in `equipmentIds` array
   - Equipment logs track placement/removal dates
   - This data foundation supports asset tracking

2. **Integration Points**
   - Add equipmentStore derived values for availability
   - Extend equipment service for maintenance tracking
   - Create asset-specific components like maintenance schedules

3. **Implementation Pattern**
   ```typescript
   // Example pattern for equipment availability
   export const availableEquipment = derived(
     [equipment, jobs],
     ([$equipment, $jobs]) => {
       // Find all currently deployed equipment
       const deployedEquipmentIds = $jobs
         .filter(job => job.status === JobStatus.IN_PROGRESS)
         .flatMap(job => job.equipmentIds || []);
       
       // Return equipment not currently deployed
       return $equipment.filter(item => 
         !deployedEquipmentIds.includes(item.id)
       );
     }
   );
   ```

#### 5.5.3 Inventory Management Integration

Inventory management extends naturally from the existing architecture:

1. **Materials Tracking**
   - `materialsCost` already tracks cost summary
   - Extend to track specific materials used
   - Create inventory reduction when materials added to job

2. **Integration Implementation**
   ```typescript
   // Add material usage tracking to job line items
   interface MaterialLineItem extends CustomLineItem {
     inventoryId: string;
     quantityUnit: string;
     inventoryReduction: boolean;
   }
   
   // Inventory service function pattern
   export async function reduceInventory(
     inventoryId: string, 
     quantity: number
   ): Promise<Inventory | null> {
     // Find inventory item
     const inventoryData = get(_inventory);
     const itemIndex = inventoryData.findIndex(i => i.id === inventoryId);
     
     if (itemIndex === -1) return null;
     
     // Create updated inventory with reduced quantity
     const updatedItem = {
       ...inventoryData[itemIndex],
       quantity: inventoryData[itemIndex].quantity - quantity
     };
     
     // Update store
     _inventory.update(items => {
       const newItems = [...items];
       newItems[itemIndex] = updatedItem;
       return newItems;
     });
     
     return updatedItem;
   }
   ```

#### 5.5.4 Employee Management Integration

The application already incorporates the foundations for employee management:

1. **Current Infrastructure**
   - User entities with roles
   - Labor entries tied to users
   - Task assignments based on user IDs

2. **Expansion Approach**
   - Add specific user detail tracking (certifications, skills)
   - Create timesheet view based on labor entries
   - Implement schedule visualization from job assignments

3. **Implementation Pattern**
   ```typescript
   // Example pattern for employee schedule derived store
   export const technicianSchedule = derived(
     [jobs, users],
     ([$jobs, $users]) => {
       // Create schedule data for each technician
       return $users
         .filter(user => user.role === Role.TECH)
         .map(tech => {
           // Find all jobs assigned to this technician
           const assignedJobs = $jobs.filter(job => 
             job.assignedUserIds?.includes(tech.id) &&
             job.status !== JobStatus.COMPLETED &&
             job.status !== JobStatus.CANCELLED
           );
           
           // Group by date for calendar view
           const scheduleByDate = groupJobsByDate(assignedJobs);
           
           return {
             technicianId: tech.id,
             name: `${tech.firstName} ${tech.lastName}`,
             schedule: scheduleByDate
           };
         });
     }
   );
   ```

### 5.6 Critical Data Flow Points

#### 5.6.1 Store Structure & Update Mechanisms

The application uses a specific store architecture to ensure data consistency:

1. **Internal Writable Stores**
   - Private `_jobs` writable store holds raw data
   - Exported public `jobs` readable store for components
   - Derived stores for filtered views

2. **Accessing vs. Updating Data**
   ```typescript
   // Internal writable store (for services)
   const _jobs = writable<Job[]>([]);
   
   // Public readable store (for components)
   export const jobs = readable(_jobs);
   
   // Service function pattern for updates
   export function updateJobStatus(jobId: string, status: JobStatus) {
     _jobs.update(currentJobs => {
       // Find and update job
       return currentJobs.map(job => 
         job.id === jobId ? { ...job, status } : job
       );
     });
   }
   ```

#### 5.6.2 Component Lifecycle & Data Loading

Components follow a consistent pattern for data loading and lifecycle management:

```typescript
// Component initialization pattern
onMount(async () => {
  isLoading = true;
  
  try {
    // 1. Load primary data
    if (!get(jobs).length) {
      await loadJobs();
    }
    
    // 2. Load related data
    await loadCustomers();
    
    // 3. Begin component-specific operations
    if (jobId) {
      await loadJobDetails(jobId);
    }
    
    isLoading = false;
  } catch (err) {
    console.error('Error loading data:', err);
    errorMessage = 'Failed to load necessary data';
    isLoading = false;
  }
});
```

#### 5.6.3 Multi-Component Data Sharing

For complex screens with multiple components, data sharing follows these patterns:

1. **Parent Component State Management**
   - Parent components load and distribute data to children
   - Children report changes through events
   - Parent updates shared state and pushes changes to services

2. **Store-Based Coordination**
   - Components independently subscribe to stores
   - Service actions update stores
   - Components react to store changes

## 6. Future Module Integration Guidelines

### 6.1 Module Development Principles

When building additional modules that integrate with the workflow system:

1. **Store Integration**
   - Create module-specific stores (e.g., `inventoryStore.ts`)
   - Design read-only public interfaces with internal writables
   - Create derived stores for cross-module relationships

2. **Service Layer Consistency**
   - Follow established CRUD operation patterns
   - Use store update patterns shown in section 5.3.3
   - Ensure proper error handling and asynchronous management

3. **Component Patterns**
   - Create module-specific components in appropriate directories
   - Follow established component lifecycle patterns
   - Maintain consistent styling and UX patterns

### 6.2 Data Consistency Requirements

To ensure seamless integration of new modules:

1. **TypeScript Enforcement**
   - Define comprehensive types for all module entities
   - Use strict typing for all functions and components
   - Extend existing types when adding related functionality

2. **Entity Relationships**
   - Use consistent ID references between entities
   - Document relationships in type definitions
   - Create derived stores for relationship queries

3. **Service Function Structure**
   ```typescript
   // Template for new module service functions
   export async function createEntity(data: CreateEntityInput): Promise<Entity> {
     // Validate input
     validateEntityData(data);
     
     // Create entity with unique ID
     const newEntity: Entity = {
       id: generateId(),
       createdAt: new Date().toISOString(),
       ...data
     };
     
     // Update mock data (future: API call)
     mockEntities.push(newEntity);
     
     // Update store
     _entities.update(current => [...current, newEntity]);
     
     // Return created entity
     return newEntity;
   }
   ```

### 6.3 Workflow Integration Requirements

When adding new workflows or extending existing ones:

1. **Define Workflow Configuration**
   - Create structured workflow definition
   - Define tasks, roles, and status transitions
   - Document workflow steps and requirements

2. **Create Task-Specific Components**
   - Build forms for task data collection
   - Implement validation and error handling
   - Follow established submission patterns

3. **Update Service Layer**
   - Add service functions for workflow transitions
   - Ensure proper updating of related entities
   - Create activity logging for workflow steps

### 6.4 Testing & Verification Guidelines

For testing new module integrations:

1. **Component Testing**
   - Verify component initialization and data loading
   - Test user interactions and form submissions
   - Check error handling and loading states

2. **Data Flow Testing**
   - Validate store updates and subscriptions
   - Verify cross-module data relationships
   - Test derived store calculations

3. **Workflow Function Testing**
   - Validate task completion and status transitions
   - Test role-based access restrictions
   - Verify workflow completion and outcomes

## 7. Code Styling & Linting

*   **Tailwind Classes:** Group related classes (positioning, colors, spacing)
*   **Component Structure:** Script section first, then markup
*   **Button States:** Include disabled, hover, focus, and active states
*   **Form Validation:** Client-side validation with error messages
*   **Loading States:** Show loading indicators during async operations

## 8. Best Practices When Extending

*   **Follow Existing Patterns:** Match the style and structure of existing components
*   **Role-Based Access:** Ensure features respect user roles
*   **State Management:** Leverage existing stores; add derived stores as needed
*   **Form Components:** Maintain consistency with existing form styles and validation
*   **Error Handling:** Include proper error handling for all async operations
*   **Mobile Responsiveness:** Ensure all new UIs work well on both desktop and mobile
*   **Component Modularity:** Create focused components and compose them together
*   **Documentation:** Add relevant JSDoc comments for complex functions

## 9. Current Limitations & TODOs

*   **Mock Data:** The app uses mock data instead of real API endpoints
*   **Image Handling:** Photo uploads are simulated (URLs in mock data)

## Golden Rule

Think about maintainability and readability for the future human developers (including your future self!). Keep code clean, well-structured, and appropriately typed. Follow the established patterns in the codebase to maintain consistency.

---

Thank you for helping build the Dryad Restoration app! 