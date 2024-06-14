<template>
  <div
    class="p-8 transition-opacity duration-500"
    :class="{ 'opacity-100': !isFetching, 'opacity-0': isFetching }"
  >
    <h1 class="text-white text-2xl font-semibold pl-2">
      ¡Despliegue automático!
    </h1>

    <div class="pt-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-y-12">
      <SongCard v-for="song in mainStore.systemSongs" :song="song" />
    </div>
  </div>
  <div
    role="status"
    class="flex items-center justify-center h-[33vh] xl:h-[55vh] transition-opacity duration-300"
    :class="{ visible: isFetching, hidden: !isFetching }"
  >
    <Loader />
  </div>
</template>

<script setup lang="ts">
import Loader from "@/components/Loader.vue";
import { onMounted, ref } from "vue";
import SongCard from "@/components/SongCard.vue";

import { useMainStore } from "@/stores/main";
import { usePlayerStore } from "@/stores/player";

import { setSong } from "@/firestore";
import { fetchSongs } from "@/backend";

const mainStore = useMainStore();
const playerStore = usePlayerStore();

const isFetching = ref(true);

const getSongs = async () => {
  try {
    const response = await fetchSongs();
    isFetching.value = false;
    mainStore.loadSongs(response.songs);

    if (
      playerStore.player?.currentSong === null ||
      playerStore.player?.currentSong == undefined
    ) {
      playerStore.player.currentTime = 0;
      playerStore.player.currentSong = mainStore.systemSongs[0];
      if (mainStore.user)
        setSong(playerStore.player.id, mainStore.systemSongs[0]);
    }
  } catch (error) {
    isFetching.value = false;
    console.error("Hubo un error al hacer fetch:", error);
  }
};

onMounted(async () => {
  mainStore.clearSystemSongs();
  getSongs();
});
</script>
