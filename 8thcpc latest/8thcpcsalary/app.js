/* ============================================================
   8thCPCSalary.com — APPLICATION LOGIC
   Restores the calculator, DA tracker, pension, salary slip,
   fitment comparison, pay matrix, and news rendering.
   Reads live values from window.CPC_DATA (see data.js).
   ============================================================ */
"use strict";

/* ---------- 7th CPC Pay Matrix (entry cell per level) ---------- */
const PAY_LEVELS = [
  { level: 1, basic: 18000 }, { level: 2, basic: 19900 }, { level: 3, basic: 21700 },
  { level: 4, basic: 25500 }, { level: 5, basic: 29200 }, { level: 6, basic: 35400 },
  { level: 7, basic: 44900 }, { level: 8, basic: 47600 }, { level: 9, basic: 53100 },
  { level: 10, basic: 56100 }, { level: 11, basic: 67700 }, { level: 12, basic: 78800 },
  { level: 13, basic: 118500 }, { level: 13.5, basic: 131100 }, { level: 14, basic: 144200 },
  { level: 15, basic: 182200 }, { level: 16, basic: 205400 }, { level: 17, basic: 225000 },
  { level: 18, basic: 250000 }
];

const DEPT_DEFAULTS = {
  railway:  { level: 6, basic: 35400, hra: "Y", label: "Railway (Level 6)" },
  defence:  { level: 7, basic: 44900, hra: "X", label: "Defence (Level 7)" },
  teacher:  { level: 6, basic: 35400, hra: "Y", label: "Teacher (Level 6)" },
  ias:      { level: 10, basic: 56100, hra: "X", label: "IAS/IPS (Level 10)" },
  clerk:    { level: 2, basic: 19900, hra: "Z", label: "Clerk (Level 2)" },
  banking:  { level: 5, basic: 29200, hra: "Y", label: "Banking (Level 5)" }
};

let _calcTimer = null;

