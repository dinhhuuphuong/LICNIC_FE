import { http, type PaginationResponse, type Response } from '@/services/http';

export type BlogPostStatus = 'draft' | 'published';

export type BlogPostAuthor = {
  userId: number;
  name: string;
  email: string;
  roleId: number;
};

export type BlogPostCategory = {
  categoryId: number;
  categoryName: string;
};

export type BlogPost = {
  postId: number;
  title: string;
  content: string;
  authorId: number;
  author?: BlogPostAuthor | null;
  createdAt: string;
  updatedAt: string;
  slug: string;
  thumbnail?: string | null;
  categoryId?: number | null;
  category?: BlogPostCategory | null;
  status: BlogPostStatus;
  views: number;
  deletedAt?: string | null;
};

export type GetBlogPostsManageResponse = PaginationResponse<BlogPost>;

export type GetBlogPostsManageParams = {
  limit?: number;
  page?: number;
  status?: BlogPostStatus;
  categoryId?: number;
  authorId?: number;
};

const BLOG_POSTS_URL = '/blog-posts';

export function getBlogPostsManage(params: GetBlogPostsManageParams = {}) {
  const limit = params.limit ?? 10;
  const page = params.page ?? 1;

  const queryParams = new URLSearchParams({
    limit: String(limit),
    page: String(page),
  });

  if (params.status) {
    queryParams.set('status', params.status);
  }
  if (params.categoryId !== undefined) {
    queryParams.set('categoryId', String(params.categoryId));
  }
  if (params.authorId !== undefined) {
    queryParams.set('authorId', String(params.authorId));
  }

  return http<GetBlogPostsManageResponse>(`${BLOG_POSTS_URL}/manage?${queryParams.toString()}`);
}

export type GetBlogPostDetailResponse = Response<BlogPost>;

export function getBlogPostDetail(postId: number) {
  return http<GetBlogPostDetailResponse>(`${BLOG_POSTS_URL}/${postId}`);
}

export type CreateBlogPostPayload = {
  title: string;
  content: string;
  authorId?: number;
  slug?: string;
  thumbnail?: string | null;
  categoryId?: number | null;
  status?: BlogPostStatus;
  thumbnailFile?: File;
};

export type CreateBlogPostResponse = Response<BlogPost>;

function buildBlogPostFormData(payload: CreateBlogPostPayload | UpdateBlogPostPayload) {
  const formData = new FormData();

  if ('title' in payload && payload.title !== undefined) formData.append('title', payload.title);
  if ('content' in payload && payload.content !== undefined) formData.append('content', payload.content);
  if ('authorId' in payload && payload.authorId !== undefined) formData.append('authorId', String(payload.authorId));
  if ('slug' in payload && payload.slug !== undefined) formData.append('slug', payload.slug);

  if ('thumbnail' in payload && payload.thumbnail !== undefined) {
    formData.append('thumbnail', payload.thumbnail ?? '');
  }

  if ('categoryId' in payload && payload.categoryId !== undefined) {
    formData.append('categoryId', payload.categoryId == null ? '' : String(payload.categoryId));
  }

  if ('status' in payload && payload.status !== undefined) {
    formData.append('status', payload.status);
  }

  if ('views' in payload && payload.views !== undefined) {
    formData.append('views', String(payload.views));
  }

  if (payload.thumbnailFile) {
    formData.append('thumbnail', payload.thumbnailFile);
  }

  return formData;
}

export function createBlogPost(payload: CreateBlogPostPayload) {
  const { thumbnailFile, ...rest } = payload;

  if (thumbnailFile) {
    const formData = buildBlogPostFormData({ ...rest, thumbnailFile });
    return http<CreateBlogPostResponse>(BLOG_POSTS_URL, {
      method: 'POST',
      headers: {
        accept: '*/*',
      },
      body: formData,
    });
  }

  return http<CreateBlogPostResponse>(BLOG_POSTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(rest),
  });
}

export type UpdateBlogPostPayload = Partial<Omit<CreateBlogPostPayload, 'thumbnailFile'>> & {
  views?: number;
  thumbnailFile?: File;
};

export type UpdateBlogPostResponse = Response<BlogPost>;

export function updateBlogPost(postId: number, payload: UpdateBlogPostPayload) {
  const { thumbnailFile, ...rest } = payload;

  if (thumbnailFile) {
    const formData = buildBlogPostFormData({ ...rest, thumbnailFile });
    return http<UpdateBlogPostResponse>(`${BLOG_POSTS_URL}/${postId}`, {
      method: 'PUT',
      headers: {
        accept: '*/*',
      },
      body: formData,
    });
  }

  return http<UpdateBlogPostResponse>(`${BLOG_POSTS_URL}/${postId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify(rest),
  });
}

export type SetBlogPostStatusResponse = Response<BlogPost>;

export function setBlogPostStatus(postId: number, status: BlogPostStatus) {
  return http<SetBlogPostStatusResponse>(`${BLOG_POSTS_URL}/${postId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify({ status }),
  });
}

export type DeleteBlogPostResponse = Response<null>;

export function deleteBlogPost(postId: number) {
  return http<DeleteBlogPostResponse>(`${BLOG_POSTS_URL}/${postId}`, {
    method: 'DELETE',
    headers: {
      accept: '*/*',
    },
  });
}
