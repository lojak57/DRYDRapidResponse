<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { updateJob } from '$lib/services/jobs';
  import type { Job } from '$lib/types/Job';
  
  // Props
  export let job: Job;
  export let disabled: boolean = false;
  
  const dispatch = createEventDispatcher<{
    complete: Job;
    cancel: void;
  }>();
  
  let isGenerating = false;
  let error = '';
  let success = false;
  
  // Keep track of edits to narrative
  let narrativeText = job.claimNarrative || '';
  let isEditing = false;
  
  // Simulate narrative generation
  async function generateNarrative() {
    isGenerating = true;
    error = '';
    success = false;
    
    try {
      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Create a template narrative
      const narrative = `INSURANCE CLAIM NARRATIVE

Claim #: ${job.insuranceInfo?.claimNumber || 'PENDING'}
Date of Loss: ${job.incidentDate ? new Date(job.incidentDate).toLocaleDateString() : 'Unknown'}
Type of Loss: ${job.jobType}

PROPERTY DETAILS:
Location: ${job.siteAddress.street}, ${job.siteAddress.city}, ${job.siteAddress.state} ${job.siteAddress.zip}

LOSS DESCRIPTION:
${job.description}

SCOPE OF WORK:
Dryad Restoration was engaged to perform emergency restoration services at the above property.
Technicians arrived on site on ${job.scheduledStartDate ? new Date(job.scheduledStartDate).toLocaleDateString() : '[Date]'} and
performed the following services:

1. Comprehensive moisture detection and documentation
2. Strategic placement of drying equipment
3. Daily monitoring of moisture levels
4. Professional removal and disposal of unsalvageable materials
5. Complete structural drying to industry standards

The property has been restored to a pre-loss condition with respect to moisture levels. All
affected areas have been properly dried and sanitized according to IICRC S500 guidelines.

This narrative was automatically generated on ${new Date().toLocaleDateString()} by Dryad Restoration's
system based on documented job activities.`;
      
      narrativeText = narrative;
      success = true;
      
    } catch (err) {
      error = err instanceof Error ? err.message : 'Generation failed';
    } finally {
      isGenerating = false;
    }
  }
  
  // Save the edited narrative
  async function saveNarrative() {
    isGenerating = true;
    error = '';
    
    try {
      const updatedJob = await updateJob(job.id, { claimNarrative: narrativeText });
      
      if (updatedJob) {
        dispatch('complete', updatedJob);
      } else {
        throw new Error('Failed to update job');
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to save narrative';
    } finally {
      isGenerating = false;
    }
  }
  
  function handleCancel() {
    dispatch('cancel');
  }
</script>

<div class="p-6 bg-white rounded-lg shadow-md border border-gray-200">
  <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-dryd-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    Generate Claim Narrative
  </h2>
  
  <div class="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
    <div class="flex items-start">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-sm text-blue-700">
        Generate a professional claim narrative automatically using job information. You can edit the narrative before finalizing.
      </p>
    </div>
  </div>
  
  {#if !narrativeText}
    <div class="bg-gray-50 p-6 rounded-md border border-gray-200 text-center mb-6">
      <p class="text-gray-600 mb-4">No narrative has been generated yet. Click the button below to auto-generate one.</p>
      <button
        type="button"
        on:click={generateNarrative}
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-dryd-blue hover:bg-dryd-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dryd-blue disabled:opacity-50"
        disabled={isGenerating || disabled}
      >
        {#if isGenerating}
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating...
        {:else}
          Auto-Generate Narrative
        {/if}
      </button>
    </div>
  {:else}
    <div class="mb-6">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-md font-medium text-gray-700">Claim Narrative</h3>
        <button
          type="button"
          on:click={() => isEditing = !isEditing}
          class="text-sm text-dryd-blue hover:text-dryd-blue-dark flex items-center"
          disabled={isGenerating || disabled}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          {isEditing ? 'Done Editing' : 'Edit'}
        </button>
      </div>
      
      {#if isEditing}
        <textarea
          bind:value={narrativeText}
          rows="20"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dryd-blue focus:border-dryd-blue font-mono text-sm"
          disabled={isGenerating || disabled}
        ></textarea>
      {:else}
        <div class="p-4 border border-gray-200 rounded-md bg-gray-50 whitespace-pre-line font-mono text-sm h-96 overflow-y-auto">
          {narrativeText}
        </div>
      {/if}
    </div>
  {/if}
  
  {#if success}
    <div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
      Narrative successfully generated! You can now edit it or continue.
    </div>
  {/if}
  
  {#if error}
    <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
      {error}
    </div>
  {/if}
  
  <div class="flex justify-end space-x-3 mt-6">
    <button
      type="button"
      on:click={handleCancel}
      class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dryd-blue"
      disabled={isGenerating || disabled}
    >
      Cancel
    </button>
    
    {#if narrativeText}
      <button
        type="button"
        on:click={saveNarrative}
        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isGenerating || disabled}
      >
        {#if isGenerating}
          <span class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </span>
        {:else}
          Save & Continue
        {/if}
      </button>
    {/if}
  </div>
</div>
