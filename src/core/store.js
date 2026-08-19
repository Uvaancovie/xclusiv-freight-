import { toast } from "./utils.js";

export const KEYS = {
  loads: "xf_loads",
  slips: "xf_slips",
  pods: "xf_pods",
  role: "xf_role",
  history: "xf_history",
};

export function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

export function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    toast("Storage full. Clear old captures to continue.");
  }
}

export const DB = {
  loads: () => read(KEYS.loads, []),
  slips: () => read(KEYS.slips, []),
  pods: () => read(KEYS.pods, []),
  history: () => read(KEYS.history, []),
  saveLoads: (v) => write(KEYS.loads, v),
  saveSlips: (v) => write(KEYS.slips, v),
  savePods: (v) => write(KEYS.pods, v),
  saveHistory: (v) => write(KEYS.history, v),
};

export const SEBASTIAN = {
  name: "Sebastian Chetty",
  whatsapp: "27821234567",
  email: "sebastian@exclusivfreight.co.za",
};

export const DRIVERS = [
  { name: "R. Naidoo", truck: "XF-12" },
  { name: "S. Moodley", truck: "XF-07" },
  { name: "T. Dlamini", truck: "XF-19" },
];