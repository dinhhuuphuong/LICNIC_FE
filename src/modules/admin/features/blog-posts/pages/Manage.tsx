import { Flex, Typography } from 'antd';

import BlogPostsTable from '../components/BlogPostsTable';
import ModifyBlogPost from '../components/ModifyBlogPost';
import AuthorParam from '../components/params/author-param';
import CategoryParam from '../components/params/category-param';
import StatusParam from '../components/params/status-param';

const Manage = () => {
  return (
    <Flex vertical gap={4}>
      <Flex justify="space-between" align="center" gap={8}>
        <Typography.Title level={4} className="whitespace-nowrap">
          Quản lý bài viết
        </Typography.Title>

        <Flex gap={8} wrap>
          <AuthorParam />
          <CategoryParam />
          <StatusParam />
          <ModifyBlogPost />
        </Flex>
      </Flex>
      <BlogPostsTable />
    </Flex>
  );
};

export default Manage;
