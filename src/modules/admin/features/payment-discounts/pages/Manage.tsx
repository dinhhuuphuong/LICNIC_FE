import { Flex, Typography } from 'antd';

import ModifyPaymentDiscount from '../components/ModifyPaymentDiscount';
import PaymentDiscountsTable from '../components/PaymentDiscountsTable';
import DiscountTypeParam from '../components/params/discount-type-param';
import StatusParam from '../components/params/status-param';

const Manage = () => {
  return (
    <Flex vertical gap={4}>
      <Flex justify="space-between" align="center" gap={8}>
        <Typography.Title level={4} className="whitespace-nowrap">
          Quản lý ưu đãi thanh toán
        </Typography.Title>

        <Flex gap={8} wrap>
          <DiscountTypeParam />
          <StatusParam />
          <ModifyPaymentDiscount />
        </Flex>
      </Flex>
      <PaymentDiscountsTable />
    </Flex>
  );
};

export default Manage;
