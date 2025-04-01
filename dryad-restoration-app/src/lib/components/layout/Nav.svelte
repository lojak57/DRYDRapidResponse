<!-- Basic Navigation Placeholder -->
<script lang="ts">
  import { currentUser, switchUser } from '$lib/stores/authStore';
  import { users } from '$lib/stores/userStore';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import type { User } from '$lib/types/User';
  import { Role } from '$lib/types/User';
  import { createEventDispatcher } from 'svelte';
  
  // Create a dispatcher for custom events
  const dispatch = createEventDispatcher();
  
  // User dropdown state
  let isUserDropdownOpen = false;
  let isMobileMenuOpen = false;
  
  // Sort users by role (admin first, then office, then technicians)
  const roleOrder: Record<string, number> = {
    'ADMIN': 1,
    'OFFICE': 2,
    'TECH': 3
  };
  
  $: sortedUsers = $users ? [...$users].sort((a, b) => {
    // First by role
    const roleComparison = roleOrder[a.role] - roleOrder[b.role];
    if (roleComparison !== 0) return roleComparison;
    
    // Then by name
    return a.firstName.localeCompare(b.firstName);
  }) : [];
  
  // Toggle user dropdown
  function toggleUserDropdown() {
    isUserDropdownOpen = !isUserDropdownOpen;
  }
  
  // Close dropdowns when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const userDropdown = document.getElementById('user-dropdown');
    const userButton = document.getElementById('user-menu-button');
    
    if (isUserDropdownOpen && userDropdown && !userDropdown.contains(target) && userButton && !userButton.contains(target)) {
      isUserDropdownOpen = false;
    }
  }
  
  // Handle user switch
  function handleUserSwitch(user: User) {
    switchUser(user.id);
    isUserDropdownOpen = false;
  }
  
  // Toggle mobile menu
  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
  }
  
  onMount(() => {
    // Add click outside listener
    document.addEventListener('click', handleClickOutside);
    
    // Remove event listener on component destroy
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<!-- Top navigation -->
<nav class="app-header">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Logo and main navigation links -->
      <div class="flex items-center">
        <!-- Logo -->
        <a href="/dashboard" class="text-white font-bold text-lg flex items-center">
          <img src="/dryd-logo-white.PNG" alt="DRYD Logo" class="h-8 w-auto mr-2" />
          <span class="hidden sm:inline-block font-bold">DRYD Rapid Response</span>
        </a>
        
        <!-- Desktop Navigation -->
        <div class="hidden md:block ml-8">
          <div class="flex items-center space-x-2">
            <a 
              href="/dashboard" 
              class="nav-link {$page.url.pathname === '/dashboard' ? 'active' : ''}"
              aria-current={$page.url.pathname === '/dashboard' ? 'page' : undefined}
            >
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </span>
            </a>
            
            <a 
              href="/jobs" 
              class="nav-link {$page.url.pathname.startsWith('/jobs') ? 'active' : ''}"
              aria-current={$page.url.pathname.startsWith('/jobs') ? 'page' : undefined}
            >
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Jobs
              </span>
            </a>
            
            <a 
              href="/quotes" 
              class="nav-link {$page.url.pathname.startsWith('/quotes') ? 'active' : ''}"
              aria-current={$page.url.pathname.startsWith('/quotes') ? 'page' : undefined}
            >
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Quotes
              </span>
            </a>
            
            <a 
              href="/customers" 
              class="nav-link {$page.url.pathname.startsWith('/customers') ? 'active' : ''}"
              aria-current={$page.url.pathname.startsWith('/customers') ? 'page' : undefined}
            >
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Customers
              </span>
            </a>
            
            <a 
              href="/reports" 
              class="nav-link {$page.url.pathname.startsWith('/reports') ? 'active' : ''}"
              aria-current={$page.url.pathname.startsWith('/reports') ? 'page' : undefined}
            >
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Reports
              </span>
            </a>
          </div>
        </div>
      </div>
      
      <!-- User menu and mobile menu button -->
      <div class="flex items-center">
        <!-- User menu -->
        {#if $currentUser}
          <div class="relative ml-3">
            <button
              id="user-menu-button"
              type="button"
              class="flex items-center max-w-xs rounded-full text-sm text-white focus:outline-none focus:ring-2 focus:ring-white"
              aria-expanded={isUserDropdownOpen}
              aria-haspopup="true"
              on:click|stopPropagation={toggleUserDropdown}
            >
              <span class="sr-only">Open user menu</span>
              <div class="flex items-center bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full transition-colors">
                <span class="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-semibold mr-2">
                  {$currentUser.firstName.charAt(0)}{$currentUser.lastName.charAt(0)}
                </span>
                <span class="mr-1 font-medium">{$currentUser.firstName} {$currentUser.lastName}</span>
                <svg class="h-4 w-4 {isUserDropdownOpen ? 'transform rotate-180' : ''} transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            
            {#if isUserDropdownOpen}
              <div
                id="user-dropdown"
                class="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
                tabindex="-1"
              >
                <div class="py-1 border-b border-gray-100">
                  <div class="px-4 py-2">
                    <p class="text-sm font-medium text-gray-700">Signed in as</p>
                    <p class="text-sm text-gray-500 truncate">{$currentUser.firstName} {$currentUser.lastName}</p>
                    <div class="mt-1 px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs inline-block">
                      {$currentUser.role}
                    </div>
                  </div>
                </div>
                
                <div class="py-1">
                  <div class="px-4 py-2 border-b border-gray-100">
                    <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Switch user</p>
                  </div>
                  
                  <div class="max-h-64 overflow-y-auto">
                    {#each sortedUsers as user}
                      <button
                        on:click={() => handleUserSwitch(user)}
                        class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center {user.id === $currentUser.id ? 'bg-primary-50' : ''}"
                        role="menuitem"
                        tabindex="-1"
                      >
                        <span class="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-semibold mr-2">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                        <div>
                          <div class="font-medium">{user.firstName} {user.lastName}</div>
                          <div class="text-xs text-gray-500">{user.role}</div>
                        </div>
                        {#if user.id === $currentUser.id}
                          <svg class="h-4 w-4 text-primary-600 ml-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                        {/if}
                      </button>
                    {/each}
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {/if}
        
        <!-- Mobile menu button -->
        <button
          type="button"
          class="md:hidden ml-4 text-white hover:text-primary-300 focus:outline-none"
          aria-controls="mobile-menu"
          aria-expanded={isMobileMenuOpen}
          on:click={toggleMobileMenu}
        >
          <span class="sr-only">Open main menu</span>
          {#if isMobileMenuOpen}
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          {:else}
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          {/if}
        </button>
      </div>
    </div>
  </div>
  
  <!-- Mobile menu -->
  {#if isMobileMenuOpen}
    <div class="md:hidden" id="mobile-menu">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-white/20">
        <a
          href="/dashboard"
          class="block px-3 py-2 rounded-md text-base font-medium text-white {$page.url.pathname === '/dashboard' ? 'bg-white/20' : 'hover:bg-white/10'}"
          aria-current={$page.url.pathname === '/dashboard' ? 'page' : undefined}
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </span>
        </a>
        
        <a
          href="/jobs"
          class="block px-3 py-2 rounded-md text-base font-medium text-white {$page.url.pathname.startsWith('/jobs') ? 'bg-white/20' : 'hover:bg-white/10'}"
          aria-current={$page.url.pathname.startsWith('/jobs') ? 'page' : undefined}
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Jobs
          </span>
        </a>
        
        <a
          href="/quotes"
          class="block px-3 py-2 rounded-md text-base font-medium text-white {$page.url.pathname.startsWith('/quotes') ? 'bg-white/20' : 'hover:bg-white/10'}"
          aria-current={$page.url.pathname.startsWith('/quotes') ? 'page' : undefined}
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Quotes
          </span>
        </a>
        
        <a
          href="/customers"
          class="block px-3 py-2 rounded-md text-base font-medium text-white {$page.url.pathname.startsWith('/customers') ? 'bg-white/20' : 'hover:bg-white/10'}"
          aria-current={$page.url.pathname.startsWith('/customers') ? 'page' : undefined}
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Customers
          </span>
        </a>
        
        <a
          href="/reports"
          class="block px-3 py-2 rounded-md text-base font-medium text-white {$page.url.pathname.startsWith('/reports') ? 'bg-white/20' : 'hover:bg-white/10'}"
          aria-current={$page.url.pathname.startsWith('/reports') ? 'page' : undefined}
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Reports
          </span>
        </a>
      </div>
    </div>
  {/if}
</nav>

<!-- Add bottom padding for mobile viewport to prevent content from being hidden by navigation -->
<div class="block md:hidden h-16"></div> 