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
    let backgroundLoaded = false;
    let absoluteBackgroundUrl = '';
    
    // Load data when the component mounts
    onMount(async () => {
        if (browser) {
            console.log('Layout mounted, checking background image...');
            
            // Fix the URL construction - make sure to use the full pathname
            absoluteBackgroundUrl = window.location.origin + backgroundImage;
            console.log('Using background image URL:', absoluteBackgroundUrl);
            
            // Test if the image loads
            const testImg = new Image();
            testImg.onload = () => {
                console.log('Background image loaded successfully');
                backgroundLoaded = true;
            };
            testImg.onerror = (e) => {
                console.error('Failed to load background image', e);
                // Log the full URL to help debug
                console.error('Attempted to load:', absoluteBackgroundUrl);
            };
            testImg.src = absoluteBackgroundUrl;
            
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
        <!-- Directly set the background image style property -->
        <div 
            class="background-container"
            style="background-image: url('{backgroundImage}');"
        ></div>
        
        <!-- Overlay with reduced opacity for better visibility -->
        <div class="overlay"></div>
        
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
        position: relative;
    }
    
    .background-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-size: cover;
        background-position: center;
        z-index: -2;
        transition: opacity 0.5s ease;
    }
    
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.3);
        z-index: -1;
    }
    
    :global(body) {
        background-color: transparent !important;
        margin: 0;
        padding: 0;
    }
</style> 