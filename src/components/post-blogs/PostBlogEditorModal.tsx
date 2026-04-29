import { getBlogPostDetail, type BlogPostStatus } from '@/services/blogPostService';
import { getServiceCategories } from '@/services/serviceCategoryService';
import { Editor } from '@tinymce/tinymce-react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Form, Input, Modal, Select, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { useEffect, useMemo, useState } from 'react';

export type BlogPostEditorValues = {
  title: string;
  content: string;
  authorId?: number;
  slug?: string;
  thumbnail?: string | null;
  categoryId?: number | null;
  status: BlogPostStatus;
  views?: number;
};

type PostBlogEditorModalProps = {
  open: boolean;
  postId?: number;
  mode: 'create' | 'edit';
  isVi: boolean;
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: BlogPostEditorValues, thumbnailFile?: File) => Promise<void>;
};

export function PostBlogEditorModal({
  open,
  postId,
  mode,
  isVi,
  submitting,
  onCancel,
  onSubmit,
}: PostBlogEditorModalProps) {
  const [form] = Form.useForm<BlogPostEditorValues>();
  const [thumbnailFileList, setThumbnailFileList] = useState<UploadFile[]>([]);
  const thumbnailUrl = Form.useWatch('thumbnail', form);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);

  const isEditMode = mode === 'edit';
  const detailQuery = useQuery({
    queryKey: ['receptionistBlogPostDetail', postId],
    queryFn: () => getBlogPostDetail(postId as number),
    enabled: open && isEditMode && !!postId,
  });

  const categoryOptionsQuery = useQuery({
    queryKey: ['blogPostCategoriesForReceptionist'],
    queryFn: () => getServiceCategories({ page: 1, limit: 100, keyword: '' }),
    enabled: open,
  });

  const editingPostData = detailQuery.data?.data;

  useEffect(() => {
    if (!open) return;
    setThumbnailFileList([]);

    if (isEditMode && editingPostData) {
      form.setFieldsValue({
        title: editingPostData.title,
        content: editingPostData.content,
        authorId: editingPostData.authorId,
        slug: editingPostData.slug,
        thumbnail: editingPostData.thumbnail ?? undefined,
        categoryId: editingPostData.categoryId ?? undefined,
        status: editingPostData.status,
        views: editingPostData.views,
      });
      return;
    }

    form.setFieldsValue({
      title: '',
      content: '',
      authorId: undefined,
      slug: undefined,
      thumbnail: undefined,
      categoryId: undefined,
      status: 'draft',
      views: 0,
    });
  }, [editingPostData, form, isEditMode, open]);

  const modalTitle = useMemo(
    () => (isEditMode ? (isVi ? 'Chỉnh sửa bài viết' : 'Edit post') : isVi ? 'Thêm bài viết' : 'Create post'),
    [isEditMode, isVi],
  );
  useEffect(() => {
    const uploadFile = thumbnailFileList[0];
    if (!uploadFile?.originFileObj) {
      setPreviewFileUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(uploadFile.originFileObj);
    setPreviewFileUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [thumbnailFileList]);

  const previewImageSrc = useMemo(() => {
    const uploadFile = thumbnailFileList[0];
    if (uploadFile?.thumbUrl) {
      return uploadFile.thumbUrl;
    }
    if (previewFileUrl) {
      return previewFileUrl;
    }
    if (typeof thumbnailUrl === 'string' && thumbnailUrl.trim()) {
      return thumbnailUrl.trim();
    }
    return null;
  }, [previewFileUrl, thumbnailFileList, thumbnailUrl]);

  async function handleFinish(values: BlogPostEditorValues) {
    await onSubmit(values, thumbnailFileList[0]?.originFileObj);
    form.resetFields();
    setThumbnailFileList([]);
  }

  return (
    <Modal
      open={open}
      title={modalTitle}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      okText={isVi ? 'Lưu' : 'Save'}
      cancelText={isVi ? 'Hủy' : 'Cancel'}
      width={860}
      destroyOnHidden
    >
      {detailQuery.isError ? (
        <Alert
          type="error"
          showIcon
          className="mb-4"
          message={
            detailQuery.error instanceof Error
              ? detailQuery.error.message
              : isVi
                ? 'Không tải được chi tiết bài viết.'
                : 'Cannot load post detail.'
          }
        />
      ) : null}

      <Form<BlogPostEditorValues>
        form={form}
        layout="vertical"
        disabled={isEditMode ? detailQuery.isLoading : false}
        initialValues={{ status: 'draft' }}
        onFinish={handleFinish}
      >
        <Form.Item
          name="title"
          label={isVi ? 'Tiêu đề' : 'Title'}
          rules={[{ required: true, message: isVi ? 'Vui lòng nhập tiêu đề' : 'Please enter title' }]}
        >
          <Input maxLength={200} placeholder={isVi ? 'Nhập tiêu đề bài viết' : 'Enter post title'} />
        </Form.Item>

        <Form.Item
          name="content"
          label={isVi ? 'Nội dung' : 'Content'}
          rules={[{ required: true, message: isVi ? 'Vui lòng nhập nội dung' : 'Please enter content' }]}
          trigger="onEditorChange"
          getValueFromEvent={(value: string) => value}
        >
          <Editor
            apiKey={import.meta.env.VITE_TINYMCE_KEY}
            init={{
              height: 320,
              menubar: false,
              plugins: [
                'advlist',
                'autolink',
                'lists',
                'link',
                'charmap',
                'preview',
                'searchreplace',
                'visualblocks',
                'code',
                'fullscreen',
                'insertdatetime',
                'table',
                'help',
                'wordcount',
              ],
              toolbar:
                'undo redo | blocks | bold italic underline forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | link | code fullscreen',
              placeholder: isVi ? 'Nội dung bài viết...' : 'Post content...',
            }}
          />
        </Form.Item>

        <Form.Item name="thumbnail" label="Thumbnail URL">
          <Input placeholder="https://res.cloudinary.com/.../image.png" />
        </Form.Item>

        <Form.Item label={isVi ? 'Hoặc tải ảnh thumbnail' : 'Or upload thumbnail image'}>
          <Upload
            accept="image/*"
            beforeUpload={() => false}
            maxCount={1}
            fileList={thumbnailFileList}
            onChange={(info) => setThumbnailFileList(info.fileList)}
          >
            <Button>{isVi ? 'Chọn ảnh' : 'Choose image'}</Button>
          </Upload>
        </Form.Item>
        {previewImageSrc ? (
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-slate-700">
              {isVi ? 'Xem trước ảnh thumbnail' : 'Thumbnail preview'}
            </p>
            <img
              src={previewImageSrc}
              alt={isVi ? 'Ảnh thumbnail xem trước' : 'Thumbnail preview'}
              className="h-40 w-auto max-w-full rounded-lg border border-slate-200 object-cover"
            />
          </div>
        ) : null}

        <Form.Item name="categoryId" label={isVi ? 'Danh mục' : 'Category'}>
          <Select
            allowClear
            loading={categoryOptionsQuery.isLoading}
            placeholder={isVi ? 'Chọn danh mục' : 'Select category'}
            options={(categoryOptionsQuery.data?.data.items ?? []).map((item) => ({
              value: item.categoryId,
              label: item.categoryName,
            }))}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
