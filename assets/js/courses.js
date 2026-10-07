/* ============================================================
   courses.js — renders the Courses section from the manifest.
   One page, two states:
     /courses.html            -> grid of all courses
     /courses.html?c=<slug>   -> one course's notes + exercises
   ============================================================ */

(function () {
  const root = document.getElementById("courses-root");
  const slug = new URLSearchParams(location.search).get("c");

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const fmtDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const fail = (msg) => { root.innerHTML = `<p class="status error">${esc(msg)}</p>`; };

  fetch("/content/courses.json")
    .then((r) => { if (!r.ok) throw new Error("Could not load courses.json"); return r.json(); })
    .then((data) => {
      const courses = (data && data.courses) || [];
      if (slug) renderCourse(courses.find((c) => c.slug === slug));
      else renderIndex(courses);
    })
    .catch((e) => fail(e.message || "Failed to load courses."));

  function renderIndex(courses) {
    if (!courses.length) { fail("No courses yet."); return; }
    const cards = courses.map((c) => {
      const notes = (c.notes || []).length;
      const ex = (c.exercises || []).length;
      const meta = [
        `${notes} note${notes === 1 ? "" : "s"}`,
        ex ? `${ex} exercise${ex === 1 ? "" : "s"}` : null,
      ].filter(Boolean).map((m) => `<span>${esc(m)}</span>`).join("");
      return `
        <a class="card" href="/courses.html?c=${encodeURIComponent(c.slug)}">
          ${c.code ? `<span class="badge">${esc(c.code)}</span>` : ""}
          <h3 style="margin-top:12px;">${esc(c.title)}</h3>
          <p class="muted">${esc(c.description || "")}</p>
          <div class="meta">${meta}</div>
        </a>`;
    }).join("");

    root.innerHTML = `
      <section class="hero">
        <p class="eyebrow">Courses</p>
        <h1>Notes &amp; interactive exercises</h1>
        <p class="lead">Coursework from Politecnico di Milano, written up as I go.</p>
      </section>
      <section><div class="grid cols-2">${cards}</div></section>`;
  }

  function renderCourse(course) {
    if (!course) { fail("Course not found."); return; }

    const notes = (course.notes || []).map((n) => `
      <li><a href="/note.html?c=${encodeURIComponent(course.slug)}&n=${encodeURIComponent(n.slug)}">
        <span class="n-title">${esc(n.title)}</span>
        <span class="n-date">${esc(fmtDate(n.date))}</span>
      </a></li>`).join("");

    const exercises = (course.exercises || []).map((x) => `
      <li><a href="/${esc(x.file)}">
        <span class="n-title">${esc(x.title)}</span>
        <span class="n-date">interactive →</span>
      </a></li>`).join("");

    root.innerHTML = `
      <p class="crumbs"><a href="/courses.html">Courses</a> / ${esc(course.title)}</p>
      <section class="hero" style="padding-top:0;">
        ${course.code ? `<span class="badge">${esc(course.code)}</span>` : ""}
        <h1 style="margin-top:12px;">${esc(course.title)}</h1>
        <p class="lead">${esc(course.description || "")}</p>
      </section>

      <section>
        <h2>Notes</h2>
        ${notes ? `<ul class="note-list" style="margin-top:14px;">${notes}</ul>`
                : `<p class="muted" style="margin-top:8px;">No notes yet.</p>`}
      </section>

      ${exercises ? `
      <section>
        <h2>Interactive exercises</h2>
        <ul class="note-list" style="margin-top:14px;">${exercises}</ul>
      </section>` : ""}`;

    document.title = `${course.title} · Santiago Minka`;
  }
})();
