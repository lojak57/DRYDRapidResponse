<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Job } from '$lib/types/Job';
  import CaptureSignedAuthTask from './tasks/insurance/CaptureSignedAuthTask.svelte';
  import GenerateNarrativeTask from './tasks/insurance/GenerateNarrativeTask.svelte';
  import PackageInsuranceDocsTask from './tasks/insurance/PackageInsuranceDocsTask.svelte';
  
  // Props
  export let job: Job;
  export let taskId: string = '';
  export let isOpen: boolean = false;
  
  const dispatch = createEventDispatcher<{
    close: void;
    taskComplete: { job: Job };
  }>();
  
  function handleCancel() {
    dispatch('close');
  }
  
  function handleTaskComplete(event: CustomEvent<Job>) {
    dispatch('taskComplete', { job: event.detail });
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex items-center justify-center p-4">
    <div class="w-full max-w-3xl bg-white rounded-lg shadow-xl">
      {#if taskId === 'capture_signed_auth'}
        <CaptureSignedAuthTask 
          {job} 
          on:complete={(event) => dispatch('taskComplete', { job: event.detail })} 
          on:cancel={handleCancel} 
        />
      {:else if taskId === 'generate_narrative'}
        <GenerateNarrativeTask 
          {job} 
          on:complete={(event) => dispatch('taskComplete', { job: event.detail })} 
          on:cancel={handleCancel} 
        />
      {:else if taskId === 'package_insurance_docs'}
        <PackageInsuranceDocsTask 
          {job} 
          on:complete={(event) => dispatch('taskComplete', { job: event.detail })} 
          on:cancel={handleCancel} 
        />
      {:else}
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Unknown Task</h2>
          <p class="text-gray-600 mb-6">The requested task "{taskId}" is not available.</p>
          <div class="flex justify-end">
            <button
              type="button"
              on:click={handleCancel}
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dryd-blue"
            >
              Close
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
