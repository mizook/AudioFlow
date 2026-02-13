<template>
  <div class="flex items-center group w-32">
    <div @click="toggleMute" class="cursor-pointer">
      <VolumeOff v-if="vol == 0" fillColor="#FFFFFF" :size="18" class="opacity-70 group-hover:opacity-100 transition-opacity" />
      <VolumeHigh v-else fillColor="#FFFFFF" :size="18" class="opacity-70 group-hover:opacity-100 transition-opacity" />
    </div>
    <div
      class="flex-1 ml-2 relative h-1 flex items-center"
      @mouseenter="isHover = true"
      @mouseleave="isHover = false"
    >
      <input
        v-model="vol"
        ref="volume"
        type="range"
        class="absolute w-full h-1 z-40 appearance-none bg-transparent cursor-pointer focus:outline-none custom-slider"
      />
      <div
        class="pointer-events-none absolute h-full z-10 rounded-full"
        :style="`width: ${vol}%;`"
        :class="isHover ? 'bg-green-500' : 'bg-white'"
      />
      <div
        class="absolute h-full z-0 w-full bg-white/10 rounded-full"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";

import VolumeOff from "vue-material-design-icons/VolumeOff.vue";
import VolumeHigh from "vue-material-design-icons/VolumeHigh.vue";

import { usePlayerStore } from "@/stores/player";

const playerStore = usePlayerStore();
const player = playerStore.player;

let isHover = ref(false);
let vol = ref(player.volume);
let prevVol = ref(player.volume > 0 ? player.volume : 50);
let volume = ref(null);
let volumeTimeout = null;

const toggleMute = () => {
  if (vol.value > 0) {
    prevVol.value = vol.value;
    vol.value = 0;
  } else {
    vol.value = prevVol.value;
  }
};

watch(vol, (newVolume) => {
  playerStore.updateVolume(newVolume);
  if (volumeTimeout) {
    clearTimeout(volumeTimeout);
  }
  volumeTimeout = setTimeout(() => {
    // if (playerStore.player.id !== "") updateVolume(playerStore.player.id, newVolume);
  }, 650);
});

watch(
  () => player.volume,
  (newVolume) => {
    vol.value = newVolume;
  }
);

onMounted(() => {
  if (volume.value) {
    volume.value.addEventListener("input", (e) => {
      const volumeValue = parseInt(e.currentTarget.value);
      vol.value = volumeValue;
    });
  }
});
</script>

<style scoped>
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
}

.custom-slider:hover::-moz-range-thumb {
  opacity: 1;
}
</style>