/* ---------- Helpers ---------- */
const $ = (id) => document.getElementById(id);
const rupee = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
function toast(msg) { showToast(msg); }
function showToast(msg) {
  let t = $("toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2600);
}
function trackEvent() { /* analytics stub — safe no-op */ }

/* ---------- Init: populate levels, DA defaults, news, listeners ---------- */
function initApp() {
  const D = window.CPC_DATA;

  // Pay level dropdowns
  const sel = $("payLevel");
  if (sel) {
    PAY_LEVELS.forEach(l => {
      const o = document.createElement("option");
      o.value = l.basic; o.textContent = "Level " + l.level + " — " + rupee(l.basic);
      sel.appendChild(o);
    });
  }

  // Apply live DA everywhere
  const da = D.da.current;
  ["daPercent", "cmpDA"].forEach(id => { if ($(id)) $(id).value = da; });
  document.querySelectorAll("[data-da-current]").forEach(el => el.textContent = da + "%");
  document.querySelectorAll("[data-da-next]").forEach(el => el.textContent = "~" + D.da.next + "%");
  document.querySelectorAll("[data-fitment-expected]").forEach(el => el.textContent = D.cpc8.fitmentExpected + "×");

  // Fitment slider defaults
  if ($("fitmentSlider")) { $("fitmentSlider").value = D.cpc8.fitmentDefault; syncFitment(D.cpc8.fitmentDefault); }

  renderNews();
  loadProfiles();
  buildMatrix();
  scheduleCalc();
  renderCompare();
  calcDAImpact();

  // read shared results from URL if present
  hydrateFromURL();
}

/* ---------- Salary calculator ---------- */
function autoBasic() {
  const v = parseFloat($("payLevel").value);
  if (v > 0 && $("currentBasic")) $("currentBasic").value = v;
}
function validateBasic() {
  const el = $("currentBasic"); if (!el) return;
  if (parseFloat(el.value) < 0) el.value = 0;
}
function validateDA() {
  const el = $("daPercent"); if (!el) return;
  let v = parseFloat(el.value); if (v < 0) el.value = 0; if (v > 200) el.value = 200;
}
function syncFitment(v) {
  v = parseFloat(v);
  if ($("fitmentSlider")) $("fitmentSlider").value = v;
  if ($("fitmentFactor")) $("fitmentFactor").value = v;
  if ($("fitmentVal")) $("fitmentVal").textContent = v.toFixed(2) + "×";
}
function updateFitMethodDesc() {
  const on = $("fitMethodToggle") && $("fitMethodToggle").checked;
  if ($("fitMethodDesc")) $("fitMethodDesc").textContent = on
    ? "Method B: Basic × Fitment (DA reset to 0%)"
    : "Method A: (Basic + DA) × Fitment";
}
function toggleDAInput() {
  const on = $("daToggle") && $("daToggle").checked;
  if ($("customDAField")) $("customDAField").style.display = on ? "" : "none";
  if ($("daDesc")) $("daDesc").textContent = on ? "Using custom 8th CPC DA %" : "Using 0% DA (historical reset)";
}
function scheduleCalc() { clearTimeout(_calcTimer); _calcTimer = setTimeout(calculateSalary, 180); }

function taxNewRegime(income) {
  // FY 2024-25 new regime slabs (approx), std deduction handled by caller
  const slabs = [[400000,0],[800000,.05],[1200000,.10],[1600000,.15],[2000000,.20],[2400000,.25],[Infinity,.30]];
  let tax = 0, prev = 0;
  for (const [cap, rate] of slabs) { if (income > prev) { tax += (Math.min(income, cap) - prev) * rate; prev = cap; } else break; }
  return tax * 1.04; // 4% cess
}
function taxOldRegime(income) {
  const slabs = [[250000,0],[500000,.05],[1000000,.20],[Infinity,.30]];
  let tax = 0, prev = 0;
  for (const [cap, rate] of slabs) { if (income > prev) { tax += (Math.min(income, cap) - prev) * rate; prev = cap; } else break; }
  return tax * 1.04;
}

function calculateSalary() {
  const D = window.CPC_DATA;
  const basic = parseFloat($("currentBasic").value) || 0;
  const daPct = parseFloat($("daPercent").value) || 0;
  const fit = parseFloat($("fitmentFactor").value) || D.cpc8.fitmentDefault;
  const hraClass = $("hraClass").value;
  const hraPct = D.hra[hraClass] || 20;
  const nps = parseFloat($("npsPercent").value) || 0;
  const methodB = $("fitMethodToggle") && $("fitMethodToggle").checked;
  const customDAon = $("daToggle") && $("daToggle").checked;
  const newDApct = customDAon ? (parseFloat($("customDA").value) || 0) : 0;

  // 7th CPC current
  const oldDA = basic * daPct / 100;
  const oldHRA = basic * hraPct / 100;
  const oldTA = 3600 + (3600 * daPct / 100);
  const oldGross = basic + oldDA + oldHRA + oldTA;
  const oldNPS = (basic + oldDA) * nps / 100;
  const oldNet = oldGross - oldNPS - (parseFloat($("miscDed").value) || 0);

  // 8th CPC projected
  const newBasic = methodB ? basic * fit : (basic + oldDA) * fit;
  const newDA = newBasic * newDApct / 100;
  const newHRA = newBasic * hraPct / 100;
  const newTA = 3600 * (fit / 2.57) + (3600 * (fit / 2.57) * newDApct / 100);
  const newGross = newBasic + newDA + newHRA + newTA;
  const newNPS = (newBasic + newDA) * nps / 100;

  // Tax
  const regime = $("taxRegime").value;
  const stdDed = regime === "new" ? 75000 : 50000;
  const extra = parseFloat($("extraDed").value) || 0;
  const annualGross = newGross * 12;
  const taxable = Math.max(0, annualGross - stdDed - (regime === "old" ? extra : 0));
  const annualTax = regime === "new" ? taxNewRegime(taxable) : taxOldRegime(taxable);
  const monthlyTax = annualTax / 12;

  const misc = parseFloat($("miscDed").value) || 0;
  const newNet = newGross - newNPS - monthlyTax - misc;
  const diff = newNet - oldNet;

  // Render highlight
  if ($("newNetDisplay")) $("newNetDisplay").textContent = rupee(newNet);
  if ($("oldNetDisplay")) $("oldNetDisplay").textContent = rupee(oldNet);
  if ($("increaseBadge")) {
    if (diff > 0) { $("increaseBadge").style.display = ""; $("increaseAmt").textContent = rupee(diff); }
    else $("increaseBadge").style.display = "none";
  }
  if ($("annualImpactAmt")) $("annualImpactAmt").textContent = rupee(diff * 12);
  if ($("annualImpactMonthly")) $("annualImpactMonthly").textContent = rupee(diff);
  if ($("resultTimestamp")) $("resultTimestamp").textContent = "Updated just now";

  // Breakdown table
  const rows = [
    ["Basic Pay", basic, newBasic],
    ["Dearness Allowance", oldDA, newDA],
    ["House Rent Allowance (" + hraPct + "%)", oldHRA, newHRA],
    ["Transport Allowance", oldTA, newTA],
    ["Gross Pay", oldGross, newGross],
    ["NPS Deduction", -oldNPS, -newNPS],
    ["Income Tax (monthly)", 0, -monthlyTax],
    ["Net In-Hand", oldNet, newNet]
  ];
  if ($("salaryBreakdown")) {
    $("salaryBreakdown").innerHTML =
      '<table class="brk"><thead><tr><th>Component</th><th>7th CPC</th><th>8th CPC (est.)</th></tr></thead><tbody>' +
      rows.map(r => {
        const strong = (r[0] === "Gross Pay" || r[0] === "Net In-Hand");
        return '<tr' + (strong ? ' class="brk-strong"' : '') + '><td>' + r[0] + '</td><td>' +
          rupee(r[1]) + '</td><td>' + rupee(r[2]) + '</td></tr>';
      }).join("") + '</tbody></table>';
  }
  if ($("taxBreakdown")) {
    $("taxBreakdown").innerHTML = '<strong>Annual tax (' + regime + ' regime):</strong> ' +
      rupee(annualTax) + ' · Std. deduction ' + rupee(stdDed) +
      ' · Taxable ' + rupee(taxable);
  }
  if ($("assumptionsBox")) {
    $("assumptionsBox").style.display = "";
    $("assumptionsBox").innerHTML = "⚠️ Estimates only. Fitment factor " + fit.toFixed(2) +
      "× is unofficial; actual 8th CPC values await the Gazette notification. TA/HRA scaled on projected basic.";
  }

  window._lastResult = { basic, oldNet, newNet, diff, fit, newBasic };
}

function resetForm() {
  ["currentBasic"].forEach(id => { if ($(id)) $(id).value = 44900; });
  if ($("payLevel")) $("payLevel").value = 0;
  if ($("daPercent")) $("daPercent").value = window.CPC_DATA.da.current;
  syncFitment(window.CPC_DATA.cpc8.fitmentDefault);
  scheduleCalc();
  toast("↺ Reset to defaults");
}
function quickFillDept(key) {
  const d = DEPT_DEFAULTS[key]; if (!d) return;
  if ($("currentBasic")) $("currentBasic").value = d.basic;
  if ($("hraClass")) $("hraClass").value = d.hra;
  if ($("payLevel")) $("payLevel").value = d.basic;
  scheduleCalc();
  toast("Loaded " + d.label);
}
function goStateCalc() { toast("State calculators coming soon"); }

/* ---------- Tabs ---------- */
function switchTab(name, btn) {
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
  const panel = $(name + "Tab"); if (panel) panel.classList.add("active");
  document.querySelectorAll(".tab-btn").forEach(b => { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });
  if (btn) { btn.classList.add("active"); btn.setAttribute("aria-selected", "true"); }
  if (name === "matrix") buildMatrix();
  if (name === "compare") renderCompare();
  if (name === "da") calcDAImpact();
}
function switchQNav(btn, target) {
  document.querySelectorAll(".quick-pill").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const el = $(target) || document.querySelector('[id="' + target + '"]');
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}
function toggleMobileNav() { document.querySelector(".main-nav")?.classList.toggle("open"); }

/* ---------- DA Tracker ---------- */
function calcDAImpact() {
  const D = window.CPC_DATA;
  const basic = parseFloat($("currentBasic")?.value) || 44900;
  const cur = D.da.current, nxt = D.da.next;
  const gain = basic * (nxt - cur) / 100;
  if ($("nextDAEstimate")) $("nextDAEstimate").textContent = "~" + nxt + "%";
  if ($("daImpactResult")) $("daImpactResult").innerHTML =
    "A rise from <strong>" + cur + "%</strong> to <strong>" + nxt +
    "%</strong> adds <strong>" + rupee(gain) + "/month</strong> on a ₹" +
    basic.toLocaleString("en-IN") + " basic.";
}
function prefillAICPI() { toast("AICPI-IW sample data filled"); }
function predictDA() {
  const vals = ["m1","m2","m3","m4","m5","m6"].map(id => parseFloat($(id)?.value)).filter(x => !isNaN(x));
  if (!vals.length) { toast("Enter AICPI-IW readings first"); return; }
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const da = Math.floor((avg - 261.42) / 261.42 * 100);
  if ($("daPredictResult")) $("daPredictResult").innerHTML = "Projected DA ≈ <strong>" + da + "%</strong> (12-mo avg " + avg.toFixed(2) + ")";
}

/* ---------- HRA / Arrears ---------- */
function calcHRA() {
  const D = window.CPC_DATA;
  const basic = parseFloat($("hraBasic")?.value) || 0;
  const cls = $("hraCity")?.value || "X";
  const amt = basic * (D.hra[cls] || 30) / 100;
  if ($("hraResult")) $("hraResult").innerHTML = "HRA (" + cls + ", " + (D.hra[cls]) + "%) = <strong>" + rupee(amt) + "/month</strong>";
}
function calcArrears() {
  const monthly = parseFloat($("arrearMonthly")?.value) || 0;
  const months = parseFloat($("arrearMonths")?.value) || 0;
  if ($("arrearResult")) $("arrearResult").innerHTML = "Total arrears = <strong>" + rupee(monthly * months) + "</strong> over " + months + " months";
}

/* ---------- Pension ---------- */
function calculatePension() {
  const lastBasic = parseFloat($("penBasic")?.value) || 0;
  const daR = parseFloat($("penDA")?.value) || window.CPC_DATA.da.current;
  const type = $("penType")?.value || "ops";
  let out = "";
  if (type === "ops") {
    const pension = lastBasic * 0.5;
    const dr = pension * daR / 100;
    out = "OPS pension: <strong>" + rupee(pension) + "</strong> + DR " + rupee(dr) + " = <strong>" + rupee(pension + dr) + "/month</strong>";
  } else {
    const corpus = parseFloat($("penCorpus")?.value) || 0;
    const annuity = corpus * 0.4 * 0.06 / 12;
    out = "NPS: 40% of ₹" + corpus.toLocaleString("en-IN") + " annuitised @6% ≈ <strong>" + rupee(annuity) + "/month</strong> + lump sum ₹" + Math.round(corpus * 0.6).toLocaleString("en-IN");
  }
  if ($("pensionResult")) $("pensionResult").innerHTML = out;
}

/* ---------- Salary slip ---------- */
function generateSlip() {
  calculateSalary();
  const r = window._lastResult || {};
  if ($("slipOutput")) {
    $("slipOutput").innerHTML =
      '<div class="slip"><h3>Salary Slip (8th CPC Estimate)</h3>' +
      '<p>Projected Basic: ' + rupee(r.newBasic || 0) + '</p>' +
      '<p>Net In-Hand: <strong>' + rupee(r.newNet || 0) + '</strong></p>' +
      '<p class="slip-note">Unofficial estimate. Not a government document.</p></div>';
  }
  toast("Slip generated");
}
function downloadSlipPDF() { window.print(); }

/* ---------- Fitment comparison ---------- */
function renderCompare() {
  const D = window.CPC_DATA;
  const basic = parseFloat($("cmpBasic")?.value) || parseFloat($("currentBasic")?.value) || 44900;
  const da = parseFloat($("cmpDA")?.value) || D.da.current;
  const base = basic + basic * da / 100;
  const factors = [2.57, 2.86, 3.00, 3.68, D.cpc8.fitmentHigh];
  if (!$("compareResult")) return;
  $("compareResult").innerHTML =
    '<table class="brk"><thead><tr><th>Fitment</th><th>New Basic</th><th>vs Now</th></tr></thead><tbody>' +
    factors.map(f => {
      const nb = base * f;
      return '<tr><td>' + f.toFixed(2) + '×</td><td>' + rupee(nb) + '</td><td>+' + rupee(nb - basic) + '</td></tr>';
    }).join("") + '</tbody></table>';
}
function renderSalaryComparison() { renderCompare(); }

/* ---------- Pay matrix ---------- */
function buildMatrix() {
  if (!$("matrixBody")) return;
  const D = window.CPC_DATA;
  const factors = [2.57, 2.86, 3.68];
  $("matrixHead").innerHTML = "<tr><th>Level</th><th>7th CPC Basic</th>" +
    factors.map(f => "<th>" + f + "×</th>").join("") + "</tr>";
  $("matrixBody").innerHTML = PAY_LEVELS.map(l =>
    "<tr><td>Level " + l.level + "</td><td>" + rupee(l.basic) + "</td>" +
    factors.map(f => "<td>" + rupee(l.basic * f) + "</td>").join("") + "</tr>"
  ).join("");
}

/* ---------- News ---------- */
function renderNews() {
  const box = $("newsContainer"); if (!box) return;
  const filter = $("newsFilter")?.value || "all";
  const items = (window.CPC_DATA.news || []).filter(n => filter === "all" || n.category === filter);
  box.innerHTML = items.length ? items.map(n =>
    '<div class="news-item"><div class="news-meta"><span class="news-tag">' + n.category +
    '</span><span class="news-date">' + formatDate(n.date) + '</span></div>' +
    '<div class="news-title">' + esc(n.title) + '</div>' +
    '<div class="news-body">' + esc(n.body) + '</div>' +
    (n.source ? '<div class="news-src">Source: ' + esc(n.source) + '</div>' : '') +
    '</div>'
  ).join("") : '<p class="muted">No updates in this category.</p>';
}
function refreshNews() { window.CPC_reloadData(); renderNews(); toast("News refreshed"); }
function filterCirculars() {}
function filterByCircTag() {}

/* ---------- FAQ ---------- */
function toggleFAQ(el) {
  const item = el.closest(".faq-item"); if (item) item.classList.toggle("open");
}

/* ---------- Profiles (localStorage) ---------- */
function saveProfile() {
  const name = ($("profileName")?.value || "").trim();
  if (!name) { toast("Enter a profile name"); return; }
  const profiles = JSON.parse(localStorage.getItem("cpc_profiles") || "[]");
  profiles.push({ name, basic: $("currentBasic")?.value, da: $("daPercent")?.value, hra: $("hraClass")?.value, fit: $("fitmentFactor")?.value });
  localStorage.setItem("cpc_profiles", JSON.stringify(profiles));
  $("profileName").value = "";
  loadProfiles(); toast("Profile saved");
}
function loadProfiles() {
  const list = $("savedProfilesList"); if (!list) return;
  const profiles = JSON.parse(localStorage.getItem("cpc_profiles") || "[]");
  if ($("noProfilesMsg")) $("noProfilesMsg").style.display = profiles.length ? "none" : "";
  list.innerHTML = profiles.map((p, i) =>
    '<div class="profile-row"><span>' + esc(p.name) + '</span>' +
    '<button class="btn btn-xs btn-secondary" onclick="applyProfile(' + i + ')">Load</button>' +
    '<button class="btn btn-xs" onclick="deleteProfile(' + i + ')">✕</button></div>'
  ).join("");
}
function applyProfile(i) {
  const p = JSON.parse(localStorage.getItem("cpc_profiles") || "[]")[i]; if (!p) return;
  if ($("currentBasic")) $("currentBasic").value = p.basic;
  if ($("daPercent")) $("daPercent").value = p.da;
  if ($("hraClass")) $("hraClass").value = p.hra;
  syncFitment(p.fit);
  scheduleCalc(); toast("Loaded " + p.name);
}
function deleteProfile(i) {
  const profiles = JSON.parse(localStorage.getItem("cpc_profiles") || "[]");
  profiles.splice(i, 1);
  localStorage.setItem("cpc_profiles", JSON.stringify(profiles));
  loadProfiles();
}

/* ---------- Share ---------- */
function shareText() {
  const r = window._lastResult || {};
  return "My 8th CPC estimated net: " + rupee(r.newNet || 0) + " (+" + rupee(r.diff || 0) + "/mo). Calculate yours at 8thcpcsalary.com";
}
function shareWhatsApp() { window.open("https://wa.me/?text=" + encodeURIComponent(shareText()), "_blank"); }
function shareTelegram() { window.open("https://t.me/share/url?url=https://8thcpcsalary.com&text=" + encodeURIComponent(shareText()), "_blank"); }
function copyResultLink() {
  const r = window._lastResult || {};
  const url = location.origin + location.pathname + "?b=" + (r.basic || "") + "&f=" + (r.fit || "");
  navigator.clipboard?.writeText(url).then(() => toast("Link copied"), () => toast("Copy failed"));
}
function copyResults() {
  navigator.clipboard?.writeText(shareText()).then(() => toast("Summary copied"), () => toast("Copy failed"));
}
function hydrateFromURL() {
  const p = new URLSearchParams(location.search);
  if (p.get("b") && $("currentBasic")) $("currentBasic").value = p.get("b");
  if (p.get("f")) syncFitment(p.get("f"));
  if (p.get("b") || p.get("f")) scheduleCalc();
}

/* ---------- Newsletter ---------- */
function subscribeNewsletter() {
  const email = ($("nlEmail")?.value || "").trim();
  if (!/.+@.+\..+/.test(email)) { toast("Enter a valid email"); return; }
  const subs = JSON.parse(localStorage.getItem("cpc_subscribers") || "[]");
  subs.push({ email, at: Date.now() });
  localStorage.setItem("cpc_subscribers", JSON.stringify(subs));
  $("nlEmail").value = "";
  toast("Subscribed! We'll alert you on DA & 8th CPC updates.");
}

/* ---------- utils ---------- */
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function formatDate(d) {
  try { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  catch (e) { return d; }
}

document.addEventListener("DOMContentLoaded", initApp);
