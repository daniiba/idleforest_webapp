'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TreePine, Calendar, Clock, MessageCircle, Heart, ArrowLeft, TreesIcon } from "lucide-react"
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"

interface BlogPost {
  title: string
  content: {
    html: string
  }
  coverImage: {
    url: string
  }
  publishedAt: string
  readTimeInMinutes: number
  views: number
  reactionCount: number
  responseCount: number
  tags: {
    name: string
  }[]
}

interface RecommendedPost {
  title: string
  brief: string
  url: string
  slug: string
  coverImage: {
    url: string
  }
  publishedAt: string
}

const POST_QUERY = `
  query Post($slug: String!) {
    publication(host: "idleforest.hashnode.dev") {
      post(slug: $slug) {
        title
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

export default function BlogPostContent({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [recommendedPosts, setRecommendedPosts] = useState<RecommendedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://gql.hashnode.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: POST_QUERY,
            variables: {
              slug
            }
          })
        })

        const data = await response.json()
        setPost(data.data?.publication?.post || null)
        setRecommendedPosts(data.data?.publication?.posts?.edges?.map((edge: any) => edge.node) || [])
      } catch (err) {
        setError('Failed to load blog post')
        console.error('Error fetching blog post:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [slug])

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>
  if (!post) return <div>Post not found</div>

  return (
    <div className="container mx-auto px-4 py-8">
     
      
      <article className="max-w-4xl mx-auto">
        <img
          src={post.coverImage.url}
          alt={post.title}
          className="w-full h-[400px] object-cover rounded-lg mb-8"
        />
        
        <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
        
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar size={16} />
            {new Date(post.publishedAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock size={16} />
            {post.readTimeInMinutes} min read
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <TreePine size={16} />
            {post.views} views
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Heart size={16} />
            {post.reactionCount} reactions
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageCircle size={16} />
            {post.responseCount} responses
          </div>
        </div>

        <div className="flex gap-2 mb-8">
          {post.tags.map((tag) => (
            <Badge key={tag.name} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>

        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {post.content.html}
          </ReactMarkdown>
        </div>
      </article>

      {recommendedPosts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Recommended Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendedPosts.map((post) => (
              <Card key={post.slug}>
                <CardContent className="p-4">
                  <img
                    src={post.coverImage.url}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                  <p className="text-muted-foreground mb-4">{post.brief}</p>
                  <Link href={`/blog/${post.slug}`}>
                    <Button variant="outline" className="w-full">
                      Read More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
