import { $, $$ } from "../core/utils.js";
import { toast, now } from "../core/utils.js";
import { DB } from "../core/store.js";
import { refresh } from "../core/router.js";
import { dispatchFromSlip } from "./dispatch.js";

let sigDrawing = false;

export function initSigPad() {
  const pad = $("#sigPad");
  const ctx = pad.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, pad.width, pad.height);
  ctx.strokeStyle = "#0B192C";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const pos = (ev) => {
    const rect = pad.getBoundingClientRect();
    return { x: ((ev.clientX - rect.left) / rect.width) * pad.width, y: ((ev.clientY - rect.top) / rect.height) * pad.height };
  };

  pad.addEventListener("pointerdown", (ev) => {
    sigDrawing = true;
    pad.setPointerCapture(ev.pointerId);
    ctx.beginPath();
    const p = pos(ev);
    ctx.moveTo(p.x, p.y);
  });
  pad.addEventListener("pointermove", (ev) => {
    if (!sigDrawing) return;
    const p = pos(ev);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });
  pad.addEventListener("pointerup", (ev) => {
    sigDrawing = false;
    ctx.closePath();
  });
  pad.addEventListener("pointercancel", () => (sigDrawing = false));

  $("#clearSig").addEventListener("click", () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, pad.width, pad.height);
  });

  $("#saveSig").addEventListener("click", () => {
    const textInputs = $$("#view-signature input[type=text]");
    const name = textInputs[0].value.trim();
    const ref = textInputs[1].value.trim();
    const notes = $("#view-signature textarea").value.trim();
    const signature = pad.toDataURL("image/png");
    const ctx2 = pad.getContext("2d");
    const blank = ctx2.getImageData(0, 0, pad.width, pad.height).data.every((v) => v === 255);
    if (blank) {
      toast("Please capture a signature first");
      return;
    }
    const loads = DB.loads();
    const active = loads.find((l) => l.status === "ACTIVE");
    const loadId = active ? active.load_id : `TR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const pods = DB.pods();
    pods.push({
      verification_id: now(),
      load_id: loadId,
      consignee_name: name || "Unknown",
      receiver_phone: ref,
      arrival_time: now(),
      damage_notes: notes,
      signature_path: signature,
    });
    DB.savePods(pods);
    if (active) {
      active.status = "COMPLETED";
      DB.saveLoads(loads);
    }
    refresh();
    toast(`${loadId} marked DELIVERED`);
    $("#clearSig").click();
    textInputs[0].value = "";
    textInputs[1].value = "";
    $("#view-signature textarea").value = "";
    dispatchFromSlip({ load_id: loadId, type: "POD_DOCUMENT", timestamp: now(), amount_zar: 0, liters_filled: 0, vendor: "", location_stamp: "" });
  });
}