import { $, $$ } from "../core/utils.js";
import { money, toast } from "../core/utils.js";
import { DB, SEBASTIAN } from "../core/store.js";
import { fmtDate, download } from "../core/utils.js";
import { SITE_URL } from "../core/config.js";
import { dispatchMessage } from "./dispatch.js";

export function renderReports() {
  const slips = DB.slips();
  const diesel = slips.filter((s) => s.type === "DIESEL").reduce((a, s) => a + s.amount_zar, 0);
  const tolls = slips.filter((s) => s.type === "TOLL").reduce((a, s) => a + s.amount_zar, 0);
  const trips = DB.loads().filter((l) => l.status === "COMPLETED").length;
  const pods = DB.pods().length;
  const vals = $$("#view-reports .stat-card .stat-value");
  if (vals.length >= 4) {
    vals[0].textContent = money(diesel);
    vals[1].textContent = money(tolls);
    vals[2].textContent = trips;
    vals[3].textContent = `${pods} / ${trips}`;
  }
}

export function exportCSV() {
  const rows = [["Date", "Load Ref", "Type", "Vendor/Location", "Amount (ZAR)", "Litres", "Driver", "Truck"]];
  const loads = DB.loads();
  DB.slips().forEach((s) => {
    const load = loads.find((l) => l.load_id === s.load_id);
    rows.push([fmtDate(s.timestamp), s.load_id, s.type, s.vendor || s.location_stamp, s.amount_zar, s.liters_filled, load ? load.assigned_driver : "", load ? load.truck_registration : ""]);
  });
  const csv = rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  download(`xclusiv-freight-report-${new Date().toISOString().slice(0, 10)}.csv`, csv, "text/csv");
  toast("CSV exported for Sage import");
}

export function bindReports() {
  $("#csvBtn").addEventListener("click", exportCSV);
  $("#emailBtn").addEventListener("click", () => {
    const body = "Xclusiv Freight weekly report attached.\n\n" + dispatchMessage(DB.loads()[0]?.load_id || "");
    window.location.href = `mailto:${SEBASTIAN.email}?subject=${encodeURIComponent("Weekly Fleet Report")}&body=${encodeURIComponent(body)}`;
    toast("Email draft opened");
  });
  $("#shareAppBtn").addEventListener("click", async () => {
    const shareData = {
      title: "Xclusiv Freight",
      text: "Xclusiv Freight — logistics & document management for our fleet",
      url: SITE_URL,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(SITE_URL);
        toast("App link copied to clipboard");
      }
    } catch (e) {
      if (e && e.name === "AbortError") return;
      toast("Could not share link on this device");
    }
  });
}