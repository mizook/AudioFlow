import { usePlayerStore } from "./player";
import { defineStore } from "pinia";
import router from "@/router";

export const useMainStore = defineStore({
  id: "main",

  state: () => ({
    user: null,
    token: "",
    mySongs: [],
    myPlaylists: [],
    availableSongs: [],
    systemSongs: [],
    systemPlaylists: [],
    isSidebarCollapsed: false,
    sidebarWidth: 230,
  }),

  actions: {
    loginUser(data) {
      this.user = data.user;
      this.token = data.token;
      router.push("/");
    },
    logoutUser() {
      this.user = null;
      this.token = "";
      this.mySongs = [];
      this.myPlaylists = [];
      this.systemPlaylists = [];
      router.push("/");
      setTimeout(() => {
        window.location.reload();
      }, 50);
    },
    loadSongs(songs) {
      this.systemSongs = songs;
    },
    LoadPlaylists(playlists) {
      this.systemPlaylists = playlists;
    },
    loadMySongs(songs) {
      this.mySongs = songs;
    },
    loadMyPlaylists(playlists) {
      this.myPlaylists = playlists;
    },
    addSystemSong(song) {
      this.systemSongs.push(song);
      this.mySongs.push(song);
    },
    addSystemPlaylist(playlist) {
      this.systemPlaylists.push(playlist);
      this.myPlaylists.push(playlist);
    },
    clearMySongs() {
      this.mySongs = [];
    },
    clearSystemSongs() {
      this.systemSongs = [];
    },
    clearSystemPlaylist() {
      this.systemPlaylists = [];
    },
    deleteSystemSong(song) {
      this.systemSongs = this.systemSongs.filter((s) => s.id !== song.id);
      this.mySongs = this.mySongs.filter((s) => s.id !== song.id);
    },
    deleteSystemPlaylist(id) {
      this.myPlaylists = this.myPlaylists.filter((p) => p.id !== id);
      this.systemPlaylists = this.systemPlaylists.filter((p) => p.id !== id);
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
      if (this.isSidebarCollapsed) {
        this.sidebarWidth = 80;
      } else {
        this.sidebarWidth = 230;
      }
    },
    setSidebarWidth(width) {
      this.sidebarWidth = width;
      if (width <= 100) {
        this.isSidebarCollapsed = true;
      } else {
        this.isSidebarCollapsed = false;
      }
    },
    async initializeLibrary() {
      const allLocalSongs = [
        {
          id: "local-1",
          name: "Baila Morena",
          artist: "Kidd Voodoo",
          coverURL: "/images/albumCovers/baila-morena.png",
          audioURL: "/songs/baila-morena.mp3",
          duration: 218
        },
        {
          id: "local-2",
          name: "Darkera",
          artist: "Easykid",
          coverURL: "/images/albumCovers/darkera.jpg",
          audioURL: "/songs/darkera.mp3",
          duration: 180
        },
        {
          id: "local-3",
          name: "Smoking Out The Window",
          artist: "Silk Sonic",
          coverURL: "/images/albumCovers/smoking-out-the-window.jpg",
          audioURL: "/songs/smoking-out-the-window.mp3",
          duration: 197
        },
        {
          id: "local-4",
          name: "Tú Me Mientes",
          artist: "DrefQuila",
          coverURL: "/images/albumCovers/tu-me-mientes.jpg",
          audioURL: "/songs/tu-me-mientes.mp3",
          duration: 185
        },
        {
          id: "local-5",
          name: "Un Preview",
          artist: "Bad Bunny",
          coverURL: "/images/albumCovers/un-preview.jpg",
          audioURL: "/songs/un-preview.mp3",
          duration: 165
        },
        {
          id: "local-6",
          name: "Y Podría",
          artist: "Resonancia Etérea",
          coverURL: "/images/albumCovers/y-podria.jpg",
          audioURL: "/songs/y-podria.mp3",
          duration: 202
        }
      ];

      this.availableSongs = allLocalSongs;

      // Force refresh if library is empty OR contains old Jamendo songs
      const hasOldSongs = this.systemSongs.length > 0 && this.systemSongs[0].id.startsWith('jam-');

      if (this.systemSongs.length === 0 || hasOldSongs) {
        this.systemSongs = [allLocalSongs[1], allLocalSongs[3], allLocalSongs[5]]; // Darkera, Tu Me Mientes, Y Podría
        if (this.token) {
          this.mySongs = [...this.systemSongs];
        }
      }
    },
  },
  persist: true,
});
