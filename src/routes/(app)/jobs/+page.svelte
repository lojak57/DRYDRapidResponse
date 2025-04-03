<script lang="ts">
  import { onMount } from 'svelte';
  import { jobStore } from '$lib/stores/jobStore';
  import Button from '$lib/components/ui/Button.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import JobFilterSection from '$lib/components/jobs/JobFilterSection.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  
  let selectedStatusFilter = $page.url.searchParams.get('status') || null;
  
  function createNewQuote() {
    goto('/quotes/new');
  }
  
  onMount(() => {
    jobStore.loadJobs();
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
  <JobFilterSection 
    bind:selectedStatusFilter 
    showViewAllButton={false} 
  />
</div> 