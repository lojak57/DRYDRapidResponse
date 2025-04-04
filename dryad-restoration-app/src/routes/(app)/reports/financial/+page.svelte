<script lang="ts">
  import { onMount } from 'svelte';
  import { jobStore } from '$lib/stores/jobStore';
  import { formatCurrency, formatDate } from '$lib/utils/formatters';
  import type { Job } from '$lib/types/Job';
  import { JobStatus, JobType } from '$lib/types/Job';
  
  // Filtering options
  let startDate: string = '';
  let endDate: string = '';
  let selectedStatus: string = 'ALL';
  let selectedType: string = 'ALL';
  let isLoading = true;
  
  // Report data
  let filteredJobs: Job[] = [];
  let totalRevenue = 0;
  let totalProfit = 0;
  let averageJobValue = 0;
  
  // Date calculations for preset filters
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
  
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  // Initialize with current month
  startDate = formatDateForInput(firstDayOfMonth);
  endDate = formatDateForInput(lastDayOfMonth);
  
  // Status options for filter
  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    ...Object.values(JobStatus).map(status => ({ value: status, label: status }))
  ];
  
  // Type options for filter
  const typeOptions = [
    { value: 'ALL', label: 'All Types' },
    ...Object.values(JobType).map(type => ({ value: type, label: type }))
  ];
  
  // Date range presets
  const datePresets = [
    { id: 'this-month', label: 'This Month', start: firstDayOfMonth, end: lastDayOfMonth },
    { id: 'last-month', label: 'Last Month', start: new Date(today.getFullYear(), today.getMonth() - 1, 1), end: new Date(today.getFullYear(), today.getMonth(), 0) },
    { id: 'this-year', label: 'This Year', start: firstDayOfYear, end: today },
    { id: 'all-time', label: 'All Time', start: new Date(2000, 0, 1), end: today }
  ];
  
  // Apply date preset
  function applyDatePreset(preset: { start: Date, end: Date }) {
    startDate = formatDateForInput(preset.start);
    endDate = formatDateForInput(preset.end);
    applyFilters();
  }
  
  onMount(async () => {
    await jobStore.loadJobs();
    applyFilters();
    isLoading = false;
  });
  
  // Apply all filters and calculate report data
  function applyFilters() {
    const jobs = $jobStore || [];
    if (!Array.isArray(jobs) || jobs.length === 0) {
      filteredJobs = [];
      calculateReportTotals();
      return;
    }
    
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);
    
    filteredJobs = jobs.filter(job => {
      // Status filter
      if (selectedStatus !== 'ALL' && job.status !== selectedStatus) {
        return false;
      }
      
      // Type filter
      if (selectedType !== 'ALL' && job.type !== selectedType) {
        return false;
      }
      
      // Date filter - use invoiceDate, completedDate, or createdAt in that order of preference
      let jobDate = null;
      if (job.invoiceDate) {
        jobDate = new Date(job.invoiceDate);
      } else if (job.completedDate) {
        jobDate = new Date(job.completedDate);
      } else if (job.createdAt) {
        jobDate = new Date(job.createdAt);
      }
      
      if (jobDate) {
        if (start && jobDate < start) return false;
        if (end && jobDate > end) return false;
      }
      
      return true;
    });
    
    calculateReportTotals();
  }
  
  // Calculate totals based on filtered jobs
  function calculateReportTotals() {
    // Reset totals
    totalRevenue = 0;
    totalProfit = 0;
    
    // Calculate totals from filtered jobs
    filteredJobs.forEach(job => {
      if (job.total) {
        totalRevenue += job.total;
        
        // Calculate profit (if we have cost data)
        const costs = (job.laborCost || 0) + (job.materialsCost || 0) + (job.equipmentCost || 0);
        if (costs > 0) {
          const profit = job.total - costs;
          totalProfit += profit;
        }
      }
    });
    
    // Calculate average job value
    averageJobValue = filteredJobs.length > 0 ? totalRevenue / filteredJobs.length : 0;
  }
  
  // Calculate profit margin percentage
  function calculateProfitMargin(job: Job): number {
    if (!job.total || job.total <= 0) return 0;
    
    const costs = (job.laborCost || 0) + (job.materialsCost || 0) + (job.equipmentCost || 0);
    if (costs <= 0) return 0;
    
    const profit = job.total - costs;
    return (profit / job.total) * 100;
  }
