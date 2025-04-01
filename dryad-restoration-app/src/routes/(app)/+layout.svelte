<!-- Layout for authenticated routes -->
<script lang="ts">
    import Nav from '$lib/components/layout/Nav.svelte';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import ToastContainer from '$lib/components/ui/ToastContainer.svelte';
    import { fade } from 'svelte/transition';
    import { page } from '$app/stores';
    import { currentUser, switchUser } from '$lib/stores/authStore';
    import { users, loadUsers } from '$lib/stores/userStore';
    import { goto } from '$app/navigation';
    import { Role } from '$lib/types/User';
    
    // Import the job store functions and stores
    import { jobs, loadJobs } from '$lib/stores/jobStore';
    
    let loaded = false;
    
    // Single professional background image
    const backgroundImage = '/images/professional-restoration.jpg';
    
    // Load data when the component mounts
    onMount(async () => {
        if (browser) {
            console.log('Layout mounted, checking background image...');
            
            // Test if the image loads
            const testImg = new Image();
            testImg.onload = () => console.log('Background image loaded successfully');
            testImg.onerror = () => console.error('Failed to load background image');
            testImg.src = window.location.origin + backgroundImage;
            
            // Load jobs if not already loaded
            if ($jobs.length === 0) {
                await loadJobs();
            }
            
            // Load users if not already loaded
            if ($users.length === 0) {
                await loadUsers();
            }
            
            // Set a default user if no one is logged in yet
            if (!$currentUser) {
                // Use an office staff user ID from your mock data
                await switchUser('office-01'); // Updated ID
            }
            
            loaded = true;
            
            // Check if user is authenticated
            if (browser && !$currentUser) {
                goto('/login');
            }
        }
    });
</script>

<svelte:window />

<!-- Notification toasts -->
<ToastContainer />

<div class="app">
    {#if loaded}
        <div 
            class="background-container fixed inset-0 z-[-1]"
            style="background-image: url('{backgroundImage}'); 
                   background-size: cover; 
                   background-position: center;"
        ></div>
        
        <!-- Modified overlay with adjusted opacity for readability -->
        <div class="overlay fixed inset-0 z-[-1] bg-white/35"></div>
        
        <div in:fade={{ duration: 500 }} class="flex flex-col h-full">
            {#if $currentUser}
                <Nav />
            {/if}
            <main class="flex-grow container mx-auto px-4 py-2 relative z-10">
                <slot />
            </main>
        </div>
    {/if}
</div>

<style>
    .app {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }
    
    .background-container {
        transition: opacity 0.5s ease;
    }
    
    :global(body) {
        background-color: #f7f9fc;
        margin: 0;
        padding: 0;
    }
</style> 