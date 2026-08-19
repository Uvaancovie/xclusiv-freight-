import { $, $$ } from "../core/utils.js";
import { esc, toast, now } from "../core/utils.js";
import { DB, DRIVERS } from "../core/store.js";
import { state, navigate, refresh } from "../core/router.js";
import { fillDispatchForm } from "./dispatch.js";

export function renderLoads() {
  const filter = state.loadFilter;
  const q = state.loadQuery.toLowerCase();
  const list = DB.loads()
    .filter((l) => (filter === "all" ? true : l.status.toLowerCase() === filter))
    .filter(
      (l) =>
        !q ||
        l.load_id.toLowerCase().includes(q) ||
        l.assigned_driver.toLowerCase().includes(q) ||
        l.truck_registration.toLowerCase().includes(q) ||
        l.origin.toLowerCase().includes(q) ||
        l.destination.toLowerCase().includes(q)
    )
    .sort((a, b) => b.created_at - a.created_at);

  $("#loadList").innerHTML = list
    .map(
      (l) => `
      <li class="card">
        <div class="card-top">
          <h3>${esc(l.load_id)} <small>${esc(l.truck_registration)}</small></h3>
          <span class="badge ${l.status.toLowerCase()}">${esc(l.status)}</span>
        </div>
        <div class="card-row"><b>${esc(l.assigned_driver)}</b></div>
        <div class="card-row">📍 ${esc(l.origin)} → 📍 ${esc(l.destination)}</div>
        <div class="card-row">📦 ${esc(l.cargo_details)} · ${Number(l.weight_tons)}t · ${l.pallet_count} pallets</div>
        ${l.special_instructions ? `<div class="card-row">⚠️ ${esc(l.special_instructions)}</div>` : ""}
        <div class="row" style="margin-top:4px">
          <button class="btn ghost" data-dispatch-load="${esc(l.load_id)}">Dispatch</button>
          ${state.role === "owner" ? `<button class="btn ghost" data-complete-load="${esc(l.load_id)}">Mark Complete</button>` : ""}
        </div>
      </li>`
    )
    .join("");

  $$("#loadList [data-dispatch-load]").forEach((b) =>
    b.addEventListener("click", () => {
      navigate("dispatch");
      setTimeout(() => {
        $("#dispatchForm select[name=load]").value = b.dataset.dispatchLoad;
        fillDispatchForm(b.dataset.dispatchLoad);
      }, 50);
    })
  );
  $$("#loadList [data-complete-load]").forEach((b) =>
    b.addEventListener("click", () => {
      const loads = DB.loads();
      const l = loads.find((x) => x.load_id === b.dataset.completeLoad);
      if (l) {
        l.status = "COMPLETED";
        DB.saveLoads(loads);
        toast(`${l.load_id} marked COMPLETED`);
        refresh();
      }
    })
  );
}

export function openLoadModal() {
  const drivers = DRIVERS.map((d) => `<option>${d.name} · ${d.truck}</option>`).join("");
  $("#app").insertAdjacentHTML(
    "beforeend",
    `<div class="modal-scrim" id="loadModal">
      <div class="modal">
        <h2>New Load Instruction</h2>
        <form class="form" id="loadForm">
          <label>Load / Trip Ref <input name="load_id" placeholder="TR-2044" required /></label>
          <div class="row" style="margin-top:0">
            <label style="flex:1">Truck Registration <input name="truck_registration" placeholder="ND 842-119" required /></label>
            <label style="flex:1">Driver <select name="assigned_driver" required>${drivers}</select></label>
          </div>
          <div class="row" style="margin-top:0">
            <label style="flex:1">Pickup (Origin) <input name="origin" placeholder="Johannesburg" required /></label>
            <label style="flex:1">Offload (Destination) <input name="destination" placeholder="Durban" required /></label>
          </div>
          <label>Cargo Details <input name="cargo_details" placeholder="e.g. Containers 2x 20ft" /></label>
          <div class="row" style="margin-top:0">
            <label style="flex:1">Weight (tons) <input type="number" name="weight_tons" step="0.1" placeholder="27.4" /></label>
            <label style="flex:1">Pallets <input type="number" name="pallet_count" placeholder="12" /></label>
          </div>
          <label>Special Instructions <input name="special_instructions" placeholder="Tarping / temperature control" /></label>
          <div class="row">
            <button type="button" class="btn ghost" id="cancelLoad">Cancel</button>
            <button type="submit" class="btn primary">Dispatch Load</button>
          </div>
        </form>
      </div>
    </div>`
  );
  $("#cancelLoad").addEventListener("click", closeLoadModal);
  $("#loadModal").addEventListener("click", (e) => {
    if (e.target.id === "loadModal") closeLoadModal();
  });
  $("#loadForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const load = {
      load_id: fd.get("load_id").trim().toUpperCase(),
      truck_registration: fd.get("truck_registration").trim().toUpperCase(),
      assigned_driver: fd.get("assigned_driver").trim().split(" · ")[0],
      origin: fd.get("origin").trim(),
      destination: fd.get("destination").trim(),
      cargo_details: fd.get("cargo_details").trim(),
      weight_tons: parseFloat(fd.get("weight_tons")) || 0,
      pallet_count: parseInt(fd.get("pallet_count")) || 0,
      special_instructions: fd.get("special_instructions").trim(),
      status: "ACTIVE",
      created_at: now(),
    };
    if (DB.loads().some((l) => l.load_id === load.load_id)) {
      toast("Load reference already exists");
      return;
    }
    const loads = DB.loads();
    loads.unshift(load);
    DB.saveLoads(loads);
    closeLoadModal();
    refresh();
    toast(`Load ${load.load_id} dispatched to ${load.assigned_driver}`);
    setTimeout(() => {
      navigate("dispatch");
      setTimeout(() => {
        $("#dispatchForm select[name=load]").value = load.load_id;
        fillDispatchForm(load.load_id);
      }, 50);
    }, 600);
  });
}

export function closeLoadModal() {
  const m = $("#loadModal");
  if (m) m.remove();
}