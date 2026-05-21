import { Metadata } from 'next'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BlogPostCard } from '@/components/blog-post-card'
import type { BlogPost } from '@/components/blog-post-card'
import Link from 'next/link'
import Script from 'next/script'
import { getHashnodePosts } from '@/lib/hashnode-blog'

const POSTS_PER_PAGE = 6


export const metadata: Metadata = {
  title: 'Blog | Idle Forest',
  description: 'Explore our latest articles and insights',
  openGraph: {
    title: 'Blog | Idle Forest',
    description: 'Explore our latest articles and insights',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Idle Forest',
    description: 'Explore our latest articles and insights',
  }
}

export default async function BlogPage({
  searchParams
}: {
  searchParams: { page?: string; cursor?: string }
}) {
  const currentPage = parseInt(searchParams.page || '1')
  const currentCursor = searchParams.cursor
  const { posts, pageInfo } = await getHashnodePosts({
    cursor: currentCursor,
    first: POSTS_PER_PAGE,
  })

  if (posts.length === 0 && currentPage === 1) {
    return (
      <div className="min-h-screen bg-brand-gray">
        <div className="container mx-auto px-4 py-8 pt-8">
          <h1 className="text-4xl font-bold mb-8 text-white">Blog Posts</h1>
          <div className="text-center py-12">
            <p className="text-gray-400">No blog posts found. Please try again later.</p>
            {currentPage > 1 && (
              <Link href="/blog">
                <Button
                  variant="outline"
                  className="bg-transparent mt-4 border-brand-yellow text-brand-yellow hover:bg-brand-yellow"
                >
                  Back to First Page
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-gray relative overflow-hidden">
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-NXHH094YJK" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);} 
          gtag('js', new Date());
          gtag('config', 'G-NXHH094YJK');
        `}
      </Script>
      {/* Background decorations */}
      <img src="/Union.svg" alt="background" className="pointer-events-none select-none absolute inset-0 w-full h-full object-cover opacity-20" />
      <img src="/yellow-shape.svg" alt="accent" className="pointer-events-none select-none absolute -top-24 -left-24 w-[600px] opacity-70" />
      <img src="/yellow-shape.svg" alt="accent" className="pointer-events-none select-none absolute -bottom-40 -right-20 w-[520px] rotate-12 opacity-70" />

      <div className="container mx-auto px-4 py-8 pt-8 relative">
        <h1 className="text-center font-rethink-sans text-black text-5xl md:text-6xl font-extrabold tracking-tight mb-10">BLOG</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {posts.map((post: BlogPost) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>

        {/* Pagination */}
        <nav className="mt-12 flex justify-center items-center gap-4" aria-label="Blog pagination">
          {currentPage > 1 && (
            <Link href={`/blog?page=${currentPage - 1}`} className="inline-block">
              <Button
                className="bg-brand-yellow text-black border-brand-yellow hover:brightness-95"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            </Link>
          )}

          <div className="flex items-center gap-2">
            <span className="text-black px-4 text-lg">
              Page {currentPage}
            </span>
          </div>

          {pageInfo?.hasNextPage && (
            <Link href={`/blog?page=${currentPage + 1}&cursor=${pageInfo.endCursor}`} className="inline-block">
              <Button
                className="bg-brand-yellow text-black border-brand-yellow hover:brightness-95"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </div>
  )
}
