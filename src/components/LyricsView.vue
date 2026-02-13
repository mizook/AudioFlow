<template>
  <div class="relative w-full h-full overflow-hidden bg-[#121212] flex flex-col">
    <!-- Immersive Background -->
    <div class="absolute inset-0 z-0">
      <div 
        class="absolute inset-0 bg-cover bg-center scale-110 blur-[100px] opacity-40 transition-all duration-1000"
        :style="{ backgroundImage: `url(${song.coverURL})` }"
      ></div>
      <div class="absolute inset-0 bg-black/40"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 flex flex-col h-full">
      <!-- Header with song info -->
      <div class="p-8 pb-4 flex items-center justify-between">
        <div class="flex items-center space-x-6">
          <div class="h-16 w-16 md:h-24 md:w-24 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 border border-white/10">
            <img :src="song.coverURL" class="w-full h-full object-cover" />
          </div>
          <div>
            <h1 class="text-xl md:text-5xl font-black text-white tracking-tighter mb-2">{{ song.name }}</h1>
            <p class="text-sm md:text-xl text-white/60 font-medium">{{ song.artist }}</p>
          </div>
        </div>
        <button 
          @click="playerStore.toggleLyrics()"
          class="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10"
        >
          <Close :size="32" />
        </button>
      </div>

      <!-- Lyrics Scrolling Area -->
      <div class="flex-1 overflow-y-auto px-8 md:px-20 py-10 no-scrollbar relative flex flex-col items-center">
        <div v-if="loading" class="absolute inset-0 flex flex-col items-center justify-center space-y-6">
          <div class="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
          <p class="text-white/40 text-lg font-medium animate-pulse">Sincronizando letras...</p>
        </div>

        <div v-else-if="error" class="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
          <div class="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
            <AlertCircle :size="40" class="text-red-500" />
          </div>
          <p class="text-white/60 text-lg mb-8">{{ error }}</p>
          <button 
            @click="fetchLyrics"
            class="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
          >
            Reintentar
          </button>
        </div>

        <div v-else class="w-full max-w-4xl flex flex-col items-center">
          <div class="w-full flex flex-col items-center space-y-4 pb-32">
            <template v-for="(line, index) in lyricsLines" :key="index">
              <!-- Section Tags (e.g. [Intro], [Chorus]) -->
              <div 
                v-if="line.trim().startsWith('[') && line.trim().endsWith(']')"
                class="text-xs md:text-sm uppercase tracking-[0.4em] font-black text-yellow-500/40 mt-10 mb-4 italic text-center"
              >
                {{ line.trim() }}
              </div>
              
              <!-- Regular Lyric Lines -->
              <p 
                v-else-if="line.trim()"
                class="lyrics-text font-sans text-xl md:text-3xl font-bold text-white/80 hover:text-white hover:scale-105 hover:bg-white/5 transition-all duration-300 cursor-default text-center w-full py-1 rounded-lg px-4 origin-center"
              >
                {{ line }}
              </p>
              
              <!-- Blank Line Spacer -->
              <div v-else class="h-6"></div>
            </template>
          </div>
          
          <div class="mt-12 pt-12 border-t border-white/10 flex flex-col items-center space-y-4 opacity-40 hover:opacity-100 transition-opacity pb-20 w-full">
            <div class="flex items-center space-x-3">
               <div class="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center text-[12px] font-black text-black">G</div>
               <p class="text-xs uppercase tracking-[0.3em] font-black text-white">Genius Lyric Technology</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import Close from "vue-material-design-icons/Close.vue";
import AlertCircle from "vue-material-design-icons/AlertCircle.vue";
import { usePlayerStore } from "@/stores/player";
import axios from "axios";

const props = defineProps({
  song: {
    type: Object,
    required: true
  }
});

const playerStore = usePlayerStore();



const lyrics = ref("");
const loading = ref(true);
const error = ref("");

// Split lyrics into lines for better styling control
const lyricsLines = computed(() => {
  if (!lyrics.value) return [];
  return lyrics.value.split('\n');
});

