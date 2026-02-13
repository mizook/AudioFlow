<template>
  <RouterLink
    v-if="pageUrl"
    :to="pageUrl || '/'"
    class="w-full flex items-center h-12 hover:bg-white/10 transition-all duration-300 ease-in-out rounded-lg group"
    :class="mainStore.isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-3'"
    @mouseenter="optionIsHover = true"
    @mouseleave="optionIsHover = false"
  >
    <div class="flex items-center justify-center min-w-[32px]">
      <img :src="iconUrl" alt="Icon Image" :class="`${w} ${h}`" />
    </div>

    <h1
      v-if="!mainStore.isSidebarCollapsed"
      class="ml-4 text-lg font-semibold transition-all duration-300 hidden md:block truncate"
      :class="optionIsHover ? 'text-white' : 'text-gray-400'"
    >
      {{ message }}
    </h1>
  </RouterLink>

  <div
    v-if="!pageUrl"
    class="w-full flex items-center h-12 hover:bg-white/10 transition-all duration-300 ease-in-out rounded-lg cursor-pointer group"
    :class="mainStore.isSidebarCollapsed ? 'justify-center px-0' : 'justify-start px-3'"
    @mouseenter="optionIsHover = true"
    @mouseleave="optionIsHover = false"
  >
    <div class="flex items-center justify-center min-w-[32px]">
      <img :src="iconUrl" alt="Icon Image" :class="`${w} ${h}`" />
    </div>

    <h1
      v-if="!mainStore.isSidebarCollapsed"
      class="ml-4 flex items-center text-lg font-semibold transition-all duration-300 hidden md:block truncate"
      :class="optionIsHover ? 'text-white' : 'text-gray-400'"
    >
      {{ message }}
    </h1>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { useMainStore } from "@/stores/main";

const mainStore = useMainStore();

const props = defineProps({
  pageUrl: String,
  iconUrl: String,
  message: String,
  ml: String,
  mt: String,
  w: String,
  h: String,
  pl: String,
  pt: String,
});

let optionIsHover = ref(false);
</script>
