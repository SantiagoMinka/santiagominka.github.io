/* ============================================================
   site.js — shared header + footer, injected on every page so
   navigation lives in one place. Pages just need:
     <div id="site-header"></div> ... <div id="site-footer"></div>
   ============================================================ */

(function () {
  const NAV = [
    { href: "/",            label: "Home",    match: (p) => p === "/" || p === "/index.html" },
    { href: "/me.html",     label: "About",   match: (p) => p.startsWith("/me") },
    { href: "/courses.html",label: "Courses", match: (p) => p.startsWith("/courses") || p.startsWith("/note") || p.startsWith("/exercises") },
  ];

  const LINKS = {
    github: "https://github.com/SantiagoMinka",
    email: "santiago@minka.io",
  };

  const path = location.pathname;
  const year = new Date().getFullYear();

  const navHTML = NAV.map((item) => {
    const active = item.match(path) ? " active" : "";
    return `<a class="${active.trim()}" href="${item.href}">${item.label}</a>`;
  }).join("");

  const header = document.getElementById("site-header");
  if (header) {
    header.outerHTML = `
      <header class="site-header">
        <div class="wrap">
          <a class="brand" href="/">Santiago Arévalo Gómez</a>
          <nav class="nav">${navHTML}</nav>
        </div>
      </header>`;
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.outerHTML = `
      <footer class="site-footer">
        <div class="wrap">
          <span>© ${year} Santiago Arévalo Gómez</span>
          <span>
            <a href="${LINKS.github}" target="_blank" rel="noopener">GitHub</a>
            &nbsp;·&nbsp;
            <a href="mailto:${LINKS.email}">Email</a>
          </span>
        </div>
      </footer>`;
  }
})();
