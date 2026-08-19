import { DB, KEYS } from "../core/store.js";
import { now } from "../core/utils.js";

export function seed() {
  if (localStorage.getItem(KEYS.loads)) return;
  const t = now();
  DB.saveLoads([
    { load_id: "TR-2041", truck_registration: "ND 842-119", assigned_driver: "R. Naidoo", origin: "Johannesburg", destination: "Durban", cargo_details: "Containers 2x 20ft", weight_tons: 27.4, pallet_count: 12, special_instructions: "Tarp required", status: "ACTIVE", created_at: t - 3600e3 * 2 },
    { load_id: "TR-2042", truck_registration: "ND 881-332", assigned_driver: "S. Moodley", origin: "Pretoria", destination: "Cape Town", cargo_details: "Dry goods", weight_tons: 18.2, pallet_count: 18, special_instructions: "Temperature controlled", status: "ACTIVE", created_at: t - 3600e3 * 5 },
    { load_id: "TR-2043", truck_registration: "ND 755-901", assigned_driver: "T. Dlamini", origin: "Durban", destination: "Port Elizabeth", cargo_details: "General freight", weight_tons: 12.9, pallet_count: 8, special_instructions: "", status: "ACTIVE", created_at: t - 3600e3 * 8 },
    { load_id: "TR-2039", truck_registration: "ND 842-119", assigned_driver: "R. Naidoo", origin: "City Deep", destination: "Richards Bay", cargo_details: "Steel coils", weight_tons: 27.4, pallet_count: 0, special_instructions: "Heavy lift", status: "COMPLETED", created_at: t - 3600e3 * 30 },
  ]);
  DB.saveSlips([
    { slip_id: 1, load_id: "TR-2041", type: "DIESEL", image_path: "", timestamp: t - 14 * 60e3, location_stamp: "Engen Harrismith", amount_zar: 1842.0, liters_filled: 195.4, vendor: "Engen Harrismith" },
    { slip_id: 2, load_id: "TR-2043", type: "TOLL", image_path: "", timestamp: t - 45 * 60e3, location_stamp: "Van Reenen", amount_zar: 248.0, liters_filled: 0, vendor: "N3 Toll" },
    { slip_id: 3, load_id: "TR-2039", type: "WEIGHBRIDGE", image_path: "", timestamp: t - 3600e3, location_stamp: "City Deep", amount_zar: 0, liters_filled: 0, vendor: "City Deep Weighbridge" },
  ]);
  DB.savePods([
    { verification_id: 1, load_id: "TR-2039", consignee_name: "R. Pillay", receiver_phone: "083 555 0101", arrival_time: t - 3600e3 * 26, damage_notes: "None", signature_path: "" },
  ]);
  DB.saveHistory([
    { id: 1, load_id: "TR-2043", channel: "WhatsApp", ts: t - 31 * 60e3, note: "Dispatched to R. Naidoo" },
    { id: 2, load_id: "TR-2040", channel: "Email", ts: t - 3600e3 * 2, note: "Dispatched to S. Moodley" },
    { id: 3, load_id: "TR-2039", channel: "Both", ts: t - 3600e3 * 5, note: "Dispatched to T. Dlamini" },
  ]);
}