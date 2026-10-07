/* ============================================================
   note-viewer.js — fetches a Markdown note and renders it with
   LaTeX math (KaTeX) and code highlighting (highlight.js).
   Also builds a heading table-of-contents and prev/next links.

   URL: /note.html?c=<course-slug>&n=<note-slug>
   ============================================================ */

(function () {
  const root = document.getElementById("note-root");
  const params = new URLSearchParams(location.search);
  const courseSlug = params.get("c");
  const noteSlug = params.get("n");

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const slugify = (s) => s.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
  const fmtDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    return isNaN(d) ? iso : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };
  const fail = (msg) => { root.innerHTML = `<p class="status error">${esc(msg)}</p>`; };

  // --- Markdown + math config -------------------------------------------
  // Math is tokenized BEFORE emphasis parsing so underscores/asterisks
  // inside formulas (x_1, a*b) are never mangled by Markdown.
  function mathRenderer(displayMode) {
    return function (token) {
      try {
        return katex.renderToString(token.text, { displayMode, throwOnError: false });
      } catch (e) {
        return `<code>${esc(token.raw)}</code>`;
      }
    };
  }
  marked.use({
    extensions: [
      {
        name: "blockMath", level: "block",
        start(src) { return src.indexOf("$$"); },
        tokenizer(src) {
          const m = /^\$\$([\s\S]+?)\$\$/.exec(src);
          if (m) return { type: "blockMath", raw: m[0], text: m[1].trim() };
        },
        renderer: mathRenderer(true),
      },
      {
        name: "inlineMath", level: "inline",
        start(src) { const i = src.indexOf("$"); return i < 0 ? undefined : i; },
        tokenizer(src) {
          const m = /^\$([^$\n]+?)\$/.exec(src);
          if (m) return { type: "inlineMath", raw: m[0], text: m[1].trim() };
        },
        renderer: mathRenderer(false),
      },
    ],
  });

  if (!courseSlug || !noteSlug) { fail("Missing course or note in the URL."); return; }

  fetch("/content/courses.json")
    .then((r) => { if (!r.ok) throw new Error("Could not load the course list."); return r.json(); })
    .then((data) => {
      const course = (data.courses || []).find((c) => c.slug === courseSlug);
      if (!course) throw new Error("Course not found.");
      const notes = course.notes || [];
      const idx = notes.findIndex((n) => n.slug === noteSlug);
      if (idx < 0) throw new Error("Note not found.");
      const note = notes[idx];

      return fetch(`/content/courses/${course.slug}/${note.file}`)
        .then((r) => { if (!r.ok) throw new Error("Could not load the note file."); return r.text(); })
        .then((md) => render(course, note, md, notes[idx - 1], notes[idx + 1]));
    })
    .catch((e) => fail(e.message || "Failed to load the note."));

  function render(course, note, md, prev, next) {
    const html = marked.parse(md);

    const pagerLink = (n, dir) => n
      ? `<a class="card" href="/note.html?c=${encodeURIComponent(course.slug)}&n=${encodeURIComponent(n.slug)}">
           <div class="dir">${dir}</div><div class="n-title">${esc(n.title)}</div></a>`
      : `<span></span>`;

    root.innerHTML = `
      <p class="crumbs">
        <a href="/courses.html">Courses</a> /
        <a href="/courses.html?c=${encodeURIComponent(course.slug)}">${esc(course.title)}</a> /
        ${esc(note.title)}
      </p>
      <div class="note-layout">
        <article class="prose">
          <p class="muted" style="margin-bottom:4px;">${esc(fmtDate(note.date))}</p>
          ${html}
          <nav class="pager">${pagerLink(prev, "← Previous")}${pagerLink(next, "Next →")}</nav>
        </article>
        <aside class="toc" id="toc"></aside>
      </div>`;

    document.title = `${note.title} · ${course.title}`;

    highlightCode();
    buildToc();
  }

  function highlightCode() {
    if (!window.hljs) return;
    root.querySelectorAll(".prose pre code").forEach((el) => hljs.highlightElement(el));
  }

  function buildToc() {
    const headings = Array.from(root.querySelectorAll(".prose h2, .prose h3"));
    const toc = document.getElementById("toc");
    if (!toc) return;
    if (headings.length < 2) { toc.remove(); return; }

    const seen = {};
    const items = headings.map((h) => {
      let id = slugify(h.textContent);
      if (seen[id] != null) { seen[id]++; id = `${id}-${seen[id]}`; } else seen[id] = 0;
      h.id = id;
      const lvl = h.tagName === "H3" ? " lvl-3" : "";
      return `<a class="${lvl.trim()}" href="#${id}">${esc(h.textContent)}</a>`;
    }).join("");

    toc.innerHTML = `<div class="toc-title">On this page</div>${items}`;
  }
})();
