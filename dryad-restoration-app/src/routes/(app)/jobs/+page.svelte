<script lang="ts">
  import { onMount } from 'svelte';
  import { jobStore, isLoading, error } from '$lib/stores/jobStore';
  import JobList from '$lib/components/jobs/JobList.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import { goto } from '$app/navigation';
  import JobHeaderNav from '$lib/components/jobs/JobHeaderNav.svelte';
  import { JobStatus, type Job, type JobType } from '$lib/types/Job';
  
  let searchQuery = '';
  let statusFilter: JobStatus | 'ALL' = 'ALL';
  let searchTimeout: ReturnType<typeof setTimeout>;
  
  // Apply filters to the jobs from the store
  $: filteredJobs = applyFilters($jobStore, searchQuery, statusFilter);
  
  // Count jobs by status
  $: jobCountsByStatus = getJobCountsByStatus($jobStore || []);
  
  function getJobCountsByStatus(jobs: Job[]): Record<string, number> {
    const counts: Record<string, number> = { ALL: jobs.length };
    
    // Initialize counts for each status
    Object.values(JobStatus).forEach(status => {
      counts[status] = 0;
    });
    
    // Count jobs by status
    jobs.forEach(job => {
      if (job.status) {
        counts[job.status] = (counts[job.status] || 0) + 1;
      }
    });
    
    return counts;
  }
  
  function applyFilters(jobs: Job[], query: string, status: JobStatus | 'ALL'): Job[] {
    if (!jobs) return [];
    
    // First filter by status if specified
    let result = jobs;
    if (status !== 'ALL') {
      result = result.filter(job => job.status === status);
    }
    
    // Then apply search if query exists
    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(' ');
      result = result.filter(job => {
        const searchableText = [
          job.jobNumber || '',
          job.title || '',
          job.description || '',
          job.status || '',
          job.type?.toString() || ''
        ].join(' ').toLowerCase();
        
        // Check if all search terms are found in the searchable text
        return searchTerms.every(term => searchableText.includes(term));
      });
    }
    
    return result;
  }
  
  function handleSearch(e: Event) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const target = e.target as HTMLInputElement;
      searchQuery = target.value;
    }, 300);
  }
  
  function handleStatusFilterChange(event: CustomEvent<{status: JobStatus | 'ALL'}>) {
    statusFilter = event.detail.status;
  }
  
  function createNewQuote() {
    goto('/quotes/new');
  }
  
  onMount(() => {
    // Call loadJobs from the jobStore to fetch the jobs
    jobStore.loadJobs();
  });
</script>

<JobHeaderNav 
  selectedStatus={statusFilter}
  countsMap={jobCountsByStatus}
  on:filterChange={handleStatusFilterChange}
/>

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
  </div>
  
  <JobList 
    jobs={filteredJobs} 
    loading={$isLoading} 
    error={$error}
    filterStatus={statusFilter}
    emptyStateMessage={searchQuery ? "No jobs match your search" : "No jobs found"}
  />
</div>