<script lang="ts">
  import { onMount } from 'svelte';
  import { jobStore, jobs as jobsStore } from '$lib/stores/jobStore';
  import { getTechnicians } from '$lib/services/users';
  import type { User } from '$lib/types/User';
  import type { Job } from '$lib/types/Job';
  import { JobStatus } from '$lib/types/Job';
  import GanttJobCard from './GanttJobCard.svelte';
  import { goto } from '$app/navigation';
  
  // Chart data
  let technicians: User[] = [];
  let jobs: Job[] = [];
  
  // View type (daily or weekly)
  let viewType: 'daily' | 'weekly' = 'weekly';
  
  // Subscribe to the jobs store to keep data updated
  $: if ($jobsStore) {
    jobs = Array.isArray($jobsStore) ? $jobsStore : [];
    console.log(`Jobs updated from store: ${jobs.length} jobs`);
  }
  
  // Status to filter (only SCHEDULED and IN_PROGRESS will be shown)
  const visibleStatuses = [JobStatus.SCHEDULED, JobStatus.IN_PROGRESS];
  
  // Date range for the chart
  const daysInWeek = 7;
  
  // Selected date - in daily view, this is the single date to show
  // in weekly view, this is the start of the week
  let selectedDate = new Date();
  selectedDate.setHours(0, 0, 0, 0); // Normalize to start of day
  
  // Generate date range based on view type
  $: dateRange = generateDateRange(selectedDate, viewType === 'daily' ? 1 : daysInWeek);
  
  // Mapped data for display - ensure all inputs are properly defined
  $: technicianJobs = technicians && Array.isArray(jobs) && dateRange ? 
      mapJobsToTechnicians(technicians, jobs, dateRange) : [];
  
  // Generate array of dates from start date to specified number of days
  function generateDateRange(start: Date, days: number): Date[] {
    const dates: Date[] = [];
    const startDateCopy = new Date(start);
    startDateCopy.setHours(0, 0, 0, 0); // Normalize to start of day
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDateCopy);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    
    return dates;
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
  
  // Format date for display
  function formatDate(date: Date, detailed = false): string {
    if (detailed) {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
    return `${day} ${monthDay}`;
  }
  
  // Check if a job is scheduled for a specific date
  function isJobScheduledForDate(job: Job, date: Date): boolean {
    if (!job || !job.scheduledStartDate) return false;
    
    const jobStartDate = new Date(job.scheduledStartDate);
    jobStartDate.setHours(0, 0, 0, 0);
    
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    
    // For daily view, we want an exact match
    if (viewType === 'daily') {
      return jobStartDate.getTime() === dateToCheck.getTime();
    } 
    
    // For weekly view, job could span multiple days
    const dayDiff = Math.floor((dateToCheck.getTime() - jobStartDate.getTime()) / (1000 * 60 * 60 * 24));
    return dayDiff >= 0 && dayDiff < 3; // Job appears on start date and 2 days after
  }
  
  // Map jobs to technicians for easier rendering
  function mapJobsToTechnicians(techs: User[], allJobs: Job[], dates: Date[]): any[] {
    // Handle case when allJobs is undefined or not an array
    if (!allJobs || !Array.isArray(allJobs)) {
      return techs.map(tech => ({
        technician: tech,
        dates: dates.map(date => ({ date, jobs: [] }))
      }));
    }
    
    return techs.map(tech => {
      // Get jobs assigned to this technician
      const techJobs = allJobs.filter(job => 
        job && 
        job.assignedUserIds && 
        Array.isArray(job.assignedUserIds) &&
        job.assignedUserIds.includes(tech.id) && 
        job.status &&
        visibleStatuses.includes(job.status)
      );
      
      // Map jobs to dates
      const dateJobs = dates.map(date => {
        const jobsForDate = techJobs.filter(job => isJobScheduledForDate(job, date));
        return {
          date,
          jobs: jobsForDate
        };
      });
      
      return {
        technician: tech,
        dates: dateJobs
      };
    });
  }
  
  // Navigate to previous date or week
  function navigatePrevious() {
    const newDate = new Date(selectedDate);
    if (viewType === 'daily') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() - daysInWeek);
    }
    selectedDate = newDate;
  }
  
  // Navigate to next date or week
  function navigateNext() {
    const newDate = new Date(selectedDate);
    if (viewType === 'daily') {
      newDate.setDate(newDate.getDate() + 1);
    } else {
      newDate.setDate(newDate.getDate() + daysInWeek);
    }
    selectedDate = newDate;
  }
  
  // Set date to today
  function goToToday() {
    selectedDate = new Date();
    selectedDate.setHours(0, 0, 0, 0);
  }
  
  // Switch to daily view
  function setDailyView() {
    viewType = 'daily';
  }
  
  // Switch to weekly view
  function setWeeklyView() {
    viewType = 'weekly';
  }
  
  // Load data on component mount
  onMount(async () => {
    try {
      // Load technicians
      technicians = await getTechnicians();
      
      // Load jobs
      await jobStore.loadJobs();
      
      // Safely extract jobs from store and ensure it's an array
      const storeJobs = $jobStore?.jobs;
      jobs = Array.isArray(storeJobs) ? storeJobs : [];
      
      // Log for debugging
      console.log(`Loaded ${technicians.length} technicians and ${jobs.length} jobs`);
      
      // Check if we have jobs scheduled in the visible range
      const scheduledJobs = jobs.filter(job => 
        job && 
        job.scheduledStartDate && 
        visibleStatuses.includes(job.status)
      );
      
      console.log(`Found ${scheduledJobs.length} scheduled/in-progress jobs`);
    } catch (error) {
      console.error('Error loading Gantt chart data:', error);
      jobs = []; // Ensure jobs is at least an empty array on error
    }
  });
