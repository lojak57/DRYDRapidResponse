<!-- Layout for authenticated routes -->
<script lang="ts">
    import Nav from '$lib/components/layout/Nav.svelte';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import ToastContainer from '$lib/components/ui/ToastContainer.svelte';
    
    // Import the job store functions and stores
    import { jobs, loadJobs } from '$lib/stores/jobStore';
    import { currentUser, switchUser } from '$lib/stores/authStore';
    
    // Load data when the component mounts
    onMount(async () => {
        if (browser) {
            // Load jobs if not already loaded
            if ($jobs.length === 0) {
                await loadJobs();
            }
            
            // Set a default user if no one is logged in yet
            if (!$currentUser) {
                // Use an office staff user ID from your mock data
                await switchUser('u005'); // Morgan Williams (OFFICE role)
            }
        }
    });
</script>

<!-- Notification toasts -->
<ToastContainer />

<Nav />
<main class="p-4"><slot /></main> 