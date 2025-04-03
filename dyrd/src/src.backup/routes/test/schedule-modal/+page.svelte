<script lang="ts">
  import { onMount } from 'svelte';
  import ScheduleJobModal from '$lib/components/scheduling/ScheduleJobModal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { loadUsers } from '$lib/services/users';
  import { loadTrucks } from '$lib/services/truckService';
  import { loadScheduleEntries } from '$lib/services/scheduleService';
  import type { ScheduleEntry } from '$lib/types/ScheduleEntry';
  
  let isModalOpen = false;
  let jobId = 'job-01'; // Mock job ID
  let initialDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
  let lastCreatedEntry: ScheduleEntry | null = null;
  let successMessage = '';
  
  // Load necessary data when the component mounts
  onMount(async () => {
    try {
      // Load all necessary data
      await Promise.all([
        loadUsers(),
        loadTrucks(),
        loadScheduleEntries()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  });
  
  function openModal() {
    successMessage = '';
    isModalOpen = true;
  }
  
  function closeModal() {
    isModalOpen = false;
  }
  
  function handleSuccess(event: CustomEvent<ScheduleEntry>) {
    lastCreatedEntry = event.detail;
    successMessage = `Successfully created schedule entry for job ${jobId} on ${lastCreatedEntry.date}`;
    setTimeout(() => {
      successMessage = '';
    }, 5000); // Clear message after 5 seconds
  }
</script>

<div class="container p-6 mx-auto">
  <h1 class="text-2xl font-bold mb-6">Schedule Job Modal Test</h1>
  
  {#if successMessage}
    <div class="mb-6 p-3 bg-green-100 border border-green-400 text-green-700 rounded dark:bg-green-900/30 dark:border-green-600 dark:text-green-300">
      {successMessage}
    </div>
  {/if}
  
  <div class="mb-6">
    <p class="mb-4">Click the button below to open the Schedule Job modal.</p>
    
    <Button color="primary" on:click={openModal}>Open Schedule Job Modal</Button>
  </div>
  
  <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
    <h2 class="text-lg font-semibold mb-2">Testing Information</h2>
    <ul class="list-disc pl-6 space-y-1">
      <li>Mock Job ID: {jobId}</li>
      <li>Initial Date: {initialDate}</li>
      <li>Modal Status: {isModalOpen ? 'Open' : 'Closed'}</li>
    </ul>
  </div>
  
  {#if lastCreatedEntry}
    <div class="mt-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
      <h2 class="text-lg font-semibold mb-2">Last Created Entry</h2>
      <pre class="bg-white dark:bg-gray-900 p-3 rounded text-xs overflow-auto max-h-40">
        {JSON.stringify(lastCreatedEntry, null, 2)}
      </pre>
    </div>
  {/if}
  
  <ScheduleJobModal
    {jobId}
    {initialDate}
    isOpen={isModalOpen}
    onClose={closeModal}
    on:success={handleSuccess}
  />
</div> 