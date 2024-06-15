<template>
  <div class="p-8 transition-opacity duration-500">
    <h1 v-if="!isFetching" class="text-white text-2xl font-semibold pl-2">
      ¡Bienvenido a AudioFlow!
    </h1>

    <div
      v-if="isFetching"
      role="status"
      class="flex items-center justify-center transition-opacity duration-300 h-[70vh]"
    >
      <Loader />
    </div>

    <div
      v-if="!isFetching"
      class="pt-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-y-12"
    >
      <SongCard v-for="song in songs" :song="song" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

import Loader from "@/components/Loader.vue";
import SongCard from "@/components/SongCard.vue";

import { useMainStore } from "@/stores/main";
import { usePlayerStore } from "@/stores/player";

const mainStore = useMainStore();
const playerStore = usePlayerStore();

const isFetching = ref(true);

const songs = [
  {
    user_id: "1",
    id: "1",
    name: "Darkera",
    artist: "Easykid",
    duration: 180,
    coverURL: "/images/albumCovers/darkera.jpg",
    audioURL: "/songs/darkera.mp3",
  },
  {
    user_id: "1",
    id: "2",
    name: "Un Preview",
    artist: "Bad Bunny",
    duration: 180,
    coverURL: "/images/albumCovers/un-preview.jpg",
    audioURL: "/songs/un-preview.mp3",
  },
  {
    user_id: "1",
    id: "3",
    name: "Smoking Out The Window",
    artist: "Silk Sonic, Bruno Mars, Anderson .Paak",
    duration: 180,
    coverURL: "/images/albumCovers/smoking-out-the-window.jpg",
    audioURL: "/songs/smoking-out-the-window.mp3",
  },
];

playerStore.playSong(songs[0]);

setTimeout(() => {
  isFetching.value = false;
}, 2000);
</script>
