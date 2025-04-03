<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Job } from '$lib/types/Job';
  import { JobStatus } from '$lib/types/Job';
  import type { User } from '$lib/types/User';
  import { Role } from '$lib/types/User';
  import { getTechnicians } from '$lib/services/users';
  import { loadTrucks } from '$lib/services/truckService';
  import { trucks as truckStore } from '$lib/stores/truckStore';
  import { get } from 'svelte/store';
  import type { Truck } from '$lib/types/Truck';
  import { createScheduleEntry } from '$lib/services/scheduleService';
  import type { CreateScheduleEntryInput } from '$lib/types/ScheduleEntry';
  import { updateJob } from '$lib/services/jobs';
  import { format } from 'date-fns';
  import Button from '$lib/components/ui/Button.svelte';
  
  export let job: Job;
  
  // Dispatcher for events
  const dispatch = createEventDispatcher<{
    complete: {
      scheduledStartDate: string;
      estimatedCompletionDate?: string;
      assignedUserIds: string[];
      scheduleEntry?: any;
      status: JobStatus;
      statusChanged: boolean;
    };
    cancel: void;
  }>();
  
  // Form state
  let scheduledStartDate = job.scheduledStartDate 
    ? new Date(job.scheduledStartDate).toISOString().split('T')[0] 
    : '';
  let estimatedCompletionDate = job.estimatedCompletionDate 
    ? new Date(job.estimatedCompletionDate).toISOString().split('T')[0] 
    : '';
  let selectedTechId = '';
  let selectedTruckId = '';
  let notes = '';
  let formError = '';
  let formSubmitting = false;
  
  // Data for select fields
  let technicians: User[] = [];
  let trucks: Truck[] = [];
  let loadingData = true;
  
  // Get technicians and trucks
  onMount(async () => {
    try {
      loadingData = true;
      
      // Load technicians
      technicians = await getTechnicians();
      
      // Load trucks from service then access the store
      await loadTrucks();
      trucks = get(truckStore);
      
      // Pre-select values if job already has assignments
      if (job.assignedUserIds && job.assignedUserIds.length > 0) {
        selectedTechId = job.assignedUserIds[0];
      }
      
      loadingData = false;
    } catch (error) {
      console.error('Error loading data:', error);
      formError = 'Failed to load technicians or trucks. Please try again.';
      loadingData = false;
    }
  });
  
  // Handle form submission
  async function handleSubmit() {
    try {
      formError = '';
      formSubmitting = true;
      
      // Validate required fields
      if (!scheduledStartDate) {
        formError = 'Please select a scheduled start date.';
        formSubmitting = false;
        return;
      }
      
      if (!selectedTechId) {
        formError = 'Please select a technician.';
        formSubmitting = false;
        return;
      }
      
      // Create data objects
      const scheduleData: CreateScheduleEntryInput = {
        jobId: job.id,
        userId: selectedTechId,
        truckId: selectedTruckId || undefined,
        date: scheduledStartDate,
        notes: notes || undefined,
        createdBy: 'admin-01' // Using a default admin ID
      };
      
      // First create the schedule entry
      const scheduleEntry = await createScheduleEntry(scheduleData);
      
      // Now update the job with new dates and assigned technician
      const updateData = {
        scheduledStartDate: new Date(scheduledStartDate),
        estimatedCompletionDate: estimatedCompletionDate ? new Date(estimatedCompletionDate) : undefined,
        assignedUserIds: [selectedTechId],
        status: JobStatus.SCHEDULED
      };
      
      // Update the job
      const updatedJob = await updateJob(job.id, updateData);
      
      // Dispatch the complete event
      dispatch('complete', {
        scheduledStartDate,
        estimatedCompletionDate: estimatedCompletionDate || undefined,
        assignedUserIds: [selectedTechId],
        scheduleEntry,
        status: JobStatus.SCHEDULED,
        statusChanged: true
      });
      
    } catch (error) {
      console.error('Error scheduling job:', error);
      formError = 'Failed to schedule job. Please try again.';
      formSubmitting = false;
    }
  }
  
  function handleCancel() {
    dispatch('cancel');
  }
</script>

<div class="space-y-4">
  {#if formError}
    <div class="bg-red-50 border border-red-300 p-3 rounded-md text-red-800">
      <h4 class="font-semibold">Error</h4>
      <p>{formError}</p>
    </div>
  {/if}
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <!-- Dates Section -->
    <div>
      <h3 class="text-sm font-medium text-gray-700 mb-3">Schedule Information</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Scheduled Start Date *
          </label>
          <input
            type="date"
            required
            bind:value={scheduledStartDate}
            min={format(new Date(), 'yyyy-MM-dd')}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Estimated Completion Date
          </label>
          <input
            type="date"
            bind:value={estimatedCompletionDate}
            min={scheduledStartDate || format(new Date(), 'yyyy-MM-dd')}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
    
    <!-- Assignment Section -->
    <div>
      <h3 class="text-sm font-medium text-gray-700 mb-3">Assignment</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Select Technician *
          </label>
          <select
            required
            disabled={loadingData}
            bind:value={selectedTechId}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a technician...</option>
            {#each technicians as tech}
              <option value={tech.id}>{tech.firstName} {tech.lastName}</option>
            {/each}
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Select Truck (Optional)
          </label>
          <select
            disabled={loadingData}
            bind:value={selectedTruckId}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a truck...</option>
            {#each trucks as truck}
              <option value={truck.id}>{truck.name || `Truck #${truck.id}`}</option>
            {/each}
          </select>
        </div>
      </div>
      <div class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Notes (Optional)
        </label>
        <textarea
          bind:value={notes}
          rows={3}
          placeholder="Add any notes about this schedule entry..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
      </div>
    </div>
    
    <div class="flex justify-end space-x-3 pt-4 border-t">
      <Button 
        type="button" 
        color="secondary" 
        on:click={handleCancel}
        disabled={formSubmitting}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        color="primary"
        disabled={formSubmitting || loadingData}
      >
        {formSubmitting ? 'Scheduling...' : 'Schedule Job'}
      </Button>
    </div>
  </form>
</div> 