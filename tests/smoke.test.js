import { JSDOM, VirtualConsole } from "jsdom";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const html = fs.readFileSync(path.join(DIST, "index.html"), "utf8").replace(/\s*<script[^>]*><\/script>/, "");
const jsFile = fs.readdirSync(path.join(DIST, "assets")).find((f) => f.endsWith(".js"));
const bundle = fs.readFileSync(path.join(DIST, "assets", jsFile), "utf8");

const distHtml = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
const ogImageInDist = fs.existsSync(path.join(DIST, "og-image.png"));
const faviconInDist = fs.existsSync(path.join(DIST, "favicon.png"));

const errors = [];
const logs = [];

function mockCtx(canvas) {
  const ctx = {
    _drawn: false,
    fillStyle: "", strokeStyle: "", lineWidth: 1, lineCap: "", lineJoin: "",
    font: "", fillRect() {}, clearRect() {}, beginPath() {}, closePath() {},
    moveTo() {}, lineTo() {}, stroke() {}, fillText() {}, drawImage() {},
    createLinearGradient() { return { addColorStop() {} }; },
    getImageData() {
      const data = new Uint8ClampedArray(canvas.width * canvas.height * 4).fill(255);
      if (ctx._drawn) data[0] = 0;
      return { data };
    },
  };
  return ctx;
}

const vc = new VirtualConsole();
vc.on("jsdomError", () => {});
vc.on("error", () => {});

const dom = new JSDOM(html, {
  url: "http://localhost/",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  virtualConsole: vc,
  beforeParse(window) {
    window.HTMLCanvasElement.prototype.getContext = function () {
      if (!this._mockCtx) this._mockCtx = mockCtx(this);
      return this._mockCtx;
    };
    window.HTMLCanvasElement.prototype.toDataURL = function () { return "data:image/png;base64,AAAA"; };
    window.Image = class {
      onload = null;
      width = 100;
      height = 100;
      set src(v) { this._src = v; setTimeout(() => this.onload && this.onload(), 0); }
      get src() { return this._src; }
    };
    window.open = function () { logs.push("window.open called"); };
    window.URL.createObjectURL = () => "blob:mock";
    window.URL.revokeObjectURL = () => {};
    window.clipboard = { writeText: (t) => logs.push("copied: " + t) };
    Object.defineProperty(window.navigator, "clipboard", { value: window.clipboard });
    Object.defineProperty(window.navigator, "mediaDevices", { value: { getUserMedia: () => Promise.reject(new Error("no cam")) } });
    window.addEventListener("error", (e) => errors.push(String(e.error ? e.error.stack : e.message)));
    window.addEventListener("unhandledrejection", (e) => errors.push("unhandled: " + String(e.reason && e.reason.stack)));
  },
});

const { window } = dom;
const { document } = window;

// Call init() directly instead of waiting for DOMContentLoaded (avoids jsdom timing races).
const booted = bundle.replace(/document\.addEventListener\("DOMContentLoaded",\s*([A-Za-z_$][\w$]*)\);/, "($1)();");
window.eval(booted);

function q(sel, root) { return (root || document).querySelector(sel); }
function qa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
function click(el) { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true })); }
function submit(el) { el.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })); }
function input(el, value) { el.value = value; el.dispatchEvent(new window.Event("input", { bubbles: true })); }

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log("  PASS  " + name); }
  else { fail++; console.log("  FAIL  " + name + (extra ? "  -- " + extra : "")); }
}

