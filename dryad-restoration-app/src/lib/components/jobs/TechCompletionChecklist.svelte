<script lang="ts">
  import type { CompletionTasks } from '$lib/types/Job';
  import { createEventDispatcher } from 'svelte';
  
  // Props
  export let tasks: CompletionTasks | undefined;
  export let jobId: string;
  
  const dispatch = createEventDispatcher<{
    taskClicked: { key: keyof CompletionTasks, action: string }
  }>();
  
  // Define the list of tasks with their keys, labels, and associated actions
  const taskList = [
    { key: 'finalReadingsLogged' as keyof CompletionTasks, label: 'Log Final Moisture Readings', action: 'reading' },
    { key: 'afterPhotosTaken' as keyof CompletionTasks, label: 'Upload "After" Photos', action: 'photo' },
    { key: 'allEquipmentRemoved' as keyof CompletionTasks, label: 'Confirm All Equipment Removed', action: 'equipment' }
  ];
  
  // Handle clicking on a task
  function handleTaskClick(task: typeof taskList[0]) {
    console.log('Clicked task:', task.action, jobId);
    dispatch('taskClicked', { key: task.key, action: task.action });
  }
</script>

<div class="bg-white rounded-lg shadow-md border border-gray-200 p-5 mb-6">
  <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-dryd-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
    Pre-Completion Checklist
  </h3>
  
  <p class="text-sm text-gray-600 mb-4">
    Please complete the following tasks before marking this job as ready for completion.
  </p>
  
  <ul class="space-y-3">
    {#each taskList as task}
      <li 
        class="flex items-center p-3 border rounded-md cursor-pointer transition-all duration-150 {tasks?.[task.key] ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}"
        on:click={() => handleTaskClick(task)}
      >
        {#if tasks && tasks[task.key]}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        {/if}
        <span class="{tasks?.[task.key] ? 'text-green-800' : 'text-gray-700'} font-medium">
          {task.label}
        </span>
      </li>
    {/each}
  </ul>
</div> 