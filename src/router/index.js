import { createRouter, createWebHistory } from "vue-router";
import { useMainStore } from "@/stores/main";

import HomeView from "@/views/HomeView.vue";
import SearchView from "@/views/SearchView.vue";
import PlaylistView from "@/views/PlaylistView.vue";
import ProfileView from "@/views/ProfileView.vue";

const routes = [
  {
    path: "/",
    component: HomeView,
  },
  {
    path: "/search",
    component: SearchView,
  },
  {
    path: "/profile",
    component: ProfileView,
    meta: { requiresAuth: true },
  },
  {
    path: "/playlist/:id",
    component: PlaylistView,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guardia de navegación para verificar autenticación
router.beforeEach((to, from, next) => {
  const mainStore = useMainStore();

  if (to.meta.requiresAuth && !mainStore.$state.token) {
    next("/");
  } else {
    next();
  }
});

export default router;
