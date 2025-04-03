<script lang="ts">
  import { currentUser } from '$lib/stores/authStore';
  import { userJobCounts } from '$lib/stores/jobStore';
  import { Role } from '$lib/types/User';
  import { JobStatus, type Job } from '$lib/types/Job';
  import { onMount } from 'svelte';

  let animated = false;

  onMount(() => {
    // Trigger animations after component mounts
    setTimeout(() => {
      animated = true;
    }, 100);
  });

  $: isTech = $currentUser?.role === Role.TECH;
  $: todaysJobs = ($userJobCounts as any)?.jobs?.filter((job: Job) => {
    if (!job.scheduledStartDate) return false;
    const today = new Date();
    const jobDate = new Date(job.scheduledStartDate);
    return jobDate.toDateString() === today.toDateString();
  }) || [];

  $: tomorrowsJobs = ($userJobCounts as any)?.jobs?.filter((job: Job) => {
    if (!job.scheduledStartDate) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const jobDate = new Date(job.scheduledStartDate);
    return jobDate.toDateString() === tomorrow.toDateString();
  }) || [];

  $: urgentJobs = ($userJobCounts as any)?.jobs?.filter((job: Job) => 
    job.status === JobStatus.IN_PROGRESS && 
    job.priority === 5
  ) || [];

  // Card configurations
  const cards = [
    {
      title: "My Jobs",
      count: $userJobCounts?.assigned || 0,
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
      bgColors: "bg-burgundy-gradient-1",
      textColor: "pink",
      headerClass: "card-header-burgundy-1",
      buttonClass: "btn-burgundy-1",
      status: "assigned",
      priority: 1
    },
    {
      title: "In Progress",
      count: $userJobCounts?.active || 0,
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      bgColors: "bg-burgundy-gradient-3",
      textColor: "pink",
      headerClass: "card-header-burgundy-3",
      buttonClass: "btn-burgundy-3",
      status: "active",
      priority: 2
    },
    {
      title: "Today",
      count: todaysJobs.length,
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      bgColors: "bg-burgundy-gradient-2",
      textColor: "pink",
      headerClass: "card-header-burgundy-2",
      buttonClass: "btn-burgundy-2",
      status: "today",
      priority: 3
    },
    {
      title: "Tomorrow",
      count: tomorrowsJobs.length,
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      bgColors: "bg-burgundy-gradient-4",
      textColor: "pink",
      headerClass: "card-header-burgundy-4",
      buttonClass: "btn-burgundy-4",
      status: "tomorrow",
      priority: 4
    }
  ];
</script>

<style>
  .card-enter {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
    transition: opacity 0.4s ease-out, transform 0.4s ease-out;
  }
  
  .card-enter.animated {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  
  .category-card {
    border-radius: 0.75rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .category-card-header {
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .category-card-content {
    padding: 1rem;
    background-color: white;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    min-height: 150px;
  }
</style>

<div class="card-glass rounded-lg card-shadow overflow-hidden mb-6">
  <div class="p-4 bg-dryd-gradient text-white">
    <div class="flex justify-between items-center">
      <h2 class="font-bold text-xl flex items-center">
        <div class="bg-white/20 text-white p-2 rounded-lg mr-3 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span>My Dashboard</span>
      </h2>
      <div class="text-sm bg-white/20 px-3 py-1 rounded-full">
        {$currentUser?.firstName} {$currentUser?.lastName}
      </div>
    </div>
  </div>

  <div class="p-6 bg-gray-50">
    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {#each cards as category, i}
        <div class="card-enter {animated ? 'animated' : ''}" style="transition-delay: {i * 75}ms">
          <div class="category-card card-shadow">
            <div class="category-card-header {category.headerClass} text-white">
              <div>
                <h3 class="text-lg font-semibold">{category.title}</h3>
                <p class="text-3xl font-bold mt-1">{category.count}</p>
              </div>
              <div class="p-3 bg-white/20 rounded-full">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={category.icon} />
                </svg>
              </div>
            </div>
            <div class="category-card-content">
              {#if category.count > 0}
                <span class="text-sm text-gray-600 mb-3">
                  {category.count} job{category.count !== 1 ? 's' : ''} in this category
                </span>
              {:else}
                <span class="text-sm text-gray-500 mb-3">No jobs in this category</span>
              {/if}
              
              <a 
                href="/jobs?status={category.status}" 
                class="action-link {category.buttonClass} text-sm mt-auto self-start"
              >
                View all {category.title.toLowerCase()}
                <svg class="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- Urgent Jobs Alert -->
    {#if urgentJobs.length > 0}
      <div class="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-rose-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-rose-800">High Priority Jobs</h3>
            <div class="mt-2 text-sm text-rose-700">
              <p>You have {urgentJobs.length} high priority job{urgentJobs.length === 1 ? '' : 's'} that need attention.</p>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Today's Schedule -->
    <div class="bg-white rounded-lg shadow-md border border-gray-200 p-5">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Today's Schedule</h3>
      
      {#if todaysJobs.length > 0}
        <div class="space-y-4">
          {#each todaysJobs as job}
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div class="flex items-center">
                <div class="p-2 rounded-full bg-dryd-blue/10 text-dryd-blue mr-3">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">{job.title}</h4>
                  <p class="text-sm text-gray-500">#{job.jobNumber}</p>
                </div>
              </div>
              <a href="/jobs/{job.id}" class="text-dryd-blue hover:text-dryd-blue-dark font-medium text-sm">
                View Details →
              </a>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-center py-4 text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="mt-2">No jobs scheduled for today</p>
        </div>
      {/if}
    </div>
  </div>
</div> 