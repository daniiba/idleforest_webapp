import { MetadataRoute } from 'next'
import { getHashnodeSitemapPosts } from '@/lib/hashnode-blog'
import { FREE_TREE_GUIDE_SLUG, FREE_TREE_GUIDE_UPDATED_AT } from '@/lib/free-tree-guide'
import { getIndexableComparisonPaths } from '@/lib/carbon-routing'
import { getAllCarbonData } from '@/lib/carbon-data'
import { canonicalUrl, translatedLocalesForPath } from '@/lib/i18n-routes'

const SEO_CLUSTER_LAST_MODIFIED = new Date('2026-05-09T00:00:00.000Z')
const CORE_SITE_LAST_MODIFIED = new Date('2026-05-09T00:00:00.000Z')

function getStableDate(value?: string) {
  return value ? new Date(value) : SEO_CLUSTER_LAST_MODIFIED
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = await getHashnodeSitemapPosts()
  const carbonPagesData = await getAllCarbonData()
  const carbonComparisonPaths = getIndexableComparisonPaths()

  // Helper to generate alternates for a given path
  const getAlternates = (path: string) => {
    const normalizedPath = path === '' ? '/' : path
    const translatedLocales = translatedLocalesForPath(normalizedPath)

    if (!translatedLocales) {
      return undefined
    }

    const alternates: Record<string, string> = {}
    translatedLocales.forEach(locale => {
      alternates[locale] = canonicalUrl(normalizedPath, locale)
    })
    alternates['x-default'] = canonicalUrl(normalizedPath, 'en')
    return { languages: alternates }
  }

  // Helper to generate entries for all languages for a given path
  const generateLocalizedUrls = (path: string, options: { lastModified: Date; changeFrequency: 'monthly' | 'weekly' | 'daily' | 'yearly'; priority: number }, translated = true) => {
    const normalizedPath = path === '' ? '/' : path
    const translatedLocales = translated ? translatedLocalesForPath(normalizedPath) : undefined

    if (!translatedLocales) {
      return [{
        url: canonicalUrl(normalizedPath, 'en'),
        ...options
      }]
    }

    const alternates = getAlternates(normalizedPath)
    return translatedLocales.map(locale => {
      return {
        url: canonicalUrl(normalizedPath, locale),
        ...(alternates ? { alternates } : {}),
        ...options
      }
    })
  }

  const posts = blogPosts.flatMap((post) => generateLocalizedUrls(`/blog/${post.slug}`, {
    lastModified: new Date(post.slug === FREE_TREE_GUIDE_SLUG ? FREE_TREE_GUIDE_UPDATED_AT : post.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }, false))

  const carbonPages = carbonPagesData.flatMap((page) => generateLocalizedUrls(`/carbon-footprint/${page.slug}`, {
    lastModified: getStableDate(page.seo_content?.en?.reviewed_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const carbonComparePages = carbonComparisonPaths.flatMap((path) => generateLocalizedUrls(path, {
    lastModified: SEO_CLUSTER_LAST_MODIFIED,
    changeFrequency: 'weekly',
    priority: 0.75,
  }))

  type RouteOption = {
    path: string;
    changeFrequency: 'monthly' | 'weekly' | 'daily' | 'yearly';
    priority: number;
    lastModified: Date;
    translated?: boolean;
  }

  const routesOptions: RouteOption[] = [
    { path: '', changeFrequency: 'daily', priority: 1, lastModified: new Date('2026-09-10T00:00:00.000Z') },
    { path: '/blog', changeFrequency: 'daily', priority: 0.8, lastModified: CORE_SITE_LAST_MODIFIED, translated: false },
    { path: '/carbon-footprint', changeFrequency: 'weekly', priority: 0.85, lastModified: SEO_CLUSTER_LAST_MODIFIED },
    { path: '/carbon-footprint/ai', changeFrequency: 'weekly', priority: 0.8, lastModified: SEO_CLUSTER_LAST_MODIFIED },
    { path: '/carbon-footprint/streaming', changeFrequency: 'weekly', priority: 0.8, lastModified: SEO_CLUSTER_LAST_MODIFIED },
    { path: '/carbon-footprint/digital-carbon-footprint', changeFrequency: 'weekly', priority: 0.8, lastModified: SEO_CLUSTER_LAST_MODIFIED },
    { path: '/carbon-footprint/leaderboard', changeFrequency: 'weekly', priority: 0.8, lastModified: SEO_CLUSTER_LAST_MODIFIED },
    { path: '/eco-friendly-search-engine', changeFrequency: 'weekly', priority: 0.9, lastModified: SEO_CLUSTER_LAST_MODIFIED },
    { path: '/tree-planting-extension', changeFrequency: 'weekly', priority: 0.9, lastModified: SEO_CLUSTER_LAST_MODIFIED },
    { path: '/ecosia', changeFrequency: 'weekly', priority: 0.9, lastModified: SEO_CLUSTER_LAST_MODIFIED },
    { path: '/is-ecosia-legit-safe', changeFrequency: 'weekly', priority: 0.85, lastModified: SEO_CLUSTER_LAST_MODIFIED },
    { path: '/compare', changeFrequency: 'weekly', priority: 0.85, lastModified: SEO_CLUSTER_LAST_MODIFIED, translated: false },
    { path: '/how-it-works', changeFrequency: 'monthly', priority: 0.85, lastModified: CORE_SITE_LAST_MODIFIED, translated: false },
    { path: '/download/chrome', changeFrequency: 'monthly', priority: 0.9, lastModified: CORE_SITE_LAST_MODIFIED, translated: false },
    { path: '/download/mac', changeFrequency: 'monthly', priority: 0.85, lastModified: CORE_SITE_LAST_MODIFIED, translated: false },
    { path: '/download/windows', changeFrequency: 'monthly', priority: 0.85, lastModified: CORE_SITE_LAST_MODIFIED, translated: false },
    { path: '/download/linux', changeFrequency: 'monthly', priority: 0.85, lastModified: CORE_SITE_LAST_MODIFIED, translated: false },
    { path: '/c/mossy-earth', changeFrequency: 'weekly', priority: 0.75, lastModified: new Date('2026-06-15T00:00:00.000Z'), translated: false },
    { path: '/c/planetwild', changeFrequency: 'weekly', priority: 0.75, lastModified: new Date('2026-06-22T00:00:00.000Z'), translated: false },
    { path: '/c/silveira', changeFrequency: 'weekly', priority: 0.75, lastModified: new Date('2026-06-16T00:00:00.000Z'), translated: false },
    { path: '/transparency', changeFrequency: 'monthly', priority: 0.7, lastModified: CORE_SITE_LAST_MODIFIED },
    { path: '/reviews', changeFrequency: 'monthly', priority: 0.65, lastModified: CORE_SITE_LAST_MODIFIED },
    { path: '/discord-bot', changeFrequency: 'monthly', priority: 0.6, lastModified: CORE_SITE_LAST_MODIFIED },
    { path: '/downloads', changeFrequency: 'monthly', priority: 0.7, lastModified: CORE_SITE_LAST_MODIFIED },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.5, lastModified: CORE_SITE_LAST_MODIFIED },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.4, lastModified: CORE_SITE_LAST_MODIFIED, translated: false },
    { path: '/terms', changeFrequency: 'monthly', priority: 0.4, lastModified: CORE_SITE_LAST_MODIFIED },
    { path: '/report', changeFrequency: 'weekly', priority: 0.7, lastModified: CORE_SITE_LAST_MODIFIED },
    { path: '/compare/idleforest-vs-ecosia-vs-treeclicks', changeFrequency: 'weekly', priority: 0.7, lastModified: SEO_CLUSTER_LAST_MODIFIED, translated: false },
  ]
  
  const routes = routesOptions.flatMap(({ path, translated, ...options }) => generateLocalizedUrls(path, options, translated !== false))

  return [...routes, ...posts, ...carbonPages, ...carbonComparePages]
}
