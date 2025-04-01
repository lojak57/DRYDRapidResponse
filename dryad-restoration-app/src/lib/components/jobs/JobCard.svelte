<script lang="ts">
  import type { Job } from '$lib/types/Job';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import JobStatusBadge from './JobStatusBadge.svelte';
  import { getCustomerById } from '$lib/services/customers';
  
  export let job: Job;
  
  // Customer name store
  const customerName = writable<string>('');
  
  // Format the address for display
  $: formattedAddress = job?.siteAddress 
    ? `${job.siteAddress.street || ''}, ${job.siteAddress.city || ''}, ${job.siteAddress.state || ''} ${job.siteAddress.zip || ''}`
    : 'Address not available';
    
  // Format date for display
  function formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  // Load customer data
  onMount(async () => {
    try {
      const customerData = await getCustomerById(job.customerId);
      if (customerData) {
        customerName.set(customerData.name);
      }
    } catch (err) {
      console.error(`Error loading customer for job ${job.id}:`, err);
    }
  });
</script>

<div class="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg hover:border-gray-300 transition-all duration-200 ease-in-out bg-gray-100">
  <div class="border-l-4 {
    job.status === 'NEW' ? 'border-blue-500' : 
    job.status === 'SCHEDULED' ? 'border-purple-500' : 
    job.status === 'IN_PROGRESS' ? 'border-amber-500' : 
    job.status === 'COMPLETED' ? 'border-green-500' : 
    job.status === 'ON_HOLD' ? 'border-red-500' : 
    job.status === 'CANCELLED' ? 'border-gray-500' : 
    'border-dryd-blue'
  } p-5">
    <div class="flex justify-between items-start mb-3">
      <div>
        <h3 class="text-xl font-bold text-gray-800 mb-1">{job.title}</h3>
        <p class="text-sm text-gray-600 flex items-center">
          <svg class="w-4 h-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          Job #{job.jobNumber}
        </p>
      </div>
      <JobStatusBadge status={job.status} />
    </div>
    
    <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
      <div class="flex items-start">
        <svg class="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <div>
          <p class="text-sm font-medium text-gray-600">Type</p>
          <p class="text-gray-900 font-medium">{job.jobType}</p>
        </div>
      </div>
      
      <div class="flex items-start">
        <svg class="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <div>
          <p class="text-sm font-medium text-gray-600">Customer</p>
          <p class="text-gray-900 font-medium">{$customerName || 'Loading...'}</p>
        </div>
      </div>
      
      <div class="md:col-span-2 flex items-start">
        <svg class="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <div>
          <p class="text-sm font-medium text-gray-600">Site Address</p>
          <p class="text-gray-900 font-medium">{formattedAddress}</p>
        </div>
      </div>
    </div>
    
    <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
      <div class="text-sm text-gray-700 flex items-center">
        <svg class="h-4 w-4 text-gray-500 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {job.incidentDate ? formatDate(job.incidentDate) : 'No incident date'}
      </div>
      <a 
        href="/jobs/{job.id}" 
        class="inline-flex items-center bg-gray-100 hover:bg-dryd-blue hover:text-white text-dryd-blue-dark py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dryd-blue"
      >
        View Details
        <svg class="ml-1 w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  </div>
</div> 