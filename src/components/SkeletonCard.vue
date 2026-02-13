<template>
  <div class="flex justify-center p-2 w-full">
    <div
      v-if="!horizontal"
      class="glass-card p-4 rounded-2xl flex flex-col items-center animate-pulse w-full max-w-[160px] shadow-2xl"
    >
      <div class="aspect-square w-full bg-white/5 rounded-xl mb-4"></div>
      <div class="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
      <div class="h-3 bg-white/5 rounded w-1/2 mb-3"></div>
      <div class="h-8 w-8 rounded-full bg-white/5 self-center sm:self-auto hidden sm:block"></div>
    </div>
    
    <div
      v-else
      class="glass-card p-4 rounded-2xl flex items-center animate-pulse w-full"
    >
      <div class="h-16 w-16 bg-white/10 rounded-xl flex-shrink-0"></div>
      <div class="ml-4 flex-1">
        <div class="h-4 bg-white/10 rounded w-2/3 mb-2"></div>
        <div class="h-3 bg-white/5 rounded w-1/3"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  horizontal: {
    type: Boolean,
    default: false
  }
});
</script>
