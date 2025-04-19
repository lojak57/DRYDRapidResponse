import mockJobs from '$lib/mock/jobs.json';
import type { Job } from '$lib/types/Job';
import { JobStatus, type JobType, type CompletionTasks } from '$lib/types/Job';
import { getCustomers } from '$lib/services/customers';
import { customers } from '$lib/stores/customerStore';
import { get } from 'svelte/store';
import { jobs } from '$lib/stores/jobStore';

// Simulate API delay (between 100-500ms)
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 100));

/**
 * Convert ISO date strings to Date objects
 */
function parseJobDates(job: any): Job {
  // Create a copy and convert date strings to Date objects
  const parsedJob = { ...job };
  
  if (typeof parsedJob.incidentDate === 'string') {
    parsedJob.incidentDate = new Date(parsedJob.incidentDate);
  }
  
  if (typeof parsedJob.createdAt === 'string') {
    parsedJob.createdAt = new Date(parsedJob.createdAt);
  }
  
  if (typeof parsedJob.scheduledStartDate === 'string') {
    parsedJob.scheduledStartDate = new Date(parsedJob.scheduledStartDate);
  }
  
  if (typeof parsedJob.estimatedCompletionDate === 'string') {
    parsedJob.estimatedCompletionDate = new Date(parsedJob.estimatedCompletionDate);
  }
  
  if (typeof parsedJob.completedDate === 'string') {
    parsedJob.completedDate = new Date(parsedJob.completedDate);
  }
  
  return parsedJob as Job;
}

/**
 * Get all jobs with optional filtering
 * @returns Promise resolving to an array of Job objects
 */
export async function getJobs(): Promise<Job[]> {
  await simulateDelay();
  return (mockJobs as any[]).map(job => parseJobDates(job));
}

/**
 * Get a specific job by its ID
 * @param id The job ID to look for
 * @returns Promise resolving to a Job object or undefined if not found
 */
export async function getJobById(id: string): Promise<Job | undefined> {
  await simulateDelay();
  const job = (mockJobs as any[]).find(job => job.id === id);
  return job ? parseJobDates(job) : undefined;
}

/**
 * Get jobs for a specific customer
 * @param customerId The customer ID to filter by
 * @returns Promise resolving to an array of Job objects
 */
export async function getJobsByCustomer(customerId: string): Promise<Job[]> {
  await simulateDelay();
  const jobs = (mockJobs as any[]).filter(job => job.customerId === customerId);
  return jobs.map(job => parseJobDates(job));
}

/**
 * Get jobs assigned to a specific technician
 * @param userId The technician's user ID
 * @returns Promise resolving to an array of Job objects
 */
export async function getJobsByTechnician(userId: string): Promise<Job[]> {
  await simulateDelay();
  const jobs = (mockJobs as any[]).filter(job => job.assignedUserIds.includes(userId));
  return jobs.map(job => parseJobDates(job));
}

/**
 * Get jobs filtered by status
 * @param status The job status to filter by
 * @returns Promise resolving to an array of Job objects
 */
export async function getJobsByStatus(status: JobStatus): Promise<Job[]> {
  await simulateDelay();
  const jobs = (mockJobs as any[]).filter(job => job.status === status);
  return jobs.map(job => parseJobDates(job));
}

/**
 * Update a job's status
 * @param jobId The ID of the job to update
 * @param status The new job status
 * @returns Promise resolving to the updated job
 */
export async function updateJobStatus(jobId: string, status: JobStatus): Promise<Job | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Find the job in the mock data
  const jobsData = get(jobs);
  const jobIndex = jobsData.findIndex(job => job.id === jobId);
  
  if (jobIndex === -1) {
    console.error(`Job with ID ${jobId} not found.`);
    return null;
  }
  
  // Create updated job with new status
  const updatedJob = {
    ...jobsData[jobIndex],
    status,
    // If setting to completed, set completion date
    ...(status === JobStatus.COMPLETED ? { completedDate: new Date() } : {})
  };
  
  // Update in the mock data
  const mockIndex = (mockJobs as any[]).findIndex(job => job.id === jobId);
  if (mockIndex !== -1) {
    (mockJobs as any[])[mockIndex] = {
      ...(mockJobs as any[])[mockIndex],
      status,
      ...(status === JobStatus.COMPLETED ? { completedDate: new Date().toISOString() } : {})
    };
  }
  
  // Update the store
  jobs.update(currentJobs => {
    const newJobs = [...currentJobs];
    newJobs[jobIndex] = updatedJob;
    return newJobs;
  });
  
  // Return a copy of the updated job
  return JSON.parse(JSON.stringify(updatedJob));
}

/**
 * Create a new job with the provided job data
 * @param jobData The data for the new job
 * @returns The newly created job
 */
export async function createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'status' | 'jobNumber' | 'equipmentIds'>): Promise<Job> {
  // Simulate API delay
  await simulateDelay();
  
  // Validate customer ID exists
  const customers = await getCustomers();
  const customerExists = customers.some(customer => customer.id === jobData.customerId);
  if (!customerExists) {
    throw new Error(`Customer with ID ${jobData.customerId} not found`);
  }
  
  // Generate a unique job ID
  const jobId = `job-${Date.now()}`;
  
  // Generate a job number
  const jobNumber = `J-${new Date().getFullYear()}-${String(mockJobs.length + 1).padStart(3, '0')}`;
  
  // Create the new job object
  const newJob = {
    ...jobData,
    id: jobId,
    jobNumber,
    status: JobStatus.NEW,
    createdAt: new Date().toISOString(),
    equipmentIds: [],
    completedDate: null,
    completionTasks: {
      finalReadingsLogged: false,
      afterPhotosTaken: false,
      allEquipmentRemoved: false
    }
  };
  
  // Add the new job to the mock data
  (mockJobs as any[]).unshift(newJob);
  
  // Also update the store directly to ensure it's visible immediately
  const parsedJob = parseJobDates(newJob);
  jobs.update(currentJobs => [parsedJob, ...currentJobs]);
  
  // Return the new job with dates parsed
  return parsedJob;
}

