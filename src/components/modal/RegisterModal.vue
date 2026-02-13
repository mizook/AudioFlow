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
                  >Crea tu cuenta</DialogTitle
                >
                <p class="text-gray-400 text-sm mb-6">Únete a la comunidad de AudioFlow hoy mismo.</p>
                
                <form @submit.prevent="submitForm" class="space-y-3">
                  <div>
                    <label for="username" class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1"
                      >Usuario</label
                    >
                    <input
                      type="text"
                      id="username"
                      name="username"
                      autocomplete="username"
                      placeholder="@usuario"
                      :disabled="isLoading"
                      v-model="formData.username"
                      class="w-full h-11 bg-white/5 text-white border border-white/10 rounded-xl px-4 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all disabled:opacity-50"
                    />
                  </div>

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
                      autocomplete="new-password"
                      placeholder="••••••••"
                      :disabled="isLoading"
                      v-model="formData.password"
                      class="w-full h-11 bg-white/5 text-white border border-white/10 rounded-xl px-4 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label for="confirmPassword" class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1"
                      >Confirmar Contraseña</label
                    >
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      autocomplete="new-password"
                      placeholder="••••••••"
                      :disabled="isLoading"
                      v-model="formData.confirmPassword"
                      class="w-full h-11 bg-white/5 text-white border border-white/10 rounded-xl px-4 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all disabled:opacity-50"
                    />
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
                        Registrarme
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

import { showErrorToast, showSuccessToast } from "@/utils/toast";

const isOpen = ref(true);
const isLoading = ref(false);
const emits = defineEmits(["close"]);
const errors = ref({});

const formData = ref({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
});

function closeModal() {
  isOpen.value = false;
  setTimeout(() => {
    emits("close");
  }, 300);
}

async function submitForm() {
  if (formData.value.password !== formData.value.confirmPassword) {
    showErrorToast("Las contraseñas no coinciden");
    return;
  }

  isLoading.value = true;
  
  // Simular registro
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  isLoading.value = false;
  showErrorToast("El registro no está habilitado en la demo, usa @guest", 3000);
  
  // Opcionalmente cerrar anyway para limpiar
  setTimeout(() => closeModal(), 1000);
}
</script>
