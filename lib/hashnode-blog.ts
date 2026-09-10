const HASHNODE_ENDPOINT = process.env.HASHNODE_ENDPOINT || 'https://gql-beta.hashnode.com';
const HASHNODE_PUBLICATION_HOST = process.env.HASHNODE_PUBLICATION_HOST || 'idleforest.com/blog';

export type HashnodePost = {
  title: string;
  brief?: string;
  slug?: string;
  content: {
    html: string;
  };
  coverImage: {
    url: string;
  };
  publishedAt: string;
  readTimeInMinutes: number;
  views?: number;
  reactionCount?: number;
  responseCount?: number;
  tags: Array<{ name: string }>;
};

export type HashnodePostSummary = {
  title: string;
  brief: string;
  slug: string;
  url?: string;
  coverImage: {
    url: string;
  };
  publishedAt: string;
  readTimeInMinutes?: number;
  views?: number;
  reactionCount?: number;
  responseCount?: number;
  tags?: Array<{ name: string }>;
};

export type HashnodePageInfo = {
  hasNextPage: boolean;
  endCursor?: string | null;
};

export const HASHNODE_POST_FIELDS = `
  fragment PostFields on Post {
    title
    brief
    slug
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
`;

export function getHashnodeHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const token = process.env.HASHNODE_ACCESS_TOKEN;
  if (token) {
    headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }

  return headers;
}

async function fetchHashnode<T>(query: string, variables: Record<string, unknown>, throwOnError = false): Promise<T | null> {
  try {
    const response = await fetch(HASHNODE_ENDPOINT, {
      method: 'POST',
      headers: getHashnodeHeaders(),
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Hashnode HTTP error: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new TypeError('Hashnode did not return JSON');
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(data.errors[0]?.message || 'Hashnode GraphQL error');
    }

    return data as T;
  } catch (error) {
    console.error('Error fetching Hashnode blog data:', error);
    if (throwOnError) throw error;
    return null;
  }
}

const POST_QUERY = `
  query Post($host: String!, $slug: String!) {
    publication(host: $host) {
      post(slug: $slug) {
        ...PostFields
      }
      redirectedPost(slug: $slug) {
        slug
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

  ${HASHNODE_POST_FIELDS}
`;

type PostResponse = {
  data?: {
    publication?: {
      post?: HashnodePost | null;
      redirectedPost?: { slug: string } | null;
      posts?: {
        edges?: Array<{ node: HashnodePostSummary }>;
      };
    };
  };
};

export async function getHashnodePost(slug: string) {
  const data = await fetchHashnode<PostResponse>(POST_QUERY, {
    host: HASHNODE_PUBLICATION_HOST,
    slug,
  });

  const publication = data?.data?.publication;
  const post = publication?.post || null;

  if (post) {
    return {
      post,
      recommendedPosts: publication?.posts?.edges?.map((edge) => edge.node) || [],
    };
  }

  const redirectedSlug = publication?.redirectedPost?.slug;
  if (redirectedSlug && redirectedSlug !== slug) {
    return getHashnodePost(redirectedSlug);
  }

  return {
    post: null,
    recommendedPosts: publication?.posts?.edges?.map((edge) => edge.node) || [],
  };
}

const POSTS_QUERY = `
  query Publication($host: String!, $first: Int!, $after: String) {
    publication(host: $host) {
      isTeam
      title
      posts(first: $first, after: $after) {
        edges {
          node {
            title
            brief
            url
            slug
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
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

type PostsResponse = {
  data?: {
    publication?: {
      posts?: {
        edges?: Array<{ node: HashnodePostSummary }>;
        pageInfo?: HashnodePageInfo;
      };
    };
  };
};

export async function getHashnodePosts({
  cursor,
  first,
}: {
  cursor?: string | null;
  first: number;
}) {
  const data = await fetchHashnode<PostsResponse>(POSTS_QUERY, {
    host: HASHNODE_PUBLICATION_HOST,
    first,
    after: cursor || null,
  });

  const posts = data?.data?.publication?.posts;

  return {
    posts: posts?.edges?.map((edge) => edge.node) || [],
    pageInfo: posts?.pageInfo || { hasNextPage: false, endCursor: null },
  };
}

type SitemapPost = { slug: string; publishedAt: string };
type SitemapPostsResponse = {
  data?: {
    publication?: {
      posts?: {
        edges: Array<{ node: SitemapPost }>;
        pageInfo: HashnodePageInfo;
      };
    } | null;
  };
};

const SITEMAP_POSTS_QUERY = `
  query SitemapPosts($host: String!, $after: String) {
    publication(host: $host) {
      posts(first: 30, after: $after) {
        edges { node { slug publishedAt } }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

export async function getHashnodeSitemapPosts(): Promise<SitemapPost[]> {
  const posts = new Map<string, SitemapPost>();
  const seenCursors = new Set<string>();
  let cursor: string | null = null;

  while (true) {
    // A failed page must not silently publish an incomplete sitemap.
    const response: SitemapPostsResponse | null = await fetchHashnode<SitemapPostsResponse>(
      SITEMAP_POSTS_QUERY,
      { host: HASHNODE_PUBLICATION_HOST, after: cursor },
      true,
    );
    const page: { edges: Array<{ node: SitemapPost }>; pageInfo: HashnodePageInfo } | undefined = response?.data?.publication?.posts;
    if (!page?.edges || typeof page.pageInfo?.hasNextPage !== 'boolean') {
      throw new Error('Missing Hashnode sitemap pagination data');
    }
    for (const { node } of page.edges) {
      posts.set(node.slug, node);
    }
    if (!page.pageInfo.hasNextPage) return Array.from(posts.values());

    const nextCursor: string | null | undefined = page.pageInfo.endCursor;
    if (!nextCursor || seenCursors.has(nextCursor)) {
      throw new Error('Hashnode sitemap pagination did not advance');
    }
    seenCursors.add(nextCursor);
    cursor = nextCursor;
  }
}
