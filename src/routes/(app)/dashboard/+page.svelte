<!-- Dashboard page -->
<script lang="ts">
  import JobList from '$lib/components/jobs/JobList.svelte';
  import { dashboardJobs, isLoading, error, jobStatusCounts, userJobCounts, jobs, jobsNeedingWorkStart } from '$lib/stores/jobStore';
  import { currentUser } from '$lib/stores/authStore';
  import { Role } from '$lib/types/User';
  import { JobStatus, type Job } from '$lib/types/Job';
  import Logo from '$lib/components/common/Logo.svelte';
  import TechJobFocusWidget from '$lib/components/dashboard/TechJobFocusWidget.svelte';
  import TechnicianJobFilters from '$lib/components/dashboard/TechnicianJobFilters.svelte';
  import AdminControlsWidget from '$lib/components/dashboard/AdminControlsWidget.svelte';
  import JobFilterSection from '$lib/components/jobs/JobFilterSection.svelte';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import TechDashboardCard from '$lib/components/dashboard/TechDashboardCard.svelte';
  
  // Animation variables
  let animated = false;
  
  // Job status filter
  let selectedStatusFilter: string | null = null;
  
  // Function to reset the filter
  function resetFilter() {
    selectedStatusFilter = null;
  }
  
  // Function to set the filter
  function setStatusFilter(status: string) {
    selectedStatusFilter = status === selectedStatusFilter ? null : status;
  }
  
  // Get filtered dashboard jobs
  $: filteredDashboardJobs = selectedStatusFilter 
    ? $dashboardJobs.filter(job => job.status === selectedStatusFilter)
    : $dashboardJobs;
  
  // Track available statuses (statuses that have jobs)
  $: availableStatuses = $jobs 
    ? Object.values(JobStatus)
        .filter(status => status !== JobStatus.CANCELLED)
        .filter(status => $jobs.some(job => job.status === status))
    : [];
  
  onMount(() => {
    // Trigger animations after component mounts
    setTimeout(() => {
      animated = true;
    }, 100);
  });
  
  // Check if user is authorized to create jobs
  $: isAuthorized = $currentUser?.role === Role.ADMIN || $currentUser?.role === Role.OFFICE;
  $: isTechnician = $currentUser?.role === Role.TECH;
  $: isAdmin = $currentUser?.role === Role.ADMIN;
  
  // Safely filter jobs by checking for nulls/undefined
  function safeFilter(jobArray: Job[] | undefined | null, statusCheck: JobStatus): Job[] {
    if (!jobArray || !Array.isArray(jobArray)) return [];
    return jobArray.filter(job => job && job.status === statusCheck);
  }
  
  // Filter jobs for each category with added safety checks
  $: newJobs = safeFilter($jobs, JobStatus.NEW);
  $: scheduledJobs = safeFilter($jobs, JobStatus.SCHEDULED);
  $: inProgressJobs = safeFilter($jobs, JobStatus.IN_PROGRESS);
  $: onHoldJobs = safeFilter($jobs, JobStatus.ON_HOLD);
  $: pendingCompletionJobs = safeFilter($jobs, JobStatus.PENDING_COMPLETION);
  $: completedJobs = safeFilter($jobs, JobStatus.COMPLETED);
  $: invoiceApprovalJobs = safeFilter($jobs, JobStatus.INVOICE_APPROVAL);
  $: invoicedJobs = safeFilter($jobs, JobStatus.INVOICED);
  $: paidJobs = safeFilter($jobs, JobStatus.PAID);
  $: cancelledJobs = safeFilter($jobs, JobStatus.CANCELLED);
  
  // Calculate performance metrics safely
  $: totalActiveJobs = (inProgressJobs?.length || 0) + (pendingCompletionJobs?.length || 0) + (scheduledJobs?.length || 0);
  // Job category configurations for the cards
  const jobCategories = [
    {
      title: "Ready to Start",
      count: $jobsNeedingWorkStart.length || 0,
      icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      bgColors: "bg-amber-gradient",
      textColor: "amber",
      headerClass: "card-header-amber",
      buttonClass: "btn-amber",
      status: JobStatus.IN_PROGRESS,
      priority: 0,
      description: "Jobs dispatched but work not started"
    },
    // ... existing code ...
  ];

    <!-- Jobs Section -->
    <div class="mb-6">
      <JobFilterSection 
        bind:selectedStatusFilter 
        showViewAllButton={true} 
      />
    </div>

    {#each sortedCategories as category, i}
      <div class="card-enter {animated ? 'animated' : ''}" style="transition-delay: {i * 75}ms">
        <div class="category-card card-shadow">
          <div class="category-card-header {category.bgColors} text-white">
            <div>
              <h3 class="text-lg font-semibold">{category.title}</h3>
              <p class="text-3xl font-bold mt-1">{category.count}</p>
            </div>
            <div class="p-3 bg-white/20 rounded-full">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={category.icon}/>
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
              class="action-link btn-teal text-sm mt-auto self-start"
            >
              View all {category.shortTitle || category.title.toLowerCase()}
              <svg class="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    {/each} 