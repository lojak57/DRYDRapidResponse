<script lang="ts">
  export let showText = true; // This prop will now default to true but we'll override it in Nav
  export let size = "md"; // sm, md, lg, xl
  export let linkToDashboard = true; // Add option to make it a link
  
  // Calculate image sizes based on the size prop using Tailwind classes
  // Increased sizes: sm=h-12, md=h-16, lg=h-20, xl=h-32
  $: logoClass = 
    size === "sm" ? "h-12 w-auto" : 
    size === "lg" ? "h-20 w-auto" : 
    size === "xl" ? "h-32 w-auto" : 
    "h-16 w-auto"; // Default to md size
      
  // Text size remains similar, adjust if needed based on the new logo
  $: textClass = 
    size === "sm" ? "text-lg" : 
    size === "lg" ? "text-3xl" :
    size === "xl" ? "text-4xl" :
    "text-2xl";
</script>

{#if linkToDashboard}
  <a href="/dashboard" class="flex items-center hover:opacity-90 transition-opacity duration-150">
    <!-- Use img tag for the new logo -->
    <img src="/dryd-logo-new.PNG" alt="DRYD Restoration Logo" class="{logoClass}" />
    
    <!-- Text is removed -->

  </a>
{:else}
  <div class="flex items-center">
    <!-- Use img tag for the new logo -->
    <img src="/dryd-logo-new.PNG" alt="DRYD Restoration Logo" class="{logoClass}" />
    
    <!-- Text is removed -->

  </div>
{/if} 