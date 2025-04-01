<script lang="ts">
  import { onMount } from 'svelte';
  import { jobStore } from '$lib/stores/jobStore';
  import JobList from '$lib/components/jobs/JobList.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import { goto } from '$app/navigation';
  
  let searchQuery = '';
  let statusFilter = 'ALL';
  let searchTimeout: ReturnType<typeof setTimeout>;
  
  $: filteredJobs = filterJobs($jobStore.jobs, searchQuery);
  
  function filterJobs(jobs: any[], query: string) {
    if (!query.trim()) return jobs;
    
    const searchTerms = query.toLowerCase().split(' ');
    return jobs.filter(job => {
      const searchableText = [
        job.jobNumber,
        job.description || '',
        job.status,
        job.jobType || ''
      ].join(' ').toLowerCase();
      
      // Check if all search terms are found in the searchable text
      return searchTerms.every(term => searchableText.includes(term));
    });
  }
  
  function handleSearch(e: Event) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const target = e.target as HTMLInputElement;
      searchQuery = target.value;
    }, 300);
  }
  
  function createNewQuote() {
    goto('/quotes/new');
  }
  
  onMount(() => {
    jobStore.fetchJobs();
  });
</script>

<PageHeader title="Jobs">
  <svelte:fragment slot="actions">
    <Button color="primary" on:click={createNewQuote}>
      Create Quote
    </Button>
  </svelte:fragment>
</PageHeader>

<div class="container mx-auto p-4">
  <div class="mb-6 flex flex-col sm:flex-row gap-4">
    <!-- Search -->
    <div class="relative flex-1">
      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      <input 
        type="search" 
        class="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500"
        placeholder="Search jobs..."
        on:input={handleSearch}
      />
    </div>
    
    <!-- Status Filter -->
    <div class="w-full sm:w-auto">
      <select 
        bind:value={statusFilter}
        class="block w-full p-2.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500"
      >
        <option value="ALL">All Statuses</option>
        <option value="NEW">New</option>
        <option value="SCHEDULED">Scheduled</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="PENDING_COMPLETION">Pending Completion</option>
        <option value="ON_HOLD">On Hold</option>
        <option value="COMPLETED">Completed</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
    </div>
  </div>
  
  <JobList 
    jobs={filteredJobs} 
    loading={$jobStore.loading} 
    error={$jobStore.error}
    filterStatus={statusFilter}
    emptyStateMessage={searchQuery ? "No jobs match your search" : "No jobs found"}
  />
</div>