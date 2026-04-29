import { PageCard } from '@/components/common/PageCard';
import SelectParam from '@/components/common/selects/select-param';
import { StatePanel } from '@/components/common/StatePanel';
import { PostBlogEditorModal, type BlogPostEditorValues } from '@/components/post-blogs/PostBlogEditorModal';
import { PostBlogsTable } from '@/components/post-blogs/PostBlogsTable';
import ROLE from '@/constants/role';
import { ROUTES } from '@/constants/routes';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { createBlogPost, deleteBlogPost, getMyBlogPosts, updateBlogPost } from '@/services/blogPostService';
import { useAuthStore } from '@/stores/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, InputNumber, Pagination, message } from 'antd';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';

function normalizeRoleName(roleName?: string | null) {
  return roleName?.trim().toLowerCase() ?? '';
}

const BLOG_POST_ALLOWED_ROLES = [ROLE.DOCTOR, ROLE.PATIENT, ROLE.RECEPTIONIST].map((role) => role.toLowerCase());

export function QuanLyBaiVietBlogLeTanPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [query, setQuery] = useQueryParams({
    status: StringParam,
    categoryId: NumberParam,
    page: NumberParam,
    limit: NumberParam,
  });

  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 ? query.limit : 10;
  const status =
    query.status && ['draft', 'published'].includes(query.status) ? (query.status as 'draft' | 'published') : undefined;
  const categoryId = query.categoryId && query.categoryId > 0 ? query.categoryId : undefined;
  const normalizedRoleName = normalizeRoleName(user?.role?.roleName);
  const canAccessBlogPostManage = BLOG_POST_ALLOWED_ROLES.includes(normalizedRoleName);
  const queryClient = useQueryClient();
  const [editorMode, setEditorMode] = useState<'create' | 'edit' | null>(null);
  const [editingPostId, setEditingPostId] = useState<number | undefined>(undefined);

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Quản lý bài viết blog' : 'NHA KHOA TAN TAM | Blog post management');

  const postsQuery = useQuery({
    queryKey: ['receptionistBlogPosts', status ?? 'all', categoryId ?? 'all', page, limit],
    queryFn: () =>
      getMyBlogPosts({
        page,
        limit,
        ...(status ? { status } : {}),
        ...(categoryId ? { categoryId } : {}),
      }),
    enabled: !!user && canAccessBlogPostManage,
  });

  const createPostMutation = useMutation({
    mutationFn: (values: BlogPostEditorValues & { thumbnailFile?: File }) =>
      createBlogPost({
        title: values.title.trim(),
        content: values.content.trim(),
        authorId: values.authorId,
        slug: values.slug?.trim() || undefined,
        thumbnail: values.thumbnail?.trim() ? values.thumbnail.trim() : (values.thumbnail ?? undefined),
        categoryId: values.categoryId ?? null,
        status: values.status,
        thumbnailFile: values.thumbnailFile,
      }),
    onSuccess: (res) => {
      message.success(res.message || (isVi ? 'Thêm bài viết thành công.' : 'Post created successfully.'));
      closeEditorModal();
      void queryClient.invalidateQueries({ queryKey: ['receptionistBlogPosts'] });
    },
    onError: (error) => {
      const text = error instanceof Error ? error.message : isVi ? 'Thêm bài viết thất bại.' : 'Create failed.';
      message.error(text);
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ postId, values }: { postId: number; values: BlogPostEditorValues & { thumbnailFile?: File } }) => {
      const payload = {
        title: values.title.trim(),
        content: values.content.trim(),
        authorId: values.authorId,
        slug: values.slug?.trim() || undefined,
        thumbnail: values.thumbnail?.trim() ? values.thumbnail.trim() : (values.thumbnail ?? undefined),
        categoryId: values.categoryId ?? null,
        status: values.status,
        views: values.views == null ? undefined : Number(values.views),
        thumbnailFile: values.thumbnailFile,
      };
      return updateBlogPost(postId, payload);
    },
    onSuccess: (res) => {
      message.success(res.message || (isVi ? 'Cập nhật bài viết thành công.' : 'Post updated successfully.'));
      closeEditorModal();
      void queryClient.invalidateQueries({ queryKey: ['receptionistBlogPosts'] });
    },
    onError: (error) => {
      const text = error instanceof Error ? error.message : isVi ? 'Cập nhật thất bại.' : 'Update failed.';
      message.error(text);
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: number) => deleteBlogPost(postId),
    onSuccess: (res) => {
      message.success(res.message || (isVi ? 'Xóa bài viết thành công.' : 'Post deleted successfully.'));
      void queryClient.invalidateQueries({ queryKey: ['receptionistBlogPosts'] });
    },
    onError: (error) => {
      const text = error instanceof Error ? error.message : isVi ? 'Xóa bài viết thất bại.' : 'Delete failed.';
      message.error(text);
    },
  });

  function openCreateModal() {
    setEditorMode('create');
    setEditingPostId(undefined);
  }

  function openEditModal(postId: number) {
    setEditorMode('edit');
    setEditingPostId(postId);
  }

  function closeEditorModal() {
    setEditorMode(null);
    setEditingPostId(undefined);
  }

  async function handleSubmitEditor(values: BlogPostEditorValues, thumbnailFile?: File) {
    console.log('🚀 ~ handleSubmitEditor ~ values:', values);
    if (editorMode === 'create') {
      await createPostMutation.mutateAsync({ ...values, thumbnailFile });
      return;
    }
    if (editorMode === 'edit' && editingPostId) {
      await updatePostMutation.mutateAsync({ postId: editingPostId, values: { ...values, thumbnailFile } });
    }
  }

  if (!user) {
    return (
      <StatePanel
        centered
        tone="warning"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Cần đăng nhập' : 'Sign in required'}
        description={isVi ? 'Vui lòng đăng nhập để quản lý bài viết blog.' : 'Please sign in to manage blog posts.'}
        action={
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-bold text-white"
            onClick={() => navigate(ROUTES.login)}
          >
            {isVi ? 'Đăng nhập' : 'Login'}
          </button>
        }
      />
    );
  }

  if (!canAccessBlogPostManage) {
    return (
      <StatePanel
        centered
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Không có quyền truy cập' : 'Access denied'}
        description={
          isVi
            ? 'Trang này chỉ dành cho tài khoản bác sĩ, bệnh nhân hoặc lễ tân.'
            : 'This page is only available for doctor, patient, or receptionist accounts.'
        }
        action={
          <button
            type="button"
            className="text-sm font-semibold text-blue-600 underline"
            onClick={() => navigate(ROUTES.home)}
          >
            {isVi ? 'Về trang chủ' : 'Back to home'}
          </button>
        }
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1360px] space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <header>
          <h1 className="text-3xl font-black text-slate-900 mb-0!">{isVi ? 'Quản lý bài viết' : 'Post management'}</h1>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          <SelectParam
            allowClear
            className="w-[170px]"
            placeholder={isVi ? 'Trạng thái' : 'Status'}
            param="status"
            clearParams={['page']}
            options={[
              { value: 'draft', label: isVi ? 'Nháp' : 'Draft' },
              { value: 'published', label: isVi ? 'Đã đăng' : 'Published' },
            ]}
          />

          <InputNumber
            min={1}
            value={categoryId}
            placeholder={isVi ? 'Mã danh mục' : 'Category ID'}
            onChange={(value) => {
              void setQuery({
                status,
                categoryId: typeof value === 'number' ? value : undefined,
                page: 1,
                limit,
              });
            }}
          />

          {(status || categoryId) && (
            <Link
              className="inline-flex h-8 items-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              to={ROUTES.blogPostsManage}
            >
              {isVi ? 'Xóa lọc' : 'Clear filters'}
            </Link>
          )}

          <Button icon={<PlusIcon size={16} />} type="primary" onClick={openCreateModal}>
            {isVi ? 'Thêm' : 'Create'}
          </Button>
        </div>
      </div>

      {postsQuery.isError ? (
        <Alert
          type="error"
          showIcon
          message={
            postsQuery.error instanceof Error
              ? postsQuery.error.message
              : isVi
                ? 'Tải danh sách thất bại.'
                : 'Load failed.'
          }
        />
      ) : null}

      <PageCard>
        <PostBlogsTable
          isVi={isVi}
          loading={postsQuery.isLoading}
          data={postsQuery.data?.data.items ?? []}
          onEdit={openEditModal}
          onDelete={(postId) => deletePostMutation.mutateAsync(postId)}
          deletingPostId={deletePostMutation.isPending ? deletePostMutation.variables : undefined}
        />
        <div className="mt-4 flex justify-end">
          <Pagination
            current={postsQuery.data?.data.page ?? page}
            pageSize={postsQuery.data?.data.limit ?? limit}
            total={postsQuery.data?.data.total ?? 0}
            onChange={(nextPage, nextLimit) => {
              void setQuery({
                status,
                categoryId,
                page: nextPage,
                limit: nextLimit,
              });
            }}
            showSizeChanger
            pageSizeOptions={['10', '20', '50']}
            showTotal={(totalValue, [from, to]) =>
              isVi ? `${from}-${to} / ${totalValue} bài viết` : `${from}-${to} of ${totalValue} blog posts`
            }
          />
        </div>
      </PageCard>

      {editorMode ? (
        <PostBlogEditorModal
          open
          mode={editorMode}
          postId={editingPostId}
          isVi={isVi}
          submitting={createPostMutation.isPending || updatePostMutation.isPending}
          onCancel={closeEditorModal}
          onSubmit={handleSubmitEditor}
        />
      ) : null}
    </div>
  );
}
