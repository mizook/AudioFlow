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
    systemSongs: [],
    systemPlaylists: [],
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
  },
  persist: true,
});
