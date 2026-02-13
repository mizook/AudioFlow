<template>
  <RegisterModal v-if="showRegisterModal" @close="showRegisterModal = false" />
  <LoginModal v-if="showLoginModal" @close="showLoginModal = false" />

  <Menu as="div" class="relative inline-block text-left mr-6">
    <div>
      <MenuButton
        class="flex items-center h-10 px-3 gap-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-all cursor-pointer backdrop-blur-md"
      >
        <Avatar :size="24" color="white" username="Invitado" class="opacity-80" />
        <span class="hidden sm:inline">Usuario Invitado</span>
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
        class="absolute right-0 mt-3 w-48 origin-top-right rounded-2xl bg-neutral-900/90 backdrop-blur-xl border border-white/10 shadow-2xl focus:outline-none overflow-hidden"
      >
        <div class="p-1.5">
          <MenuItem v-slot="{ active }">
            <button
              @click="openLoginModal"
              :class="[
                active ? 'bg-white/10 text-white' : 'text-gray-300',
                'group flex w-full items-center justify-between px-4 py-2.5 text-sm rounded-xl transition-colors',
              ]"
            >
              <span>Iniciar sesión</span>
              <Account :size="18" class="opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
          </MenuItem>
          
          <div class="h-[1px] bg-white/5 my-1 mx-2"></div>

          <MenuItem v-slot="{ active }">
            <button
              @click="openRegisterModal"
              :class="[
                active ? 'bg-white/10 text-white' : 'text-gray-300',
                'group flex w-full items-center justify-between px-4 py-2.5 text-sm rounded-xl transition-colors',
              ]"
            >
              <span>Registrarse</span>
              <AccountPlus :size="18" class="opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script setup>
import { ref } from "vue";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";

import ChevronDown from "vue-material-design-icons/ChevronDown.vue";
import Account from "vue-material-design-icons/Account.vue";
import AccountPlus from "vue-material-design-icons/AccountPlus.vue";
import Avatar from "vue-avatar/src/Avatar.vue";

import LoginModal from "@/components/modal/LoginModal.vue";
import RegisterModal from "@/components/modal/RegisterModal.vue";

let showRegisterModal = ref(false);
let showLoginModal = ref(false);

function openRegisterModal() {
  showRegisterModal.value = true;
}

function openLoginModal() {
  showLoginModal.value = true;
}
</script>
