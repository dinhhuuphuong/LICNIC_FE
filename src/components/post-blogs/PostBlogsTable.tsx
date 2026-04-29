import { Button, Popconfirm, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo } from 'react';

import type { BlogPost } from '@/services/blogPostService';
import { PencilIcon, Trash2Icon } from 'lucide-react';

type PostBlogsTableProps = {
  isVi: boolean;
  loading?: boolean;
  data: BlogPost[];
  onEdit: (postId: number) => void;
  onDelete: (postId: number) => Promise<unknown> | void;
  deletingPostId?: number;
};

function formatDateTime(value?: string | null, isVi?: boolean) {
  if (!value) return '—';
  return new Date(value).toLocaleString(isVi ? 'vi-VN' : 'en-GB');
}

function getPostStatusDisplay(status?: string, isVi?: boolean) {
  const normalized = status?.trim().toLowerCase();
  if (normalized === 'published') return { label: isVi ? 'Đã đăng' : 'Published', color: 'success' as const };
  if (normalized === 'draft') return { label: isVi ? 'Nháp' : 'Draft', color: 'default' as const };
  return { label: status || '—', color: 'default' as const };
}

export function PostBlogsTable({ isVi, loading, data, onEdit, onDelete, deletingPostId }: PostBlogsTableProps) {
  const columns = useMemo<ColumnsType<BlogPost>>(
    () => [
      {
        title: 'ID',
        dataIndex: 'postId',
        key: 'postId',
        render: (value: number) => <span className="font-semibold text-slate-700">#{value}</span>,
      },
      {
        title: isVi ? 'Tiêu đề' : 'Title',
        dataIndex: 'title',
        key: 'title',
        render: (value: string) => (
          <span className="block max-w-[200px] line-clamp-2 font-medium text-slate-800">{value || '—'}</span>
        ),
      },
      {
        title: isVi ? 'Danh mục' : 'Category',
        key: 'category',
        render: (_, record) => record.category?.categoryName || (record.categoryId ? `#${record.categoryId}` : '—'),
      },
      {
        title: isVi ? 'Trạng thái' : 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (value: string) => {
          const statusValue = getPostStatusDisplay(value, isVi);
          return <Tag color={statusValue.color}>{statusValue.label}</Tag>;
        },
      },
      {
        title: isVi ? 'Lượt xem' : 'Views',
        dataIndex: 'views',
        key: 'views',
        render: (value: number) => value ?? 0,
      },
      {
        title: isVi ? 'Cập nhật lần cuối' : 'Updated at',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (value: string) => formatDateTime(value, isVi),
      },
      {
        title: 'Slug',
        dataIndex: 'slug',
        key: 'slug',
        render: (value: string) => (
          <span className="block max-w-[200px] line-clamp-2 text-slate-500">{value || '—'}</span>
        ),
      },
      {
        key: 'actions',
        fixed: 'right',
        width: 94,
        render: (_, record) => (
          <Space size={2}>
            <Button
              color="primary"
              variant="text"
              icon={<PencilIcon size={16} />}
              size="small"
              onClick={() => onEdit(record.postId)}
              disabled={deletingPostId === record.postId}
            />
            <Popconfirm
              title={isVi ? 'Xóa bài viết này?' : 'Delete this post?'}
              description={isVi ? 'Hành động này không thể hoàn tác.' : 'This action cannot be undone.'}
              okText={isVi ? 'Xóa' : 'Delete'}
              cancelText={isVi ? 'Hủy' : 'Cancel'}
              okButtonProps={{ danger: true, loading: deletingPostId === record.postId }}
              onConfirm={() => onDelete(record.postId)}
            >
              <Button
                danger
                type="text"
                icon={<Trash2Icon size={16} />}
                size="small"
                loading={deletingPostId === record.postId}
              />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deletingPostId, isVi, onDelete, onEdit],
  );

  return (
    <Table<BlogPost>
      rowKey="postId"
      loading={loading}
      columns={columns}
      dataSource={data}
      pagination={false}
      locale={{
        emptyText: isVi ? 'Chưa có bài viết phù hợp.' : 'No blog posts found.',
      }}
      scroll={{ x: 'max-content' }}
    />
  );
}
