import { writable, derived } from 'svelte/store';
import type { Job } from '$lib/types/Job';
import { JobStatus } from '$lib/types/Job';
import * as jobService from '$lib/services/jobs';
import { currentUser } from '$lib/stores/authStore';
import { Role } from '$lib/types/User';

// Create the internal stores
const _jobs = writable<Job[]>([]);
const _isLoading = writable(false);
const _error = writable<string | null>(null);
const _statusFilter = writable<JobStatus | null>(null);
const _customerFilter = writable<string | null>(null);
const _technicianFilter = writable<string | null>(null);
const _searchQuery = writable<string>('');

// Export the internal writable stores for direct updates from services
export { _jobs, _isLoading, _error };

// Create derived stores
const _filteredJobs = derived(
  [_jobs, _statusFilter, _customerFilter, _technicianFilter, _searchQuery],
  ([$jobs, $statusFilter, $customerFilter, $technicianFilter, $searchQuery]) => {
    let result = [...$jobs];

    // Apply status filter if set
    if ($statusFilter) {
      result = result.filter(job => job.status === $statusFilter);
    }

    // Apply customer filter if set
    if ($customerFilter) {
      result = result.filter(job => job.customerId === $customerFilter);
    }

    // Apply technician filter if set
    if ($technicianFilter) {
      result = result.filter(job => job.assignedUserIds.includes($technicianFilter));
    }

    // Apply search filter if set
    if ($searchQuery.trim()) {
      const query = $searchQuery.toLowerCase();
      result = result.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.jobNumber.toLowerCase().includes(query)
      );
    }

    return result;
  }
);

// Dashboard jobs with role-specific filtering
const _dashboardJobs = derived(
  [_jobs, currentUser],
  ([$jobs, $currentUser]) => {
    if (!$currentUser) return []; // No user, no jobs
    
    let result = [...$jobs];
    
    // Role-specific filtering
    if ($currentUser.role === Role.TECH) {
      // Technicians see only jobs assigned to them
      result = result.filter(job => 
        job.assignedUserIds?.includes($currentUser.id)
      );
    } else {
      // Office/Admin users see non-completed jobs (more actionable view)
      result = result.filter(job => 
        job.status !== JobStatus.COMPLETED && 
        job.status !== JobStatus.CANCELLED
      );
    }
    
    // Sort by creation date descending (newest first)
    result.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return result;
  }
);

// Count of jobs by status
const _jobStatusCounts = derived(_jobs, $jobs => {
  const counts: Record<JobStatus, number> & { total: number } = {
    [JobStatus.NEW]: 0,
    [JobStatus.SCHEDULED]: 0,
    [JobStatus.IN_PROGRESS]: 0,
    [JobStatus.ON_HOLD]: 0,
    [JobStatus.PENDING_COMPLETION]: 0,
    [JobStatus.COMPLETED]: 0,
    [JobStatus.INVOICE_APPROVAL]: 0,
    [JobStatus.INVOICED]: 0,
    [JobStatus.PAID]: 0,
    [JobStatus.CANCELLED]: 0,
    total: $jobs.length
  };

  $jobs.forEach(job => {
    if (job.status in counts) {
      counts[job.status]++;
    }
  });

  return counts;
});

// Count of jobs specific to the current user's role
const _userJobCounts = derived(
  [_jobs, currentUser],
  ([$jobs, $currentUser]) => {
    const counts = {
      assigned: 0,
      active: 0,
      total: 0
    };
    
    if (!$currentUser) return counts;
    
    // For technicians: assigned jobs to them
    if ($currentUser.role === Role.TECH) {
      const userJobs = $jobs.filter(job => 
        job.assignedUserIds?.includes($currentUser.id)
      );
      
      counts.assigned = userJobs.length;
      counts.active = userJobs.filter(job => 
        job.status === JobStatus.IN_PROGRESS || 
        job.status === JobStatus.SCHEDULED
      ).length;
      counts.total = userJobs.length;
    } else {
      // For admin/office: all jobs
      counts.assigned = $jobs.filter(job => job.assignedUserIds?.length > 0).length;
      counts.active = $jobs.filter(job => 
        job.status === JobStatus.IN_PROGRESS || 
        job.status === JobStatus.SCHEDULED
      ).length;
      counts.total = $jobs.length;
    }
    
    return counts;
  }
);

