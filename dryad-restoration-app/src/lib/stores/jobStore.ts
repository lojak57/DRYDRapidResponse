import { writable, derived } from 'svelte/store';
import type { Job } from '$lib/types/Job';
import { JobStatus } from '$lib/types/Job';
import * as jobService from '$lib/services/jobs';
import { currentUser } from '$lib/stores/authStore';
import { Role } from '$lib/types/User';

// Main jobs store
export const jobs = writable<Job[]>([]);

// UI state stores
export const isLoading = writable(false);
export const error = writable<string | null>(null);

// Filter stores
export const statusFilter = writable<JobStatus | null>(null);
export const customerFilter = writable<string | null>(null);
export const technicianFilter = writable<string | null>(null);
export const searchQuery = writable<string>('');

// Derived store for filtered jobs
export const filteredJobs = derived(
  [jobs, statusFilter, customerFilter, technicianFilter, searchQuery],
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

// Derived store for dashboard jobs - role-specific filtering
export const dashboardJobs = derived(
  [jobs, currentUser],
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
export const jobStatusCounts = derived(jobs, $jobs => {
  const counts = {
    [JobStatus.NEW]: 0,
    [JobStatus.SCHEDULED]: 0,
    [JobStatus.IN_PROGRESS]: 0,
    [JobStatus.ON_HOLD]: 0,
    [JobStatus.COMPLETED]: 0,
    [JobStatus.INVOICED]: 0,
    [JobStatus.PAID]: 0,
    [JobStatus.CANCELLED]: 0,
    total: $jobs.length
  };

  $jobs.forEach(job => {
    if (counts[job.status] !== undefined) {
      counts[job.status]++;
    }
  });

  return counts;
});

// Count of jobs specific to the current user's role
export const userJobCounts = derived(
  [jobs, currentUser],
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
export async function loadJobs(): Promise<void> {
  isLoading.set(true);
  error.set(null);
  
  try {
    const allJobs = await jobService.getJobs();
    jobs.set(allJobs);
  } catch (err) {
    console.error('Error loading jobs:', err);
    error.set(err instanceof Error ? err.message : 'An error occurred loading jobs');
  } finally {
    isLoading.set(false);
  }
}

/**
 * Load a specific job by ID and add it to the store if not already present
 */
export async function loadJobById(id: string): Promise<Job | undefined> {
  isLoading.set(true);
  error.set(null);
  
  try {
    const job = await jobService.getJobById(id);
    
    if (job) {
      // Update the jobs store with this job
      jobs.update(currentJobs => {
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
    error.set(err instanceof Error ? err.message : `An error occurred loading job ${id}`);
    return undefined;
  } finally {
    isLoading.set(false);
  }
}

/**
 * Reset all filters to their default state
 */
export function resetFilters(): void {
  statusFilter.set(null);
  customerFilter.set(null);
  technicianFilter.set(null);
  searchQuery.set('');
}

/**
 * Fetch all jobs
 */
async function fetchJobs(): Promise<void> {
  await loadJobs();
}

// Export a consolidated jobStore object
export const jobStore = {
  jobs,
  isLoading,
  error,
  filteredJobs,
  dashboardJobs,
  jobStatusCounts,
  userJobCounts,
  loadJobs,
  loadJobById,
  resetFilters,
  fetchJobs,
  get loading() { return isLoading }
}; 