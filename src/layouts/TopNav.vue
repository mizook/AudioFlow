<template>
  <div
    id="TopNav"
    class="w-[100%] h-[60px] sticky top-0 z-50 bg-gradient-to-b from-[#505a88] to-[#2d373f] shadow-2xl flex items-center justify-between"
  >
    <div class="flex items-center ml-6">
      <button
        type="button"
        class="rounded-full bg-[#282828] p-[1px] cursor-pointer hover:bg-gray-900"
      >
        <ChevronLeft
          @click="historyNav('back')"
          fillColor="#FFFFFF"
          :size="30"
        />
      </button>
      <button
        @click="historyNav('forward')"
        type="button"
        class="rounded-full bg-[#282828] p-[1px] hover:bg-[#] ml-4 cursor-pointer hover:bg-gray-900"
      >
        <ChevronRight fillColor="#FFFFFF" :size="30" />
      </button>
    </div>

    <GuestOptions v-if="!mainStore.$state.token" />
    <UserOptions v-if="mainStore.$state.token" />
  </div>
</template>

<script setup>
import GuestOptions from "@/components/GuestOptions.vue";
import UserOptions from "@/components/UserOptions.vue";

import ChevronRight from "vue-material-design-icons/ChevronRight.vue";
import ChevronLeft from "vue-material-design-icons/ChevronLeft.vue";

import { useMainStore } from "@/stores/main";
import { useRouter } from "vue-router";

const mainStore = useMainStore();
const router = useRouter();

function historyNav(option) {
  if (option == "back") router.go(-1);
  if (option == "forward") router.go(1);
}
</script>