setTimeout(() => {
  console.log("== Smoke test: Xclusiv Freight (production bundle) ==");

  // SEO / social preview in the built HTML
  check("og:title present", distHtml.includes('property="og:title"'));
  check("og:description present", distHtml.includes('property="og:description"'));
  check("og:image present", distHtml.includes('property="og:image"'));
  check("og:image URL substituted from env", distHtml.includes("https://xclusiv-freight.vercel.app/og-image.png"), "env not substituted");
  check("twitter card present", distHtml.includes('name="twitter:card"'));
  check("og-image.png copied to dist", ogImageInDist);
  check("favicon copied to dist", faviconInDist);
  check("canonical present", distHtml.includes('rel="canonical"'));

  check("stats: 3 active loads", q("#statActive").textContent === "3", q("#statActive").textContent);
  check("activity list rendered", qa("#activityList li").length === 5, String(qa("#activityList li").length));
  check("spend bars rendered", qa("#spendBars .bar").length === 7);

  // Role switch (segmented control)
  click(q("#roleDriver"));
  check("driver button active", q("#roleDriver").classList.contains("active"));
  check("owner button inactive", !q("#roleOwner").classList.contains("active"));
  check("owner-only FAB hidden for driver", q("#newLoadBtn").classList.contains("hidden"));
  check("owner-only hero button hidden for driver", q("#newLoadHeroBtn").classList.contains("hidden"));
  check("driver sees 4 nav links", qa(".nav-link:not(.hidden)").length === 4, String(qa(".nav-link:not(.hidden)").length));
  click(q("#roleOwner"));
  check("owner button active again", q("#roleOwner").classList.contains("active"));
  check("owner-only FAB visible for owner", !q("#newLoadBtn").classList.contains("hidden"));

  // Loads + load instruction creation
  click(qa(".nav-link").find((a) => a.dataset.route === "loads"));
  check("loads list: 4 seed cards", qa("#loadList .card").length === 4, String(qa("#loadList .card").length));
  input(q("#loadSearch"), "naidoo");
  check("search filters by driver", qa("#loadList .card").length === 2, String(qa("#loadList .card").length));
  input(q("#loadSearch"), "");

  click(q("#newLoadHeroBtn"));
  check("load modal opens", !!q("#loadModal"));
  const form = q("#loadForm");
  form.elements.load_id.value = "TR-2050";
  form.elements.truck_registration.value = "ND 999-000";
  form.elements.origin.value = "Durban";
  form.elements.destination.value = "Johannesburg";
  form.elements.cargo_details.value = "Test cargo";
  form.elements.weight_tons.value = "10.5";
  form.elements.pallet_count.value = "6";
  submit(form);
  check("modal closes after submit", !q("#loadModal"));
  check("new load in list", qa("#loadList .card").length === 5, String(qa("#loadList .card").length));
  check("dispatch select has new load", q("#dispatchForm select[name=load]").querySelectorAll("option").length === 5, String(q("#dispatchForm select[name=load]").querySelectorAll("option").length));

  click(qa("#loadList [data-dispatch-load]")[0]);
  setTimeout(() => {
    check("dispatch view active", !q("#view-dispatch").classList.contains("hidden"));
    check("message pre-filled", (q("#dispatchForm textarea[name=message]").value || "").includes("TR-2050"));
    submit(q("#dispatchForm"));
    check("dispatch recorded", JSON.parse(window.localStorage.getItem("xf_history")).length >= 4);
    check("window.open used for WhatsApp", logs.some((l) => l.includes("window.open")));

    // Scanner fail-safe + slip save
    click(qa(".tab").find((t) => t.dataset.route === "scan"));
    setTimeout(() => {
      click(q("#captureBtn"));
      setTimeout(() => {
        check("fail-safe preview shown", !!q(".scanner-frame img.preview"));
        const slipForm = q("#slipForm");
        slipForm.elements.amount.value = "1234.5";
        slipForm.elements.litres.value = "100";
        slipForm.elements.station.value = "Sasol Kroonstad";
        slipForm.elements.load.value = "TR-2041";
        submit(slipForm);
        const slipsAfter = JSON.parse(window.localStorage.getItem("xf_slips"));
        check("slip saved to DB", slipsAfter.length === 4, String(slipsAfter.length));
        check("slip amount persisted", slipsAfter[0].amount_zar === 1234.5, String(slipsAfter[0].amount_zar));

        // Signature + POD
        click(qa(".nav-link").find((a) => a.dataset.route === "signature"));
        click(q("#saveSig"));
        check("blank signature rejected", q("#toast").textContent.includes("signature"));
        q("#sigPad").getContext("2d")._drawn = true;
        click(q("#saveSig"));
        const pods = JSON.parse(window.localStorage.getItem("xf_pods"));
        check("POD recorded", pods.length === 2, String(pods.length));
        const loadsAfter = JSON.parse(window.localStorage.getItem("xf_loads"));
        check("load completed on POD", loadsAfter.find((l) => l.load_id === "TR-2050").status === "COMPLETED", loadsAfter.find((l) => l.load_id === "TR-2050").status);

        // Reports
        click(qa(".nav-link").find((a) => a.dataset.route === "reports"));
        const dieselVal = qa("#view-reports .stat-card .stat-value")[0].textContent.replace(/\u00A0/g, " ");
        check("reports diesel total", dieselVal.includes("3 076"), dieselVal);
        click(q("#csvBtn"));
        click(q("#shareAppBtn"));
        check("share copies site URL", logs.some((l) => l.includes("copied: https://xclusiv-freight.vercel.app")), logs.join(" | "));

        check("no runtime errors", errors.length === 0, errors.join(" | "));
        console.log(`\n${pass} passed, ${fail} failed`);
        process.exit(fail ? 1 : 0);
      }, 300);
    }, 300);
  }, 300);
}, 300);