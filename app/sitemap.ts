import { MetadataRoute } from 'next'

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

import { getAllSlugs } from '@/lib/carbon-data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = await getBlogPosts()
  const carbonSlugs = getAllSlugs()

  const locales = ['en', 'es', 'pt', 'de', 'fr']

  // Helper to generate alternates for a given path
  const getAlternates = (path: string) => {
    const alternates: Record<string, string> = {}
    locales.forEach(locale => {
      // For 'en', the path is exactly the base path. Others get the prefix.
      const prefix = locale === 'en' ? '' : `/${locale}`
      alternates[locale] = `https://idleforest.com${prefix}${path}`
    })
    return { languages: alternates }
  }

  const posts = blogPosts.map((post) => ({
    url: `https://idleforest.com/blog/${post.node.slug}`,
    lastModified: new Date(post.node.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    alternates: getAlternates(`/blog/${post.node.slug}`)
  }))

  const carbonPages = carbonSlugs.map((slug) => ({
    url: `https://idleforest.com/carbon-footprint/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    alternates: getAlternates(`/carbon-footprint/${slug}`)
  }))

  const routes = [
    {
      url: 'https://idleforest.com',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
      alternates: getAlternates('')
    },
    {
      url: 'https://idleforest.com/blog',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
      alternates: getAlternates('/blog')
    },
    {
      url: 'https://idleforest.com/ecosia',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
      alternates: getAlternates('/ecosia')
    },
    {
      url: 'https://idleforest.com/transparency',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: getAlternates('/transparency')
    },
    {
      url: 'https://idleforest.com/discord-bot',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: getAlternates('/discord-bot')
    },
    {
      url: 'https://idleforest.com/downloads',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: getAlternates('/downloads')
    },
    {
      url: 'https://idleforest.com/contact',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
      alternates: getAlternates('/contact')
    },
    {
      url: 'https://idleforest.com/terms',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
      alternates: getAlternates('/terms')
    },
    {
      url: 'https://idleforest.com/report',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: getAlternates('/report')
    },
    {
      url: 'https://idleforest.com/compare/idleforest-vs-ecosia-vs-treeclicks',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: getAlternates('/compare/idleforest-vs-ecosia-vs-treeclicks')
    },
  ]

  return [...routes, ...posts, ...carbonPages]
}
