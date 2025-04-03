<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import Modal from '$lib/components/common/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { users as userStore } from '$lib/stores/userStore';
  import { availableTrucksByDate, trucks as truckStore } from '$lib/stores/truckStore'; // Import store and derived fn
  import { currentUser } from '$lib/stores/authStore'; // To get creator ID
  import { Role } from '$lib/types/User';
  import type { User } from '$lib/types/User';
  import type { Truck } from '$lib/types/Truck';
  import type { CreateScheduleEntryInput, ScheduleEntry } from '$lib/types/ScheduleEntry'; // Import type
  import { createScheduleEntry } from '$lib/services/scheduleService'; // Import service function
  import { get } from 'svelte/store';
  import { format } from 'date-fns'; // For date formatting
  import { AlertTriangle } from 'lucide-svelte';

  export let jobId: string;
  export let initialDate: string = format(new Date(), 'yyyy-MM-dd'); // Default to today
  export let isOpen: boolean = false;
  export let onClose: () => void;

  const dispatch = createEventDispatcher<{ success: ScheduleEntry }>(); // Define success event payload

  // Form State
  let selectedDate: string = initialDate;
  let selectedUserId: string = '';
  let selectedTruckId: string = ''; // Use '' for "No Truck" option
  let notes: string = '';
  let isSubmitting: boolean = false;
  let errorMessage: string = '';

  // Data State
  let technicians: User[] = [];
  let availableTrucks: Truck[] = [];

  // Fetch technicians on mount or when store changes
  $: technicians = $userStore.filter(u => u.role === Role.TECH).sort((a, b) => a.lastName.localeCompare(b.lastName));

  // Reactively update available trucks when date changes
  // Need to subscribe to truckStore as well so availableTrucksByDate updates when trucks load
  $: $truckStore, updateAvailableTrucks(selectedDate);

  function updateAvailableTrucks(date: string) {
      if(date) {
         const getAvailTrucks = get(availableTrucksByDate); // Get the function from the derived store
         availableTrucks = getAvailTrucks(date); // Call the function with the date
      } else {
         availableTrucks = [];
      }
      // If previously selected truck is no longer available, reset selection
      if (selectedTruckId && !availableTrucks.some(t => t.id === selectedTruckId)) {
          selectedTruckId = '';
      }
  }

  onMount(() => {
    selectedDate = initialDate || format(new Date(), 'yyyy-MM-dd');
    // Initial fetch of trucks for the default date
    updateAvailableTrucks(selectedDate);
  });

  // --- Submission Logic ---
  async function handleSubmit() {
    errorMessage = '';
    if (!selectedDate || !selectedUserId) {
      errorMessage = 'Please select a date and a technician.';
      return;
    }

    const creator = get(currentUser);
    if (!creator) {
        errorMessage = 'Cannot determine current user. Please log in again.';
        return;
    }

    isSubmitting = true;

    const input: CreateScheduleEntryInput = {
      jobId: jobId,
      userId: selectedUserId,
      date: selectedDate,
      truckId: selectedTruckId || undefined, // Set to undefined if empty string
      notes: notes.trim() || undefined,
      createdBy: creator.id
    };

    try {
      const newEntry = await createScheduleEntry(input);
      console.log('Successfully scheduled:', newEntry);
      dispatch('success', newEntry); // Dispatch success event with the new entry data
      resetForm();
      onClose(); // Close the modal
    } catch (err) {
      console.error('Error scheduling job:', err);
      errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while scheduling.';
      // Keep modal open to show error
    } finally {
      isSubmitting = false;
    }
  }

  function handleClose() {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  }

  function resetForm() {
      selectedDate = initialDate || format(new Date(), 'yyyy-MM-dd');
      selectedUserId = '';
      selectedTruckId = '';
      notes = '';
      errorMessage = '';
      isSubmitting = false;
  }
</script>

<Modal {isOpen} on:close={handleClose}>
  <div class="p-6">
    <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Schedule Job Assignment</h2>
    
    <form on:submit|preventDefault={handleSubmit}>
      {#if errorMessage}
        <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900/30 dark:border-red-600 dark:text-red-300 flex items-start">
          <AlertTriangle size={18} class="mr-2 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      {/if}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label for="schedule-date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date <span class="text-red-500">*</span></label>
          <input
            type="date"
            id="schedule-date"
            bind:value={selectedDate}
            required
            class="w-full px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
            aria-required="true"
          />
        </div>

        <div>
          <label for="technician" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Technician <span class="text-red-500">*</span></label>
          <select
            id="technician"
            bind:value={selectedUserId}
            required
            class="w-full px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting || technicians.length === 0}
            aria-required="true"
          >
            <option value="" disabled>-- Select Technician --</option>
            {#each technicians as tech (tech.id)}
              <option value={tech.id}>{tech.firstName} {tech.lastName}</option>
            {/each}
            {#if technicians.length === 0}
               <option value="" disabled>Loading technicians...</option>
            {/if}
          </select>
          {#if technicians.length === 0}
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Loading technicians...</p>
          {/if}
        </div>
      </div>

       <div class="mb-4">
          <label for="truck" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign Truck (Optional)</label>
          <select
            id="truck"
            bind:value={selectedTruckId}
            class="w-full px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting || !selectedDate}
            aria-label="Select a truck (optional)"
          >
            <option value="">-- No Truck Assigned --</option>
            {#if selectedDate}
               {#each availableTrucks as truck (truck.id)}
                <option value={truck.id}>{truck.name}</option>
               {:else}
                <option value="" disabled>No trucks available on {selectedDate}</option>
               {/each}
            {:else}
                <option value="" disabled>Select a date first</option>
            {/if}
          </select>
          {#if selectedDate && availableTrucks.length === 0}
            <p class="text-xs text-amber-600 dark:text-amber-400 mt-1">No trucks available on this date</p>
          {/if}
        </div>

       <div class="mb-4">
          <label for="schedule-notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Optional)</label>
          <textarea
            id="schedule-notes"
            bind:value={notes}
            rows="3"
            class="w-full px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
            placeholder="Add any specific instructions or notes for this assignment..."
            aria-label="Additional notes for this assignment (optional)"
          ></textarea>
        </div>

      <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
        <Button type="button" color="secondary" on:click={handleClose} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" color="primary" loading={isSubmitting} disabled={isSubmitting || !selectedUserId || !selectedDate}>
          {isSubmitting ? 'Scheduling...' : 'Assign Schedule'}
        </Button>
      </div>
    </form>
  </div>
</Modal> 