</script>

<style>
  /* Ensure consistent card spacing and appearance */
  .gantt-card-wrapper {
    margin-bottom: 2px;
    height: calc(100% - 4px);
    width: calc(100% - 4px);
    display: flex;
  }
  
  /* Square cells for weekly view */
  td.cell-square {
    height: 120px;
    width: 120px;
    min-width: 120px;
    max-width: 120px;
    padding: 2px !important;
  }
  
  /* Rectangular cells for daily view */
  td.cell-daily {
    height: 60px;
    width: 100%;
    padding: 2px !important;
  }
  
  /* Square header cells */
  th.header-square {
    width: 120px;
    min-width: 120px;
    max-width: 120px;
  }
  
  /* Daily view header cell */
  th.header-daily {
    width: 100%;
  }
  
  /* Technician column width */
  .tech-column {
    width: 120px;
    min-width: 120px;
  }
  
  /* Card styling for compact squares */
  :global(.gantt-card-wrapper .job-card) {
    padding: 0.25rem !important;
    font-size: 0.75rem !important;
    line-height: 1rem !important;
    height: 100% !important;
    width: 100% !important;
    margin-bottom: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
  }
  
  /* Card styling for daily view */
  :global(.gantt-card-wrapper .job-card-daily) {
    padding: 0.25rem !important;
    font-size: 0.75rem !important;
    line-height: 1rem !important;
    height: 100% !important;
    width: 100% !important;
    margin-bottom: 0 !important;
    display: flex !important;
    flex-direction: row !important;
    justify-content: space-between !important;
    align-items: center !important;
  }
</style>

