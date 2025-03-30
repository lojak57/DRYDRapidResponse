<script lang="ts">
  // Slot content will be placed inside the card
  export let noPadding = false;
  export let className = '';
</script>

<div class="{noPadding ? '' : 'p-4'} bg-white shadow-sm rounded-lg border border-gray-200 {className}">
  <slot />
</div>