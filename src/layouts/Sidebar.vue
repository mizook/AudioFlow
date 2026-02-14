<template>
  <UploadSongModal
    v-if="showUploadSongModal"
    @close="showUploadSongModal = false"
  ></UploadSongModal>
  <CreatePlaylistModal
    v-if="showCreatePlaylistModal"
    @close="showCreatePlaylistModal = false"
  ></CreatePlaylistModal>

  <!-- Mobile Bottom Navbar -->
  <div 
    v-if="windowWidth < 768"
    class="fixed bottom-0 left-0 right-0 h-[60px] bg-black z-50 flex items-center justify-around border-t border-white/10"
  >
      <SidebarItem
        pageUrl="/"
        iconUrl="/images/icons/home-icon.png"
        message=""
        w="w-6"
        h="h-6"
      />
      <SidebarItem
        pageUrl="/search"
        iconUrl="/images/icons/search-icon.png"
        message=""
        w="w-6"
        h="h-6"
      />
      <SidebarItem
        pageUrl="/library"
        iconUrl="/images/icons/library-icon.png"
        message=""
        w="w-6"
        h="h-6"
      />
  </div>

  <!-- Desktop Sidebar -->
  <div
    v-else
    :style="{ width: mainStore.sidebarWidth + 'px' }"
    :class="[
      'flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out gap-2 relative group h-full'
    ]"
  >
    <!-- Resize Handle -->
    <div
      @mousedown="startResize"
      class="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-green-500/50 transition-colors z-50 flex items-center justify-center"
    >
      <div class="w-[2px] h-8 bg-white/20 rounded-full group-hover:bg-white/40"></div>
    </div>

    <!-- Toggle Button -->
    <div 
      class="hidden md:flex w-full h-[60px] items-center mb-1"
      :class="mainStore.isSidebarCollapsed ? 'justify-center' : 'justify-end pr-5'"
    >
        <button 
           @click="mainStore.toggleSidebar"
           class="glass p-2 rounded-full hover:bg-white/10 transition-all hidden md:block"
        >
            <Menu v-if="mainStore.isSidebarCollapsed" :size="20" fillColor="#FFFFFF" />
            <ChevronLeft v-else :size="20" fillColor="#FFFFFF" />
        </button>
    </div>

    <div 
      id="Navigation" 
      class="glass-dark !border-none rounded-lg overflow-hidden transition-all duration-300"
      :class="mainStore.isSidebarCollapsed ? 'mx-1' : 'mx-2'"
    >
      <div class="flex flex-col gap-y-1 p-2">
          <SidebarItem
            pageUrl="/"
            iconUrl="/images/icons/home-icon.png"
            message="Inicio"
            w="w-6"
            h="h-6"
          />
          <SidebarItem
            pageUrl="/search"
            iconUrl="/images/icons/search-icon.png"
            message="Buscar"
            w="w-6"
            h="h-6"
          />
      </div>
    </div>

    <div
      v-if="mainStore.$state.token"
      id="Actions"
      class="glass-dark !border-none rounded-lg overflow-hidden transition-all duration-300 mt-2"
      :class="mainStore.isSidebarCollapsed ? 'mx-1' : 'mx-2'"
    >
      <div class="flex flex-col gap-y-1 p-2">
          <SidebarItem
            @click="openUploadSongModal"
            iconUrl="/images/icons/upload-icon.png"
            message="Subir"
            w="w-7"
            h="h-7"
          />
          <SidebarItem
            @click="openCreatePlaylistModal"
            iconUrl="/images/icons/playlist-icon.png"
            message="Crear"
            w="w-7"
            h="h-7"
          />
      </div>
    </div>

    <div
      v-if="mainStore.$state.token"
      id="Playlists"
      class="h-screen overflow-y-hidden overflow-x-hidden hover:overflow-y-auto glass-dark rounded-lg"
    >
      <div class="grid grid-rows gap-y-2 p-1.5 rounded-lg">
          <PlaylistItem
            v-for="playlist in mainStore.myPlaylists"
            :playlist="playlist"
            :key="playlist.id"
          />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useMainStore } from "@/stores/main";
import PlaylistItem from "@/components/PlaylistItem.vue";
import SidebarItem from "@/components/SidebarItem.vue";
import UploadSongModal from "@/components/modal/UploadSongModal.vue";
import CreatePlaylistModal from "@/components/modal/CreatePlaylistModal.vue";

import Menu from "vue-material-design-icons/Menu.vue";
import ChevronLeft from "vue-material-design-icons/ChevronLeft.vue";

let showUploadSongModal = ref(false);
let showCreatePlaylistModal = ref(false);

function openUploadSongModal() {
  showUploadSongModal.value = true;
}

function openCreatePlaylistModal() {
  showCreatePlaylistModal.value = true;
}

const mainStore = useMainStore();

const isResizing = ref(false);
const windowWidth = ref(window.innerWidth);

const updateWidth = () => {
  windowWidth.value = window.innerWidth;
  if (windowWidth.value < 768 && !mainStore.isSidebarCollapsed) {
    mainStore.isSidebarCollapsed = true;
    mainStore.setSidebarWidth(64); // Reduced width for mobile
  } else if (windowWidth.value < 768 && mainStore.isSidebarCollapsed && mainStore.sidebarWidth !== 64) {
    mainStore.setSidebarWidth(64);
  } else if (windowWidth.value >= 768 && mainStore.isSidebarCollapsed && mainStore.sidebarWidth === 64) {
    mainStore.setSidebarWidth(80); // Default collapsed width for desktop
  }
};

const startResize = (e) => {
  if (windowWidth.value < 768) return; // Disable resizing on mobile
  isResizing.value = true;
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', stopResize);
  document.body.style.cursor = 'col-resize';
  document.body.classList.add('select-none');
};

const handleMouseMove = (e) => {
  if (!isResizing.value) return;
  
  let newWidth = e.clientX;
  
  // Constraints
  const collapsedWidth = windowWidth.value < 768 ? 64 : 80;
  if (newWidth < 100) newWidth = collapsedWidth; 
  if (newWidth > 100 && newWidth < 180) newWidth = 180; // Minimum expanded
  if (newWidth > 300) newWidth = 300; // Maximum
  
  mainStore.setSidebarWidth(newWidth);
};

const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', stopResize);
  document.body.style.cursor = 'default';
  document.body.classList.remove('select-none');
};

onMounted(() => {
  window.addEventListener('resize', updateWidth);
  updateWidth(); // Initial check
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth);
});
</script>

<style scoped>
/* Individual scrollbar styles managed by global styles or scoped if needed */
</style>
