<script lang="ts">
  export let showText = true;
  export let size = "md"; // sm, md, lg
  
  // Calculate sizes based on the size prop
  $: logoClass = size === "sm" 
    ? "w-8 h-8" 
    : size === "lg" 
      ? "w-16 h-16" 
      : "w-12 h-12";
      
  $: textClass = size === "sm" 
    ? "text-lg" 
    : size === "lg" 
      ? "text-3xl" 
      : "text-2xl";
</script>

<div class="flex items-center">
  <div class={logoClass}>
    <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <!-- Shield shape with gradient -->
      <defs>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#61C3E2" />
          <stop offset="100%" stop-color="#264F8E" />
        </linearGradient>
        <linearGradient id="burgundyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#9A3667" />
          <stop offset="100%" stop-color="#751D44" />
        </linearGradient>
      </defs>
      
      <!-- Outer Shield - Blue Gradient -->
      <path d="M60 10C78 10 90 16 90 16L90 45C90 65 75 80 60 90C45 80 30 65 30 45L30 16C30 16 42 10 60 10Z" fill="url(#blueGradient)" />
      
      <!-- Inner D - Burgundy Gradient -->
      <path d="M45 24C50 24 70 28 70 45C70 62 50 66 45 66L45 24Z" fill="url(#burgundyGradient)" />
      
      <!-- White cutout -->
      <path d="M45 32L45 58C48 58 59 56 59 45C59 34 48 32 45 32Z" fill="white" />
    </svg>
  </div>
  
  {#if showText}
    <div class="ml-3 flex flex-col">
      <span class={`font-montserrat font-extrabold tracking-wide ${textClass}`}>DRYD</span>
      {#if size !== "sm"}
        <span class="text-xs font-roboto-slab tracking-wider">RAPID RESPONSE TEAM</span>
      {/if}
    </div>
  {/if}
</div> 