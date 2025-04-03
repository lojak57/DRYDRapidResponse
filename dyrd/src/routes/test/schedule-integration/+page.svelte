<script lang="ts">
  import { onMount } from 'svelte';
  import { loadUsers } from '$lib/services/users';
  import { loadJobs } from '$lib/services/jobs';
  import { loadCustomers } from '$lib/services/customers';
  import { loadTrucks } from '$lib/services/truckService';
  import { loadScheduleEntries } from '$lib/services/scheduleService';
  import { JobStatus, JobType } from '$lib/types/Job';
  import type { Job } from '$lib/types/Job';
  import { Role } from '$lib/types/User';
  import { TASKS_BY_STATUS } from '$lib/config/workflowConfig';
  import TaskActionModal from '$lib/components/jobs/TaskActionModal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  
  // Task to test
  const scheduleTask = TASKS_BY_STATUS[JobStatus.NEW]?.find(t => t.id === 'schedule_technician');
  
  // Sample job data with proper typing
  let sampleJob: Job = {
    id: 'test-job-1',
    jobNumber: 'J-TEST001',
    title: 'Test Job for Scheduling',
    status: JobStatus.NEW,
    type: JobType.WATER,
    description: 'This is a test job for testing the technician scheduling workflow task',
    customerId: 'customer-1',
    location: {
      street: '123 Test St',
      city: 'Testville',
      state: 'CA',
      zip: '12345'
    },
    assignedUserIds: [],
    createdAt: new Date(),
    equipmentIds: [],
    priority: 3,
    scheduledStartDate: null,
    estimatedCompletionDate: null,
    completedDate: null
  };
  
  let isLoading = true;
  let errorMessage = '';
  let isModalOpen = false;
  
  onMount(async () => {
    try {
      isLoading = true;
      // Load all necessary data for scheduling
      await Promise.all([
        loadUsers(),
        loadJobs(),
        loadCustomers(),
        loadTrucks(),
        loadScheduleEntries()
      ]);
      errorMessage = '';
    } catch (error) {
      console.error('Error loading data:', error);
      errorMessage = 'Failed to load scheduling data. Please try again.';
    } finally {
      isLoading = false;
    }
  });
  
  function openTaskModal() {
    if (!scheduleTask) {
      errorMessage = 'Schedule task not found in workflow configuration';
      return;
    }
    
    isModalOpen = true;
  }
  
  function handleModalClose() {
    isModalOpen = false;
  }
  
  function handleTaskComplete(event: CustomEvent<{ taskId: string, data?: any }>) {
    console.log('Task completed:', event.detail);
    isModalOpen = false;
    
    // Update the sample job to reflect the changes (in a real app, this would be automatic)
    sampleJob = {
      ...sampleJob,
      status: JobStatus.SCHEDULED,
      scheduledStartDate: new Date()
    };
  }
</script>

<div class="container mx-auto p-6">
  <h1 class="text-2xl font-bold mb-4">Schedule Integration Test</h1>
  
  {#if errorMessage}
    <div class="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
      {errorMessage}
    </div>
  {/if}
  
  {#if isLoading}
    <div class="flex items-center justify-center h-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
      <div class="text-lg text-gray-500">Loading data...</div>
    </div>
  {:else}
    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Job Details</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p><span class="font-medium">Job Number:</span> {sampleJob.jobNumber}</p>
          <p><span class="font-medium">Title:</span> {sampleJob.title}</p>
          <p><span class="font-medium">Status:</span> {sampleJob.status}</p>
          <p><span class="font-medium">Description:</span> {sampleJob.description}</p>
        </div>
        <div>
          <p><span class="font-medium">Location:</span> {sampleJob.location.street}, {sampleJob.location.city}, {sampleJob.location.state}</p>
          <p><span class="font-medium">Priority:</span> {sampleJob.priority} / 5</p>
          <p><span class="font-medium">Created:</span> {sampleJob.createdAt.toLocaleDateString()}</p>
          {#if sampleJob.scheduledStartDate}
            <p><span class="font-medium">Scheduled Date:</span> {new Date(sampleJob.scheduledStartDate).toLocaleDateString()}</p>
          {/if}
        </div>
      </div>
    </div>
    
    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4">Workflow Tasks</h2>
      
      {#if scheduleTask}
        <div class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded mb-2">
          <div>
            <h3 class="font-medium">{scheduleTask.label}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">{scheduleTask.description || 'No description available'}</p>
          </div>
          <Button color="primary" on:click={openTaskModal} disabled={sampleJob.status !== JobStatus.NEW}>
            Complete Task
          </Button>
        </div>
      {:else}
        <p class="text-gray-600 dark:text-gray-400">Schedule task not found in workflow configuration</p>
      {/if}
      
      {#if sampleJob.status === JobStatus.SCHEDULED}
        <div class="mt-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded">
          <p class="font-medium">Job has been scheduled successfully!</p>
        </div>
      {/if}
    </div>
  {/if}
  
  {#if isModalOpen && scheduleTask}
    <TaskActionModal 
      isOpen={isModalOpen} 
      task={scheduleTask} 
      job={sampleJob} 
      on:close={handleModalClose}
      on:taskCompleted={handleTaskComplete}
    />
  {/if}
</div> 