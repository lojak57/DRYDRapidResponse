<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { TaskFormContent, FormField } from '$lib/types/Task';
  import { fade } from 'svelte/transition';
  
  export let formContent: TaskFormContent;
  export let formData: Record<string, any> = {};
  
  const dispatch = createEventDispatcher();
  
  let errors: Record<string, string> = {};
  let loading = false;
  
  // Simple validation to check required fields
  function validate() {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    if (formContent.fields) {
      formContent.fields.forEach((field: FormField) => {
        if (field.required && !formData[field.id]) {
          newErrors[field.id] = `${field.label} is required`;
          isValid = false;
        }
      });
    }
    
    errors = newErrors;
    return isValid;
  }
  
  function handleSubmit() {
    if (!validate()) return;
    
    loading = true;
    dispatch('submit', formData);
  }
  
  function handleCancel() {
    dispatch('cancel');
  }
  
  // Initialize form data with defaults
  $: {
    if (formContent.fields) {
      formContent.fields.forEach((field: FormField) => {
        if (!(field.id in formData) && field.defaultValue !== undefined) {
          formData[field.id] = field.defaultValue;
        }
      });
    }
  }
</script>

<div class="p-4" in:fade={{ duration: 200 }}>
  <div class="mb-4">
    <p class="text-gray-600">{formContent.description || 'Complete this task to proceed'}</p>
  </div>
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    {#if formContent.fields}
      {#each formContent.fields as field}
        <div class="mb-3">
          {#if field.type === 'text' || field.type === 'number' || field.type === 'email' || field.type === 'date'}
            <label for={field.id} class="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required ? '*' : ''}
            </label>
            <input
              type={field.type}
              id={field.id}
              bind:value={formData[field.id]}
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder={field.placeholder || ''}
              min={field.type === 'number' ? (field as any).min : undefined}
              max={field.type === 'number' ? (field as any).max : undefined}
              step={field.type === 'number' ? (field as any).step : undefined}
              required={field.required}
            />
            {#if field.description}
              <p class="mt-1 text-sm text-gray-500">{field.description}</p>
            {/if}
          {:else if field.type === 'textarea'}
            <label for={field.id} class="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required ? '*' : ''}
            </label>
            <textarea
              id={field.id}
              bind:value={formData[field.id]}
              rows={(field as any).rows || 3}
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder={field.placeholder || ''}
              required={field.required}
            ></textarea>
            {#if field.description}
              <p class="mt-1 text-sm text-gray-500">{field.description}</p>
            {/if}
          {:else if field.type === 'checkbox'}
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id={field.id}
                  type="checkbox"
                  bind:checked={formData[field.id]}
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for={field.id} class="font-medium text-gray-700">{field.label}</label>
                {#if field.description}
                  <p class="text-gray-500">{field.description}</p>
                {/if}
              </div>
            </div>
          {:else if field.type === 'select'}
            <label for={field.id} class="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required ? '*' : ''}
            </label>
            <select
              id={field.id}
              bind:value={formData[field.id]}
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required={field.required}
            >
              <option value="" disabled selected>Select an option</option>
              {#if (field as any).options}
                {#each (field as any).options as option}
                  <option value={option.value}>{option.label}</option>
                {/each}
              {/if}
            </select>
            {#if field.description}
              <p class="mt-1 text-sm text-gray-500">{field.description}</p>
            {/if}
          {/if}
          
          {#if errors[field.id]}
            <p class="mt-1 text-sm text-red-600">{errors[field.id]}</p>
          {/if}
        </div>
      {/each}
    {/if}
    
    <div class="flex justify-end space-x-3 pt-4">
      <button
        type="button"
        class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        on:click={handleCancel}
        disabled={loading}
      >
        Cancel
      </button>
      <button
        type="submit"
        class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
          Submit
        {/if}
      </button>
    </div>
  </form>
</div> 