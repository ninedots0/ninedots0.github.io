import { readdir, readFile } from 'node:fs/promises'
import { basename, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AstroIntegration } from 'astro'
import { close, createIndex } from 'pagefind'

export default function pagefind(): AstroIntegration {
  return {
    name: 'blog-pagefind',
    hooks: {
      'astro:build:done': async ({ dir, logger, pages }) => {
        const output = fileURLToPath(dir)
        const blog = join(output, 'blog')
        const hasPosts = pages.some(({ pathname }) => pathname.startsWith('blog/'))
        const files = hasPosts ? await readdir(blog, { recursive: true }) : []
        let count = 0

        try {
          // The Chinese tokenizer handles both Han text and Latin words in mixed articles.
          const { index, errors } = await createIndex({
            forceLanguage: 'zh',
            excludeSelectors: ['mjx-container']
          })
          if (!index || errors.length) {
            throw new Error(errors.join('\n') || 'Pagefind initialization failed')
          }

          for (const file of files.sort()) {
            if (basename(file) !== 'index.html') continue
            const path = join(blog, file)
            const content = await readFile(path, 'utf8')
            const url = '/' + relative(output, path).split(sep).join('/').replace(/\/index\.html$/, '')
            const added = await index.addHTMLFile({ url, content })
            if (added.errors.length) throw new Error(added.errors.join('\n'))
            count++
          }

          const written = await index.writeFiles({ outputPath: join(output, 'pagefind') })
          if (written.errors.length) throw new Error(written.errors.join('\n'))
          logger.info(`Indexed ${count} articles`)
        } finally {
          await close()
        }
      }
    }
  }
}
