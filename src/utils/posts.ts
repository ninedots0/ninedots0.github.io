import { getCollection } from 'astro:content'
import { lastUpdatedDate } from './publication'

export async function getPosts() {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft)
  return posts.sort((a, b) =>
    lastUpdatedDate(b.data).getTime() - lastUpdatedDate(a.data).getTime() ||
    b.data.publishDate.getTime() - a.data.publishDate.getTime() ||
    a.id.localeCompare(b.id, 'en')
  )
}
