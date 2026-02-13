<template>
  <div class="flex justify-center p-2 w-full group/card" :class="{ 'z-[60] relative': isMenuOpen }">
    <div
      @click="handleCardClick"
      :class="[
        'glass-card p-4 rounded-2xl flex flex-row sm:flex-col items-center transition-all duration-500 border border-white/5 hover:border-white/10 shadow-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] w-full sm:max-w-[160px]',
        windowWidth < 640 ? 'cursor-pointer active:scale-[0.98] hover:bg-white/[0.08]' : 'cursor-default'
      ]"
    >
      <!-- Image Section -->
      <div
        class="relative h-16 w-16 sm:h-auto sm:aspect-square sm:w-full rounded-xl overflow-hidden flex-shrink-0 sm:mb-4"
      >
        <img 
          class="object-cover w-full h-full transition-transform duration-700 group-hover/card:scale-110" 
          :src="song.coverURL" 
          :alt="song.name" 
        />
        
        <!-- Hover Play Button (Desktop Only) -->
        <div
          class="absolute inset-0 bg-black/20 sm:flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-500 backdrop-blur-[2px] hidden"
        >
          <div
            @click.stop="playSong"
            class="h-12 w-12 bg-green-500 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center justify-center translate-y-4 group-hover/card:translate-y-0 transition-transform duration-500 cursor-pointer hover:scale-110 active:scale-95"
          >
            <Play fillColor="#000000" :size="28" class="ml-1" />
          </div>
        </div>
      </div>

      <!-- Info Section -->
      <div class="ml-4 sm:ml-0 flex-1 min-w-0 sm:w-full flex flex-col sm:items-center">
        <div class="flex items-center justify-between w-full sm:justify-center mb-0.5 sm:mb-2 text-left sm:text-center">
          <h3 class="text-white truncate font-bold text-[14px] sm:text-[16px] tracking-tight leading-tight">
            {{ song.name }}
          </h3>
        </div>
        
        <div class="flex items-center justify-between w-full">
          <div class="text-gray-400 font-medium text-[11px] sm:text-[13px] truncate sm:text-center w-full opacity-70 group-hover/card:opacity-100 transition-opacity">
            {{ song.artist }}
          </div>
          
          <!-- Options button mobile -->
          <div class="sm:hidden" @click.stop>
            <SongCardOptions @menu-state="val => isMenuOpen = val" :song="song" />
          </div>
        </div>

        <div 
          class="hidden sm:block mt-3 opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-y-2 group-hover/card:translate-y-0"
          @click.stop
        >
          <SongCardOptions @menu-state="val => isMenuOpen = val" :song="song" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import SongCardOptions from "./SongCardOptions.vue";
import Play from "vue-material-design-icons/Play.vue";
import { usePlayerStore } from "@/stores/player";
import { useMainStore } from "@/stores/main";

const mainStore = useMainStore();
const playerStore = usePlayerStore();
const isMenuOpen = ref(false);

const windowWidth = ref(window.innerWidth);
const updateWidth = () => { windowWidth.value = window.innerWidth; };

onMounted(() => { window.addEventListener('resize', updateWidth); });
onUnmounted(() => { window.removeEventListener('resize', updateWidth); });

const props = defineProps({
  song: Object
});

const handleCardClick = () => {
  if (windowWidth.value < 640) {
    playSong();
  }
};

const playSong = async () => {
  const currentSong = playerStore.player.currentSong;
  if (currentSong && currentSong.id === props.song.id) return;

  playerStore.playSong(props.song);
  if (mainStore.user) {
    // updateCurrentTime(playerStore.player.id, 0);
    // setSong(playerStore.player.id, props.song);
    // togglePlayFS(playerStore.player.id, playerStore.player.isPlaying);
  }
};
</script>
