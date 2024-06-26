<template>
  <div
    id="MusicPlayer"
    v-if="player.currentSong"
    class="bg-black w-[calc(100%)] h-[110px] sm:h-[110px] z-50 fixed flex items-center justify-between bottom-0"
  >
    <div class="flex items-center ml-4 w-1/4">
      <img
        class="rounded-lg shadow-2xl"
        width="70"
        :src="player.currentSong.coverURL"
      />
      <div
        class="ml-4 opacity-0 md:opacity-100 group transition-all duration-300 ease-in-out"
      >
        <div class="text-[14px] text-white hover:underline cursor-pointer">
          {{ player.currentSong.name }}
        </div>
        <div
          class="text-[11px] text-gray-400 font-semibold hover:underline hover:text-white cursor-pointer"
        >
          {{ player.currentSong.artist }}
        </div>
      </div>
    </div>

    <div class="max-w-[40%] mx-auto w-2/4 mb-3">
      <div class="flex-col items-center justify-center">
        <div class="buttons flex items-center justify-center h-[30px]">
          <button class="mx-2">
            <SkipBackward fillColor="#FFFFFF" :size="25" @click="prevSong" />
          </button>
          <button class="p-1 rounded-full mx-3 bg-white" @click="togglePlay">
            <Play v-if="!player.isPlaying" :size="25" />
            <Pause v-else fillColor="#181818" :size="25" />
          </button>
          <button class="mx-2">
            <SkipForward fillColor="#FFFFFF" :size="25" @click="nextSong" />
          </button>
        </div>

        <div class="flex items-center h-[25px]">
          <div class="text-white text-[12px] pr-2 pt-[11px]">
            {{ formattedCurrentTime }}
          </div>
          <div
            ref="seekerContainer"
            class="w-full relative mt-2 mb-3"
            @mouseenter="isHover = true"
            @mouseleave="isHover = false"
          >
            <input
              v-model="range"
              ref="seeker"
              type="range"
              class="absolute rounded-full my-2 w-full h-0 z-40 appearance-none bg-opacity-100 focus:outline-none accent-white"
              :class="{ rangeDotHidden: !isHover }"
              @input="updateAudioTime"
            />
            <div
              class="pointer-events-none mt-[6px] absolute h-[4px] z-10 inset-y-0 left-0 w-0 bg-green-500"
              :style="`width: ${range}%;`"
              :class="isHover ? 'bg-green-500' : 'bg-white'"
            />
            <div
              class="absolute h-[4px] z-[-0] mt-[6px] inset-y-0 left-0 w-full bg-gray-700 rounded-full"
            />
          </div>
          <div class="text-white text-[12px] pl-2 pt-[11px]">
            {{ formattedDuration }}
          </div>
        </div>
      </div>
    </div>

    <div
      class="flex items-center w-1/4 justify-end pr-10 opacity-0 sm:opacity-100"
    >
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
import { usePlayerStore } from "@/stores/player";

import { useMainStore } from "@/stores/main";

const mainStore = useMainStore();
const playerStore = usePlayerStore();
const player = playerStore.player;

let audio = ref(new Audio(player.currentSong?.audioURL));
let isHover = ref(false);
let range = ref(0);

onMounted(async () => {
  await nextTick();
  audio.value.volume = player.volume / 100;
  audio.value.onloadedmetadata = () => {
    if (audio.value.duration) {
      range.value = (player.currentTime / audio.value.duration) * 100;
    }
  };
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
      audio.value.onended = handleSongEnd;
      if (player.currentTime != 0) {
        range.value =
          (playerStore.player.currentTime / audio.value.duration) * 100;
        audio.value.currentTime = playerStore.player.currentTime;
        return;
      }
      togglePlay();
    }
  }
);

audio.value.ontimeupdate = () => {
  playerStore.updateCurrentTime(audio.value.currentTime);
  range.value = (audio.value.currentTime / audio.value.duration) * 100;
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
    if (mainStore.user) {
      console.log("xd");
    }
    //   updateCurrentTime(playerStore.player.id, playerStore.player.currentTime);
  } else {
    try {
      audio.value.play();
      audio.value.currentTime = player.currentTime;
    } catch (error) {
      console.error("Error al reproducir el audio:", error);
    }
  }
  player.isPlaying = !player.isPlaying;
  //   if (mainStore.user) togglePlayFS(playerStore.player.id, player.isPlaying);
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

<style>
.rangeDotHidden[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 0;
  height: 0;
}
</style>
