<template>
  <ConfirmationModal
    v-if="showConfirmationModal"
    @close="showConfirmationModal = false"
    @confirm="removeSongAndCloseModal"
    entityToDelete="canción de la playlist"
  />
  <AddSongPlaylistModal
    v-if="showAddSongToPlaylistModal"
    @close="showAddSongToPlaylistModal = false"
    :song="song"
  ></AddSongPlaylistModal>

  <Menu as="div" class="relative" id="songOptions">
    <div>
      <MenuButton
        class="flex items-center justify-center h-8 w-8 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer backdrop-blur-md group/dots"
      >
        <DotsHorizontal :size="20" class="text-white opacity-60 group-hover/dots:opacity-100 transition-opacity" />
      </MenuButton>
    </div>

    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <MenuItems
        class="absolute right-0 mt-2 w-52 origin-top-right rounded-2xl bg-neutral-900/95 backdrop-blur-xl border border-white/10 shadow-2xl focus:outline-none overflow-hidden z-[100]"
      >
        <div class="p-1.5">
          <MenuItem v-slot="{ active }">
            <button
              @click="addToQueue()"
              :class="[
                active ? 'bg-white/10 text-white' : 'text-gray-300',
                'group flex w-full items-center justify-between px-4 py-2.5 text-sm rounded-xl transition-colors',
              ]"
            >
              <span>Agregar a cola</span>
              <svg class="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </MenuItem>

          <div v-if="mainStore.user" class="h-[1px] bg-white/5 my-1 mx-2"></div>

          <MenuItem v-if="mainStore.user" v-slot="{ active }">
            <button
              @click="addToPlaylist()"
              :class="[
                active ? 'bg-white/10 text-white' : 'text-gray-300',
                'group flex w-full items-center justify-between px-4 py-2.5 text-sm rounded-xl transition-colors',
              ]"
            >
              <span>Agregar a playlist</span>
              <svg class="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3H1a1 1 0 100 2h9a1 1 0 100-2zM10 7H1a1 1 0 100 2h9a1 1 0 100-2zM5 11H1a1 1 0 100 2h4a1 1 0 100-2zM14.5 3a1 1 0 011 1v2.5H18a1 1 0 110 2h-2.5V11a1 1 0 11-2 0V8.5H11a1 1 0 110-2h2.5V4a1 1 0 011-1z" />
              </svg>
            </button>
          </MenuItem>

          <template v-if="props.playlist.user_id === mainStore.user?.id">
            <div class="h-[1px] bg-white/5 my-1 mx-2"></div>
            <MenuItem v-slot="{ active }">
              <button
                @click="showConfirmationModal = true"
                :class="[
                  active ? 'bg-red-500/20 text-red-400' : 'text-gray-400',
                  'group flex w-full items-center justify-between px-4 py-2.5 text-sm rounded-xl transition-colors',
                ]"
              >
                <span>Remover de playlist</span>
                <svg class="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </MenuItem>
          </template>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import DotsHorizontal from "vue-material-design-icons/DotsHorizontal.vue";
import ConfirmationModal from "@/components/modal/ConfirmationModal.vue";
import AddSongPlaylistModal from "./modal/AddSongPlaylistModal.vue";

import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

import { useMainStore } from "@/stores/main";
import { usePlayerStore } from "@/stores/player";

const router = useRouter();

const playerStore = usePlayerStore();
const mainStore = useMainStore();
const isUserSong = ref(false);

const errors = ref < string > "";
const showConfirmationModal = ref(false);
const showAddSongToPlaylistModal = ref(false);

const props = defineProps({
  song: {
    required: true,
  },
  playlist: {
    required: true,
  },
});

const verifyCanDelete = computed(() => {
  return props.song.user_id == mainStore.user?.id;
});

const addToQueue = () => {
  playerStore.addToQueue(props.song);
  // if(mainStore.user) addToQueueFS(playerStore.player.id, props.song);
  showSuccessToast("Canción agregada a la cola");
};

const addToPlaylist = () => {
  showAddSongToPlaylistModal.value = true;
};

const removeSongAndCloseModal = async () => {
  errors.value = "";
  try {
    // await removeSongFromPlaylist(String(props.playlist.id),String(props.song.id));
    showConfirmationModal.value = false;
    // mainStore.deleteSystemPlaylist(String(playlistId));
    //router.push(`/playlist/${props.playlistId}`);
    // const userPlaylists = await fetchUserPlaylists();
    mainStore.loadMyPlaylists(userPlaylists);
    router.go(0);
    setTimeout(() => {
      showSuccessToast("Canción removida correctamente correctamente");
    }, 500);
  } catch (error) {
    if (error.response) {
      // errors.value = error.response.data.message;
      console.log(error);
    }
    showErrorToast(error);
  }
};

watch(
  () => mainStore.user,
  () => {
    isUserSong.value = verifyCanDelete.value;
  }
);

onMounted(() => {
  isUserSong.value = verifyCanDelete.value;
});
</script>
