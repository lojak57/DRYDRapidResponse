<script lang="ts">
  import { onMount } from 'svelte';
  import { loadUsers } from '$lib/services/users';
  import { loadJobs } from '$lib/services/jobs';
  import { loadCustomers } from '$lib/services/customers';
  import { loadTrucks } from '$lib/services/truckService';
  import { loadScheduleEntries } from '$lib/services/scheduleService';
  
  import { users } from '$lib/stores/userStore';
  import { trucks } from '$lib/stores/truckStore';
  import { scheduleEntries } from '$lib/stores/scheduleStore';
  
  let loadingState = {
    users: { status: 'pending', error: null },
    trucks: { status: 'pending', error: null },
    scheduleEntries: { status: 'pending', error: null },
    jobs: { status: 'pending', error: null },
    customers: { status: 'pending', error: null }
  };
  
  let storeData = {
    users: [],
    trucks: [],
    scheduleEntries: [],
  };
  
  // Subscribe to stores
  const unsubscribeUsers = users.subscribe(value => {
    storeData.users = value;
  });
  
  const unsubscribeTrucks = trucks.subscribe(value => {
    storeData.trucks = value;
  });
  
  const unsubscribeScheduleEntries = scheduleEntries.subscribe(value => {
    storeData.scheduleEntries = value;
  });
  
  // Cleanup subscriptions
  onMount(() => {
    return () => {
      unsubscribeUsers();
      unsubscribeTrucks();
      unsubscribeScheduleEntries();
    };
  });
  
  // Individual load functions
  async function testLoadUsers() {
    loadingState.users.status = 'loading';
    try {
      await loadUsers();
      loadingState.users.status = 'success';
    } catch (error) {
      loadingState.users.status = 'error';
      loadingState.users.error = error instanceof Error ? error.message : 'Unknown error';
    }
  }
  
  async function testLoadTrucks() {
    loadingState.trucks.status = 'loading';
    try {
      await loadTrucks();
      loadingState.trucks.status = 'success';
    } catch (error) {
      loadingState.trucks.status = 'error';
      loadingState.trucks.error = error instanceof Error ? error.message : 'Unknown error';
    }
  }
  
  async function testLoadScheduleEntries() {
    loadingState.scheduleEntries.status = 'loading';
    try {
      await loadScheduleEntries();
      loadingState.scheduleEntries.status = 'success';
    } catch (error) {
      loadingState.scheduleEntries.status = 'error';
      loadingState.scheduleEntries.error = error instanceof Error ? error.message : 'Unknown error';
    }
  }
  
  async function testLoadJobs() {
    loadingState.jobs.status = 'loading';
    try {
      await loadJobs();
      loadingState.jobs.status = 'success';
    } catch (error) {
      loadingState.jobs.status = 'error';
      loadingState.jobs.error = error instanceof Error ? error.message : 'Unknown error';
    }
  }
  
  async function testLoadCustomers() {
    loadingState.customers.status = 'loading';
    try {
      await loadCustomers();
      loadingState.customers.status = 'success';
    } catch (error) {
      loadingState.customers.status = 'error';
      loadingState.customers.error = error instanceof Error ? error.message : 'Unknown error';
    }
  }
</script>

