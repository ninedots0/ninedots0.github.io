import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

// Date-only frontmatter can use unpadded months or days, which Date parses as local time.
const articleDate = z.preprocess((value) => {
  if (typeof value !== 'string') return value
  return value.replace(/^(\d{4})-(\d{1,2})-(\d{1,2})$/, (_, year, month, day) =>
    `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  )
}, z.coerce.date())

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(60),
      description: z.string().max(160),
      publishDate: articleDate,
      updatedDate: articleDate.optional(),
      heroImage: z.object({ src: image() }).optional(),
      language: z.string().optional(),
      draft: z.boolean().default(false)
    })
})

export const collections = { blog }
