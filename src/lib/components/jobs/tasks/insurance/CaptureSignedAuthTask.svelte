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
  
  let isUploading = false;
  let error = '';
  let uploadProgress = 0;
  
  // Simulate upload file process
  async function handleUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    
    const file = input.files[0];
    isUploading = true;
    error = '';
    
    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        uploadProgress = i;
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Simulate server response with signed document URL
      const signedAuthUrl = `/uploads/signed_auth_${job.id}_${Date.now()}.pdf`;
      const updatedJob = await updateJob(job.id, { signedAuthUrl });
      
      if (updatedJob) {
        dispatch('complete', updatedJob);
      } else {
        throw new Error('Failed to update job');
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Upload failed';
    } finally {
      isUploading = false;
      uploadProgress = 0;
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
    Capture Signed Work Authorization
  </h2>
  
  <div class="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
    <div class="flex items-start">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-sm text-blue-700">
        Upload the customer-signed work authorization document for insurance purposes. 
        This document is required by most insurance carriers before work begins.
      </p>
    </div>
  </div>
  
  {#if job.signedAuthUrl}
    <div class="mb-6">
      <h3 class="text-md font-medium text-gray-700 mb-2">Current Document</h3>
      <div class="p-4 border border-gray-200 rounded-md bg-gray-50 flex items-center justify-between">
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span class="text-gray-700">Signed Authorization.pdf</span>
        </div>
        <a 
          href={job.signedAuthUrl} 
          target="_blank" 
          class="text-sm text-dryd-blue hover:text-dryd-blue-dark flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View Document
        </a>
      </div>
    </div>
  {/if}
  
  <div class="mb-6">
    <label for="auth-document" class="block text-sm font-medium text-gray-700 mb-2">
      {job.signedAuthUrl ? 'Replace Document' : 'Upload Document'}
    </label>
    <input
      type="file"
      id="auth-document"
      accept=".pdf,.jpg,.jpeg,.png"
      on:change={handleUpload}
      class="block w-full text-sm text-gray-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-md file:border-0
        file:text-sm file:font-medium
        file:bg-dryd-blue file:text-white
        hover:file:bg-dryd-blue-dark
        file:cursor-pointer
      "
      disabled={disabled || isUploading}
    />
    <p class="mt-1 text-sm text-gray-500">
      PDF, JPG, or PNG files only. Max size: 10MB.
    </p>
  </div>
  
  {#if isUploading}
    <div class="mb-6">
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          class="bg-dryd-blue h-2.5 rounded-full transition-all duration-300" 
          style="width: {uploadProgress}%"
        ></div>
      </div>
      <p class="mt-2 text-sm text-gray-600 text-center">
        Uploading... {uploadProgress}%
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
      disabled={disabled || isUploading}
    >
      Cancel
    </button>
    
    {#if job.signedAuthUrl}
      <button
        type="button"
        on:click={() => dispatch('complete', job)}
        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled || isUploading}
      >
        Confirm & Continue
      </button>
    {/if}
  </div>
</div>
