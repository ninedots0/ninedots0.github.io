import { join, relative } from 'node:path'
import { readdir, readFile } from 'node:fs/promises'
import { createIndex, close } from 'pagefind'
import { fileURLToPath } from 'node:url'
// Astro
import type { AstroIntegration, RehypePlugins, RemarkPlugins } from 'astro'
import { AstroError } from 'astro/errors'
// Integrations
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import UnoCSS from 'unocss/astro'

import rehypeExternalLinks from './plugins/rehype-external-links'
import rehypeTable from './plugins/rehype-table'
import { remarkAddZoomable, remarkReadingTime } from './plugins/remark-plugins'
import { vitePluginUserConfig } from './plugins/virtual-user-config'
import { UserConfigSchema, type UserInputConfig } from './types/user-config'
import { parseWithFriendlyErrors } from './utils/error-map'

export default function AstroPureIntegration(opts: UserInputConfig): AstroIntegration {
  if (typeof opts !== 'object' || opts === null || Array.isArray(opts))
    throw new AstroError(
      'Invalid config passed to astro-pure integration',
      'The astro-pure integration expects a right configuration object with at least a `title` property.\n\n'
    )
  const integrations: AstroIntegration[] = []
  const remarkPlugins: RemarkPlugins = []
  const rehypePlugins: RehypePlugins = []

  return {
    name: 'astro-pure',
    hooks: {
      'astro:config:setup': async ({ config, updateConfig }) => {
        const userConfig = parseWithFriendlyErrors(
          UserConfigSchema,
          opts,
          'Invalid config passed to astro-pure integration'
        )

        // Add built-in integrations only if they are not already added by the user through the
        // config or by a plugin.
        const allIntegrations = [...config.integrations, ...integrations]
        if (!allIntegrations.find(({ name }) => name === '@astrojs/sitemap')) {
          integrations.push(sitemap())
        }
        if (!allIntegrations.find(({ name }) => name === '@astrojs/mdx')) {
          integrations.push(mdx({ optimize: true }))
        }
        if (!allIntegrations.find(({ name }) => name === 'unocss')) {
          integrations.push(UnoCSS({ injectReset: true }))
        }

        // Add supported remark plugins based on user config.
        if (userConfig.integ.mediumZoom.enable)
          remarkPlugins.push([remarkAddZoomable, userConfig.integ.mediumZoom.options])
        remarkPlugins.push(remarkReadingTime)

        // Add supported rehype plugins based on user config.
        rehypePlugins.push([
          rehypeExternalLinks,
          {
            content: { type: 'text', value: userConfig.content.externalLinks.content },
            contentProperties: userConfig.content.externalLinks.properties
          }
        ])
        // Make table scrollable on overflow
        rehypePlugins.push(rehypeTable)

        // Add Starlight directives restoration integration at the end of the list so that remark
        // plugins injected by Starlight plugins through Astro integrations can handle text and
        // leaf directives before they are transformed back to their original form.
        // integrations.push(starlightDirectivesRestorationIntegration())

        // Add integrations immediately after Starlight in the config array.
        // This ensures users can add integrations before/after Starlight and we respect that order.
        const selfIndex = config.integrations.findIndex((i) => i.name === 'astro-pure')
        config.integrations.splice(selfIndex + 1, 0, ...integrations)

        updateConfig({
          vite: {
            // biome-ignore lint/suspicious/noTsIgnore: expects error for local, but expects no error when build
            // @ts-ignore
            plugins: [vitePluginUserConfig(userConfig, config)]
          },
          markdown: {
            remarkPlugins,
            rehypePlugins
            // rehypePlugins: [rehypeRtlCodeSupport()],
            // shikiConfig:
            // Configure Shiki theme if the user is using the default github-dark theme.
            //   config.markdown.shikiConfig.theme !== 'github-dark' ? {} : { theme: 'css-variables' }
          },
          scopedStyleStrategy: 'where',
          // If not already configured, default to prefetching all links on hover.
          prefetch: config.prefetch ?? { prefetchAll: true }
        })
      },

      'astro:build:done': async ({ dir, logger }) => {
        if (!opts.integ.pagefind) return
        // One Chinese-capable index also searches embedded English words.
        const { index, errors } = await createIndex({ forceLanguage: 'zh', excludeSelectors: ['.katex'] })
        if (!index || errors.length) throw new Error(errors.join('\n') || 'Pagefind initialization failed')
        try {
          const output = fileURLToPath(dir)
          const blogDir = join(output, 'blog')
          const files = await readdir(blogDir, { recursive: true })
          let count = 0
          for (const file of files) {
            if (!file.endsWith('.html')) continue
            const fullPath = join(blogDir, file)
            const content = await readFile(fullPath, 'utf8')
            if (!content.includes('data-pagefind-body')) continue
            const url = '/' + relative(output, fullPath).replaceAll('\\', '/').replace(/\/index\.html$/, '')
            const added = await index.addHTMLFile({ url, content })
            if (added.errors.length) throw new Error(added.errors.join('\n'))
            count++
          }
          const written = await index.writeFiles({ outputPath: join(fileURLToPath(dir), 'pagefind') })
          if (written.errors.length) throw new Error(written.errors.join('\n'))
          logger.info(`Pagefind: indexed ${count} blog pages`)
        } finally { await close() }
      }
    }
  }
}
