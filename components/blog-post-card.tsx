import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, Heart, MessageCircle, TreePine } from 'lucide-react'
import Image from 'next/image'

export interface BlogPost {
  title: string
  brief: string
  slug: string
  coverImage: {
    url: string
  }
  publishedAt: string
  readTimeInMinutes?: number
  views?: number
  reactionCount?: number
  responseCount?: number
  tags?: Array<{ name: string }>
}

export function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <Card className="h-full flex flex-col bg-brand-navy border-4 border-brand-navy shadow-[0_6px_0_0_#0B101F] hover:shadow-[0_10px_0_0_#0B101F] transition-all">
        <CardContent className="p-0 flex-grow">
          <div className="relative w-full h-52 overflow-hidden">
            <Image
              src={post.coverImage.url}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority={false}
            />
          </div>

          <div className="px-5 pt-4 pb-5">
            <h2 className="text-white  text-xl leading-snug tracking-wide font-rethink-sans mb-3">
              {post.title}
            </h2>
           {/*  <p className="text-sm text-gray-300/90 line-clamp-2 mb-4">
              {post.brief}
            </p> */}

            <div className="flex flex-wrap items-center gap-5 text-xs text-gray-300/80">
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
              </div>
              {post.readTimeInMinutes && (
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>{post.readTimeInMinutes} min read</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <div className="px-5 pb-5">
          <div className="w-full bg-brand-yellow text-black font-medium text-center py-2 group-hover:brightness-95">
            Read More
          </div>
        </div>
      </Card>
    </Link>
  )
}

