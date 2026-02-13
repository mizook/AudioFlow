<template>
  <div
    id="MusicPlayer"
    class="glass-dark w-full h-full flex items-center justify-between px-4 md:px-10 shadow-2xl transition-all duration-500"
  >
    <div class="flex items-center w-2/3 md:w-1/4 overflow-hidden">
      <div v-if="player.currentSong" class="flex items-center w-full">
        <img
          class="rounded-lg shadow-lg flex-shrink-0"
          :width="windowWidth < 768 ? 45 : 60"
          :src="player.currentSong.coverURL"
        />
        <div
          class="ml-3 group transition-all duration-300 ease-in-out truncate"
        >
          <div class="text-[13px] md:text-[14px] text-white hover:underline cursor-pointer font-bold truncate">
            {{ player.currentSong.name }}
          </div>
          <div
            class="text-[10px] md:text-[11px] text-gray-400 font-medium hover:underline hover:text-white cursor-pointer truncate"
          >
            {{ player.currentSong.artist }}
          </div>
        </div>
      </div>
      <div v-else class="flex items-center space-x-3 opacity-50">
        <div class="bg-white/10 rounded-lg w-[45px] h-[45px] md:w-[60px] md:h-[60px] flex items-center justify-center">
          <MusicIcon :size="24" fillColor="#FFFFFF" />
        </div>
        <div class="text-sm text-gray-400 italic">No hay canción seleccionada</div>
      </div>
    </div>

    <div 
      class="flex-1 flex flex-col items-center justify-center max-w-[50%] md:max-w-[40%] px-2"
      :class="{ 'opacity-30 pointer-events-none': !player.currentSong }"
    >
        <div class="buttons flex items-center justify-center h-[35px] mb-2">
          <button class="mx-2 opacity-70 hover:opacity-100 transition-opacity" @click="prevSong">
            <SkipBackward fillColor="#FFFFFF" :size="windowWidth < 768 ? 20 : 24" />
          </button>
          <button class="h-8 w-8 md:h-10 md:w-10 rounded-full mx-4 bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg" @click="togglePlay">
            <Play v-if="!player.isPlaying" fillColor="#181818" :size="windowWidth < 768 ? 20 : 26" class="ml-0.5" />
            <Pause v-else fillColor="#181818" :size="windowWidth < 768 ? 20 : 26" />
          </button>
          <button class="mx-2 opacity-70 hover:opacity-100 transition-opacity" @click="nextSong">
            <SkipForward fillColor="#FFFFFF" :size="windowWidth < 768 ? 20 : 24" />
          </button>
        </div>

        <div class="flex items-center w-full group">
          <div class="text-white text-[10px] pr-2 opacity-60 font-medium">
            {{ formattedCurrentTime }}
          </div>
          <div
            ref="seekerContainer"
            class="flex-1 relative h-1 flex items-center cursor-pointer"
            @mouseenter="isHover = true"
            @mouseleave="isHover = false"
          >
            <input
              v-model="range"
              ref="seeker"
              type="range"
              class="absolute w-full h-1 z-40 appearance-none bg-transparent cursor-pointer focus:outline-none custom-slider"
              @input="updateAudioTime"
            />
            <div
              class="pointer-events-none absolute h-full z-10 rounded-full transition-colors duration-200"
              :style="`width: ${range}%;`"
              :class="isHover ? 'bg-green-500' : 'bg-white'"
            />
            <div
              class="absolute h-full z-0 w-full bg-white/10 rounded-full"
            />
          </div>
          <div class="text-white text-[10px] pl-2 opacity-60 font-medium">
            {{ formattedDuration }}
          </div>
        </div>
    </div>

    <div
      class="hidden md:flex items-center w-1/4 justify-end pr-4 space-x-4"
    >
      <button 
        v-if="player.currentSong"
        @click="playerStore.toggleLyrics()"
        class="p-2 rounded-full hover:bg-white/10 transition-all group/lyrics relative"
        :class="{ 'bg-white/20': player.showLyrics }"
        title="Ver letra"
      >
        <MicrophoneVariant :size="20" class="text-white opacity-60 group-hover/lyrics:opacity-100 transition-opacity" />
        <div class="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full scale-0 group-hover/lyrics:scale-100 transition-transform"></div>
      </button>
      <MusicPlayerVolume />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, nextTick } from "vue";
import MusicPlayerVolume from "@/components/MusicPlayerVolume.vue";

