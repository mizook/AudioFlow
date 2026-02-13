<template>
  <li
    class="group flex items-center justify-between px-4 py-2 rounded-xl hover:bg-white/[0.05] transition-all duration-300 border border-transparent hover:border-white/5"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
  >
    <div class="flex items-center flex-1 min-w-0 cursor-pointer" @click="playSong">
      <ConfirmationModal
        v-if="showConfirmationModal"
        @close="showConfirmationModal = false"
        @confirm="deleteSongAndCloseModal()"
        entityToDelete="canción de la playlist"
      />
      
      <!-- Index / Play Button -->
      <div class="w-10 flex items-center justify-center mr-2">
        <div v-if="isHover" class="text-white">
          <Play :size="20" />
        </div>
        <div v-else class="text-gray-500 font-medium text-sm">
          {{ props.index + 1 }}
        </div>
      </div>

      <!-- Song Info -->
      <div class="flex items-center min-w-0">
        <!-- Optional: Small thumbnail if needed, but keeping it clean for now -->
        <div class="truncate">
          <div
            :class="playerStore.player.currentSong?.id === props.song.id ? 'text-green-500' : 'text-white'"
            class="font-semibold text-[15px] truncate tracking-tight"
          >
            {{ props.song.name }}
          </div>
          <div class="text-[13px] text-gray-400 font-medium truncate opacity-70">
            {{ props.song.artist }}
          </div>
        </div>
      </div>
    </div>

    <!-- Duration and Options -->
    <div class="flex items-center space-x-6 ml-4">
      <div class="text-[13px] text-gray-400 font-medium whitespace-nowrap opacity-60">
        {{ formatDuration(props.song.duration) }}
      </div>

      <div class="opacity-0 group-hover:opacity-100 transition-opacity">
        <SongRowOptions :song="props.song" :playlist="props.playlist" />
      </div>
    </div>
  </li>
</template>

<script setup>
import { ref } from "vue";
import Play from "vue-material-design-icons/Play.vue";
import Pause from "vue-material-design-icons/Pause.vue";
import { usePlayerStore } from "../stores/player";

import ConfirmationModal from "@/components/modal/ConfirmationModal.vue";
import SongRowOptions from "./SongRowOptions.vue";

import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useRouter } from "vue-router";

import { useMainStore } from "@/stores/main";

const mainStore = useMainStore();
const router = useRouter();
const playerStore = usePlayerStore();

const showConfirmationModal = ref(false);
let isHover = ref(false);

const props = defineProps({
  song: {
    required: true,
  },
  index: {
    required: true,
  },
  playlist: {
    required: true,
  },
});

const playSong = async () => {
  playerStore.playSong(props.song);
};

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins + ":" + secs.toString().padStart(2, "0");
};

const deleteSongAndCloseModal = async () => {
  // errors.value = '';

  try {
    // await removeSongFromPlaylist(String(props.playlist.id),String(props.song.id));
    showConfirmationModal.value = false;
    // mainStore.deleteSystemPlaylist(String(playlistId));
    //router.push(`/playlist/${props.playlistId}`);
    // const userPlaylists = await fetchUserPlaylists();
    mainStore.loadMyPlaylists(userPlaylists);
    router.go(0);
    setTimeout(() => {
      showSuccessToast("Canción removida correctamente");
    }, 500);
  } catch (error) {
    if (error.response) {
      // errors.value = error.response.data.message;
      console.log(error);
    }
    showErrorToast(error);
  }
};
</script>
