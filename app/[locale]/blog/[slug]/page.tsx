import { Metadata } from 'next'
import { Button } from "@/components/ui/button"
import { TreePine, Calendar, Clock, MessageCircle, Heart, ArrowLeft } from "lucide-react"
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { BlogPostCard } from '@/components/blog-post-card'
import type { BlogPost } from '@/components/blog-post-card'
import BrowserButtons from "@/components/browser-buttons";
import { SmartCTA } from "@/components/smart-cta";

export const revalidate = 60 // invalidate every hour

const POST_QUERY = `
  query Post($slug: String!) {
    publication(host: "idleforest.com/blog") {
      post(slug: $slug) {
        title
        brief
        content {
          html
        }
        coverImage {
          url
        }
        publishedAt
        readTimeInMinutes
        views
        reactionCount
        responseCount
        tags {
          name
        }
      }
      posts(first: 3) {
        edges {
          node {
            title
            brief
            slug
            coverImage {
              url
            }
            publishedAt
          }
        }
      }
    }
  }
`

async function fetchPost(slug: string) {
  try {
    // Add a unique timestamp to the query name to bypass caching
    const timestamp = Date.now();
    const uniqueQuery = POST_QUERY.replace('query Post', `query Post_${timestamp}`);

    const response = await fetch('https://gql.hashnode.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query: uniqueQuery,
        variables: { slug }
      }),
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new TypeError("Oops, we haven't got JSON!")
    }

    const data = await response.json()
    if (data.errors) {
      throw new Error(data.errors[0]?.message || 'GraphQL Error')
    }

    return data
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await fetchPost(params.slug)
  const post = data?.data?.publication?.post

  if (!post) {
    return {
      title: 'Post Not Found | Idle Forest Blog',
      description: 'The requested blog post could not be found.'
    }
  }

  // Strip HTML tags from content for meta description
  const contentText = post.content.html.replace(/<[^>]*>/g, '')
  const description = contentText.length > 200 ? contentText.substring(0, 197) + '...' : contentText

  return {
    title: `${post.title}`,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      images: [post.coverImage.url],
      type: 'article',
      publishedTime: post.publishedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: description,
      images: [post.coverImage.url],
    }
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const data = await fetchPost(params.slug)
  const post = data?.data?.publication?.post
  const recommendedPosts = data?.data?.publication?.posts?.edges?.map((edge: any) => edge.node) || []

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">The requested blog post could not be found.</p>

        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-gray">
      <div className="container mx-auto px-4 py-32 ">


        <article className="max-w-4xl mx-auto">
          <img
            src={post.coverImage.url}
            alt={post.title}
            className="w-full h-[400px] object-fit md:object-cover rounded-lg mb-8"
          />

          <h1 className="text-4xl font-bold mb-6 text-black">{post.title}</h1>

          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={16} />
              {new Date(post.publishedAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={16} />
              {post.readTimeInMinutes} min read
            </div>

          </div>

          <div className="flex gap-2 mb-8">
            {post.tags.map((tag: any) => (
              <Badge
                key={tag.name}
                variant="secondary"
                className="bg-transparent text-brand-yellow border border-brand-yellow hover:bg-brand-yellow/10"
              >
                {tag.name}
              </Badge>
            ))}
          </div>

          <div className="prose prose-lg max-w-none text-gray-800
            prose-p:text-gray-800 prose-p:leading-relaxed
            prose-strong:text-gray-900 
            prose-pre:bg-gray-100 prose-pre:text-gray-800 prose-pre:p-4 prose-pre:rounded-lg
            prose-code:text-brand-yellow prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mt-16 prose-headings:mb-4
            prose-h1:text-5xl prose-h2:text-4xl prose-h3:text-3xl
            prose-a:text-brand-yellow hover:prose-a:underline prose-a:no-underline
            prose-li:text-gray-800 prose-li:leading-relaxed prose-li:my-[-20px]
            prose-ul:my-4 prose-ol:my-4
            prose-blockquote:text-gray-700 prose-blockquote:border-l-4 prose-blockquote:border-brand-yellow prose-blockquote:pl-4
            prose-hr:border-gray-200
            prose-img:rounded-lg prose-img:shadow-lg">
            <div dangerouslySetInnerHTML={{ __html: post.content.html }} />
          </div>
        </article>

        <div className="max-w-4xl mx-auto w-full bg-brand-navy backdrop-blur-sm border-2 rounded-lg border-brand-yellow py-8 my-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center gap-6 text-center">
              <div>
                <h2 className="text-3xl font-extrabold text-white mb-2">Plant trees for free while you read</h2>
                <p className="text-white">Install IdleForest in one click and turn unused bandwidth into trees. Lightweight, secure, and runs automatically.</p>
              </div>
              <SmartCTA className="text-white" showLearnMore={true} onDarkBackground={true} />
              <p className="text-sm text-white">Free. No signup. Sessionless traffic — no personal data transmitted.</p>
            </div>
          </div>
        </div>


        {recommendedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8 text-black">Recommended Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recommendedPosts.map((post: BlogPost) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