/**
 * Update a job
 */
export async function updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const index = (mockJobs as any[]).findIndex(job => job.id === id);
  if (index === -1) return null;
  
  // Update the job
  (mockJobs as any[])[index] = {
    ...(mockJobs as any[])[index],
    ...updates
  };
  
  return parseJobDates((mockJobs as any[])[index]);
}

/**
 * Update a job's completion task
 * @param jobId The ID of the job to update
 * @param taskKey The key of the completion task to update
 * @param value The new value for the task
 * @returns Promise resolving to the updated job
 */
export async function updateJobCompletionTask(
  jobId: string, 
  taskKey: keyof CompletionTasks, 
  value: boolean
): Promise<Job | null> {
  // Simulate API delay
  await simulateDelay();
  
  // Find the job in our data
  const jobsData = get(jobs);
  const jobIndex = jobsData.findIndex(job => job.id === jobId);
  
  if (jobIndex === -1) {
    console.error(`Job with ID ${jobId} not found.`);
    return null;
  }
  
  const job = jobsData[jobIndex];
  
  // If completionTasks doesn't exist yet, initialize it
  if (!job.completionTasks) {
    job.completionTasks = {
      finalReadingsLogged: false,
      afterPhotosTaken: false,
      allEquipmentRemoved: false
    };
  }
  
  // Create updated job with the updated task
  const updatedJob = {
    ...job,
    completionTasks: {
      ...job.completionTasks,
      [taskKey]: value
    }
  };
  
  // Update in the mock data
  const mockIndex = (mockJobs as any[]).findIndex(job => job.id === jobId);
  if (mockIndex !== -1) {
    if (!(mockJobs as any[])[mockIndex].completionTasks) {
      (mockJobs as any[])[mockIndex].completionTasks = {
        finalReadingsLogged: false,
        afterPhotosTaken: false,
        allEquipmentRemoved: false
      };
    }
    
    (mockJobs as any[])[mockIndex].completionTasks[taskKey] = value;
  }
  
  // Update the store
  jobs.update(currentJobs => {
    const newJobs = [...currentJobs];
    newJobs[jobIndex] = updatedJob;
    return newJobs;
  });
  
  // Return a copy of the updated job
  return JSON.parse(JSON.stringify(updatedJob));
}

/**
 * Generate a claim narrative based on job details
 * @param jobId The ID of the job to generate narrative for
 * @returns Promise resolving to the generated narrative text
 */
export async function generateClaimNarrative(jobId: string): Promise<string> {
  // Simulate API delay
  await simulateDelay();
  
  // Get the job to access its details
  const job = await getJobById(jobId);
  if (!job) {
    throw new Error(`Job with ID ${jobId} not found`);
  }
  
  // In a real app, you would call an AI endpoint here
  // For the demo, we'll generate a simple template-based narrative
  const narrative = `INSURANCE CLAIM NARRATIVE

Claim #: ${job.insuranceInfo?.claimNumber || 'PENDING'}
Date of Loss: ${job.incidentDate ? new Date(job.incidentDate).toLocaleDateString() : 'Unknown'}
Type of Loss: ${job.jobType}

PROPERTY DETAILS:
Location: ${job.siteAddress.street}, ${job.siteAddress.city}, ${job.siteAddress.state} ${job.siteAddress.zip}

LOSS DESCRIPTION:
${job.description}

SCOPE OF WORK:
Dryad Restoration was engaged to perform emergency water mitigation services at the above property.
Technicians arrived on site on ${job.scheduledStartDate ? new Date(job.scheduledStartDate).toLocaleDateString() : '[Date]'} and
performed the following services:

1. Comprehensive moisture detection and documentation
2. Strategic placement of drying equipment
3. Daily monitoring of moisture levels
4. Professional removal and disposal of unsalvageable materials
5. Complete structural drying to industry standards

The property has been restored to a pre-loss condition with respect to moisture levels. All
affected areas have been properly dried and sanitized according to IICRC S500 guidelines.

This narrative was automatically generated on ${new Date().toLocaleDateString()} by Dryad Restoration's
system based on documented job activities.`;
  
  // Update the job with the narrative
  await updateJob(jobId, { claimNarrative: narrative });
  
  return narrative;
}

/**
 * Build and package insurance documentation
 * @param jobId The ID of the job to build package for
 * @returns Promise resolving to the URL for the package
 */
export async function buildInsurancePackage(jobId: string): Promise<string> {
  // Simulate API delay for package generation
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Get the job
  const job = await getJobById(jobId);
  if (!job) {
    throw new Error(`Job with ID ${jobId} not found`);
  }
  
  // In a real app, this would call a server endpoint to generate and zip documents
  // For demo purposes, just generate a mock URL
  const timestamp = new Date().getTime();
  const packageUrl = `/api/storage/insurance/package_${jobId}_${timestamp}.zip`;
  
  // Update the job with the package URL
  await updateJob(jobId, { insurancePackageUrl: packageUrl });
  
  return packageUrl;
}