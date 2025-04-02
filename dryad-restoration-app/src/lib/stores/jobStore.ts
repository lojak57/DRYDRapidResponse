import { writable, derived, get } from 'svelte/store';
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

// New store for technician job categorization
const _techJobCategorization = derived(
  [_jobs, currentUser],
  ([$jobs, $currentUser]) => {
    if (!$currentUser || $currentUser.role !== Role.TECH) {
      return {
        unscheduledJobs: [],
        scheduledJobs: [],
        completedJobs: [],
        allAssignedJobs: []
      };
    }
    
    // Filter for jobs assigned to this technician
    const techJobs = $jobs.filter(job => 
      job.assignedUserIds?.includes($currentUser.id)
    );
    
    // Unscheduled jobs (NEW status)
    const unscheduledJobs = techJobs.filter(job => 
      job.status === JobStatus.NEW
    );
    
    // Scheduled jobs (SCHEDULED or IN_PROGRESS)
    const scheduledJobs = techJobs.filter(job => 
      job.status === JobStatus.SCHEDULED || 
      job.status === JobStatus.IN_PROGRESS
    );
    
    // Completed jobs from technician perspective
    // (PENDING_COMPLETION and beyond - technician has done their part)
    const completedJobs = techJobs.filter(job => 
      job.status === JobStatus.PENDING_COMPLETION || 
      job.status === JobStatus.COMPLETED ||
      job.status === JobStatus.INVOICE_APPROVAL ||
      job.status === JobStatus.INVOICED ||
      job.status === JobStatus.PAID
    );
    
    return {
      unscheduledJobs,
      scheduledJobs,
      completedJobs,
      allAssignedJobs: techJobs
    };
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
      unscheduled: 0,
      scheduled: 0,
      completed: 0,
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
      
      // New counts for technician categories
      counts.unscheduled = userJobs.filter(job => 
        job.status === JobStatus.NEW
      ).length;
      
      counts.scheduled = userJobs.filter(job => 
        job.status === JobStatus.SCHEDULED || 
        job.status === JobStatus.IN_PROGRESS
      ).length;
      
      counts.completed = userJobs.filter(job => 
        job.status === JobStatus.PENDING_COMPLETION || 
        job.status === JobStatus.COMPLETED ||
        job.status === JobStatus.INVOICE_APPROVAL ||
        job.status === JobStatus.INVOICED ||
        job.status === JobStatus.PAID
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
    console.error('Error loading job by ID:', err);
    _error.set(err instanceof Error ? err.message : 'An error occurred loading the job');
    return undefined;
  } finally {
    _isLoading.set(false);
  }
}

/**
 * Load jobs for a specific customer
 */
async function loadJobsByCustomerId(customerId: string): Promise<Job[]> {
  _isLoading.set(true);
  _error.set(null);
  
  try {
    const customerJobs = await jobService.getJobsByCustomer(customerId);
    
    // Update the jobs store with these jobs
    _jobs.update(currentJobs => {
      // Create a copy of current jobs
      const updatedJobs = [...currentJobs];
      
      // For each customer job, either replace existing or add new
      customerJobs.forEach((job: Job) => {
        const existingJobIndex = updatedJobs.findIndex(j => j.id === job.id);
        
        if (existingJobIndex >= 0) {
          updatedJobs[existingJobIndex] = job;
        } else {
          updatedJobs.push(job);
        }
      });
      
      return updatedJobs;
    });
    
    return customerJobs;
  } catch (err) {
    console.error('Error loading jobs by customer ID:', err);
    _error.set(err instanceof Error ? err.message : 'An error occurred loading customer jobs');
    return [];
  } finally {
    _isLoading.set(false);
  }
}

// Export public stores
export const jobs = _jobs;
export const filteredJobs = _filteredJobs;
export const dashboardJobs = _dashboardJobs;
export const jobStatusCounts = _jobStatusCounts;
export const userJobCounts = _userJobCounts;
export const techJobCategorization = _techJobCategorization;
export const isLoading = _isLoading;
export const error = _error;

// Export functions
export { loadJobs, loadJobById, loadJobsByCustomerId }; 