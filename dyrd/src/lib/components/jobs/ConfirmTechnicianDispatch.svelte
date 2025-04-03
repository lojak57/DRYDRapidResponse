<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { JobStatus } from '$lib/types/Job';
  import type { Job } from '$lib/types/Job';
  import { getUserById } from '$lib/services/users';
  import type { User } from '$lib/types/User';
  import { writable } from 'svelte/store';
  
  export let job: Job;
  
  const dispatch = createEventDispatcher();
  const technicians = writable<User[]>([]);
  
  let confirmed = false;
  let notes = '';
  let error = '';
  let loading = false;
  let loadingTechs = false;
  
  // Load technician data
  onMount(async () => {
    if (job.assignedUserIds && job.assignedUserIds.length > 0) {
      loadingTechs = true;
      try {
        const techData = [];
        for (const techId of job.assignedUserIds) {
          const techInfo = await getUserById(techId);
          if (techInfo) {
            techData.push(techInfo);
          }
        }
        technicians.set(techData);
      } catch (err) {
        console.error('Error loading technician data:', err);
      } finally {
        loadingTechs = false;
      }
    }
  });
  
  function handleSubmit() {
    if (!confirmed) {
      error = 'Please confirm that technicians have been dispatched.';
      return;
    }
    
    loading = true;
    
    // Prepare data to send back to parent
    const data = {
      dispatchConfirmed: confirmed,
      notes: notes || 'Technician dispatch confirmed',
      timestamp: new Date(),
      statusChange: {
        from: job.status,
        to: JobStatus.IN_PROGRESS
      }
    };
    
    // Dispatch the completed event with the form data
    dispatch('submit', data);
  }
  
  function handleCancel() {
    dispatch('cancel');
  }
</script>

<div class="p-4" in:fade={{ duration: 200 }}>
  <div class="mb-5">
    <p class="text-gray-600 mb-4">
      Confirm that technicians have been dispatched to the job site. This will update the job status to "In Progress".
    </p>
    
    {#if job.assignedUserIds && job.assignedUserIds.length > 0}
      <div class="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
        <h3 class="font-medium text-blue-800 mb-2">Assigned Technicians</h3>
        {#if loadingTechs}
          <p class="text-blue-700">Loading technician details...</p>
        {:else if $technicians.length > 0}
          <ul class="list-disc pl-5 text-blue-700">
            {#each $technicians as tech}
              <li>{tech.firstName} {tech.lastName}</li>
            {/each}
          </ul>
        {:else}
          <ul class="list-disc pl-5 text-blue-700">
            {#each job.assignedUserIds as techId}
              <li>{techId}</li>
            {/each}
          </ul>
        {/if}
      </div>
    {:else}
      <div class="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
        <p class="text-amber-700">
          <strong>Warning:</strong> No technicians are currently assigned to this job.
        </p>
      </div>
    {/if}
    
    <div class="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
      <h3 class="font-medium text-gray-800 mb-2">Job Details</h3>
      <p class="text-gray-700">
        <strong>Job Number:</strong> {job.jobNumber || 'N/A'}
      </p>
      <p class="text-gray-700">
        <strong>Scheduled Start:</strong> {job.scheduledStartDate ? new Date(job.scheduledStartDate).toLocaleDateString() : 'Not scheduled'}
      </p>
      <p class="text-gray-700">
        <strong>Description:</strong> {job.description || 'No description provided'}
      </p>
    </div>
  </div>
  
  <div class="mb-4">
    <label class="flex items-center cursor-pointer p-3 bg-white border rounded-md hover:bg-gray-50 transition-colors">
      <input 
        type="checkbox" 
        bind:checked={confirmed} 
        class="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300"
      />
      <span class="ml-2 text-gray-800 font-medium">
        I confirm that technicians have been dispatched to the job site
      </span>
    </label>
    {#if error}
      <p class="mt-1 text-sm text-red-600">{error}</p>
    {/if}
  </div>
  
  <div class="mb-4">
    <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
    <textarea
      id="notes"
      bind:value={notes}
      rows="3"
      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      placeholder="Add any additional notes about the dispatch..."
    ></textarea>
  </div>
  
  <div class="flex justify-end space-x-3 mt-6">
    <button
      type="button"
      class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      on:click={handleCancel}
      disabled={loading}
    >
      Cancel
    </button>
    <button
      type="button"
      class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      on:click={handleSubmit}
      disabled={loading}
    >
      {#if loading}
        <span class="flex items-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      {:else}
        Confirm Dispatch
      {/if}
    </button>
  </div>
</div> 