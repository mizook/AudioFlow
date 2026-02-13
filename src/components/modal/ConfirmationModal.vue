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
              class="flex flex-col transform overflow-hidden rounded-2xl glass-dark border border-white/10 p-8 shadow-2xl transition-all max-w-md w-full"
            >
              <div class="flex flex-col items-center text-center">
                <div class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                   <AlertCircle :size="40" class="text-red-500" />
                </div>
                
                <h2 class="text-xl font-bold text-white mb-2">
                  ¿Eliminar {{ props.entityToDelete }}?
                </h2>
                <p class="text-white/60 text-sm mb-8 leading-relaxed">
                  Esta acción no se puede deshacer. ¿Estás seguro de que quieres continuar?
                </p>

                <div class="flex w-full space-x-4">
                  <button
                    @click="closeModal"
                    class="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all border border-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    @click="confirmModal"
                    class="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-lg shadow-red-500/20"
                  >
                    Eliminar
                  </button>
                </div>
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
} from "@headlessui/vue";
import AlertCircle from "vue-material-design-icons/AlertCircle.vue";

const props = defineProps({
  entityToDelete: {
    required: true,
  },
});

const isOpen = ref(true);
const emits = defineEmits(["close", "confirm"]);

function closeModal() {
  isOpen.value = false;
  setTimeout(() => {
    emits("close");
  }, 300);
}

function confirmModal() {
  isOpen.value = false;
  emits("confirm");
}
</script>
