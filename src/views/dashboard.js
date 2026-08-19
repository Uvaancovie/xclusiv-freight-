import { $, $$ } from "../core/utils.js";
import { esc, money, timeAgo } from "../core/utils.js";
import { DB } from "../core/store.js";
import { state } from "../core/router.js";

export function renderDashboard() {
  const loads = DB.loads();
  const slips = DB.slips();
  const pods = DB.pods();
  const active = loads.filter((l) => l.status === "ACTIVE");
  const onRoad = new Set(active.map((l) => l.assigned_driver)).size;
  const today = slips.filter((s) => new Date(s.timestamp).toDateString() === new Date().toDateString()).length;

  $("#statActive").textContent = active.length;
  $("#statDrivers").textContent = `${onRoad}`;
  $("#statSlips").textContent = today;

  const hero = $("#view-dashboard .hero h1");
  hero.innerHTML =
    state.role === "driver"
      ? `Good day, <span class="accent">Driver</span>`
      : `Good day, <span class="accent">Sebastian</span>`;

  const events = [
    ...pods.map((p) => ({ ts: p.arrival_time, type: "pod", label: "POD signed", sub: `${p.consignee_name} · ${p.load_id}` })),
    ...slips.map((s) => ({ ts: s.timestamp, type: s.type, label: `${s.type} captured`, sub: `${money(s.amount_zar)} · ${s.vendor || s.location_stamp} · ${s.load_id}` })),
    ...DB.history().map((h) => ({ ts: h.ts, type: "dispatch", label: "Dispatch sent", sub: `${h.load_id} → ${h.channel}` })),
  ]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 5);

  $("#activityList").innerHTML = events
    .map((e) => {
      const dotClass = e.type === "pod" ? "green" : e.type === "dispatch" ? "" : "orange";
      return `<li><span class="dot ${dotClass}"></span><div><strong>${esc(e.label)}</strong><br><small>${esc(e.sub)} · ${timeAgo(e.ts)}</small></div></li>`;
    })
    .join("");

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const sums = Array(7).fill(0);
  slips.forEach((s) => {
    const d = new Date(s.timestamp);
    sums[d.getDay()] += Number(s.amount_zar) || 0;
  });
  const max = Math.max(...sums, 1);
  $("#spendBars").innerHTML = sums
    .map((v, i) => `<div class="bar"><span style="height:${Math.max(6, Math.round((v / max) * 100))}%"></span><small>${days[i]}</small></div>`)
    .join("");
}