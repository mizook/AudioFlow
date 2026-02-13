<template>
  <EditPasswordModal
    v-if="showEditPasswordModal"
    @close="showEditPasswordModal = false"
  />
  <Menu as="div" class="relative inline-block text-left mr-6">
    <div>
      <MenuButton
        class="flex items-center h-10 px-3 gap-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-all cursor-pointer backdrop-blur-md"
      >
        <Avatar
          :size="24"
          color="white"
          :username="mainStore.$state.user?.username || 'Usuario'"
          :src="mainStore.$state.user?.picture_url"
          class="opacity-90"
        />
        <span class="hidden sm:inline">{{ mainStore.$state.user?.username }}</span>
        <ChevronDown :size="18" class="opacity-50" />
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
        class="absolute right-0 mt-3 w-52 origin-top-right rounded-2xl bg-neutral-900/90 backdrop-blur-xl border border-white/10 shadow-2xl focus:outline-none overflow-hidden"
      >
        <div class="p-1.5">
          <RouterLink to="/profile">
            <MenuItem v-slot="{ active }">
              <button
                :class="[
                  active ? 'bg-white/10 text-white' : 'text-gray-300',
                  'group flex w-full items-center justify-between px-4 py-2.5 text-sm rounded-xl transition-colors',
                ]"
              >
                <span>Mi perfil</span>
                <AccountBox :size="18" class="opacity-50 group-hover:opacity-100 transition-opacity" />
              </button>
            </MenuItem>
          </RouterLink>

          <div class="h-[1px] bg-white/5 my-1 mx-2"></div>

          <MenuItem v-slot="{ active }">
            <button
              @click="openChangePasswordModal()"
              :class="[
                active ? 'bg-white/10 text-white' : 'text-gray-300',
                'group flex w-full items-center justify-between px-4 py-2.5 text-sm rounded-xl transition-colors',
              ]"
            >
              <span>Contraseña</span>
              <ShieldEdit :size="18" class="opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
          </MenuItem>

          <div class="h-[1px] bg-white/5 my-1 mx-2"></div>

          <MenuItem v-slot="{ active }">
            <button
              @click="logoutUser()"
              :class="[
                active ? 'bg-red-500/20 text-red-400' : 'text-gray-300',
                'group flex w-full items-center justify-between px-4 py-2.5 text-sm rounded-xl transition-colors',
              ]"
            >
              <span>Cerrar sesión</span>
              <AccountRemove :size="18" class="opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";

import Avatar from "vue-avatar/src/Avatar.vue";
import ChevronDown from "vue-material-design-icons/ChevronDown.vue";
import AccountBox from "vue-material-design-icons/AccountBox.vue";
import ShieldEdit from "vue-material-design-icons/ShieldEdit.vue";
import AccountRemove from "vue-material-design-icons/AccountRemove.vue";

import EditPasswordModal from "@/components/modal/EditPasswordModal.vue";

import { useMainStore } from "@/stores/main";
import { usePlayerStore } from "@/stores/player";
import { showErrorToast } from "@/utils/toast";

const mainStore = useMainStore();
const playerStore = usePlayerStore();

let showEditPasswordModal = ref(false);

function openChangePasswordModal() {
  showEditPasswordModal.value = true;
}

const logoutUser = () => {
  //   updateCurrentTime(playerStore.player.id, playerStore.player.currentTime);
  //   togglePlayFS(playerStore.player.id, false);

  showErrorToast("Cerrando sesión...", 2000);
  setTimeout(() => {
    playerStore.destorePlayer();
    mainStore.logoutUser();
  }, 2000);
};
</script>
