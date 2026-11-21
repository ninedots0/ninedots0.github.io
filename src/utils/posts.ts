import { getCollection } from 'astro:content'

export async function getPosts() {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft)
  return posts.sort((a, b) =>
    b.data.publishDate.getTime() - a.data.publishDate.getTime() ||
    a.id.localeCompare(b.id, 'en')
  )
}
