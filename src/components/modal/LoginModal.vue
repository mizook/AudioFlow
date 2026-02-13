<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-[50]">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-80" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="flex w-full max-w-2xl transform overflow-hidden rounded-3xl bg-neutral-950/80 backdrop-blur-xl border border-white/10 p-8 shadow-2xl transition-all"
            >
              <div class="w-full md:w-1/2 md:pr-8">
                <DialogTitle
                  as="h3"
                  class="text-2xl font-bold leading-6 text-white mb-2"
                  >¡Bienvenido!</DialogTitle
                >
                <p class="text-gray-400 text-sm mb-6">Inicia sesión para continuar en AudioFlow.</p>
                
                <form @submit.prevent="submitForm" class="space-y-4">
                  <div>
                    <label for="email" class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1"
                      >Correo Electrónico</label
                    >
                    <input
                      type="email"
                      id="email"
                      name="email"
                      autocomplete="email"
                      placeholder="tu@correo.com"
                      :disabled="isLoading"
                      v-model="formData.email"
                      class="w-full h-11 bg-white/5 text-white border border-white/10 rounded-xl px-4 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1"
                      >Contraseña</label
                    >
                    <input
                      type="password"
                      id="password"
                      name="password"
                      autocomplete="current-password"
                      placeholder="••••••••"
                      :disabled="isLoading"
                      v-model="formData.password"
                      class="w-full h-11 bg-white/5 text-white border border-white/10 rounded-xl px-4 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all disabled:opacity-50"
                    />
                    <p v-if="errors" class="text-xs text-red-500 mt-2 flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                      {{ errors }}
                    </p>
                  </div>

                  <div class="pt-4">
                    <button
                      type="submit"
                      :disabled="isLoading"
                      class="w-full h-11 flex justify-center items-center rounded-xl bg-green-500 text-black font-bold text-sm hover:bg-green-400 focus:outline-none transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    >
                      <template v-if="isLoading">
                        <div class="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      </template>
                      <template v-else>
                        Entrar
                      </template>
                    </button>
                  </div>
                </form>
              </div>

              <div class="hidden md:flex w-1/2 items-center justify-center bg-white/5 rounded-2xl ml-4">
                <img
                  src="/images/icons/audioflow-logo.png"
                  alt="Icono de AudioFlow"
                  class="w-1/2 drop-shadow-2xl animate-pulse"
                />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref } from "vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

import { showSuccessToast } from "@/utils/toast";

import { useMainStore } from "@/stores/main";
import { usePlayerStore } from "@/stores/player";

const mainStore = useMainStore();
const playerStore = usePlayerStore();

const isOpen = ref(true);
const isLoading = ref(false);
const emits = defineEmits(["close"]);
const errors = ref("");
const formData = ref({
  email: "",
  password: "",
});

function closeModal() {
  isOpen.value = false;
  setTimeout(() => {
    emits("close");
  }, 300);
}

const loginUser = async (data) => {
  // Simular latencia de red
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (data.email === "guest" && data.password === "") {
    return {
      user: {
        username: "guest",
        id: 1,
        name: "guest",
        email: "guest",
        player: {
          id: 1,
          name: "guestPlayer",
          volume: 100,
          isPlaying: false,
          currentSong: {
            user_id: "1",
            id: "1",
            name: "Darkera",
            artist: "Easykid",
            duration: 180,
            coverURL: "/images/albumCovers/darkera.jpg",
            audioURL: "/songs/darkera.mp3",
          },
          songs: [],
        },
      },
      token: "token",
    };
  } else {
    errors.value = "Credenciales incorrectas (tip: guest / vacío)";
    return null;
  }
};

async function submitForm() {
  errors.value = "";
  isLoading.value = true;
  
  try {
    const data = await loginUser(formData.value);

    if (data) {
      mainStore.loginUser(data);
      playerStore.storePlayer(data.user.player);
      showSuccessToast("¡Bienvenido de nuevo!");
      closeModal();
    }
  } catch (error) {
    errors.value = "Ocurrió un error al intentar iniciar sesión";
  } finally {
    isLoading.value = false;
  }
}
</script>
