import { $, $$ } from "../core/utils.js";
import { esc, money, fmtDate, now, timeAgo, toast } from "../core/utils.js";
import { DB, DRIVERS, SEBASTIAN } from "../core/store.js";
import { refresh } from "../core/router.js";

export function populateDispatchSelects() {
  const loadSel = $("#dispatchForm select[name=load]");
  const driverSel = $("#dispatchForm select[name=driver]");
  const keepLoad = loadSel.value;
  loadSel.innerHTML = DB.loads()
    .map((l) => `<option value="${esc(l.load_id)}">${esc(l.load_id)} · ${esc(l.origin)} → ${esc(l.destination)}</option>`)
    .join("");
  if (keepLoad && DB.loads().some((l) => l.load_id === keepLoad)) loadSel.value = keepLoad;
  driverSel.innerHTML = DRIVERS.map((d) => `<option>${d.name} · ${d.truck}</option>`).join("");
}

export function fillDispatchForm(loadId) {
  const load = DB.loads().find((l) => l.load_id === loadId);
  if (!load) return;
  const driverSel = $("#dispatchForm select[name=driver]");
  const msg = $("#dispatchForm textarea[name=message]");
  const driver = DRIVERS.find((d) => d.name === load.assigned_driver);
  if (driver) driverSel.value = `${driver.name} · ${driver.truck}`;
  if (msg && load) {
    const slips = DB.slips().filter((s) => s.load_id === loadId);
    const lines = [
      `Load ${load.load_id} ready.`,
      `${load.origin} → ${load.destination}`,
      `Driver: ${load.assigned_driver} (${load.truck_registration})`,
      `Cargo: ${load.cargo_details} · ${load.weight_tons}t · ${load.pallet_count} pallets`,
    ];
    if (slips.length) lines.push("Documents: " + slips.map((s) => `${s.type} ${s.amount_zar ? money(s.amount_zar) : ""}`.trim()).join(", "));
    lines.push("POD on arrival.");
    msg.value = lines.join("\n");
  }
}

export function dispatchMessage(loadId) {
  const load = DB.loads().find((l) => l.load_id === loadId);
  const slips = DB.slips().filter((s) => s.load_id === loadId);
  const pod = DB.pods().find((p) => p.load_id === loadId);
  const lines = [];
  if (load) {
    lines.push(`🧾 XCLUSIV FREIGHT — TRIP REPORT`);
    lines.push(`Load: ${load.load_id}`);
    lines.push(`Route: ${load.origin} → ${load.destination}`);
    lines.push(`Driver: ${load.assigned_driver} (${load.truck_registration})`);
    lines.push(`Cargo: ${load.cargo_details || "—"} · ${load.weight_tons}t · ${load.pallet_count} pallets`);
  }
  if (slips.length) {
    lines.push(`\n📁 Documents (${slips.length}):`);
    slips.forEach((s) => {
      lines.push(`• ${s.type} — ${s.amount_zar ? money(s.amount_zar) : ""} ${s.liters_filled ? `· ${s.liters_filled} L` : ""} @ ${s.vendor || s.location_stamp || "—"}`);
    });
  }
  if (pod) {
    lines.push(`\n✅ POD: Signed by ${pod.consignee_name} · ${fmtDate(pod.arrival_time)}${pod.damage_notes ? ` · Notes: ${pod.damage_notes}` : ""}`);
  }
  lines.push(`\nSent via Exclusiv Freight · ${fmtDate(now())}`);
  return lines.join("\n");
}

export function recordDispatch(loadId, channel, note) {
  const h = DB.history();
  h.unshift({ id: now(), load_id: loadId, channel, ts: now(), note });
  DB.saveHistory(h);
}

export function handleDispatchSubmit(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const loadRef = fd.get("load").split(" · ")[0];
  const driver = fd.get("driver");
  const channel = fd.get("channel");
  const message = fd.get("message") || dispatchMessage(loadRef);
  const subject = `Trip Report — ${loadRef}`;

  if (channel === "whatsapp" || channel === "both") {
    window.open(`https://wa.me/${SEBASTIAN.whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
  }
  if (channel === "email" || channel === "both") {
    window.location.href = `mailto:${SEBASTIAN.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  }
  recordDispatch(loadRef, channel === "both" ? "Both" : channel === "whatsapp" ? "WhatsApp" : "Email", `Dispatched to ${driver}`);
  refresh();
  toast(`Dispatch sent via ${channel} to ${SEBASTIAN.name}`);
}

export function dispatchFromSlip(slip) {
  const message = dispatchMessage(slip.load_id);
  const load = DB.loads().find((l) => l.load_id === slip.load_id);
  const note = `${slip.type} report for ${slip.load_id}${load ? ` to ${load.assigned_driver}` : ""}`;
  window.open(`https://wa.me/${SEBASTIAN.whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
  recordDispatch(slip.load_id, "WhatsApp", note);
  refresh();
}

export function renderDispatchHistory() {
  const hist = DB.history().slice(0, 6);
  $("#view-dispatch .panel:last-child .activity").innerHTML = hist
    .map(
      (h) => `<li><span class="dot green"></span><div><strong>${esc(h.load_id)} → ${esc(h.channel)}</strong><br><small>${esc(h.note)} · ${timeAgo(h.ts)}</small></div></li>`
    )
    .join("");
}