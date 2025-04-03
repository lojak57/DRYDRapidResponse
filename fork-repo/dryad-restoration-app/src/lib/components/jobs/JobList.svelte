<script lang="ts">
  import type { Job } from '$lib/types/Job';
  import JobCard from './JobCard.svelte';
  
  export let jobs: Job[] = [];
</script>

<div class="space-y-6">
  {#if jobs.length === 0}
    <div class="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
      <p class="text-gray-500">No jobs found.</p>
    </div>
  {:else}
    {#each jobs as job (job.id)}
      <JobCard {job} />
    {/each}
  {/if}
</div> 