<div class="p-4 max-w-4xl mx-auto">
  <h1 class="text-2xl font-bold mb-6">Store & Service Debug Page</h1>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Users Section -->
    <div class="border p-4 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-2">Users</h2>
      <button 
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2"
        on:click={testLoadUsers}
      >
        Load Users
      </button>
      
      <div class="mb-2">
        Status: <span class={`font-medium ${loadingState.users.status === 'success' ? 'text-green-500' : loadingState.users.status === 'error' ? 'text-red-500' : 'text-yellow-500'}`}>
          {loadingState.users.status}
        </span>
        {#if loadingState.users.error}
          <div class="text-red-500 text-sm">{loadingState.users.error}</div>
        {/if}
      </div>
      
      {#if storeData.users.length > 0}
        <div class="text-sm">
          <div class="font-medium">User Count: {storeData.users.length}</div>
          <div class="mt-2 bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
            <pre class="text-xs">{JSON.stringify(storeData.users[0], null, 2)}</pre>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Trucks Section -->
    <div class="border p-4 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-2">Trucks</h2>
      <button 
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2"
        on:click={testLoadTrucks}
      >
        Load Trucks
      </button>
      
      <div class="mb-2">
        Status: <span class={`font-medium ${loadingState.trucks.status === 'success' ? 'text-green-500' : loadingState.trucks.status === 'error' ? 'text-red-500' : 'text-yellow-500'}`}>
          {loadingState.trucks.status}
        </span>
        {#if loadingState.trucks.error}
          <div class="text-red-500 text-sm">{loadingState.trucks.error}</div>
        {/if}
      </div>
      
      {#if storeData.trucks.length > 0}
        <div class="text-sm">
          <div class="font-medium">Truck Count: {storeData.trucks.length}</div>
          <div class="mt-2 bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
            <pre class="text-xs">{JSON.stringify(storeData.trucks[0], null, 2)}</pre>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Schedule Entries Section -->
    <div class="border p-4 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-2">Schedule Entries</h2>
      <button 
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2"
        on:click={testLoadScheduleEntries}
      >
        Load Schedule Entries
      </button>
      
      <div class="mb-2">
        Status: <span class={`font-medium ${loadingState.scheduleEntries.status === 'success' ? 'text-green-500' : loadingState.scheduleEntries.status === 'error' ? 'text-red-500' : 'text-yellow-500'}`}>
          {loadingState.scheduleEntries.status}
        </span>
        {#if loadingState.scheduleEntries.error}
          <div class="text-red-500 text-sm">{loadingState.scheduleEntries.error}</div>
        {/if}
      </div>
      
      {#if storeData.scheduleEntries.length > 0}
        <div class="text-sm">
          <div class="font-medium">Schedule Entry Count: {storeData.scheduleEntries.length}</div>
          <div class="mt-2 bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
            <pre class="text-xs">{JSON.stringify(storeData.scheduleEntries[0], null, 2)}</pre>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Jobs Section -->
    <div class="border p-4 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-2">Jobs</h2>
      <button 
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2"
        on:click={testLoadJobs}
      >
        Load Jobs
      </button>
      
      <div class="mb-2">
        Status: <span class={`font-medium ${loadingState.jobs.status === 'success' ? 'text-green-500' : loadingState.jobs.status === 'error' ? 'text-red-500' : 'text-yellow-500'}`}>
          {loadingState.jobs.status}
        </span>
        {#if loadingState.jobs.error}
          <div class="text-red-500 text-sm">{loadingState.jobs.error}</div>
        {/if}
      </div>
    </div>
    
    <!-- Customers Section -->
    <div class="border p-4 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-2">Customers</h2>
      <button 
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-2"
        on:click={testLoadCustomers}
      >
        Load Customers
      </button>
      
      <div class="mb-2">
        Status: <span class={`font-medium ${loadingState.customers.status === 'success' ? 'text-green-500' : loadingState.customers.status === 'error' ? 'text-red-500' : 'text-yellow-500'}`}>
          {loadingState.customers.status}
        </span>
        {#if loadingState.customers.error}
          <div class="text-red-500 text-sm">{loadingState.customers.error}</div>
        {/if}
      </div>
    </div>
  </div>
  
  <div class="mt-8">
    <h2 class="text-xl font-semibold mb-4">Load All Data Test</h2>
    <button 
      class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      on:click={() => {
        testLoadUsers();
        testLoadJobs();
        testLoadCustomers();
        testLoadTrucks();
        testLoadScheduleEntries();
      }}
    >
      Load All Data
    </button>
  </div>
  
  <div class="mt-8">
    <a href="/schedule" class="text-blue-500 hover:underline">Go to Schedule Page</a>
  </div>
</div> 