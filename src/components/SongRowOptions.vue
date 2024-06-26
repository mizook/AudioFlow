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

  <Menu as="div" class="relative pl-1" id="songOptions">
    <div>
      <MenuButton
        class="items-center rounded-full bg-[#282828] bg-opacity-40 text-sm font-medium text-white hover:bg-gray-900 cursor-pointer"
      >
        <DotsHorizontal />
      </MenuButton>
    </div>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <MenuItems
        class="absolute right-1 w-48 rounded-md bg-black shadow-2xl z-50"
      >
        <div class="px-1 py-1">
          <MenuItem v-slot="{ active }" class="w-full">
            <button
              @click="addToQueue()"
              :class="[
                active ? 'bg-gray-900 text-white' : 'text-gray-300',
                'group flex w-full items-center px-2 py-2 text-sm border-b border-gray-700',
              ]"
            >
              Agregar a cola
              <svg
                class="w-5 h-5 text-white ml-[52px]"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 21 18"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.5 3h9.563M9.5 9h9.563M9.5 15h9.563M1.5 13a2 2 0 1 1 3.321 1.5L1.5 17h5m-5-15 2-1v6m-2 0h4"
                />
              </svg>
            </button>
          </MenuItem>
          <MenuItem v-if="mainStore.user" v-slot="{ active }">
            <button
              @click="addToPlaylist()"
              :class="[
                active ? 'bg-gray-900 text-white' : 'text-gray-300',
                'group flex w-full items-center px-2 py-2 text-sm',
              ]"
            >
              Agregar a playlist
              <svg
                class="w-5 h-5 text-white ml-[38px] mt-1"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 18 16"
              >
                <path
                  d="M14.316.051A1 1 0 0 0 13 1v8.473A4.49 4.49 0 0 0 11 9c-2.206 0-4 1.525-4 3.4s1.794 3.4 4 3.4 4-1.526 4-3.4a2.945 2.945 0 0 0-.067-.566c.041-.107.064-.22.067-.334V2.763A2.974 2.974 0 0 1 16 5a1 1 0 0 0 2 0C18 1.322 14.467.1 14.316.051ZM10 3H1a1 1 0 0 1 0-2h9a1 1 0 1 1 0 2Z"
                />
                <path
                  d="M10 7H1a1 1 0 0 1 0-2h9a1 1 0 1 1 0 2Zm-5 4H1a1 1 0 0 1 0-2h4a1 1 0 1 1 0 2Z"
                />
              </svg>
            </button>
          </MenuItem>
          <MenuItem
            v-if="props.playlist.user_id === mainStore.user?.id"
            v-slot="{ active }"
          >
            <button
              @click="showConfirmationModal = true"
              :class="[
                active ? 'bg-red-950 text-white' : 'text-red-500',
                'group flex w-full items-center px-2 py-2 text-sm border-t border-gray-700',
              ]"
            >
              Eliminar de la playlist
              <svg
                class="w-5 h-5 text-red-500 ml-3.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 18 20"
              >
                <path
                  d="M17 4h-4V2a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2H1a1 1 0 0 0 0 2h1v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1a1 1 0 1 0 0-2ZM7 2h4v2H7V2Zm1 14a1 1 0 1 1-2 0V8a1 1 0 0 1 2 0v8Zm4 0a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0v8Z"
                />
              </svg>
            </button>
          </MenuItem>
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
