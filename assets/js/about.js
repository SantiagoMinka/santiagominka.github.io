/* ============================================================
   about.js — renders the Education and Work timelines on the
   About page from content/about.json (same idea as courses.json).
   ============================================================ */

(function () {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // One timeline entry. `sub` is the university (education) or company (work).
  function entry({ date, title, sub, desc }) {
    return `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-body">
          ${date ? `<div class="timeline-date">${esc(date)}</div>` : ""}
          <h3 class="timeline-title">${esc(title)}</h3>
          ${sub ? `<div class="timeline-sub">${esc(sub)}</div>` : ""}
          ${desc ? `<p class="timeline-desc">${esc(desc)}</p>` : ""}
        </div>
      </div>`;
  }

  function fill(el, items) {
    if (!el) return;
    if (!items || !items.length) { el.innerHTML = `<p class="muted">Nothing here yet.</p>`; return; }
    el.innerHTML = items.map(entry).join("");
  }

  fetch("/content/about.json")
    .then((r) => { if (!r.ok) throw new Error("Could not load about.json"); return r.json(); })
    .then((data) => {
      fill(document.getElementById("education-timeline"),
        (data.education || []).map((e) => ({ date: e.date, title: e.title, sub: e.uni, desc: e.description })));
      fill(document.getElementById("work-timeline"),
        (data.work || []).map((w) => ({ date: w.date, title: w.title, sub: w.company, desc: w.description })));
    })
    .catch((e) => {
      ["education-timeline", "work-timeline"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = `<p class="status error">${esc(e.message || "Failed to load.")}</p>`;
      });
    });
})();
