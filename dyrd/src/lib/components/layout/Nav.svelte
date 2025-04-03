<!-- Basic Navigation Placeholder -->
<script lang="ts">
  import RoleSwitcher from '$lib/components/common/RoleSwitcher.svelte';
  import Logo from '$lib/components/common/Logo.svelte';
  import { currentUser } from '$lib/stores/authStore';
</script>

<nav class="bg-dryd-gradient text-white shadow-md">
  <div class="container mx-auto py-3 px-4 flex justify-between items-center">
    <div class="flex-shrink-0">
      <Logo />
    </div>

    {#if $currentUser}
      <div class="flex items-center space-x-4">
        <div class="hidden md:flex space-x-4">
          <a href="/dashboard" class="font-medium px-3 py-1.5 rounded-md hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all duration-150 ease-in-out text-white">Dashboard</a>
          <a href="/jobs" class="font-medium px-3 py-1.5 rounded-md hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all duration-150 ease-in-out text-white">Jobs</a>
          <a href="/quotes" class="font-medium px-3 py-1.5 rounded-md hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all duration-150 ease-in-out text-white">Quotes</a>
          <a href="/customers" class="font-medium px-3 py-1.5 rounded-md hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all duration-150 ease-in-out text-white">Customers</a>
          <a href="/equipment" class="font-medium px-3 py-1.5 rounded-md hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all duration-150 ease-in-out text-white">Equipment</a>
        </div>
        
        <div class="flex items-center space-x-4 border-l pl-4 border-white/20">
          <RoleSwitcher />
          <div class="hidden sm:block text-sm font-medium text-white">
            <span>{$currentUser.firstName} {$currentUser.lastName}</span>
            <span class="ml-1 text-xs bg-dryd-burgundy px-2 py-0.5 rounded-full">
              {$currentUser.role}
            </span>
          </div>
        </div>
      </div>
    {/if}
  </div>
</nav> 