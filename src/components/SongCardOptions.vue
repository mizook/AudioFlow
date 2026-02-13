<template>
  <ConfirmationModal
    v-if="showConfirmationModal"
    @close="showConfirmationModal = false"
    @confirm="deleteSongAndCloseModal"
    entityToDelete="canción"
  />
  <AddSongPlaylistModal
    v-if="showAddSongToPlaylistModal"
    @close="showAddSongToPlaylistModal = false"
    :song="song"
  ></AddSongPlaylistModal>

  <Menu as="div" class="relative z-20" id="songOptions" v-slot="{ open }">
    <div @click="handleMenuClick(open)">
      <MenuButton
        ref="buttonRef"
        class="flex items-center justify-center h-8 w-8 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer backdrop-blur-md group/dots"
      >
        <DotsHorizontal :size="20" class="text-white opacity-60 group-hover/dots:opacity-100 transition-opacity" />
      </MenuButton>
    </div>

    <!-- Notify parent about open state -->
    <div v-if="trackOpen(open)" class="hidden"></div>

    <Teleport to="body">
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <MenuItems
          v-if="open"
          :style="menuStyle"
          class="fixed w-52 origin-top-right rounded-2xl bg-neutral-900/98 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] focus:outline-none overflow-hidden z-[99999]"
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

            <MenuItem v-if="showAddToLibrary" v-slot="{ active }">
              <button
                @click="addToLibrary()"
                :class="[
                  active ? 'bg-white/10 text-white' : 'text-gray-300',
                  'group flex w-full items-center justify-between px-4 py-2.5 text-sm rounded-xl transition-colors',
                ]"
              >
                <span>Agregar a biblioteca</span>
                <Plus :size="16" class="opacity-50 group-hover:opacity-100 transition-opacity" />
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

            <template v-if="isUserSong">
              <div class="h-[1px] bg-white/5 my-1 mx-2"></div>
              <MenuItem v-slot="{ active }">
                <button
                  @click="showConfirmationModal = true"
                  :class="[
                    active ? 'bg-red-500/20 text-red-400' : 'text-gray-400',
                    'group flex w-full items-center justify-between px-4 py-2.5 text-sm rounded-xl transition-colors',
                  ]"
                >
                  <span>Eliminar canción</span>
                  <svg class="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </MenuItem>
            </template>
          </div>
        </MenuItems>
      </transition>
    </Teleport>
  </Menu>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import DotsHorizontal from "vue-material-design-icons/DotsHorizontal.vue";
import Plus from "vue-material-design-icons/Plus.vue";
import ConfirmationModal from "@/components/modal/ConfirmationModal.vue";
import AddSongPlaylistModal from "./modal/AddSongPlaylistModal.vue";

import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

import { useMainStore } from "@/stores/main";
import { usePlayerStore } from "@/stores/player";

const playerStore = usePlayerStore();
const mainStore = useMainStore();
const route = useRoute();
const isUserSong = ref(false);

const buttonRef = ref(null);
const menuStyle = ref({ top: '0px', left: '0px' });

const errors = ref("");
const showConfirmationModal = ref(false);
const showAddSongToPlaylistModal = ref(false);

const props = defineProps({
  song: {
    required: true,
  },
});

const emit = defineEmits(['menuState']);

import { nextTick } from "vue";

const trackOpen = (open) => {
  if (open) {
    nextTick(() => {
      let el = buttonRef.value?.$el || buttonRef.value;
      if (el) {
        const rect = el.getBoundingClientRect();
        // Adjust for scrolls and ensure it stays in viewport
        menuStyle.value = {
          top: `${rect.bottom + window.scrollY + 8}px`,
          left: `${rect.right - 208}px`, // 52 * 4 = 208px width
        };
        // Reset to fixed coordinates if we use fixed in style
        menuStyle.value = {
          top: `${rect.bottom + 8}px`,
          left: `${rect.right - 208}px`,
        };
      }
    });
  }
  emit('menuState', open);
  return false; // Don't render anything
};

const handleMenuClick = (open) => {
  // Toggle handled by MenuButton
};

const verifyCanDelete = computed(() => {
  return props.song.user_id == mainStore.user?.id && (route.path === '/' || route.path === '/library');
});

const showAddToLibrary = computed(() => {
  if (route.path !== '/search') return false;
  // Check if song is already in library (systemSongs)
  return !mainStore.systemSongs.some(s => s.id === props.song.id);
});

const addToLibrary = () => {
    mainStore.addSystemSong(props.song);
    showSuccessToast("Canción agregada a tu biblioteca");
};

const addToQueue = () => {
  playerStore.addToQueue(props.song);
  //   if (mainStore.user) addToQueueFS(playerStore.player.id, props.song);
  showSuccessToast("Canción agregada a la cola");
};

const addToPlaylist = () => {
  showAddSongToPlaylistModal.value = true;
};

const deleteSongAndCloseModal = async () => {
  errors.value = "";

  const deleteSongToast = toast.loading("Eliminando canción...", {
    position: "bottom-right",
    theme: "dark",
  });

  try {
    // Simulating deletion delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500)); 

    mainStore.deleteSystemSong(props.song);
    
    toast.update(deleteSongToast, {
      render: "Canción eliminada de tu biblioteca",
      autoClose: 3000,
      closeOnClick: true,
      closeButton: true,
      type: "success",
      isLoading: false,
    });

    showConfirmationModal.value = false;
  } catch (error) {
    toast.remove(deleteSongToast);
    if (error.response) {
      errors.value = error.response.data.message;
    }
    showErrorToast(errors.value);
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
