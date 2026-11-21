# 9dots

A static Astro blog published on [GitHub Pages](https://ninedots0.github.io/).

Install dependencies with `bun install --frozen-lockfile` and start the dev server
with `bun run dev`. Use `bun run build` for type checking and a production build,
then `bun run preview` to try the generated site and its Pagefind search index.

Posts live in `src/content/blog/`. The Astro collection ID determines each
`/blog/<id>` URL. Posts marked `draft: true` are only shown in development.
Use `$...$` for inline math and `$$...$$` for display math. MathJax renders
equations into SVG during the build.

The GitHub Pages workflow publishes `dist/` when changes land on `main`.

The syntax files under `src/plugins/math-syntax/` come from
[micromark-extension-math 3.1.0](https://github.com/micromark/micromark-extension-math/tree/3.1.0)
under the MIT license. The HTML renderer from that package is excluded so the
original Markdown syntax can be used with MathJax as the sole renderer.
