import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: Home
  },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue")
  }, 
  {
    path: '/register',
    name: 'register',
    component: () => 
      import(/* webpackChunkName: "register"*/ '../views/Register.vue')
  }, 
  {
    path: '/profile.html',
    name: 'profile',
    component: () => 
      import(/* webpackChunkName: "register"*/ '../views/Profile.vue')
  }
];

const router = new VueRouter({
  mode: "history",
  base: "/connect",
  routes
});

export default router;