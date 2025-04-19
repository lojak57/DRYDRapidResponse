<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Job } from '$lib/types/Job';

  // Props
  export let job: Job;
  export let disabled: boolean = false;

  const dispatch = createEventDispatcher<{
    taskClicked: { taskId: string, action: string }
  }>();

  // Define the list of insurance tasks with their ids, labels, and completion status functions
  const taskList = [
    { 
      id: 'capture_signed_auth', 
      label: 'Capture Signed Work Auth', 
      action: 'signed_auth',
      isComplete: (j: Job) => !!j.signedAuthUrl,
      isRequired: (j: Job) => j.insuranceMode === true
    },
    { 
      id: 'generate_narrative', 
      label: 'Generate Claim Narrative', 
      action: 'narrative',
      isComplete: (j: Job) => !!j.claimNarrative,
      isRequired: (j: Job) => j.insuranceMode === true
    },
    { 
      id: 'package_insurance_docs', 
      label: 'Build Insurance Package', 
      action: 'package',
      isComplete: (j: Job) => !!j.insurancePackageUrl,
      isRequired: (j: Job) => j.insuranceMode === true
    }
  ];

  // Handle clicking on a task
  function handleTaskClick(task: typeof taskList[0]) {
    if (disabled) return;
    dispatch('taskClicked', { taskId: task.id, action: task.action });
  }

  // Filter tasks based on job.insuranceMode
  $: visibleTasks = taskList.filter(task => task.isRequired(job));
</script>

{#if job.insuranceMode}
  <div class="bg-white rounded-lg shadow-md border border-gray-200 p-5 mb-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-dryd-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      Insurance Tasks
    </h3>
    
    <p class="text-sm text-gray-600 mb-4">
      Complete these insurance-related tasks to prepare the job for submission to the carrier.
    </p>
    
    <ul class="space-y-3">
      {#each visibleTasks as task}
        <li 
          class="flex items-center p-3 border rounded-md {!disabled ? 'cursor-pointer' : ''} transition-all duration-150 
                 {task.isComplete(job) ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}"
          on:click={() => handleTaskClick(task)}
        >
          {#if task.isComplete(job)}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          {/if}
          <span class="{task.isComplete(job) ? 'text-green-800' : 'text-gray-700'} font-medium">
            {task.label}
          </span>
        </li>
      {/each}
    </ul>
  </div>
{/if}