import Play from "vue-material-design-icons/Play.vue";
import Pause from "vue-material-design-icons/Pause.vue";
import SkipBackward from "vue-material-design-icons/SkipBackward.vue";
import SkipForward from "vue-material-design-icons/SkipForward.vue";
import MusicIcon from "vue-material-design-icons/Music.vue";
import MicrophoneVariant from "vue-material-design-icons/MicrophoneVariant.vue";

import { usePlayerStore } from "@/stores/player";
import { useMainStore } from "@/stores/main";

const mainStore = useMainStore();
const playerStore = usePlayerStore();
const player = playerStore.player;

let audio = ref(null);
if (player.currentSong) {
  audio.value = new Audio(player.currentSong.audioURL);
} else {
  audio.value = new Audio();
}
let isHover = ref(false);
let range = ref(0);
const windowWidth = ref(window.innerWidth);

const updateWidth = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(async () => {
  window.addEventListener('resize', updateWidth);
  await nextTick();
  if (audio.value) {
    audio.value.volume = player.volume / 100;
    audio.value.onloadedmetadata = () => {
      if (audio.value.duration) {
        range.value = (player.currentTime / audio.value.duration) * 100;
      }
    };
  }
});

import { onUnmounted } from "vue";
onUnmounted(() => {
  window.removeEventListener('resize', updateWidth);
});

watch(
  () => player.volume,
  (newVolume) => {
    audio.value.volume = newVolume / 100;
  }
);

watch(
  () => player.currentTime,
  (newCurrentTime) => {
    audio.value.onended = handleSongEnd;
    range.value = (newCurrentTime / audio.value.duration) * 100;
  }
);

watch(
  () => player.currentSong,
  (newSong) => {
    if (newSong) {
      audio.value.pause();
      player.isPlaying = false;
      audio.value.src = newSong.audioURL;
      audio.value.load();
      
      audio.value.onloadedmetadata = async () => {
        if (player.currentTime != 0) {
          audio.value.currentTime = player.currentTime;
        }
        range.value = (audio.value.currentTime / audio.value.duration) * 100;
        
        // Force play on selection
        try {
          player.isPlaying = true;
          await audio.value.play();
        } catch (e) {
          console.warn("Auto-play blocked or interrupted:", e);
          player.isPlaying = false; // Sync back if blocked
        }
      };

      audio.value.onended = handleSongEnd;
    }
  }
);

audio.value.ontimeupdate = () => {
  if (audio.value.duration) {
    playerStore.updateCurrentTime(audio.value.currentTime);
    range.value = (audio.value.currentTime / audio.value.duration) * 100;
  }
};

const updateAudioTime = () => {
  if (audio.value.duration) {
    const newTime = (range.value / 100) * audio.value.duration;
    audio.value.currentTime = newTime;
    playerStore.updateCurrentTime(newTime);
  }
};

const togglePlay = async () => {
  if (player.isPlaying) {
    audio.value.pause();
  } else {
    try {
      await audio.value.play();
    } catch (error) {
      console.error("Error al reproducir el audio:", error);
    }
  }
  player.isPlaying = !player.isPlaying;
};

const nextSong = () => {
  if (mainStore.user && player.queue.length > 0) {
    let nextSong = player.queue[0];
    // setSong(playerStore.player.id, nextSong);
    // removeFromQueue(playerStore.player.id, nextSong);
  }
  playerStore.nextSong();
};

const prevSong = () => {
  if (playerStore.lastPlayed.length === 0) {
    audio.value.currentTime = 0;
    if (mainStore.user) {
      togglePlayFS(playerStore.player.id, player.isPlaying);
      updateCurrentTime(playerStore.player.id, 0);
    }
    return;
  }

  if (mainStore.user && playerStore.lastPlayed.length > 0) {
    let nextSong = playerStore.lastPlayed[0];
    updateCurrentTime(playerStore.player.id, 0);
    setSong(playerStore.player.id, nextSong);
  }
  playerStore.prevSong();
};

const handleSongEnd = () => {
  if (player.queue.length === 0) {
    player.isPlaying = false;
    if (mainStore.user) {
      togglePlayFS(playerStore.player.id, player.isPlaying);
      updateCurrentTime(playerStore.player.id, player.currentTime);
    }
  } else {
    nextSong();
  }
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formattedCurrentTime = computed(() => formatTime(player.currentTime));
const formattedDuration = computed(() =>
  player.currentSong ? formatTime(player.currentSong.duration) : "0:00"
);
</script>

<style scoped>
#MusicPlayer {
  backdrop-filter: blur(20px);
  background: rgba(24, 24, 24, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.4);
}

.custom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.custom-slider:hover::-webkit-slider-thumb {
  opacity: 1;
}

.custom-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.custom-slider:hover::-moz-range-thumb {
  opacity: 1;
}
</style>
