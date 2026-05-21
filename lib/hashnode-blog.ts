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

async function fetchHashnode<T>(query: string, variables: Record<string, unknown>): Promise<T | null> {
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