<div class="gantt-chart">
  <!-- Chart Header -->
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-xl font-bold">Schedule</h2>
    
    <!-- Navigation and view controls -->
    <div class="flex gap-2 items-center">
      <!-- Previous button -->
      <button class="btn btn-sm" on:click={navigatePrevious} aria-label="Previous">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
      
      <!-- Today button -->
      <button class="btn btn-sm" on:click={goToToday}>Today</button>
      
      <!-- Next button -->
      <button class="btn btn-sm" on:click={navigateNext} aria-label="Next">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
      
      <!-- Current date display -->
      <div class="px-2 font-medium">
        {#if viewType === 'daily'}
          {formatDate(selectedDate, true)}
        {:else}
          {formatDate(dateRange[0], false)} - {formatDate(dateRange[dateRange.length - 1], false)}
        {/if}
      </div>
      
      <!-- View type toggles -->
      <div class="ml-4 border-l pl-4">
        <button 
          class="btn btn-sm {viewType === 'daily' ? 'bg-blue-100 text-blue-700' : ''}"
          on:click={setDailyView}
        >
          Daily
        </button>
        <button 
          class="btn btn-sm {viewType === 'weekly' ? 'bg-blue-100 text-blue-700' : ''}"
          on:click={setWeeklyView}
        >
          Weekly
        </button>
      </div>
    </div>
  </div>
  
  <!-- Daily View (Grid) -->
  {#if viewType === 'daily' && dateRange.length > 0}
    <div class="overflow-x-auto border rounded-lg">
      <div class="bg-gray-50 px-4 py-3 border-b">
        <h3 class="text-lg font-medium">Jobs Scheduled for {formatDate(dateRange[0], true)}</h3>
      </div>
      <table class="min-w-full border-collapse">
        <thead>
          <tr class="bg-gray-50 border-b">
            <!-- Header for technician column -->
            <th class="tech-column px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
              Technician
            </th>
            
            <!-- Header for the single date column -->
            <th class="header-daily px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Schedule
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <!-- Show loading state when technicians are not loaded yet -->
          {#if technicians.length === 0}
            {#each Array(3) as _, i}
              <tr>
                <td class="px-2 py-2 whitespace-nowrap border-r bg-gray-50 tech-column">
                  <div class="h-6 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td class="px-2 py-2 cell-daily border-r border-dashed border-gray-100">
                </td>
              </tr>
            {/each}
          {:else}
            <!-- Render rows for each technician -->
            {#each technicianJobs as row}
              <tr>
                <td class="px-2 py-2 whitespace-nowrap border-r bg-gray-50 tech-column">
                  <div class="text-sm font-medium text-gray-900 truncate">{row.technician.firstName} {row.technician.lastName}</div>
                </td>
                
                <!-- Render cell for the single date -->
                <td class="cell-daily border-r border-dashed border-gray-100 align-top overflow-hidden">
                  <div class="h-full w-full">
                    {#if row.dates[0].jobs && row.dates[0].jobs.length > 0}
                      <div class="space-y-1 h-full">
                        {#each row.dates[0].jobs as job}
                          <div class="gantt-card-wrapper">
                            <div 
                              class="job-card-daily {getStatusStyle(job.status).bgClass} border rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer flex"
                              on:click={() => goto(`/jobs/${job.id}`)}
                              on:keydown={(e: KeyboardEvent) => e.key === 'Enter' && goto(`/jobs/${job.id}`)}
                              tabindex="0"
                              role="button"
                              aria-label="View job {job.jobNumber}"
                            >
                              <div class="text-xs font-bold {getStatusStyle(job.status).textClass} mr-2">{job.jobNumber}</div>
                              <div class="text-xs {getStatusStyle(job.status).textClass} truncate flex-grow">{job.title || 'Untitled Job'}</div>
                              <div class="text-xs {getStatusStyle(job.status).textClass} opacity-75">
                                {job.status}
                              </div>
                            </div>
                          </div>
                        {/each}
                      </div>
                    {:else}
                      <div class="h-full flex items-center justify-center text-gray-400 text-sm">
                        No jobs scheduled
                      </div>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
          
          <!-- Empty state row when no technicians have jobs on this date -->
          {#if technicianJobs.length > 0 && technicianJobs.every(tech => !tech.dates[0].jobs || tech.dates[0].jobs.length === 0)}
            <tr>
              <td colspan="2" class="px-6 py-8 text-center text-gray-500">
                No jobs scheduled for this date.
              </td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>
  <!-- Weekly View (Grid) -->
  {:else}
    <div class="overflow-x-auto border rounded-lg">
      <table class="min-w-full border-collapse">
        <thead>
          <tr class="bg-gray-50">
            <!-- Header for technician column -->
            <th class="tech-column px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r">
              Technician
            </th>
            
            <!-- Headers for date columns -->
            {#each dateRange as date}
              <th class="header-square px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                {formatDate(date)}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <!-- Show loading state when technicians are not loaded yet -->
          {#if technicians.length === 0}
            {#each Array(3) as _, i}
              <tr>
                <td class="px-2 py-2 whitespace-nowrap border-r bg-gray-50 tech-column">
                  <div class="h-6 bg-gray-200 rounded animate-pulse"></div>
                </td>
                {#each dateRange as _, j}
                  <td class="px-2 py-2 cell-square border-r border-dashed border-gray-100">
                  </td>
                {/each}
              </tr>
            {/each}
          {:else}
            <!-- Render rows for each technician -->
            {#each technicianJobs as row}
              <tr>
                <td class="px-2 py-2 whitespace-nowrap border-r bg-gray-50 tech-column">
                  <div class="text-sm font-medium text-gray-900 truncate">{row.technician.firstName} {row.technician.lastName}</div>
                </td>
                
                <!-- Render cells for each date -->
                {#each row.dates as dateData}
                  <td class="cell-square border-r border-dashed border-gray-100 align-top overflow-hidden">
                    <div class="h-full w-full">
                      {#if dateData.jobs && dateData.jobs.length > 0}
                        {#if dateData.jobs.length === 1}
                          <!-- Single job fills the whole cell -->
                          <div class="gantt-card-wrapper">
                            <GanttJobCard job={dateData.jobs[0]} />
                          </div>
                        {:else}
                          <!-- Multiple jobs in a cell get split into a grid -->
                          <div class="grid grid-cols-{Math.min(2, dateData.jobs.length)} grid-rows-{Math.ceil(dateData.jobs.length/2)} gap-1 h-full">
                            {#each dateData.jobs as job}
                              <div class="gantt-card-wrapper">
                                <GanttJobCard {job} />
                              </div>
                            {/each}
                          </div>
                        {/if}
                      {/if}
                    </div>
                  </td>
                {/each}
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
    
    <!-- Empty state for weekly view -->
    {#if technicians.length > 0 && jobs.length > 0 && technicianJobs.every(row => row.dates.every(d => !d.jobs || d.jobs.length === 0))}
      <div class="mt-4 p-4 bg-gray-50 rounded-md text-center">
        <p class="text-gray-600">No jobs are scheduled for this date range. Try selecting a different range or check job scheduling.</p>
      </div>
    {/if}
  {/if}
</div>
