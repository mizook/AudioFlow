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
              class="flex w-full max-w-2xl transform overflow-hidden rounded-2xl bg-black p-6 shadow-xl transition-all"
            >
              <div class="w-1/2 pr-4">
                <DialogTitle
                  as="h3"
                  class="text-lg font-medium leading-6 text-white mb-4"
                  >¡Inicia sesión en AudioFlow!</DialogTitle
                >
                <form @submit.prevent="submitForm" class="mt-6">
                  <div class="mt-4">
                    <label for="email" class="block text-sm text-gray-400"
                      >Correo Electrónico</label
                    >
                    <input
                      type="text"
                      id="email"
                      name="email"
                      autocomplete="off"
                      placeholder="ejemplo@correo"
                      :class="{ 'border-red-500': errors }"
                      v-model="formData.email"
                      class="w-[90%] h-10 my-2 py-3 px-4 block border-6 bg-gray-950 text-white border-gray-200 rounded-md text-sm focus:border-green-500 focus:ring-green-500 shadow-sm"
                    />
                  </div>

                  <div class="mt-4">
                    <label for="password" class="block text-sm text-gray-400"
                      >Contraseña</label
                    >
                    <input
                      type="password"
                      id="password"
                      name="password"
                      autocomplete="off"
                      placeholder="contraseña"
                      v-model="formData.password"
                      :class="{ 'border-red-500': errors }"
                      class="w-[90%] h-10 my-2 py-3 px-4 block border-2 bg-gray-950 text-white border-gray-200 rounded-md text-sm focus:border-green-500 focus:ring-green-500 shadow-sm"
                    />
                    <p v-if="errors" class="text-xs text-red-600 mt-2">
                      {{ errors }}
                    </p>
                  </div>

                  <div class="mt-8 flex justify-center pr-8">
                    <button
                      type="submit"
                      class="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:text-black hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                      Iniciar sesión
                    </button>
                  </div>
                </form>
              </div>

              <div class="w-1/2 flex items-center justify-center">
                <img
                  src="/images/icons/audioflow-logo.png"
                  alt="Icono de AudioFlow"
                  class="w-1/2"
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

const loginUser = (data) => {
  if (data.email === "guest" && data.password === "") {
    showSuccessToast("Inicio de sesión exitoso", 2000);
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
    errors.value = "Usuario o contraseña incorrectos";
  }
};

async function submitForm() {
  const data = loginUser(formData.value);

  if (data) {
    mainStore.loginUser(data);
    playerStore.storePlayer(data.user.player);

    closeModal();
    showSuccessToast("Inicio de sesión exitoso");
  }
}
</script>
