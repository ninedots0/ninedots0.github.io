export const site = {
  url: 'https://ninedots0.github.io',
  title: '9dots',
  author: '9dots',
  description: '做点有想象力的~',
  titleDelimiter: '•',
  locale: 'en_US',
  favicon: '/favicon/favicon.ico',
  socialCard: '/images/avatar.png'
}

export interface SiteMeta {
  title: string
  description?: string
  ogImage?: string
  articleDate?: string
}
