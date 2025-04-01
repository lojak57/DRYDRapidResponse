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
    let scrollY = 0;
    let innerHeight = 0;
    
    // Images for parallax effect
    const backgroundImages = [
        '/images/construction-site.jpg',
        '/images/restoration-work.jpg',
        '/images/flood-damage.jpg'
    ];
    
    let currentBgIndex = 0;
    
    // For debugging
    let backgroundImageUrl = '';
    
    // Load data when the component mounts
    onMount(async () => {
        if (browser) {
            console.log('Layout mounted, checking background images...');
            
            // Check if images exist and log their URLs
            backgroundImages.forEach((img, index) => {
                const fullUrl = window.location.origin + img;
                console.log(`Background image ${index}: ${fullUrl}`);
                
                // Test if the image loads
                const testImg = new Image();
                testImg.onload = () => console.log(`Image ${index} loaded successfully`);
                testImg.onerror = () => console.error(`Failed to load image ${index}: ${fullUrl}`);
                testImg.src = fullUrl;
            });
            
            // Set initial background
            updateBackgroundImage();
            
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
    
    // Update background image based on scroll position
    function updateBackgroundImage() {
        if (scrollY && innerHeight && document.body) {
            const scrollPercentage = scrollY / (document.body.scrollHeight - innerHeight);
            const newIndex = Math.min(
                backgroundImages.length - 1,
                Math.floor(scrollPercentage * backgroundImages.length)
            );
            
            if (newIndex !== currentBgIndex) {
                console.log(`Changing background to image ${newIndex}: ${backgroundImages[newIndex]}`);
                currentBgIndex = newIndex;
            }
            
            backgroundImageUrl = `url('${backgroundImages[currentBgIndex]}')`;
        } else {
            backgroundImageUrl = `url('${backgroundImages[0]}')`;
        }
    }
    
    // Watch for scroll position changes
    $: {
        if (browser && loaded) {
            updateBackgroundImage();
        }
    }
</script>

<svelte:window bind:scrollY bind:innerHeight on:scroll={() => updateBackgroundImage()} />

<!-- Notification toasts -->
<ToastContainer />

<div class="app">
    {#if loaded}
        <div 
            class="background-container fixed inset-0 z-[-1] transition-opacity duration-1000"
            style="background-image: {backgroundImageUrl}; 
                   background-size: cover; 
                   background-position: center; 
                   background-attachment: fixed;
                   background-repeat: no-repeat;"
        ></div>
        
        <div class="overlay fixed inset-0 z-[-1] bg-white/75 backdrop-blur-sm"></div>
        
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
        transition: opacity 1s ease;
    }
    
    :global(body) {
        background-color: #f7f9fc;
        margin: 0;
        padding: 0;
    }
</style> 