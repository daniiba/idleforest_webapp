import { MetadataRoute } from 'next'
import { CARBON_LOCALES, getComparisonPaths } from '@/lib/carbon-routing'

interface BlogPost {
  node: {
    slug: string
    publishedAt: string
  }
}

async function getBlogPosts() {
  try {
    // Add a unique timestamp to the query name to bypass caching
    const timestamp = Date.now();
    const query = `
      query Publication_${timestamp} {
        publication(host: "idleforest.hashnode.dev") {
          posts(first: 30) {
            edges {
              node {
                slug
                publishedAt
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://gql.hashnode.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: query
      }),
      cache: 'no-store' // Prevent caching
    })

    const data = await response.json()
    if (!data?.data?.publication?.posts?.edges) {
      console.error('Invalid blog post data structure:', data)
      return []
    }
    return data.data.publication.posts.edges as BlogPost[]
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }
}

import { getAllCarbonData, getAllSlugs } from '@/lib/carbon-data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = await getBlogPosts()
  const carbonSlugs = await getAllSlugs()
  const carbonApps = await getAllCarbonData()
  const carbonComparisonPaths = getComparisonPaths(carbonApps)

  const locales = [...CARBON_LOCALES]

  // Helper to generate alternates for a given path
  const getAlternates = (path: string) => {
    const alternates: Record<string, string> = {}
    locales.forEach(locale => {
      // For 'en', the path is exactly the base path. Others get the prefix.
      const prefix = locale === 'en' ? '' : `/${locale}`
      alternates[locale] = `https://www.idleforest.com${prefix}${path}`
    })
    return { languages: alternates }
  }

  // Helper to generate entries for all languages for a given path
  const generateLocalizedUrls = (path: string, options: { lastModified: Date; changeFrequency: 'monthly' | 'weekly' | 'daily' | 'yearly'; priority: number }, translated = true) => {
    if (!translated) {
      return [{
        url: `https://www.idleforest.com${path}`,
        ...options
      }]
    }

    const alternates = getAlternates(path)
    return locales.map(locale => {
      const prefix = locale === 'en' ? '' : `/${locale}`
      return {
        url: `https://www.idleforest.com${prefix}${path}`,
        alternates,
        ...options
      }
    })
  }

  const posts = blogPosts.flatMap((post) => generateLocalizedUrls(`/blog/${post.node.slug}`, {
    lastModified: new Date(post.node.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }, false))

  const carbonPages = carbonSlugs.flatMap((slug) => generateLocalizedUrls(`/carbon-footprint/${slug}`, {
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const carbonComparePages = carbonComparisonPaths.flatMap((path) => generateLocalizedUrls(path, {
    lastModified: new Date(),
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
    { path: '', changeFrequency: 'daily', priority: 1, lastModified: new Date() },
    { path: '/blog', changeFrequency: 'daily', priority: 0.8, lastModified: new Date(), translated: false },
    { path: '/carbon-footprint', changeFrequency: 'weekly', priority: 0.85, lastModified: new Date() },
    { path: '/carbon-footprint/ai', changeFrequency: 'weekly', priority: 0.8, lastModified: new Date() },
    { path: '/carbon-footprint/streaming', changeFrequency: 'weekly', priority: 0.8, lastModified: new Date() },
    { path: '/carbon-footprint/digital-carbon-footprint', changeFrequency: 'weekly', priority: 0.8, lastModified: new Date() },
    { path: '/carbon-footprint/leaderboard', changeFrequency: 'weekly', priority: 0.8, lastModified: new Date() },
    { path: '/ecosia', changeFrequency: 'weekly', priority: 0.9, lastModified: new Date() },
    { path: '/transparency', changeFrequency: 'monthly', priority: 0.7, lastModified: new Date() },
    { path: '/discord-bot', changeFrequency: 'monthly', priority: 0.6, lastModified: new Date() },
    { path: '/downloads', changeFrequency: 'monthly', priority: 0.7, lastModified: new Date() },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.5, lastModified: new Date() },
    { path: '/terms', changeFrequency: 'monthly', priority: 0.4, lastModified: new Date() },
    { path: '/report', changeFrequency: 'weekly', priority: 0.7, lastModified: new Date() },
    { path: '/compare/idleforest-vs-ecosia-vs-treeclicks', changeFrequency: 'weekly', priority: 0.7, lastModified: new Date(), translated: false },
  ]
  
  const routes = routesOptions.flatMap(({ path, translated, ...options }) => generateLocalizedUrls(path, options, translated !== false))

  return [...routes, ...posts, ...carbonPages, ...carbonComparePages]
}
