<template>
  <div class="p-8">
    <h1 class="text-white text-3xl font-bold pl-1 mb-8">
      Descubre nueva música
    </h1>
    <div class="glass p-1 rounded-full w-full max-w-[500px] mt-4 flex items-center shadow-2xl">
      <div class="pl-4 pt-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      <input
        v-model="searchTerm"
        @input="handleSearch"
        class="bg-transparent text-white w-full py-3 px-4 outline-none text-lg"
        placeholder="¿Qué quieres escuchar hoy?"
      />
    </div>

    <div class="py-10">
      <h2 class="text-gray-400 text-sm uppercase tracking-widest font-bold mb-6 ml-2">
        {{ searchTerm ? 'Resultados de la búsqueda' : 'Canciones Populares' }}
      </h2>

      <div v-if="songList.length > 0 && !isSearching" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-6 justify-items-center">
        <div v-for="song in songList" :key="song.id" class="w-full flex justify-center">
          <SongCard :song="song" />
        </div>
      </div>

      <div v-if="isSearching" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-6 justify-items-center">
        <SkeletonCard v-for="i in (mainStore.availableSongs.length || 6)" :key="i" class="w-full" :horizontal="windowWidth < 640" />
      </div>

      <div v-if="!isSearching && searchTerm && songList.length === 0" class="text-center py-20 glass rounded-3xl">
        <p class="text-gray-400 text-lg">No encontramos resultados para "{{ searchTerm }}"</p>
        <button @click="searchTerm = ''; loadPopularSongs()" class="mt-4 text-green-500 hover:underline">Ver canciones populares</button>
      </div>
      

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import SongCard from "@/components/SongCard.vue";
import SkeletonCard from "@/components/SkeletonCard.vue";
import { useMainStore } from "@/stores/main";
import { usePlayerStore } from "@/stores/player";
import { toast } from 'vue3-toastify';

const windowWidth = ref(window.innerWidth);
const updateWidth = () => { windowWidth.value = window.innerWidth; };

onMounted(() => {
  window.addEventListener('resize', updateWidth);
  loadPopularSongs();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth);
});

const mainStore = useMainStore();
const playerStore = usePlayerStore();

const searchTerm = ref("");
const isSearching = ref(false);
const songList = ref([]);

const loadPopularSongs = async () => {
  isSearching.value = true;
  // Simulate a very fast local load to show skeletons briefly
  setTimeout(() => {
    songList.value = [...mainStore.availableSongs];
    isSearching.value = false;
  }, 400);
};

const handleSearch = () => {
  const term = searchTerm.value.trim().toLowerCase();
  
  if (!term) {
    songList.value = [...mainStore.availableSongs];
    return;
  }

  isSearching.value = true;
  
  // Clean term for robust searching
  const cleanTerm = term.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  setTimeout(() => {
    songList.value = mainStore.availableSongs.filter(song => {
      const name = song.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const artist = song.artist.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      return name.includes(cleanTerm) || artist.includes(cleanTerm);
    });
    isSearching.value = false;
  }, 300);
};

const addSongToLibrary = (song) => {
  const exists = mainStore.systemSongs.some(s => s.id === song.id);
  if (exists) {
    toast.info("Esta canción ya está en tu biblioteca");
    return;
  }
  
  mainStore.addSystemSong(song);
  toast.success(`"${song.name}" agregada a tu biblioteca`);
};


</script>
