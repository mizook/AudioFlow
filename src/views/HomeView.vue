<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-white text-3xl font-bold mb-2">
          ¡Bienvenido de nuevo!
        </h1>
        <p class="text-gray-400">Tu música personalizada, impulsada por AudioFlow.</p>
      </div>
      <div v-if="!isFetching && mainStore.systemSongs.length > 0" class="hidden md:block">
        <button 
          @click="playerStore.playSong(mainStore.systemSongs[0])"
          class="bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-8 rounded-full transition-all hover:scale-105 shadow-lg flex items-center space-x-2"
        >
          <Play :size="20" />
          <span>ESCUCHAR AHORA</span>
        </button>
      </div>
    </div>

    <div v-if="isFetching || mainStore.systemSongs.length > 0" class="mb-10">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-white text-xl font-bold">Tu Biblioteca</h2>
        <router-link to="/search" class="text-xs font-bold text-gray-400 hover:underline tracking-widest uppercase">Ver todo</router-link>
      </div>

      <div
        v-if="isFetching"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 justify-items-center transition-all duration-300"
      >
        <SkeletonCard v-for="i in 5" :key="i" class="w-full" :horizontal="windowWidth < 640" />
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 justify-items-center transition-all duration-300">
        <SongCard v-for="song in mainStore.systemSongs" :key="song.id" :song="song" />
      </div>
    </div>

    <div v-else-if="!isFetching && mainStore.systemSongs.length === 0" class="text-center py-20 glass rounded-3xl">
      <div class="mb-6">
        <svg class="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      </div>
      <h3 class="text-white text-xl font-medium mb-2">Tu biblioteca está vacía</h3>
      <p class="text-gray-400 mb-8">Empieza a explorar el catálogo global para añadir tus canciones favoritas.</p>
      <router-link 
        to="/search" 
        class="inline-block bg-white text-black font-bold py-3 px-8 rounded-full hover:scale-105 transition-all"
      >
        IR A BUSCAR
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import SkeletonCard from "@/components/SkeletonCard.vue";
import SongCard from "@/components/SongCard.vue";
import Play from "vue-material-design-icons/Play.vue";
import { usePlayerStore } from "@/stores/player";
import { useMainStore } from "@/stores/main";

const windowWidth = ref(window.innerWidth);
const updateWidth = () => { windowWidth.value = window.innerWidth; };

const playerStore = usePlayerStore();
const mainStore = useMainStore();

const isFetching = ref(true);

onMounted(() => {
  window.addEventListener('resize', updateWidth);
  mainStore.initializeLibrary();
  
  setTimeout(() => {
    isFetching.value = false;
  }, 800);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth);
});
</script>
