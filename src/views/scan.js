import { $, $$ } from "../core/utils.js";
import { esc, money, timeAgo, toast, now } from "../core/utils.js";
import { DB } from "../core/store.js";
import { state, refresh, onRouteEnter, onRouteLeave } from "../core/router.js";
import { dispatchFromSlip } from "./dispatch.js";

let mediaStream = null;
let facing = "environment";

export function stopCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
    mediaStream = null;
  }
  $$(".scanner-frame video").forEach((n) => n.remove());
}

export async function startCamera() {
  const frame = $(".scanner-frame");
  if (!frame) return;
  frame.querySelectorAll("video, .placeholder, .preview").forEach((n) => n.remove());
  if (mediaStream) return;
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } },
      audio: false,
    });
    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    video.srcObject = mediaStream;
    video.addEventListener("loadedmetadata", () => video.play().catch(() => {}));
    frame.insertBefore(video, frame.firstChild);
  } catch (e) {
    frame.insertAdjacentHTML(
      "afterbegin",
      `<div class="placeholder">📷 Camera unavailable<br/><small>Fail-safe capture will be used.</small></div>`
    );
  }
}

function downscale(dataUrl, maxW, quality) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function failSafeCapture() {
  const c = document.createElement("canvas");
  c.width = 900;
  c.height = 675;
  const g = c.getContext("2d");
  const grad = g.createLinearGradient(0, 0, 900, 675);
  grad.addColorStop(0, "#102A43");
  grad.addColorStop(1, "#0B192C");
  g.fillStyle = grad;
  g.fillRect(0, 0, 900, 675);
  g.fillStyle = "rgba(217,119,6,0.2)";
  g.fillRect(0, 560, 900, 115);
  g.fillStyle = "#D97706";
  g.font = "bold 44px Inter, sans-serif";
  g.fillText("FAIL-SAFE CAPTURE", 34, 610);
  g.fillStyle = "#9DB4CC";
  g.font = "26px Inter, sans-serif";
  g.fillText(new Date().toLocaleString("en-ZA"), 34, 652);
  return c.toDataURL("image/jpeg", 0.8);
}

async function captureImage() {
  const frame = $(".scanner-frame");
  const video = frame.querySelector("video");
  let dataUrl;
  if (video && video.srcObject) {
    const c = document.createElement("canvas");
    c.width = video.videoWidth || 900;
    c.height = video.videoHeight || 675;
    c.getContext("2d").drawImage(video, 0, 0);
    dataUrl = c.toDataURL("image/jpeg", 0.8);
  } else {
    dataUrl = failSafeCapture();
  }
  state.pendingImage = await downscale(dataUrl, 900, 0.72);
  showCapturePreview(state.pendingImage);
  toast("Capture ready — fill details and Save");
}

function showCapturePreview(dataUrl) {
  stopCamera();
  const frame = $(".scanner-frame");
  frame.querySelectorAll("video, .placeholder, .preview").forEach((n) => n.remove());
  const img = document.createElement("img");
  img.className = "preview";
  img.src = dataUrl;
  frame.insertBefore(img, frame.firstChild);
}

function openGallery() {
  let input = $("#galleryInput");
  if (!input) {
    input = document.createElement("input");
    input.type = "file";
    input.id = "galleryInput";
    input.accept = "image/*";
    input.style.display = "none";
    document.body.appendChild(input);
    input.addEventListener("change", async () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        state.pendingImage = await downscale(reader.result, 900, 0.72);
        showCapturePreview(state.pendingImage);
        toast("Image loaded — fill details and Save");
      };
      reader.readAsDataURL(file);
      input.value = "";
    });
  }
  input.click();
}

async function toggleTorch() {
  if (!mediaStream) {
    toast("Camera not active");
    return;
  }
  const track = mediaStream.getVideoTracks()[0];
  try {
    await track.applyConstraints({ advanced: [{ torch: true }] });
    toast("Torch on");
  } catch (e) {
    toast("Torch not supported");
  }
}

async function flipCamera() {
  facing = facing === "environment" ? "user" : "environment";
  stopCamera();
  $$(".scanner-frame video, .scanner-frame .placeholder").forEach((n) => n.remove());
  await startCamera();
}

export function renderSlips() {
  const q = state.slipQuery.toLowerCase();
  const slips = DB.slips()
    .filter(
      (s) =>
        !q ||
        s.load_id.toLowerCase().includes(q) ||
        (s.vendor || "").toLowerCase().includes(q) ||
        (s.location_stamp || "").toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q)
    )
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 12);

  const ICONS = { DIESEL: "⛽", TOLL: "🛣️", WEIGHBRIDGE: "⚖️", POD_DOCUMENT: "📄" };
  $("#slipThumbs").innerHTML =
    slips
      .map((s) => {
        const title =
          s.type === "DIESEL" ? money(s.amount_zar) : s.type === "TOLL" ? money(s.amount_zar) : s.type === "WEIGHBRIDGE" ? `${s.amount_zar || "—"} t` : s.load_id;
        const thumb = s.image_path ? `<img src="${s.image_path}" alt="" />` : ICONS[s.type] || "🧾";
        return `<li><div class="thumb">${thumb}</div><div><strong>${esc(title)}</strong><br><small>${esc(s.type)} · ${esc(s.load_id)} · ${timeAgo(s.timestamp)}</small></div></li>`;
      })
      .join("") || '<li class="muted">No captures yet.</li>';
}

export function saveSlip(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const type = fd.get("type");
  if (!state.pendingImage && type !== "OTHER") {
    toast("Capture or upload an image first");
    return;
  }
  const loadRef = fd.get("load") || "UNLINKED";
  const slip = {
    slip_id: now(),
    load_id: loadRef.trim().toUpperCase(),
    type,
    image_path: state.pendingImage || "",
    timestamp: now(),
    location_stamp: fd.get("station").trim() || "Unknown",
    vendor: fd.get("station").trim() || "Unknown",
    amount_zar: parseFloat(fd.get("amount")) || 0,
    liters_filled: parseFloat(fd.get("litres")) || 0,
  };
  const slips = DB.slips();
  slips.unshift(slip);
  DB.saveSlips(slips);
  state.pendingImage = null;
  e.target.reset();
  e.target.elements.load.value = "TR-2041";
  refresh();
  toast(`${slip.type} saved to local database`);
  dispatchFromSlip(slip);
}

export function bindScan() {
  $("#captureBtn").addEventListener("click", captureImage);
  $("#torchBtn").addEventListener("click", toggleTorch);
  $("#galleryBtn").addEventListener("click", openGallery);
  $("#flipBtn").addEventListener("click", flipCamera);
  $("#slipForm").addEventListener("submit", saveSlip);
  onRouteEnter("scan", startCamera);
  onRouteLeave("scan", stopCamera);
}