</script>

<svelte:head>
  <title>Financial Reports | DRYAD Restoration</title>
</svelte:head>

<div class="p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Financial Reports</h1>
    
    <div class="flex space-x-2">
      {#each datePresets as preset}
        <button 
          class="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm"
          on:click={() => applyDatePreset(preset)}
        >
          {preset.label}
        </button>
      {/each}
    </div>
  </div>
  
  <!-- Filter Controls -->
  <div class="bg-white p-4 rounded-lg shadow mb-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label for="start-date" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
        <input 
          type="date" 
          id="start-date"
          class="w-full border-gray-300 rounded-md shadow-sm focus:ring-dryd-blue focus:border-dryd-blue"
          bind:value={startDate}
        />
      </div>
      
      <div>
        <label for="end-date" class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
        <input 
          type="date" 
          id="end-date"
          class="w-full border-gray-300 rounded-md shadow-sm focus:ring-dryd-blue focus:border-dryd-blue"
          bind:value={endDate}
        />
      </div>
      
      <div>
        <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-1">Job Status</label>
        <select 
          id="status-filter"
          class="w-full border-gray-300 rounded-md shadow-sm focus:ring-dryd-blue focus:border-dryd-blue"
          bind:value={selectedStatus}
        >
          {#each statusOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
      
      <div>
        <label for="type-filter" class="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
        <select 
          id="type-filter"
          class="w-full border-gray-300 rounded-md shadow-sm focus:ring-dryd-blue focus:border-dryd-blue"
          bind:value={selectedType}
        >
          {#each typeOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
    </div>
    
    <div class="mt-4 flex justify-end">
      <button 
        class="px-4 py-2 bg-dryd-blue text-white rounded-md hover:bg-blue-700 shadow-sm"
        on:click={applyFilters}
      >
        Apply Filters
      </button>
    </div>
  </div>
  
  {#if isLoading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-dryd-blue"></div>
    </div>
  {:else}
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm text-gray-500 mb-1">Total Revenue</h3>
        <p class="text-2xl font-bold text-dryd-blue">{formatCurrency(totalRevenue)}</p>
        <p class="text-sm text-gray-500 mt-2">{filteredJobs.length} jobs</p>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm text-gray-500 mb-1">Total Profit</h3>
        <p class="text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</p>
        <p class="text-sm text-gray-500 mt-2">
          {totalRevenue > 0 ? `${((totalProfit / totalRevenue) * 100).toFixed(1)}% margin` : '0% margin'}
        </p>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm text-gray-500 mb-1">Average Job Value</h3>
        <p class="text-2xl font-bold text-amber-600">{formatCurrency(averageJobValue)}</p>
        <p class="text-sm text-gray-500 mt-2">Per job average</p>
      </div>
    </div>
    
    <!-- Financial Data Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden mb-8">
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-semibold">Financial Report {startDate ? `(${startDate} to ${endDate})` : ''}</h3>
        <p class="text-sm text-gray-500">{filteredJobs.length} jobs found</p>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costs</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#if filteredJobs.length === 0}
              <tr>
                <td colspan="9" class="px-6 py-4 text-center text-gray-400">No jobs match the selected filters</td>
              </tr>
            {:else}
              {#each filteredJobs as job}
                {@const costs = (job.laborCost || 0) + (job.materialsCost || 0) + (job.equipmentCost || 0)}
                {@const profit = job.total ? job.total - costs : 0}
                {@const margin = calculateProfitMargin(job)}
                {@const displayDate = job.invoiceDate || job.completedDate || job.createdAt}
                
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <a href="/jobs/{job.id}" class="text-sm font-medium text-dryd-blue hover:underline">{job.jobNumber}</a>
                    <div class="text-sm text-gray-500">{job.title}</div>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <!-- Customer name would go here -->
                    {job.customerId ? `ID: ${job.customerId}` : 'N/A'}
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.type}
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${job.status === JobStatus.PAID ? 'bg-green-100 text-green-800' : 
                        job.status === JobStatus.INVOICED ? 'bg-amber-100 text-amber-800' : 
                        'bg-blue-100 text-blue-800'}`}>
                      {job.status}
                    </span>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {displayDate ? formatDate(new Date(displayDate)) : 'N/A'}
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {formatCurrency(job.total || 0)}
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(costs)}
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span class={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(profit)}
                    </span>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class={margin >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {margin.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div> 