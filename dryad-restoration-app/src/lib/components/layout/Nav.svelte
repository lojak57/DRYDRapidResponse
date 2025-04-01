<!-- Basic Navigation Placeholder -->
<script lang="ts">
  import UserSwitcher from '$lib/components/common/UserSwitcher.svelte';
  import Logo from '$lib/components/common/Logo.svelte';
  import { currentUser, switchUser } from '$lib/stores/authStore';
  import { page } from '$app/stores';
  import { Role } from '$lib/types/User';
  import { getFullName } from '$lib/types/User';
  import mockUsers from '$lib/mock/users.json';
  import { onMount } from 'svelte';
  
  let sidebarOpen = false;
  
  // Track if a link is active based on the current path
  function isActive(path: string): boolean {
    return $page.url.pathname.startsWith(path);
  }
  
  // Prepare users for dropdown
  let availableUsers: any[] = [];
  
  onMount(() => {
    // Group users by role for the dropdown
    availableUsers = (mockUsers as any[])
      .filter(user => user.isActive)
      .sort((a, b) => {
        // Sort by role (ADMIN first, then OFFICE, then TECH)
        const roleOrder = { 'ADMIN': 1, 'OFFICE': 2, 'TECH': 3, 'TECHNICIAN': 3, 'CUSTOMER': 4 };
        const roleA = roleOrder[a.role] || 999;
        const roleB = roleOrder[b.role] || 999;
        
        if (roleA !== roleB) return roleA - roleB;
        
        // Then by name
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      });
  });
  
  // Handle user change
  function handleUserChange(userId: string) {
    switchUser(userId);
  }
</script>

<div class="sticky top-0 z-40 flex-shrink-0 flex h-16 border-b-2 border-dryd-grayblue-dark bg-dryd-gradient shadow-sm">
  <div class="flex-1 px-4 flex justify-between">
    <div class="flex items-center">
      <div class="flex-shrink-0 flex items-center">
        <Logo size="md" linkToDashboard={true} showText={false} />
      </div>
      
      <div class="hidden md:ml-6 md:flex md:items-center md:space-x-2">
        <a href="/dashboard" 
          class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 border-2 {isActive('/dashboard') ? 'bg-white border-white text-dryd-grayblue-dark' : 'bg-transparent border-transparent text-white hover:bg-white/10 hover:border-white/20'}">
          Dashboard
        </a>
        
        <a href="/jobs" 
          class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 border-2 {isActive('/jobs') ? 'bg-white border-white text-dryd-grayblue-dark' : 'bg-transparent border-transparent text-white hover:bg-white/10 hover:border-white/20'}">
          Jobs
        </a>
        
        <a href="/quotes" 
          class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 border-2 {isActive('/quotes') ? 'bg-white border-white text-dryd-grayblue-dark' : 'bg-transparent border-transparent text-white hover:bg-white/10 hover:border-white/20'}">
          Quotes
        </a>
        
        <a href="/customers" 
          class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 border-2 {isActive('/customers') ? 'bg-white border-white text-dryd-grayblue-dark' : 'bg-transparent border-transparent text-white hover:bg-white/10 hover:border-white/20'}">
          Customers
        </a>
        
        {#if $currentUser && ($currentUser.role === Role.ADMIN || $currentUser.role === Role.OFFICE)}
          <a href="/reports" 
            class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 border-2 {isActive('/reports') ? 'bg-white border-white text-dryd-grayblue-dark' : 'bg-transparent border-transparent text-white hover:bg-white/10 hover:border-white/20'}">
            Reports
          </a>
        {/if}
        
        {#if $currentUser && $currentUser.role === Role.ADMIN}
          <a href="/settings" 
            class="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 border-2 {isActive('/settings') ? 'bg-white border-white text-dryd-grayblue-dark' : 'bg-transparent border-transparent text-white hover:bg-white/10 hover:border-white/20'}">
            Settings
          </a>
        {/if}
      </div>
    </div>
    
    <div class="flex items-center">
      <!-- User Switcher (for demo) -->
      <UserSwitcher />
      
      <!-- Mobile menu button -->
      <button 
        type="button" 
        class="md:hidden ml-2 p-2 rounded-md text-white hover:bg-white/10"
        on:click={() => sidebarOpen = !sidebarOpen}
        aria-label="Open main menu"
      >
        <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </div>
</div>

<!-- Mobile menu, show/hide based on menu state -->
{#if sidebarOpen}
  <div class="md:hidden bg-white shadow-lg absolute top-16 left-0 right-0 z-30">
    <div class="pt-4 pb-4 space-y-1 px-2">
      <a href="/dashboard" 
        class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 {isActive('/dashboard') ? 'bg-dryd-gradient text-white' : 'text-gray-700 hover:bg-gray-100'}">
        Dashboard
      </a>
      
      <a href="/jobs" 
        class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 {isActive('/jobs') ? 'bg-dryd-gradient text-white' : 'text-gray-700 hover:bg-gray-100'}">
        Jobs
      </a>
      
      <a href="/quotes" 
        class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 {isActive('/quotes') ? 'bg-dryd-gradient text-white' : 'text-gray-700 hover:bg-gray-100'}">
        Quotes
      </a>
      
      <a href="/customers" 
        class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 {isActive('/customers') ? 'bg-dryd-gradient text-white' : 'text-gray-700 hover:bg-gray-100'}">
        Customers
      </a>
      
      {#if $currentUser && ($currentUser.role === Role.ADMIN || $currentUser.role === Role.OFFICE)}
        <a href="/reports" 
          class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 {isActive('/reports') ? 'bg-dryd-gradient text-white' : 'text-gray-700 hover:bg-gray-100'}">
          Reports
        </a>
      {/if}
      
      {#if $currentUser && $currentUser.role === Role.ADMIN}
        <a href="/settings" 
          class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 {isActive('/settings') ? 'bg-dryd-gradient text-white' : 'text-gray-700 hover:bg-gray-100'}">
          Settings
        </a>
      {/if}
    </div>
  </div>
{/if}

<!-- Add bottom padding for mobile viewport to prevent content from being hidden by navigation -->
<div class="block md:hidden h-16"></div>

<!-- Add a user switcher dropdown to the navigation component -->
<nav class="bg-dryd-blue text-white p-4">
  <div class="container mx-auto flex justify-between items-center">
    <a href="/" class="text-xl font-bold">DRYAD Restoration</a>
    
    {#if $currentUser}
      <div class="flex items-center">
        <!-- User switcher -->
        <div class="mr-4">
          <select 
            class="bg-dryd-blue text-white border border-blue-700 rounded px-2 py-1"
            value={$currentUser.id}
            on:change={(e) => handleUserChange(e.target.value)}
          >
            {#each availableUsers as user}
              <option value={user.id}>
                {user.firstName} {user.lastName} ({user.role})
              </option>
            {/each}
          </select>
        </div>
        
        <!-- User info and logout -->
        <div class="flex items-center">
          <span class="mr-4">
            {#if $currentUser}
              {getFullName($currentUser)} ({$currentUser.role})
            {:else}
              Guest
            {/if}
          </span>
          <a href="/login" class="bg-dryd-orange hover:bg-orange-600 text-white px-4 py-2 rounded">
            {$currentUser ? 'Logout' : 'Login'}
          </a>
        </div>
      </div>
    {/if}
  </div>
</nav> 