<script lang="ts">
  import type { Job } from "$lib/types/Job";
  import { JobStatus } from "$lib/types/Job";
  import { goto } from "$app/navigation";
  
  export let job: Job;
  
  // Get status-based styling
  $: statusStyle = getStatusStyle(job.status);
  
  // Format job details for display
  $: displayText = `${job.jobNumber}`;
  $: titleText = job.title || 'Untitled Job';
  
  // Navigate to job detail page
  function navigateToJob() {
    goto(`/jobs/${job.id}`);
  }
  
  // Get style based on job status
  function getStatusStyle(status: JobStatus): { bgClass: string; textClass: string } {
    switch(status) {
      case JobStatus.SCHEDULED:
        return { bgClass: "bg-blue-100 border-blue-300", textClass: "text-blue-800" };
      case JobStatus.IN_PROGRESS:
        return { bgClass: "bg-green-100 border-green-300", textClass: "text-green-800" };
      case JobStatus.ON_HOLD:
        return { bgClass: "bg-yellow-100 border-yellow-300", textClass: "text-yellow-800" };
      default:
        return { bgClass: "bg-gray-100 border-gray-300", textClass: "text-gray-800" };
    }
  }
</script>

<div 
  class="job-card {statusStyle.bgClass} border rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
  on:click={navigateToJob}
  on:keydown={(e) => e.key === 'Enter' && navigateToJob()}
  tabindex="0"
  role="button"
  aria-label="View job {job.jobNumber}"
>
  <div class="text-xs font-bold {statusStyle.textClass} truncate">{displayText}</div>
  <div class="text-xs {statusStyle.textClass} truncate">{titleText}</div>
  <div class="text-xs {statusStyle.textClass} opacity-75 truncate text-right">
    {job.status}
  </div>
</div>