/**
 * Load all jobs into the store
 */
async function loadJobs(): Promise<void> {
  console.log('Loading fresh jobs data at', new Date().toISOString());
  _isLoading.set(true);
  _error.set(null);
  
  try {
    const allJobs = await jobService.getJobs();
    console.log('Jobs loaded:', allJobs.length, 'jobs');
    if (allJobs.length > 0) {
      console.log('First job title:', allJobs[0].title);
    }
    _jobs.set(allJobs);
  } catch (err) {
    console.error('Error loading jobs:', err);
    _error.set(err instanceof Error ? err.message : 'An error occurred loading jobs');
  } finally {
    _isLoading.set(false);
  }
}

/**
 * Load a specific job by ID and add it to the store if not already present
 */
async function loadJobById(id: string): Promise<Job | undefined> {
  _isLoading.set(true);
  _error.set(null);
  
  try {
    const job = await jobService.getJobById(id);
    
    if (job) {
      // Update the jobs store with this job
      _jobs.update(currentJobs => {
        // Find if this job already exists in the store
        const existingJobIndex = currentJobs.findIndex(j => j.id === id);
        
        if (existingJobIndex >= 0) {
          // Replace the existing job with the updated one
          const updatedJobs = [...currentJobs];
          updatedJobs[existingJobIndex] = job;
          return updatedJobs;
        } else {
          // Add the new job to the store
          return [...currentJobs, job];
        }
      });
    }
    
    return job;
  } catch (err) {
    console.error(`Error loading job ${id}:`, err);
    _error.set(err instanceof Error ? err.message : `An error occurred loading job ${id}`);
    return undefined;
  } finally {
    _isLoading.set(false);
  }
}

/**
 * Reset all filters to their default state
 */
function resetFilters(): void {
  _statusFilter.set(null);
  _customerFilter.set(null);
  _technicianFilter.set(null);
  _searchQuery.set('');
}

// Expose the jobs store directly for more flexibility
export const jobs = {
  subscribe: _jobs.subscribe
};

// Export the jobStore with a subscribe method and all its properties
export const jobStore = {
  // Expose the stores with their subscribe methods
  subscribe: _jobs.subscribe,
  isLoading: { subscribe: _isLoading.subscribe },
  error: { subscribe: _error.subscribe },
  statusFilter: { 
    subscribe: _statusFilter.subscribe,
    set: _statusFilter.set 
  },
  customerFilter: { 
    subscribe: _customerFilter.subscribe,
    set: _customerFilter.set 
  },
  technicianFilter: { 
    subscribe: _technicianFilter.subscribe,
    set: _technicianFilter.set 
  },
  searchQuery: { 
    subscribe: _searchQuery.subscribe,
    set: _searchQuery.set 
  },
  
  // Derived stores
  filteredJobs: { subscribe: _filteredJobs.subscribe },
  dashboardJobs: { subscribe: _dashboardJobs.subscribe },
  jobStatusCounts: { subscribe: _jobStatusCounts.subscribe },
  userJobCounts: { subscribe: _userJobCounts.subscribe },
  
  // Methods
  loadJobs,
  loadJobById,
  resetFilters
};

// Export individual stores and functions for direct import
export const isLoading = { subscribe: _isLoading.subscribe };
export const error = { subscribe: _error.subscribe };
export const filteredJobs = { subscribe: _filteredJobs.subscribe };
export const dashboardJobs = { subscribe: _dashboardJobs.subscribe };
export const jobStatusCounts = { subscribe: _jobStatusCounts.subscribe };
export const userJobCounts = { subscribe: _userJobCounts.subscribe };

export { loadJobs, loadJobById, resetFilters }; 