import { $ } from "../core/utils.js";
import { esc } from "../core/utils.js";
import { DB, DRIVERS } from "../core/store.js";
import { state } from "../core/router.js";

export function renderDrivers() {
  const loads = DB.loads();
  const q = state.driverQuery.toLowerCase();
  const rows = DRIVERS.map((d) => {
    const trips = loads.filter((l) => l.assigned_driver === d.name);
    const activeTrips = trips.filter((l) => l.status === "ACTIVE").length;
    return { ...d, activeTrips, trips: trips.length };
  }).filter((d) => !q || d.name.toLowerCase().includes(q) || d.truck.toLowerCase().includes(q));

  $("#driverList").innerHTML =
    rows
      .map(
        (d) => `
      <li class="card">
        <div class="card-top">
          <h3>👤 ${esc(d.name)} <small>${esc(d.truck)}</small></h3>
          <span class="badge ${d.activeTrips ? "active" : "completed"}">${d.activeTrips ? `${d.activeTrips} on road` : "Idle"}</span>
        </div>
        <div class="card-row">Total trips: <b>${d.trips}</b></div>
      </li>`
      )
      .join("") || '<li class="muted" style="text-align:center;padding:20px">No drivers match.</li>';
}