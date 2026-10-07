# santiagominka.github.io

Personal site — a short about page plus course notes and interactive exercises from
Politecnico di Milano. Plain HTML/CSS/JS, **no build step**: it runs as-is on GitHub Pages.

## Structure

```
index.html / me.html / courses.html / note.html / 404.html
assets/css/style.css          design system (CSS variables)
assets/js/site.js             shared header + footer
assets/js/courses.js          renders the Courses section from the manifest
assets/js/note-viewer.js      renders a Markdown note (math + code + TOC)
content/courses.json          the manifest: courses, notes, exercises
content/courses/<course>/*.md the notes themselves
exercises/<course>/*.html     standalone interactive visualizations
```

## Run it locally

Notes are fetched at runtime, so open it over HTTP (not `file://`):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Add a note

1. Create the Markdown file: `content/courses/<course>/note-02-whatever.md`.
2. Add an entry to that course's `notes` array in `content/courses.json`:

   ```json
   { "slug": "note-02-whatever", "title": "Whatever", "date": "2026-10-10", "file": "note-02-whatever.md" }
   ```

That's it. Notes support standard Markdown, LaTeX math (`$inline$` and `$$block$$`),
code fences, tables, and raw HTML (e.g. an `<iframe>` to embed an exercise).

## Add a course

Create a folder under `content/courses/` and add a course object to `content/courses.json`:

```json
{
  "slug": "my-course",
  "title": "Full Course Name",
  "code": "SHORT",
  "description": "One line.",
  "notes": [],
  "exercises": []
}
```

## Add an interactive exercise

An exercise is just a self-contained HTML page under `exercises/<course>/` (see
`exercises/distributed-systems/recovery-line.html`).

1. Drop your HTML file in `exercises/<course>/`.
2. Register it under the course's `exercises` in the manifest:

   ```json
   { "slug": "my-exercise", "title": "My Exercise", "file": "exercises/<course>/my-exercise.html" }
   ```

3. (Optional) Embed it inside a note with an iframe:

   ```html
   <iframe class="embed" src="/exercises/<course>/my-exercise.html" height="560" loading="lazy"></iframe>
   ```
