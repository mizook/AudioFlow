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
              <!-- Bloque Izquierdo -->
              <div class="w-1/2 pr-4">
                <DialogTitle
                  as="h3"
                  class="text-lg font-medium leading-6 text-white mb-4"
                  >¡Cambia tu correo electrónico!</DialogTitle
                >
                <form @submit.prevent="submitForm" class="mt-6">
                  <div class="mt-4">
                    <label for="password" class="block text-sm text-gray-400"
                      >Contraseña actual</label
                    >
                    <input
                      type="password"
                      id="password"
                      name="password"
                      autocomplete="off"
                      v-model="formData.password"
                      placeholder="contraseña actual"
                      class="w-[90%] h-10 my-2 py-3 px-4 block border-6 bg-gray-950 text-white border-gray-200 rounded-md text-sm focus:border-green-500 focus:ring-green-500 shadow-sm"
                    />
                    <p v-if="errors.password" class="text-xs text-red-600 mt-2">
                      {{ errors.password[0] }}
                    </p>
                  </div>

                  <div class="mt-4">
                    <label for="email" class="block text-sm text-gray-400"
                      >Nuevo correo electrónico</label
                    >
                    <input
                      type="text"
                      id="email"
                      name="email"
                      autocomplete="off"
                      v-model="formData.email"
                      placeholder="nuevo correo electrónico"
                      class="w-[90%] h-10 my-2 py-3 px-4 block border-6 bg-gray-950 text-white border-gray-200 rounded-md text-sm focus:border-green-500 focus:ring-green-500 shadow-sm"
                    />
                    <p v-if="errors.email" class="text-xs text-red-600 mt-2">
                      {{ errors.email[0] }}
                    </p>
                  </div>

                  <div class="mt-8 flex justify-center pr-8">
                    <button
                      type="submit"
                      class="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:text-black hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                      Actualizar
                    </button>
                  </div>
                </form>
              </div>

              <!-- Bloque Derecho -->
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

import { showErrorToast } from "@/utils/toast";

import { useMainStore } from "@/stores/main";

const mainStore = useMainStore();

const isOpen = ref(true);
const emits = defineEmits(["close"]);
const errors = ref({});
const formData = ref({
  password: "",
  email: mainStore.$state.user?.email || "",
});

function closeModal() {
  isOpen.value = false;
  setTimeout(() => {
    emits("close");
  }, 300);
}

async function submitForm() {
  showErrorToast("No implementado en esta versión de la app :(", 2000);

  closeModal();
}
</script>
