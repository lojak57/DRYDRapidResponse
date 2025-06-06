<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import type { Job } from '$lib/types/Job';
  import { JobStatus, type CompletionTasks } from '$lib/types/Job';
  import { getJobById, updateJobStatus, updateJobCompletionTask } from '$lib/services/jobs';
  import JobWorkflowIndicator from '$lib/components/jobs/JobWorkflowIndicator.svelte';
  import { getCustomerById } from '$lib/services/customers';
  import { getLogEntriesByJobId, addLogEntry } from '$lib/services/logEntries';
  import type { LogEntry } from '$lib/types/LogEntry';
  import { LogEntryType } from '$lib/types/LogEntry';
  import ActivityLogFeed from '$lib/components/field/ActivityLogFeed.svelte';
  import AddNoteForm from '$lib/components/field/AddNoteForm.svelte';
  import AddPhotoForm from '$lib/components/field/AddPhotoForm.svelte';
  import AddReadingForm from '$lib/components/field/AddReadingForm.svelte';
  import AddEquipmentLogForm from '$lib/components/field/AddEquipmentLogForm.svelte';
  import { currentUser } from '$lib/stores/authStore';
  import { calculateEquipmentUsage, calculateTotalCosts } from '$lib/utils/billingUtils';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import { allLogEntries } from '$lib/stores/logEntryStore';
  import { getLaborEntriesByJobId, addLaborEntries } from '$lib/services/laborEntries';
  import JobCompletionModal from '$lib/components/jobs/JobCompletionModal.svelte';
  import JobCompletionReport from '$lib/components/jobs/JobCompletionReport.svelte';
  import TechCompletionChecklist from '$lib/components/jobs/TechCompletionChecklist.svelte';
  import { getUserById } from '$lib/services/users';
  import { getFullName, Role } from '$lib/types/User';
  import type { BillingSummary } from '$lib/utils/billingUtils';
  
  const currentJob = writable<Job | null>(null);
  const isLoading = writable<boolean>(true);
  const error = writable<string | null>(null);
  const customerName = writable<string>('');
  
  // Add state to manage which form is visible
  let showForm: 'note' | 'photo' | 'reading' | 'equipment' | null = null;
  
  // Add state for filtering and view mode
  let selectedFilter: LogEntryType | 'ALL' = 'ALL';
  let viewMode: 'log' | 'gallery' = 'log';
  
  // Reactive statement to get the current Job ID from the URL
  $: currentJobId = $page.params.jobId;

  // Reactive statement to filter ALL log entries for the current job and sort them
  $: jobLogEntries = $allLogEntries
    .filter(entry => entry.jobId === currentJobId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort newest first

  // Reactive statement to apply the UI filter (NOTE, PHOTO, etc.) to the job's logs
  $: filteredLogEntries = jobLogEntries.filter(entry =>
    selectedFilter === 'ALL' || entry.type === selectedFilter
  );

  // State for tracking job completion
  let isCompletingJob = false;
  let completionError = '';
  
  // Equipment billing calculations
  $: equipmentUsage = ($currentJob && jobLogEntries.length > 0)
    ? calculateEquipmentUsage(jobLogEntries)
    : new Map();

  $: billingSummary = ($currentJob && equipmentUsage.size > 0)
    ? calculateTotalCosts(equipmentUsage)
    : { details: [], totalCost: 0 };
  
  // Add a store for labor entries
  const laborEntries = writable<any[]>([]);

  // Add state for completion modal
  let showCompletionModal = false;
  let techDetails: { id: string, name: string }[] = [];

  // Add a reactive declaration to check if all tasks are complete
  $: allTasksComplete = $currentJob?.completionTasks
    ? Object.values($currentJob.completionTasks).every(status => status === true)
    : false;

  // Function to load labor data for completed jobs
  async function loadLaborData(jobId: string) {
    if (!jobId) return;
    
    try {
      const entries = await getLaborEntriesByJobId(jobId);
      laborEntries.set(entries);
    } catch (err) {
      console.error('Error loading labor data:', err);
    }
  }

  // Handle form submission
  function handleFormSubmit(event: CustomEvent) {
    const logEntry = event.detail;
    
    // Hide the form after successful submission
    showForm = null;
    
    // If equipment was added or removed, refresh the job data to update equipment IDs
    if (logEntry.type === LogEntryType.EQUIPMENT_PLACEMENT || 
        logEntry.type === LogEntryType.EQUIPMENT_REMOVAL) {
      refreshJobData();
    }
    
    // Update completion tasks if relevant
    if ($currentJob && $currentJob.completionTasks) {
      if (logEntry.type === LogEntryType.MOISTURE_READING) {
        updateTaskStatus('finalReadingsLogged', true);
      } else if (logEntry.type === LogEntryType.PHOTO) {
        const photoData = logEntry.content;
        if (typeof photoData === 'object' && 
            'caption' in photoData && 
            typeof photoData.caption === 'string' && 
            photoData.caption.toLowerCase().includes('after')) {
          updateTaskStatus('afterPhotosTaken', true);
        }
      } else if (logEntry.type === LogEntryType.EQUIPMENT_REMOVAL) {
        // Check if this was the last piece of equipment
        if ($currentJob.equipmentIds && $currentJob.equipmentIds.length <= 1) {
          updateTaskStatus('allEquipmentRemoved', true);
        }
      }
    }
  }

  // Helper function to refresh job data
  async function refreshJobData() {
    if (!currentJobId) return;
    
    isLoading.set(true);
    
    try {
      const jobData = await getJobById(currentJobId);
      if (jobData) {
        currentJob.set(jobData);
      }
    } catch (err) {
      console.error('Error reloading job details:', err);
    } finally {
      isLoading.set(false);
    }
  }

  // Add a function to check if all completion tasks are complete
  function areAllTasksComplete(tasks?: CompletionTasks): boolean {
    if (!tasks) return false;
    return Object.values(tasks).every(value => value === true);
  }
  
  // Function to handle a task being clicked in the checklist
  async function handleTaskClicked(event: CustomEvent<{ key: keyof CompletionTasks, action: string }>) {
    if (!$currentJob) return;
    
    const { key, action } = event.detail;
    
    // Set the form to show based on the action
    showForm = action as any;
    
    // If the task is already complete, we can mark it as incomplete
    if ($currentJob.completionTasks && $currentJob.completionTasks[key]) {
      try {
        const updatedJob = await updateJobCompletionTask($currentJob.id, key, false);
        if (updatedJob) {
          currentJob.set(updatedJob);
        }
      } catch (err) {
        console.error('Error updating task:', err);
      }
    }
  }
  
  // Function to update a task as complete
  async function updateTaskStatus(taskKey: keyof CompletionTasks, value: boolean) {
    if (!$currentJob) return;
    
    try {
      const updatedJob = await updateJobCompletionTask($currentJob.id, taskKey, value);
      if (updatedJob) {
        currentJob.set(updatedJob);
      }
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  }
  
  // Update the task status based on log entries
  $: {
    if ($currentJob && jobLogEntries.length > 0) {
      // Check for readings to update finalReadingsLogged
      const hasRecentReadings = jobLogEntries.some(entry => 
        entry.type === LogEntryType.MOISTURE_READING && 
        new Date(entry.timestamp).getTime() > Date.now() - (24 * 60 * 60 * 1000) // Within last 24 hours
      );
      
      if (hasRecentReadings && $currentJob.completionTasks && !$currentJob.completionTasks.finalReadingsLogged) {
        updateTaskStatus('finalReadingsLogged', true);
      }
      
      // Check for photos to update afterPhotosTaken
      const hasRecentPhotos = jobLogEntries.some(entry => 
        entry.type === LogEntryType.PHOTO && 
        typeof entry.content === 'object' && 
        'caption' in entry.content &&
        typeof entry.content.caption === 'string' &&
        entry.content.caption.toLowerCase().includes('after') &&
        new Date(entry.timestamp).getTime() > Date.now() - (24 * 60 * 60 * 1000) // Within last 24 hours
      );
      
      if (hasRecentPhotos && $currentJob.completionTasks && !$currentJob.completionTasks.afterPhotosTaken) {
        updateTaskStatus('afterPhotosTaken', true);
      }
      
      // Check for equipment removals to update allEquipmentRemoved
      const hasEquipment = $currentJob.equipmentIds && $currentJob.equipmentIds.length > 0;
      const allEquipmentRemoved = !hasEquipment;
      
      if (allEquipmentRemoved && $currentJob.completionTasks && !$currentJob.completionTasks.allEquipmentRemoved) {
        updateTaskStatus('allEquipmentRemoved', true);
      }
    }
  }

  // Mark Ready for Completion function
  async function markReadyForCompletion() {
    if (!$currentJob || !allTasksComplete) return;
    
    try {
      // Update job status to PENDING_COMPLETION
      const updatedJob = await updateJobStatus($currentJob.id, JobStatus.PENDING_COMPLETION);
      if (updatedJob) {
        currentJob.set(updatedJob);
        
        // Add a log entry to record this action
        await addLogEntry({
          jobId: updatedJob.id,
          userId: $currentUser?.id || 'unknown',
          type: LogEntryType.NOTE,
          content: 'Technician marked job as ready for final completion.',
          timestamp: new Date()
        });
      }
    } catch (err) {
      console.error('Error marking job as ready for completion:', err);
    }
  }

  // Replace the old markJobComplete function with these new functions
  function openCompleteJobModal() {
    showCompletionModal = true;
  }

  function handleCancelCompletion() {
    showCompletionModal = false;
  }

  async function handleConfirmCompletion(laborData: any[]) {
    if (!$currentJob) return;
    
    isCompletingJob = true;
    completionError = '';
    
    try {
      // 1. Add Labor Entries
      if (laborData.length > 0) {
        const entriesToAdd = laborData.map(ld => {
          const tech = techDetails.find(t => t.id === ld.userId);
          return {
            jobId: $currentJob.id,
            userId: ld.userId,
            userName: tech ? tech.name : `Technician ${ld.userId}`,
            hours: ld.hours
          };
        });
        
        await addLaborEntries(entriesToAdd);
        
        // Update the local labor entries store
        const newEntries = await getLaborEntriesByJobId($currentJob.id);
        laborEntries.set(newEntries);
      }
      
      // 2. Update Job Status
      const updatedJob = await updateJobStatus($currentJob.id, JobStatus.COMPLETED);
      
      // 3. Update the local job store
      if (updatedJob) {
        currentJob.set(updatedJob);
      }
      
      // 4. Close the modal
      showCompletionModal = false;
    } catch (err) {
      console.error('Error completing job:', err);
      completionError = 'Failed to complete the job. Please try again.';
    } finally {
      isCompletingJob = false;
    }
  }

  onMount(async () => {
    isLoading.set(true);
    error.set(null);
    const jobId = $page.params.jobId;

    if (!jobId) {
      error.set('Job ID not found in URL.');
      isLoading.set(false);
      return;
    }

    try {
      const jobData = await getJobById(jobId);
      if (jobData) {
        currentJob.set(jobData);
        
        // Load customer info
        try {
          const customerData = await getCustomerById(jobData.customerId);
          if (customerData) {
            customerName.set(customerData.name);
          }
        } catch (customerErr) {
          console.error('Error loading customer details:', customerErr);
        }
      } else {
        error.set(`Job with ID ${jobId} not found.`);
      }
    } catch (err) {
      console.error('Error loading job details:', err);
      error.set('Failed to load job details.');
    } finally {
      isLoading.set(false);
    }

    // Load user details for assigned techs
    if ($currentJob?.assignedUserIds) {
      const promises = $currentJob.assignedUserIds.map(async (userId: string) => {
        const user = await getUserById(userId);
        return user ? { id: user.id, name: getFullName(user) } : null;
      });
      
      const results = await Promise.all(promises);
      techDetails = results.filter((tech): tech is { id: string, name: string } => tech !== null);
    }
    
    // Load labor data for completed jobs
    if ($currentJob?.status === JobStatus.COMPLETED) {
      loadLaborData($currentJob.id);
    }
  });
  
  // Format date for display
  function formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<div class="max-w-6xl mx-auto">
  {#if $currentJob}
    <PageHeader title={$currentJob.title} back="/dashboard">
      <div slot="actions">
        Job #{$currentJob.jobNumber}
      </div>
    </PageHeader>

    <!-- Main Job/Customer/Address Details Grid -->
    <div class="bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden">
      <div class="p-4 bg-dryd-gradient text-white">
        <div class="flex justify-between items-center">
          <div>
            <div class="inline-flex items-center px-3 py-1 rounded-full {
              $currentJob.status === JobStatus.NEW ? 'bg-blue-500' :
              $currentJob.status === JobStatus.SCHEDULED ? 'bg-purple-500' :
              $currentJob.status === JobStatus.IN_PROGRESS ? 'bg-amber-500' :
              $currentJob.status === JobStatus.PENDING_COMPLETION ? 'bg-blue-500' :
              $currentJob.status === JobStatus.ON_HOLD ? 'bg-red-500' :
              $currentJob.status === JobStatus.COMPLETED ? 'bg-green-500' :
              $currentJob.status === JobStatus.INVOICED ? 'bg-indigo-500' :
              $currentJob.status === JobStatus.PAID ? 'bg-teal-500' :
              'bg-gray-500'
            }">
              <span class="font-semibold text-xs text-white">{$currentJob.status}</span>
            </div>
          </div>
          <JobWorkflowIndicator status={$currentJob.status} compact={true} />
        </div>
      </div>

      <div class="p-6 bg-gray-50">
        <!-- Job Status Workflow -->
        <div class="mb-6">
          <JobWorkflowIndicator status={$currentJob.status} compact={false} />
        </div>
        
        <!-- Job Details -->
        <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <!-- Put job details, customer info, etc. here -->
        </div>

        <!-- Action Buttons & Activity Log Section -->
        {#if $currentJob.status !== JobStatus.COMPLETED}
          <div class="my-4 p-3 bg-gray-100 rounded shadow">
            <!-- Quick action buttons -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button 
                on:click={() => showForm = 'note'}
                class="flex flex-col items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:shadow active:bg-blue-100 active:shadow-inner active:transform active:scale-[0.98] transition-all duration-150"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span class="font-medium text-gray-700 hover:text-blue-700 transition-colors duration-150">Add Note</span>
              </button>
              
              <button 
                on:click={() => showForm = 'photo'}
                class="flex flex-col items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-purple-50 hover:border-purple-300 hover:shadow active:bg-purple-100 active:shadow-inner active:transform active:scale-[0.98] transition-all duration-150"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="font-medium text-gray-700 hover:text-purple-700 transition-colors duration-150">Add Photo</span>
              </button>
              
              <button 
                on:click={() => showForm = 'reading'}
                class="flex flex-col items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-indigo-50 hover:border-indigo-300 hover:shadow active:bg-indigo-100 active:shadow-inner active:transform active:scale-[0.98] transition-all duration-150"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span class="font-medium text-gray-700 hover:text-indigo-700 transition-colors duration-150">Add Reading</span>
              </button>
              
              <button
                on:click={() => showForm = 'equipment'}
                class="flex flex-col items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-green-50 hover:border-green-300 hover:shadow active:bg-green-100 active:shadow-inner active:transform active:scale-[0.98] transition-all duration-150"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="font-medium text-gray-700 hover:text-green-700 transition-colors duration-150">Equipment Log</span>
              </button>
            </div>
          </div>
        {/if}

        <!-- Conditionally Rendered Forms -->
        {#if showForm === 'note'}
          <div class="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <h3 class="text-lg font-semibold text-blue-800 mb-4">Add a Note</h3>
            <AddNoteForm 
              jobId={$currentJob?.id || ''} 
              userId={$currentUser?.id || 'tech-1'} 
              on:newLogEntry={handleFormSubmit}
            />
          </div>
        {:else if showForm === 'photo'}
          <div class="mb-6 p-4 bg-purple-50 border border-purple-100 rounded-lg">
            <h3 class="text-lg font-semibold text-purple-800 mb-4">Add a Photo</h3>
            <AddPhotoForm 
              jobId={$currentJob?.id || ''} 
              userId={$currentUser?.id || 'tech-1'} 
              on:newLogEntry={handleFormSubmit}
            />
          </div>
        {:else if showForm === 'reading'}
          <div class="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
            <h3 class="text-lg font-semibold text-indigo-800 mb-4">Add Moisture Reading</h3>
            <AddReadingForm 
              jobId={$currentJob?.id || ''} 
              userId={$currentUser?.id || 'tech-1'} 
              on:newLogEntry={handleFormSubmit}
            />
          </div>
        {:else if showForm === 'equipment'}
          <div class="mb-6 p-4 bg-green-50 border border-green-100 rounded-lg">
            <h3 class="text-lg font-semibold text-green-800 mb-4">Equipment Log</h3>
            <AddEquipmentLogForm 
              jobId={$currentJob?.id || ''} 
              userId={$currentUser?.id || 'tech-1'} 
              on:newLogEntry={handleFormSubmit}
            />
          </div>
        {/if}

        <!-- Container for Log OR Report -->
        <div class="mt-6">
          {#if $currentJob.status === JobStatus.COMPLETED}
            <!-- Render JobCompletionReport -->
            <JobCompletionReport
              job={$currentJob}
              logEntries={jobLogEntries}
              laborEntries={$laborEntries}
              billingSummary={billingSummary as any}
            />
          {:else}
            <!-- Render Activity Log Feed -->
            <div class="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div class="p-5 bg-gray-50 border-b border-gray-200">
                <h3 class="text-xl font-bold text-gray-800">Activity Log</h3>
              </div>
              
              <div class="p-5">
                <!-- Activity Log Feed -->
                <ActivityLogFeed 
                  logEntries={filteredLogEntries} 
                  isLoading={$isLoading} 
                />
              </div>
            </div>

            <!-- TECHNICIAN COMPLETION CHECKLIST AREA -->
            {#if $currentUser?.role === Role.TECH && $currentJob && $currentJob.status === JobStatus.IN_PROGRESS}
              <div class="mt-8 border-t pt-6">
                <TechCompletionChecklist 
                  tasks={$currentJob.completionTasks} 
                  jobId={$currentJob.id} 
                  on:taskClicked={handleTaskClicked}
                />

                <button
                  on:click={markReadyForCompletion}
                  disabled={!allTasksComplete}
                  class="mt-4 w-full font-bold py-2 px-4 rounded transition-all duration-150 ease-in-out"
                  class:bg-green-600={allTasksComplete}
                  class:hover:bg-green-700={allTasksComplete}
                  class:text-white={allTasksComplete}
                  class:bg-gray-300={!allTasksComplete}
                  class:text-gray-500={!allTasksComplete}
                  class:cursor-not-allowed={!allTasksComplete}
                >
                  {allTasksComplete ? 'Mark Ready for Completion' : 'Complete All Tasks Above'}
                </button>
              </div>
            {/if}
            <!-- END TECHNICIAN COMPLETION AREA -->
          {/if}
        </div>

        <!-- Office/Admin Only - Final Completion Button -->
        {#if $currentUser && ($currentUser.role === Role.ADMIN || $currentUser.role === Role.OFFICE) && $currentJob.status !== JobStatus.COMPLETED}
          <div class="mt-4">
            <button
              on:click={openCompleteJobModal}
              disabled={isCompletingJob}
              class="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md shadow-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
              {#if isCompletingJob}
                <span class="inline-flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              {:else}
                <span class="inline-flex items-center justify-center">
                  <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {$currentJob.status === JobStatus.PENDING_COMPLETION 
                    ? 'Finalize Job & Enter Labor' 
                    : 'Mark Job as Complete & Enter Labor'}
                </span>
              {/if}
            </button>
            {#if completionError}
              <p class="mt-2 text-red-600 text-sm text-center">{completionError}</p>
            {/if}
          </div>
        {/if}

        <!-- Completion Modal -->
        {#if showCompletionModal && $currentJob}
          <JobCompletionModal
            job={$currentJob}
            onComplete={handleConfirmCompletion}
            onCancel={handleCancelCompletion}
          />
        {/if}
      </div>
    </div>

  {:else if $isLoading}
    <div class="flex justify-center items-center h-64">
      <p class="text-gray-500">Loading job details...</p>
    </div>
  {:else if $error}
    <div class="bg-red-50 p-6 rounded-lg border border-red-200 mb-4">
      <p class="text-red-700">{$error}</p>
      <a href="/dashboard" class="text-blue-600 hover:text-blue-800 mt-4 inline-block">← Back to Dashboard</a>
    </div>
  {/if}
</div> 