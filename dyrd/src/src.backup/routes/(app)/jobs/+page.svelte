<script lang="ts">
  import { onMount } from 'svelte';
  import { loadJobs, jobsNeedingWorkStart, getJobsByStatus, getAllJobs } from '$lib/stores/jobStore';
  import Button from '$lib/components/ui/Button.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import JobFilterSection from '$lib/components/jobs/JobFilterSection.svelte';
  import JobList from '$lib/components/jobs/JobList.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { JobStatus } from '$lib/types/Job';
  
  let selectedStatusFilter = $page.url.searchParams.get('status') || null;
  let filterNeedsStart = $page.url.searchParams.get('needsStart') === 'true';
  let isUpdatingUrl = false; // Flag to prevent recursive URL updates
  
  function createNewQuote() {
    goto('/quotes/new');
  }
  
  // Update URL when filters change
  $: if (!isUpdatingUrl && (selectedStatusFilter || filterNeedsStart)) {
    updateUrl();
  }
  
  function updateUrl() {
    isUpdatingUrl = true;
    
    const url = new URL(window.location.href);
    
    // Handle mutual exclusivity of filters
    if (filterNeedsStart) {
      url.searchParams.set('needsStart', 'true');
      url.searchParams.delete('status');
    } else if (selectedStatusFilter) {
      url.searchParams.set('status', selectedStatusFilter);
      url.searchParams.delete('needsStart');
    } else {
      // No filters active, clear URL
      url.searchParams.delete('status');
      url.searchParams.delete('needsStart');
    }
    
    goto(url.pathname + url.search, { replaceState: true })
      .then(() => {
        // Reset the flag after a short delay to ensure we don't trigger during the same event cycle
        setTimeout(() => {
          isUpdatingUrl = false;
        }, 50);
      });
  }
  
  // Update filter when URL changes
  $: if ($page && !isUpdatingUrl) {
    const urlStatus = $page.url.searchParams.get('status');
    const urlNeedsStart = $page.url.searchParams.get('needsStart') === 'true';
    
    // Only update if different from current value to avoid loops
    if (urlStatus !== selectedStatusFilter) {
      selectedStatusFilter = urlStatus;
    }
    
    if (urlNeedsStart !== filterNeedsStart) {
      filterNeedsStart = urlNeedsStart;
    }
  }
  
  // Choose which jobs to display based on the filters
  $: filteredJobs = filterNeedsStart 
    ? $jobsNeedingWorkStart
    : selectedStatusFilter 
      ? getJobsByStatus(selectedStatusFilter)
      : getAllJobs();
  
  onMount(() => {
    loadJobs();
  });
</script>

<PageHeader title={filterNeedsStart ? "Jobs Ready to Start" : "Jobs"}>
  <svelte:fragment slot="actions">
    <Button color="primary" on:click={createNewQuote}>
      Create Quote
    </Button>
  </svelte:fragment>
</PageHeader>

<div class="container mx-auto p-4">
  <JobFilterSection 
    bind:selectedStatusFilter 
    bind:filterNeedsStart
    showViewAllButton={false} 
  />
  
  <!-- Display the filtered jobs -->
  <JobList jobs={filteredJobs} />
</div>