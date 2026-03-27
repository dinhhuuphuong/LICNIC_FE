import { Button, Flex, Modal, Select, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Pencil, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { SEARCH_PARAMS } from '@/constants/search-params';
import { type BlogPost, type BlogPostStatus } from '@/services/blogPostService';
import { useDeleteBlogPostMutation } from '../hooks/mutations/useDeleteBlogPostMutation';
import { useSetBlogPostStatusMutation } from '../hooks/mutations/useSetBlogPostStatusMutation';
import { useGetBlogPostsQuery } from '../hooks/queries/useGetBlogPostsQuery';
import ModifyBlogPost from './ModifyBlogPost';

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN');
}

const BlogPostsTable = () => {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get(SEARCH_PARAMS.STATUS);
  const categoryParam = searchParams.get(SEARCH_PARAMS.CATEGORY_ID);
  const authorParam = searchParams.get(SEARCH_PARAMS.AUTHOR_ID);

  const status = statusParam === 'draft' || statusParam === 'published' ? statusParam : undefined;
  const categoryId = categoryParam ? Number(categoryParam) : undefined;
  const authorId = authorParam ? Number(authorParam) : undefined;

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isFetching } = useGetBlogPostsQuery({ page, limit, status, categoryId, authorId });
  const posts: BlogPost[] = data?.data.items ?? [];
  const total = data?.data.total ?? 0;
  const deleteMutation = useDeleteBlogPostMutation();
  const setStatusMutation = useSetBlogPostStatusMutation();

  const handleDelete = useCallback(
    (record: BlogPost) => {
      Modal.confirm({
        title: 'Xác nhận xóa bài viết',
        content: `Bạn có chắc muốn xóa "${record.title ?? `ID ${record.postId}`}"?`,
        okText: 'Xóa',
        cancelText: 'Hủy',
        okButtonProps: { danger: true },
        onOk: async () => {
          try {
            const res = await deleteMutation.mutateAsync(record.postId);
            message.success(res.message || 'Đã xóa bài viết');
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Xóa thất bại';
            message.error(msg);
          }
        },
      });
    },
    [deleteMutation],
  );

  const handleSetStatus = useCallback(
    async (record: BlogPost, nextStatus: BlogPostStatus) => {
      try {
        const res = await setStatusMutation.mutateAsync({ postId: record.postId, status: nextStatus });
        message.success(res.message || 'Đã cập nhật trạng thái');
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Cập nhật trạng thái thất bại';
        message.error(msg);
      }
    },
    [setStatusMutation],
  );

  const columns = useMemo<ColumnsType<BlogPost>>(
    () => [
      {
        title: 'ID',
        dataIndex: 'postId',
        key: 'postId',
      },
      {
        title: 'Tiêu đề',
        dataIndex: 'title',
        key: 'title',
        render: (value: string, record) => (
          <Flex vertical gap={2}>
            <span>{value}</span>
            <span className="text-xs text-gray-500">{record.slug}</span>
          </Flex>
        ),
      },
      {
        title: 'Tác giả',
        key: 'author',
        render: (_, record) => record.author?.name ?? `User ${record.authorId}`,
      },
      {
        title: 'Danh mục',
        key: 'category',
        render: (_, record) => record.category?.categoryName ?? 'Không có',
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (value: BlogPostStatus) =>
          value === 'published' ? <Tag color="green">Published</Tag> : <Tag color="gold">Draft</Tag>,
      },
      {
        title: 'Đổi trạng thái',
        key: 'statusAction',
        render: (_, record) => (
          <Select
            size="small"
            value={record.status}
            loading={setStatusMutation.isPending}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
            ]}
            style={{ minWidth: 120 }}
            onChange={(nextStatus) => handleSetStatus(record, nextStatus)}
          />
        ),
      },
      {
        title: 'Lượt xem',
        dataIndex: 'views',
        key: 'views',
      },
      {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (createdAt: string) => formatDate(createdAt),
      },
      {
        title: '',
        key: 'action',
        fixed: 'right',
        render: (_, record) => (
          <Flex gap={8} justify="center" align="center">
            <ModifyBlogPost
              postId={record.postId}
              trigger={<Button variant="text" color="primary" icon={<Pencil size={16} />} />}
            />
            <Button
              danger
              type="text"
              icon={<Trash2 size={16} />}
              loading={deleteMutation.isPending}
              disabled={deleteMutation.isPending}
              onClick={() => handleDelete(record)}
            />
          </Flex>
        ),
      },
    ],
    [deleteMutation.isPending, handleDelete, handleSetStatus, setStatusMutation.isPending],
  );

  return (
    <Table
      rowKey="postId"
      columns={columns}
      dataSource={posts}
      loading={isFetching}
      scroll={{
        x: 'max-content',
      }}
      pagination={{
        current: page,
        pageSize: limit,
        total,
        showSizeChanger: false,
        onChange: (nextPage) => setPage(nextPage),
      }}
    />
  );
};

export default BlogPostsTable;
