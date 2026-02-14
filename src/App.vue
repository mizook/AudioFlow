<template>
  <div class="bg-black flex h-screen w-screen overflow-hidden md:p-2 md:gap-2">
    <Sidebar></Sidebar>

    <div class="flex-1 flex flex-col min-w-0 h-full md:gap-2 relative">
      <div
        class="bg-[#121212] text-white flex-1 md:rounded-lg overflow-hidden relative mb-[90px] md:mb-0 flex flex-col"
        id="ViewBlock"
      >
        <!-- Top Navigation (Fixed at top) -->
        <TopNav class="flex-shrink-0 z-20" />

        <!-- Content Area (Relative for positioning Lyrics over RouterView) -->
        <div class="flex-1 relative w-full overflow-hidden">
            <!-- Main Scrollable Content -->
            <div class="w-full h-full overflow-y-auto custom-scrollbar pb-24 md:pb-0">
                 <RouterView />
            </div>

            <!-- Lyrics Immersive Layer (Absolute overlay in content area) -->
            <Transition name="fade">
                <div 
                  v-if="player.showLyrics && player.currentSong" 
                  class="absolute inset-0 z-30 bg-black/95"
                >
                  <LyricsView :song="player.currentSong" />
                </div>
            </Transition>
        </div>
      </div>

      <div class="fixed bottom-[60px] left-0 right-0 z-40 h-[70px] p-[2px] md:static md:p-0 md:h-[110px] w-full overflow-hidden md:rounded-2xl">
        <MusicPlayer />
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { onMounted, watch } from "vue";
import { RouterView, useRoute } from "vue-router";
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

const route = useRoute();

watch(
  () => route.path,
  () => {
    if (player.value.showLyrics) {
      player.value.showLyrics = false;
    }
  }
);
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
