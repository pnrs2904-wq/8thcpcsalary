/* ============================================================
   8thCPCSalary.com — SHARED SITE DATA (single source of truth)
   ------------------------------------------------------------
   This file holds every editable number and content block used
   across the site. The CMS (/admin/) writes overrides to
   localStorage under key "cpc_cms_data"; the site merges those
   on top of these defaults at load time. That means an admin can
   update DA %, fitment factor, news and blog posts WITHOUT
   re-deploying code.

   Last verified against public sources: August 2026.
   ============================================================ */

(function (global) {
  "use strict";

  // ---- DEFAULT DATA (edit here for permanent/deploy-time changes) ----
  const DEFAULT_DATA = {
    meta: {
      lastUpdated: "2026-08-24",
      dataVersion: 7
    },

    /* Dearness Allowance — 7th CPC series (base year 2016=100) */
    da: {
      current: 60,                 // effective 1 Jan 2026 (Cabinet approved 18 Apr 2026)
      currentEffective: "1 January 2026",
      next: 63,                    // expected 1 Jul 2026 (AICPI-IW calc complete, awaiting Cabinet)
      nextEffective: "1 July 2026",
      nextStatus: "expected",      // "expected" | "approved"
      note: "July 2026 revision to 63% is confirmed by AICPI-IW data; Cabinet notification expected Sep–Oct 2026 with arrears from 1 Jul 2026."
    },

    /* 8th Pay Commission status */
    cpc8: {
      constituted: "3 November 2025",       // Gazette notification
      chair: "Justice Ranjana Prakash Desai",
      reportDue: "Mid-2026 to 2027 (18 months from constitution)",
      effectiveDate: "1 January 2026 (expected, retrospective with arrears)",
      fitmentLow: 1.92,
      fitmentExpected: 2.86,
      fitmentHigh: 3.83,            // highest union demand discussed
      fitmentDefault: 2.57,        // slider default (7th CPC anchor)
      status: "Constituted. Recommendations NOT yet submitted (confirmed in Lok Sabha, Aug 2026). No fitment factor or implementation date officially fixed.",
      minPay7th: 18000
    },

    /* HRA slabs (7th CPC, DA>50% tier) */
    hra: { X: 30, Y: 20, Z: 10 },

    /* News / updates feed — newest first.
       category: DA | 8th CPC | Pension | Fitment */
    news: [
      {
        date: "2026-08-10",
        category: "8th CPC",
        title: "8th CPC recommendations not yet submitted — govt confirms in Lok Sabha",
        body: "The government confirmed on 10 August 2026 that the 8th Central Pay Commission has not submitted its recommendations. No fitment factor or implementation date has been fixed.",
        source: "Lok Sabha reply"
      },
      {
        date: "2026-07-31",
        category: "DA",
        title: "July 2026 DA set to rise to 63% — AICPI-IW data complete",
        body: "With the June 2026 AICPI-IW reading published (151.9), the 12-month average confirms a 3% DA increase from 60% to 63%, effective 1 July 2026. Cabinet approval expected Sep–Oct 2026 with arrears.",
        source: "Labour Bureau / AICPI-IW"
      },
      {
        date: "2026-07-10",
        category: "8th CPC",
        title: "Kolkata meeting raises 5 demands including equal fitment factor",
        body: "Staff-side representations at the 8th CPC Kolkata meeting (9–10 July 2026) raised professional-tax exemption, pension parity, an equal fitment factor for all levels, a 6% increment and more.",
        source: "Staff-side note"
      },
      {
        date: "2026-04-22",
        category: "DA",
        title: "DA fixed at 60% from January 2026 — Finance Ministry OM issued",
        body: "The Union Cabinet approved a 3% DA hike (57% → 60%) on 18 April 2026; the Finance Ministry office memorandum dated 22 April 2026 notified it effective 1 January 2026.",
        source: "MoF OM 22.04.2026"
      },
      {
        date: "2025-11-03",
        category: "8th CPC",
        title: "8th Pay Commission formally constituted via Gazette",
        body: "The 8th CPC was constituted through Gazette notification dated 3 November 2025, chaired by Justice Ranjana Prakash Desai, with a mandate to review pay, pension and allowances of central government staff.",
        source: "Gazette 03.11.2025"
      }
    ],

    /* Blog posts — long-form, indexable pages (rendered by blog.html) */
    blog: [
      {
        slug: "8th-cpc-fitment-factor-explained",
        title: "8th CPC Fitment Factor Explained: What 1.92× to 2.86× Means for Your Pay",
        category: "Fitment",
        author: "Editorial Team",
        date: "2026-08-15",
        excerpt: "The fitment factor is the single multiplier that decides your revised basic pay. Here is how it works, the range under discussion for the 8th CPC, and how to estimate your own number.",
        cover: "",
        body: [
          "The fitment factor is the multiplier applied to your existing basic pay to arrive at your revised basic pay under a new pay commission. Under the 7th CPC the factor was 2.57×, which lifted the minimum basic pay from ₹7,000 to ₹18,000.",
          "For the 8th Pay Commission, no factor has been officially notified. Public estimates discussed in 2026 range from about 1.92× at the conservative end to 2.86× as a widely-cited expectation, with some union demands quoted as high as 3.83×.",
          "It is important to understand what the factor does and does not touch. The fitment factor applies to basic pay only. Allowances such as HRA and Transport Allowance are then recalculated as a percentage of the new basic pay — the factor is not applied to them directly.",
          "To estimate your revised basic pay: multiply your current basic pay by the factor you want to test, then place the result in the nearest cell of the revised pay matrix. Our calculator lets you slide the factor between 1.92× and 3.83× and see the effect on basic, DA, HRA, TA and net in-hand instantly.",
          "Remember these are projections. The actual figure will depend on the Commission's final report and the government's decision. Treat any specific number you see online — including ours — as an unofficial estimate until the Gazette notification is published."
        ]
      },
      {
        slug: "da-hike-july-2026-63-percent",
        title: "DA Hike July 2026: Why It's 63% and What It Adds to Your Salary",
        category: "DA",
        author: "Editorial Team",
        date: "2026-08-05",
        excerpt: "The July 2026 Dearness Allowance revision takes DA from 60% to 63%. Here's the AICPI-IW maths, the arrears timeline, and the rupee impact by pay level.",
        cover: "",
        body: [
          "Dearness Allowance for central government employees is revised twice a year, effective 1 January and 1 July, based on the 12-month moving average of the All-India Consumer Price Index for Industrial Workers (AICPI-IW, base 2016=100).",
          "For the July 2026 cycle, the calculation window runs July 2025 to June 2026. With the June 2026 index published at 151.9 points, the 12-month average places DA just above 63%. Because only the whole number is paid, the payable rate is 63% — a 3 percentage-point rise over the current 60%.",
          "The current 60% rate has been effective since 1 January 2026, confirmed by the Union Cabinet on 18 April 2026 and notified by a Finance Ministry office memorandum dated 22 April 2026.",
          "The revised 63% rate is expected to receive formal Cabinet approval during the usual September–October review, with the increase applied retrospectively from 1 July 2026 and arrears paid as a lump sum.",
          "Pensioners receive Dearness Relief (DR) at the same rate, so DR also rises from 60% to 63% from the same date. Because DA already crossed 50% back in January 2026, this particular hike does not trigger a fresh HRA revision — the 30% / 20% / 10% city slabs continue to apply."
        ]
      },
      {
        slug: "8th-cpc-vs-7th-cpc-salary-comparison",
        title: "8th CPC vs 7th CPC: How Much More Could You Actually Take Home?",
        category: "8th CPC",
        author: "Editorial Team",
        date: "2026-07-20",
        excerpt: "A plain-rupees look at how the projected 8th CPC pay structure compares with your current 7th CPC salary across pay levels.",
        cover: "",
        body: [
          "The headline everyone quotes is a 30–40% salary hike. Whether you actually see that depends on three moving parts: the fitment factor, how DA is treated at the reset, and how allowances are recalculated on the new basic.",
          "Under the 7th CPC, minimum basic pay was ₹18,000. If the 8th CPC applies a 2.86× factor, the minimum basic would rise to roughly ₹51,000 before allowances. At 1.92× it would be closer to ₹34,560. The spread between these scenarios is large, which is why our calculator lets you test each one.",
          "At implementation, accumulated DA is typically merged into basic pay and DA resets toward 0%. That reset is why comparing only 'new basic vs old basic' can be misleading — you have to compare full gross and net figures.",
          "Higher pay levels see a larger rupee increase but not necessarily a larger percentage increase. The multiplier is the same for everyone, so the absolute gap between Level 1 and Level 10 actually widens even though the percentage uplift is similar.",
          "Use the Fitment tab in the calculator to line up 2.57×, 3.00× and 3.68× side by side for your own level, then read the net in-hand row — that is the number that lands in your account."
        ]
      }
    ]
  };

  // ---- MERGE CMS OVERRIDES FROM localStorage ----
  function loadData() {
    let data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    try {
      const raw = global.localStorage && localStorage.getItem("cpc_cms_data");
      if (raw) {
        const override = JSON.parse(raw);
        // shallow-merge top-level, replace arrays wholesale if present
        data = deepMerge(data, override);
      }
    } catch (e) {
      console.warn("CMS override parse failed, using defaults:", e);
    }
    return data;
  }

  function deepMerge(base, over) {
    if (Array.isArray(over)) return over.slice();
    if (over && typeof over === "object") {
      const out = Array.isArray(base) ? {} : Object.assign({}, base);
      Object.keys(over).forEach(function (k) {
        out[k] = (k in base) ? deepMerge(base[k], over[k]) : over[k];
      });
      return out;
    }
    return over;
  }

  global.CPC_DEFAULT_DATA = DEFAULT_DATA;
  global.CPC_DATA = loadData();
  global.CPC_reloadData = function () { global.CPC_DATA = loadData(); return global.CPC_DATA; };

})(typeof window !== "undefined" ? window : this);
