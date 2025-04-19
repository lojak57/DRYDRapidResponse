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
  let generationProgress = 0;
  
  // Included document types
  let includedDocs = {
    claimNarrative: true,
    signedAuth: true,
    moistureReadings: true,
    beforePhotos: true,
    afterPhotos: true,
    equipmentList: true,
    costBreakdown: true
  };
  
  // Simulate package generation
  async function generatePackage() {
    if (!validateRequirements()) return;
    
    isGenerating = true;
    error = '';
    generationProgress = 0;
    
    try {
      // Simulate processing steps
      const steps = [
        'Gathering documents',
        'Processing readings data',
        'Compiling photos',
        'Generating cost sheets',
        'Building final package',
        'Compressing files'
      ];
      
      for (let i = 0; i < steps.length; i++) {
        // Update progress
        generationProgress = Math.round((i / (steps.length - 1)) * 100);
        
        // Wait to simulate processing time
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      // Final progress
      generationProgress = 100;
      
      // Create package URL
      const packageUrl = `/api/storage/insurance/package_${job.id}_${Date.now()}.zip`;
      
      // Update job with package URL
      const updatedJob = await updateJob(job.id, { insurancePackageUrl: packageUrl });
      
      if (updatedJob) {
        // Short delay to show 100% progress
        await new Promise(resolve => setTimeout(resolve, 500));
        dispatch('complete', updatedJob);
      } else {
        throw new Error('Failed to update job');
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Package generation failed';
    } finally {
      isGenerating = false;
    }
  }
  
  // Validate requirements before generating package
  function validateRequirements() {
    // Check for required documents
    if (includedDocs.signedAuth && !job.signedAuthUrl) {
      error = 'Signed authorization document is required but not uploaded';
      return false;
    }
    
    if (includedDocs.claimNarrative && !job.claimNarrative) {
      error = 'Claim narrative is required but not generated';
      return false;
    }
    
    return true;
  }
  
  function handleCancel() {
    dispatch('cancel');
  }
</script>

<div class="p-6 bg-white rounded-lg shadow-md border border-gray-200">
  <h2 class="text-xl font-semibold text-gray-800 mb-4 flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-dryd-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
    Build Insurance Package
  </h2>
  
  <div class="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
    <div class="flex items-start">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-sm text-blue-700">
        Create a comprehensive package of all job-related documents for insurance submission. 
        Select which documents to include in the package.
      </p>
    </div>
  </div>
  
  {#if job.insurancePackageUrl}
    <div class="mb-6">
      <h3 class="text-md font-medium text-gray-700 mb-2">Current Package</h3>
      <div class="p-4 border border-gray-200 rounded-md bg-gray-50 flex items-center justify-between">
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <span class="text-gray-700">Insurance Package.zip</span>
        </div>
        <a 
          href={job.insurancePackageUrl} 
          target="_blank" 
          class="text-sm text-dryd-blue hover:text-dryd-blue-dark flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Package
        </a>
      </div>
    </div>
  {/if}
  
  <div class="mb-6">
    <h3 class="text-md font-medium text-gray-700 mb-2">Include in Package</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div class="flex items-center">
        <input 
          type="checkbox" 
          id="include-auth"
          bind:checked={includedDocs.signedAuth}
          class="h-4 w-4 text-dryd-blue focus:ring-dryd-blue border-gray-300 rounded"
          disabled={disabled || isGenerating}
        >
        <label for="include-auth" class="ml-2 text-sm text-gray-700">
          Signed Authorization
          {#if !job.signedAuthUrl}
            <span class="text-amber-500 text-xs ml-1">(not uploaded)</span>
          {/if}
        </label>
      </div>
      
      <div class="flex items-center">
        <input 
          type="checkbox" 
          id="include-narrative"
          bind:checked={includedDocs.claimNarrative}
          class="h-4 w-4 text-dryd-blue focus:ring-dryd-blue border-gray-300 rounded"
          disabled={disabled || isGenerating}
        >
        <label for="include-narrative" class="ml-2 text-sm text-gray-700">
          Claim Narrative
          {#if !job.claimNarrative}
            <span class="text-amber-500 text-xs ml-1">(not generated)</span>
          {/if}
        </label>
      </div>
      
      <div class="flex items-center">
        <input 
          type="checkbox" 
          id="include-readings"
          bind:checked={includedDocs.moistureReadings}
          class="h-4 w-4 text-dryd-blue focus:ring-dryd-blue border-gray-300 rounded"
          disabled={disabled || isGenerating}
        >
        <label for="include-readings" class="ml-2 text-sm text-gray-700">Moisture Readings</label>
      </div>
      
      <div class="flex items-center">
        <input 
          type="checkbox" 
          id="include-before"
          bind:checked={includedDocs.beforePhotos}
          class="h-4 w-4 text-dryd-blue focus:ring-dryd-blue border-gray-300 rounded"
          disabled={disabled || isGenerating}
        >
        <label for="include-before" class="ml-2 text-sm text-gray-700">Before Photos</label>
      </div>
      
      <div class="flex items-center">
        <input 
          type="checkbox" 
          id="include-after"
          bind:checked={includedDocs.afterPhotos}
          class="h-4 w-4 text-dryd-blue focus:ring-dryd-blue border-gray-300 rounded"
          disabled={disabled || isGenerating}
        >
        <label for="include-after" class="ml-2 text-sm text-gray-700">After Photos</label>
      </div>
      
      <div class="flex items-center">
        <input 
          type="checkbox" 
          id="include-equipment"
          bind:checked={includedDocs.equipmentList}
          class="h-4 w-4 text-dryd-blue focus:ring-dryd-blue border-gray-300 rounded"
          disabled={disabled || isGenerating}
        >
        <label for="include-equipment" class="ml-2 text-sm text-gray-700">Equipment List</label>
      </div>
      
      <div class="flex items-center">
        <input 
          type="checkbox" 
          id="include-costs"
          bind:checked={includedDocs.costBreakdown}
          class="h-4 w-4 text-dryd-blue focus:ring-dryd-blue border-gray-300 rounded"
          disabled={disabled || isGenerating}
        >
        <label for="include-costs" class="ml-2 text-sm text-gray-700">Cost Breakdown</label>
      </div>
    </div>
  </div>
  
  {#if isGenerating}
    <div class="mb-6">
      <h3 class="text-md font-medium text-gray-700 mb-2">Generating Package</h3>
      <div class="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div 
          class="bg-dryd-blue h-2.5 rounded-full transition-all duration-300" 
          style="width: {generationProgress}%"
        ></div>
      </div>
      <p class="text-sm text-gray-600">
        {#if generationProgress < 20}
          Gathering documents...
        {:else if generationProgress < 40}
          Processing data files...
        {:else if generationProgress < 60}
          Compiling photos...
        {:else if generationProgress < 80}
          Generating cost sheets...
        {:else if generationProgress < 100}
          Building final package...
        {:else}
          Package complete!
        {/if}
      </p>
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
      disabled={disabled || isGenerating}
    >
      Cancel
    </button>
    
    <button
      type="button"
      on:click={generatePackage}
      class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-dryd-blue hover:bg-dryd-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dryd-blue disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={disabled || isGenerating}
    >
      {#if isGenerating}
        <span class="flex items-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating...
        </span>
      {:else if job.insurancePackageUrl}
        Regenerate Package
      {:else}
        Generate Package
      {/if}
    </button>
    
    {#if job.insurancePackageUrl}
      <button
        type="button"
        on:click={() => dispatch('complete', job)}
        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled || isGenerating}
      >
        Complete
      </button>
    {/if}
  </div>
</div>