const fetchLyrics = async () => {
  // Check persistent store cache first
  if (playerStore.lyricsCache && playerStore.lyricsCache[props.song.id]) {
    lyrics.value = playerStore.lyricsCache[props.song.id];
    loading.value = false;
    error.value = "";
    return;
  }

  const query = `${props.song.name} ${props.song.artist}`;
  
  loading.value = true;
  error.value = "";
  lyrics.value = "";

  try {
    // 1. Try Vercel Serverless Function (internal API) first
    // This will work in Production (Vercel) but fail locally with Vite (404)
    try {
        const response = await axios.get(`/api/lyrics`, {
            params: { q: query },
            timeout: 5000 // Short timeout to fail fast locally
        });
        
        const finalLyrics = response.data.lyrics;
        if (finalLyrics) {
            playerStore.cacheLyrics(props.song.id, finalLyrics);
            lyrics.value = finalLyrics;
            error.value = "";
            loading.value = false;
            return; // Success via API!
        }
    } catch (apiErr) {
        console.warn("Internal API failed (expected locally), trying fallbacks...", apiErr.message);
        // Continue to fallback logic below
    }

    // 2. Fallback: Client-side Scraping with Proxies (for Localhost / Backup)
    const ACCESS_TOKEN = import.meta.env.VITE_GENIUS_ACCESS_TOKEN; 
    const SEARCH_URL = "https://api.genius.com/search";
    
    // Fallback Proxies
    const PROXIES = [
        "https://api.codetabs.com/v1/proxy?quest=",
        "https://api.allorigins.win/get?url=",
        "https://corsproxy.io/?",
        "https://thingproxy.freeboard.io/fetch/"
    ];
    
    // Helper for proxies
    const fetchWithProxy = async (url) => {
        let lastError = null;
        for (const proxy of PROXIES) {
            try {
                const fullUrl = proxy.includes("allorigins") ? `${proxy}${encodeURIComponent(url)}` : `${proxy}${url}`;
                const response = await fetch(fullUrl);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                if (proxy.includes("allorigins")) {
                    const data = await response.json();
                    return typeof data.contents === 'string' ? data.contents : JSON.stringify(data.contents);
                }
                return await response.text();
            } catch (err) {
                console.warn(`Proxy ${proxy} failed:`, err);
                lastError = err;
            }
        }
        throw lastError || new Error("No se pudo conectar con los servidores de letras.");
    };

    if (!ACCESS_TOKEN) throw new Error("API Token missing for fallback.");

    const searchUrl = `${SEARCH_URL}?q=${encodeURIComponent(query)}&access_token=${ACCESS_TOKEN}`;
    const searchContents = await fetchWithProxy(searchUrl);
    
    let searchData;
    try { searchData = JSON.parse(searchContents); } catch (e) { throw new Error("Error de respuesta API (Fallback)."); }

    if (!searchData.response || !searchData.response.hits || searchData.response.hits.length === 0) {
        throw new Error("Letra no encontrada.");
    }

    const songUrl = searchData.response.hits[0].result.url;
    const html = await fetchWithProxy(songUrl);

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const containers = doc.querySelectorAll('[class^="Lyrics__Container"]');
    let lyricsText = "";

    if (containers.length > 0) {
      containers.forEach(container => {
        container.querySelectorAll('script, .SponsorshipAd__Container').forEach(s => s.remove());
        container.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
        lyricsText += container.textContent + "\n\n";
      });
    } else {
      const oldLyrics = doc.querySelector('.lyrics');
      if (oldLyrics) lyricsText = oldLyrics.textContent;
    }

    if (!lyricsText.trim()) throw new Error("No se pudo extraer el texto (Fallback).");
    
    const finalLyrics = lyricsText.trim().replace(/\n{3,}/g, '\n\n');
    lyrics.value = finalLyrics;
    
    // Save to persistent store cache
    playerStore.cacheLyrics(props.song.id, finalLyrics);

  } catch (err) {
    console.error("All fetch methods failed:", err);
    error.value = "No pudimos encontrar la letra de esta canción.";
  } finally {
    loading.value = false;
  }
};

watch(() => props.song.id, () => {
  fetchLyrics();
});

onMounted(() => {
  fetchLyrics();
});
</script>

<style scoped>
.lyrics-text {
  text-shadow: 0 4px 20px rgba(0,0,0,0.5);
}

pre {
  font-family: 'Inter', sans-serif;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
