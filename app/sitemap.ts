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

  const posts = blogPosts.map((post) => ({
    url: `https://idleforest.com/blog/${post.node.slug}`,
    lastModified: new Date(post.node.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7
  }))

  const carbonPages = carbonSlugs.map((slug) => ({
    url: `https://idleforest.com/carbon-footprint/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8
  }))

  const routes = [
    {
      url: 'https://idleforest.com',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: 'https://idleforest.com/blog',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: 'https://idleforest.com/ecosia',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: 'https://idleforest.com/report',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: 'https://idleforest.com/compare/idleforest-vs-ecosia-vs-treeclicks',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ]

  return [...routes, ...posts, ...carbonPages]
}
