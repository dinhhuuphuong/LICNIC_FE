import { Button, Form, Input, InputNumber, Modal, Select, Upload, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import type { ReactElement } from 'react';
import { cloneElement, useEffect, useState } from 'react';

import {
  type BlogPost,
  type BlogPostStatus,
  type CreateBlogPostPayload,
  type UpdateBlogPostPayload,
} from '@/services/blogPostService';
import { useGetServiceCategoriesQuery } from '../../service-categories/hooks/queries/useGetServiceCategoriesQuery';
import { useGetUsersQuery } from '../../users/hooks/queries/useGetUsersQuery';
import { useCreateBlogPostMutation } from '../hooks/mutations/useCreateBlogPostMutation';
import { useUpdateBlogPostMutation } from '../hooks/mutations/useUpdateBlogPostMutation';
import { useGetBlogPostDetailQuery } from '../hooks/queries/useGetBlogPostDetailQuery';

type ModifyBlogPostProps = {
  trigger?: ReactElement;
  postId?: number;
  initialValues?: Partial<CreateBlogPostPayload>;
  onSuccess?: (post: BlogPost) => void;
};

type BlogPostFormValues = {
  title: string;
  content: string;
  authorId?: number;
  slug?: string;
  thumbnail?: string | null;
  categoryId?: number | null;
  status: BlogPostStatus;
  views?: number;
};

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

const ModifyBlogPost = ({ trigger, postId, initialValues, onSuccess }: ModifyBlogPostProps) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<BlogPostFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const createMutation = useCreateBlogPostMutation();
  const updateMutation = useUpdateBlogPostMutation();

  const editPostId = (initialValues as BlogPost)?.postId as number | undefined;
  const effectivePostId = postId ?? editPostId;

  const detailQuery = useGetBlogPostDetailQuery(effectivePostId, open);
  const usersQuery = useGetUsersQuery({ page: 1, limit: 100 });
  const categoriesQuery = useGetServiceCategoriesQuery({ page: 1, limit: 100, keyword: '' });

  useEffect(() => {
    if (!open) return;
    const detail = detailQuery.data?.data;
    form.setFieldsValue({
      title: detail?.title ?? initialValues?.title ?? undefined,
      content: detail?.content ?? initialValues?.content ?? undefined,
      authorId: detail?.authorId ?? initialValues?.authorId ?? undefined,
      slug: detail?.slug ?? initialValues?.slug ?? undefined,
      thumbnail: detail?.thumbnail ?? initialValues?.thumbnail ?? undefined,
      categoryId: detail?.categoryId ?? initialValues?.categoryId ?? undefined,
      status: detail?.status ?? initialValues?.status ?? 'draft',
      views: detail?.views ?? undefined,
    });
    setFileList([]);
  }, [detailQuery.data, form, initialValues, open]);

  async function handleFinish(values: BlogPostFormValues) {
    try {
      const thumbnailFile = fileList[0]?.originFileObj;
      const normalizedCommon = {
        title: values.title.trim(),
        content: values.content.trim(),
        authorId: values.authorId,
        slug: values.slug?.trim() || undefined,
        thumbnail: values.thumbnail?.trim() ? values.thumbnail.trim() : (values.thumbnail ?? undefined),
        categoryId: values.categoryId ?? null,
        status: values.status,
        thumbnailFile,
      };

      if (effectivePostId) {
        const payload: UpdateBlogPostPayload = {
          ...normalizedCommon,
          views: values.views == null ? undefined : Number(values.views),
        };
        const res = await updateMutation.mutateAsync({ postId: effectivePostId, payload });
        message.success(res.message || 'Thành công');
        setOpen(false);
        form.resetFields();
        setFileList([]);
        onSuccess?.(res.data);
        return;
      }

      const payload: CreateBlogPostPayload = normalizedCommon;
      const res = await createMutation.mutateAsync(payload);
      message.success(res.message || 'Thành công');
      setOpen(false);
      form.resetFields();
      setFileList([]);
      onSuccess?.(res.data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Thao tác thất bại';
      message.error(msg);
    }
  }

  const triggerNode = trigger ? (
    cloneElement(trigger, {
      onClick: (e: unknown) => {
        trigger.props?.onClick?.(e);
        setOpen(true);
      },
    })
  ) : (
    <Button type="primary" onClick={() => setOpen(true)}>
      Thêm bài viết
    </Button>
  );

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      {triggerNode}
      <Modal
        open={open}
        title={effectivePostId ? 'Chỉnh sửa bài viết' : 'Thêm bài viết'}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={submitting}
        destroyOnHidden
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        width={860}
      >
        <Form<BlogPostFormValues>
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            status: 'draft',
          }}
        >
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
            <Input maxLength={200} placeholder="Chăm sóc răng miệng hàng ngày" />
          </Form.Item>

          <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}>
            <Input.TextArea autoSize={{ minRows: 6, maxRows: 12 }} placeholder="Nội dung bài viết..." />
          </Form.Item>

          <Form.Item name="slug" label="Slug">
            <Input placeholder="cham-soc-rang-mieng-hang-ngay" />
          </Form.Item>

          <Form.Item name="thumbnail" label="Thumbnail URL">
            <Input placeholder="https://res.cloudinary.com/.../image.jpg" />
          </Form.Item>

          <Form.Item label="Upload ảnh thumbnail">
            <Upload
              fileList={fileList}
              beforeUpload={() => false}
              maxCount={1}
              onChange={(info) => setFileList(info.fileList)}
              accept="image/*"
            >
              <Button>Chọn file ảnh</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="authorId" label="Tác giả">
            <Select
              allowClear
              loading={usersQuery.isFetching}
              placeholder="Chọn tác giả"
              options={(usersQuery.data?.data.items ?? []).map((item) => ({
                value: item.userId,
                label: `${item.name ?? `User ${item.userId}`} - ${item.email}`,
              }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item name="categoryId" label="Danh mục">
            <Select
              allowClear
              loading={categoriesQuery.isFetching}
              placeholder="Chọn danh mục"
              options={(categoriesQuery.data?.data.items ?? []).map((item) => ({
                value: item.categoryId,
                label: item.categoryName,
              }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select options={STATUS_OPTIONS} />
          </Form.Item>

          {effectivePostId ? (
            <Form.Item name="views" label="Lượt xem">
              <InputNumber className="w-full" min={0} step={1} placeholder="0" />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
    </>
  );
};

export default ModifyBlogPost;
