<script lang="ts">
  import { JobStatus } from '$lib/types/Job';

  // Props
  export let title: string;
  export let count: number = 0;
  export let icon: string;
  export let status: JobStatus;
  export let textColor: string = 'blue';
  export let animated: boolean = false;
  export let transitionDelay: number = 0;

  // Badge colors based on count
  function getBadgeClasses(count: number): string {
    if (!count || count === 0) return 'bg-gray-200 text-gray-600';
    if (count > 5) return 'bg-red-500 text-white animate-pulse';
    if (count > 3) return 'bg-orange-400 text-white';
    return 'bg-blue-500 text-white';
  }
</script>

<div class="card-enter {animated ? 'animated' : ''}" style="transition-delay: {transitionDelay}ms">
  <div class="card-glass bg-gradient-to-br from-{textColor}-50/90 to-{textColor === 'blue' ? 'indigo' : textColor}-50/90 rounded-xl card-shadow p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative">
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center">
          <p class="text-sm font-medium text-{textColor}-700">{title}</p>
          {#if count > 0}
            <span class="ml-2 px-2 py-0.5 text-xs font-medium rounded-full count-badge {getBadgeClasses(count)} {count > 5 ? 'count-pulse' : ''}">
              {count}
            </span>
          {/if}
        </div>
        <p class="text-3xl font-bold text-{textColor}-800">{count}</p>
      </div>
      <div class="bg-{textColor}-100 p-3 rounded-full {count > 0 ? 'animate-bounce' : ''}">
        <svg class="w-6 h-6 text-{textColor}-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={icon}/>
        </svg>
      </div>
    </div>
    <div class="mt-2">
      <a href="/jobs?status={status}" class="text-xs text-{textColor}-700 hover:underline inline-flex items-center group">
        View all {title.toLowerCase()}
        <svg class="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </a>
    </div>
    {#if count > 3}
      <div class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full -mt-1 -mr-1"></div>
    {/if}
  </div>
</div>

<style>
  .card-enter {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
    transition: opacity 0.4s ease-out, transform 0.4s ease-out;
  }
  
  .card-enter.animated {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  
  .count-badge {
    transition: all 0.3s ease;
  }
  
  .count-pulse {
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }
</style> 