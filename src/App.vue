<template>
  <div class="bg-black flex h-screen w-screen overflow-hidden p-2 gap-2">
    <Sidebar></Sidebar>

    <div class="flex-1 flex flex-col min-w-0 h-full gap-2">
      <div
        class="bg-[#121212] text-white flex-1 rounded-lg overflow-hidden relative"
        id="ViewBlock"
      >
        <div class="h-full w-full overflow-auto custom-scrollbar">
          <TopNav></TopNav>
          <RouterView />
        </div>

        <!-- Lyrics Immersive Layer -->
        <Transition name="fade">
          <div 
            v-if="player.showLyrics && player.currentSong" 
            class="absolute inset-0 z-[50]"
          >
            <LyricsView :song="player.currentSong" />
          </div>
        </Transition>
      </div>

      <div class="h-[100px] md:h-[110px] w-full overflow-hidden rounded-2xl">
        <MusicPlayer />
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import { RouterView } from "vue-router";
import TopNav from "@/layouts/TopNav.vue";
import Sidebar from "@/layouts/Sidebar.vue";
import MusicPlayer from "@/layouts/MusicPlayer.vue";
import LyricsView from "@/components/LyricsView.vue";
import { usePlayerStore } from "@/stores/player";

const playerStore = usePlayerStore();
const { player } = storeToRefs(playerStore);

onMounted(() => {
  player.value.isPlaying = false;
});
</script>

<style>
/* Hide scrollbar for Chrome, Safari and Opera */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.no-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

/* Fallback for the main view block */
#ViewBlock::-webkit-scrollbar {
  width: 8px;
}

@media (max-width: 768px) {
  #ViewBlock::-webkit-scrollbar {
    display: none;
  }
}

#ViewBlock::-webkit-scrollbar-track {
  background-color: transparent;
}

#ViewBlock::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

#ViewBlock::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.4);
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(1.02);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background-color: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.4);
}
</style>
