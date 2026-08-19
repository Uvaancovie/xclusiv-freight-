import { $, $$, toast } from "./utils.js";
import { KEYS, read, write } from "./store.js";

export const state = {
  role: read(KEYS.role, "owner"),
  route: "dashboard",
  pendingImage: null,
  loadFilter: "all",
  loadQuery: "",
  driverQuery: "",
  slipQuery: "",
};

export const OWNER_ROUTES = ["dashboard", "loads", "scan", "signature", "dispatch", "drivers", "reports"];
export const DRIVER_ROUTES = ["dashboard", "scan", "signature", "dispatch"];

let renderFn = null;
const enterHooks = {};
const leaveHooks = {};

export function setRender(fn) {
  renderFn = fn;
}

export function refresh() {
  if (renderFn) renderFn();
}

export function onRouteEnter(route, fn) {
  enterHooks[route] = fn;
}

export function onRouteLeave(route, fn) {
  leaveHooks[route] = fn;
}

export function navigate(route) {
  if (!route) return;
  const allowed = state.role === "owner" ? OWNER_ROUTES : DRIVER_ROUTES;
  if (!allowed.includes(route)) route = "dashboard";
  if (state.route !== route) {
    const leave = leaveHooks[state.route];
    if (leave) leave();
  }
  state.route = route;
  $$(".view").forEach((v) => v.classList.toggle("hidden", v.dataset.route !== route));
  $$(".nav-link").forEach((a) => a.classList.toggle("active", a.dataset.route === route));
  $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.route === route));
  closeDrawer();
  refresh();
  const enter = enterHooks[route];
  if (enter) enter();
  window.scrollTo(0, 0);
}

export function openDrawer() {
  $("#drawer").classList.add("open");
  $("#scrim").classList.add("show");
  $("#menuBtn").setAttribute("aria-expanded", "true");
  $("#drawer").setAttribute("aria-hidden", "false");
}

export function closeDrawer() {
  $("#drawer").classList.remove("open");
  $("#scrim").classList.remove("show");
  $("#menuBtn").setAttribute("aria-expanded", "false");
  $("#drawer").setAttribute("aria-hidden", "true");
}

export function renderNav() {
  const isOwner = state.role === "owner";
  $("#roleOwner").classList.toggle("active", isOwner);
  $("#roleDriver").classList.toggle("active", !isOwner);
  $("#roleLabel").textContent = isOwner ? "Fleet Owner Console" : "Driver Console";
  $$(".owner-only").forEach((el) => el.classList.toggle("hidden", !isOwner));

  $$(".nav-link").forEach((a) => {
    const visible = isOwner || DRIVER_ROUTES.includes(a.dataset.route);
    a.classList.toggle("hidden", !visible);
  });
  $$(".tab").forEach((t) => {
    const visible = isOwner || ["dashboard", "scan", "dispatch"].includes(t.dataset.route);
    t.classList.toggle("hidden", !visible);
  });
}

export function setRole(role) {
  if (role !== "owner" && role !== "driver") return;
  state.role = role;
  write(KEYS.role, role);
  renderNav();
  navigate(state.route);
  toast(`Switched to ${role === "owner" ? "Fleet Owner" : "Driver"} console`);
}