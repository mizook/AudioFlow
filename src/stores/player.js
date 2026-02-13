import { defineStore } from "pinia";

export const usePlayerStore = defineStore({
  id: "player",

  state: () => ({
    player: {
      id: "",
      user_id: "",
      currentSong: null,
      queue: [],
      currentTime: 0,
      volume: 100,
      isPlaying: false,
      showLyrics: false,
    },
    lastPlayed: [],
    subscribed: false,
    lyricsCache: {},
  }),

  actions: {
    toggleLyrics() {
      this.player.showLyrics = !this.player.showLyrics;
    },
    cacheLyrics(songId, lyrics) {
      this.lyricsCache[songId] = lyrics;
    },
    storePlayer(player) {
      const { id, currentTime, volume, user_id, currentSong, queue } = player;
      this.player.id = id;
      this.player.user_id = user_id;
      if (currentSong) this.player.currentSong = currentSong;
      this.player.currentTime = currentTime;
      this.player.volume = volume;
      if (queue) this.player.queue = queue;
    },

    destorePlayer() {
      this.player = {
        id: "",
        user_id: "",
        currentSong: null,
        queue: [],
        currentTime: 0,
        volume: 100,
        isPlaying: false,
        showLyrics: false,
      };
      this.lastPlayed = [];
    },

    playSong(song) {
      if (this.player.currentSong) {
        if (this.player.currentSong.id == song.id) return;
        this.lastPlayed.unshift(this.player.currentSong);
        if (this.lastPlayed.length > 5) {
          this.lastPlayed.pop();
        }
      }
      this.player.currentTime = 0;
      this.player.isPlaying = true;
      this.player.currentSong = song;
    },

    addToQueue(song) {
      this.player.queue.push(song);
    },

    addPlaylistToQueue(playlist) {
      const firstSong = playlist[0];
      this.playSong(firstSong);
      this.player.queue = [];
      this.restorePrevSong();
      for (const song of playlist) {
        if (this.player.currentSong?.id != song.id) {
          this.player.queue.push(song);
        }
      }
    },

    nextSong() {
      if (this.player.queue.length > 0) {
        this.player.currentTime = 0;
        this.player.isPlaying = true;
        this.playSong(this.player.queue.shift());
      } else {
        // If queue is empty, loop through systemSongs in MainStore
        const mainStore = useMainStore();
        const currentIndex = mainStore.systemSongs.findIndex(s => s.id === this.player.currentSong?.id);
        if (currentIndex !== -1 && currentIndex < mainStore.systemSongs.length - 1) {
          this.playSong(mainStore.systemSongs[currentIndex + 1]);
        } else if (mainStore.systemSongs.length > 0) {
          this.playSong(mainStore.systemSongs[0]); // Loop to first
        }
      }
    },

    prevSong() {
      if (this.lastPlayed.length > 0) {
        if (this.player.currentSong) {
          this.player.queue.unshift(this.player.currentSong);
        }
        const previousSong = this.lastPlayed.shift();
        if (previousSong == null) return;
        this.player.currentTime = 0;
        this.player.isPlaying = true;
        this.player.currentSong = previousSong;
      } else {
        // If nothing in lastPlayed, try to go to previous in systemSongs
        const mainStore = useMainStore();
        const currentIndex = mainStore.systemSongs.findIndex(s => s.id === this.player.currentSong?.id);
        if (currentIndex > 0) {
          this.playSong(mainStore.systemSongs[currentIndex - 1]);
        }
      }
    },

    restorePrevSong() {
      this.lastPlayed = [];
    },

    updateCurrentTime(time) {
      this.player.currentTime = time;
    },

    updateVolume(volume) {
      this.player.volume = volume;
    },
  },
  persist: true,
});
