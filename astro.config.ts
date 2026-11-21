import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerRemoveNotationEscape
} from '@shikijs/transformers'
import { defineConfig } from 'astro/config'
import rehypeMathjax from 'rehype-mathjax/svg'

import pagefind from './src/integrations/pagefind'
import rehypeArticle from './src/plugins/rehype-article'
import remarkDisplayMath from './src/plugins/remark-display-math'
import remarkMath from './src/plugins/remark-math'
import { wrapCodeBlock } from './src/plugins/shiki-custom-transformers'
import { site } from './src/site.config'

export default defineConfig({
  site: site.url,
  trailingSlash: 'never',
  server: { host: true },
  image: { responsiveStyles: true },
  prefetch: { prefetchAll: true },
  markdown: {
    remarkPlugins: [remarkMath, remarkDisplayMath],
    rehypePlugins: [
      [rehypeMathjax, { svg: { fontCache: 'local' } }],
      rehypeHeadingIds,
      rehypeArticle
    ],
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      transformers: [
        transformerNotationDiff(),
        transformerNotationHighlight(),
        transformerRemoveNotationEscape(),
        wrapCodeBlock
      ]
    }
  },
  integrations: [pagefind()]
})
