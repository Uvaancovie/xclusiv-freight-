import { $, $$, toast } from "./core/utils.js";
import { setRender, navigate, renderNav, setRole, openDrawer, closeDrawer, state } from "./core/router.js";
import { seed } from "./data/seed.js";
import { renderDashboard } from "./views/dashboard.js";
import { renderLoads, openLoadModal, closeLoadModal } from "./views/loads.js";
import { renderDrivers } from "./views/drivers.js";
import { renderSlips, bindScan } from "./views/scan.js";
import { initSigPad } from "./views/signature.js";
import { populateDispatchSelects, fillDispatchForm, handleDispatchSubmit, renderDispatchHistory } from "./views/dispatch.js";
import { renderReports, bindReports } from "./views/reports.js";

function render() {
  renderNav();
  renderDashboard();
  renderLoads();
  renderDrivers();
  renderSlips();
  renderDispatchHistory();
  renderReports();
  populateDispatchSelects();
}

function bind() {
  $$(".nav-link").forEach((a) => a.addEventListener("click", () => navigate(a.dataset.route)));
  $$(".tab").forEach((t) => t.addEventListener("click", () => navigate(t.dataset.route)));
  $("#menuBtn").addEventListener("click", openDrawer);
  $("#scrim").addEventListener("click", closeDrawer);
  $("#roleOwner").addEventListener("click", () => setRole("owner"));
  $("#roleDriver").addEventListener("click", () => setRole("driver"));
  $("#refreshActivity").addEventListener("click", () => {
    render();
    toast("Activity refreshed");
  });

  $$(".chip").forEach((c) =>
    c.addEventListener("click", () => {
      $$(".chip").forEach((x) => x.classList.remove("active"));
      c.classList.add("active");
      state.loadFilter = c.dataset.filter;
      renderLoads();
    })
  );

  $("#newLoadBtn").addEventListener("click", openLoadModal);
  $("#newLoadHeroBtn").addEventListener("click", openLoadModal);
  $("#dispatchForm").addEventListener("submit", handleDispatchSubmit);
  $("#dispatchForm select[name=load]").addEventListener("change", (e) => fillDispatchForm(e.target.value.split(" · ")[0]));

  bindScan();
  bindReports();

  const loadSearch = document.createElement("div");
  loadSearch.className = "search";
  loadSearch.innerHTML = `<span>🔍</span><input type="search" id="loadSearch" placeholder="Search by load, driver, truck..." />`;
  $("#view-loads").insertBefore(loadSearch, $("#view-loads .filter-row").nextSibling);
  $("#loadSearch").addEventListener("input", (e) => {
    state.loadQuery = e.target.value;
    renderLoads();
  });

  const driverSearch = document.createElement("div");
  driverSearch.className = "search";
  driverSearch.innerHTML = `<span>🔍</span><input type="search" id="driverSearch" placeholder="Search drivers..." />`;
  $("#view-drivers").insertBefore(driverSearch, $("#view-drivers .cards"));
  $("#driverSearch").addEventListener("input", (e) => {
    state.driverQuery = e.target.value;
    renderDrivers();
  });

  const slipSearch = document.createElement("div");
  slipSearch.className = "search";
  slipSearch.innerHTML = `<span>🔍</span><input type="search" id="slipSearch" placeholder="Search by load, vendor, location..." />`;
  const slipPanel = $("#view-scan .panel:last-child");
  slipPanel.insertBefore(slipSearch, slipPanel.querySelector(".thumbs"));
  $("#slipSearch").addEventListener("input", (e) => {
    state.slipQuery = e.target.value;
    renderSlips();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLoadModal();
  });
}

function init() {
  seed();
  setRender(render);
  bind();
  initSigPad();
  renderNav();
  navigate("dashboard");
}

document.addEventListener("DOMContentLoaded", init);