import { cn } from '@/utils/cn';
import type { InputNumberProps } from 'antd';
import { InputNumber } from 'antd';

/**
 * NumberFormatInput Component
 *
 * Component này là wrapper cho Ant Design InputNumber với tính năng format số tự động.
 * Tự động thêm dấu phẩy ngăn cách hàng nghìn khi hiển thị và xử lý input.
 *
 * Tính năng chính:
 * - Tự động format số với dấu phẩy ngăn cách hàng nghìn
 * - Parser tự động loại bỏ dấu phẩy khi nhập liệu
 * - Kế thừa tất cả props từ Ant Design InputNumber
 * - Responsive width (w-full) mặc định
 *
 * @param props - Tất cả props của Ant Design InputNumber
 * @returns InputNumber component với format số tự động
 */
const NumberFormatInput = (props: InputNumberProps<number>) => {
  return (
    <InputNumber<number>
      {...props}
      className={cn('w-full', props.className)}
      // Formatter: Thêm dấu phẩy ngăn cách hàng nghìn khi hiển thị
      // Sử dụng regex để tìm vị trí cần thêm dấu phẩy
      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      // Parser: Loại bỏ dấu phẩy và các ký tự không cần thiết khi parse input
      // Chuyển đổi về kiểu number để Ant Design có thể xử lý
      parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
    />
  );
};

export default NumberFormatInput;
