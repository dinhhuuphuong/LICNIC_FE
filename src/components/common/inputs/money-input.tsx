import { InputNumber, InputNumberProps } from 'antd';

const MoneyInput = (props: InputNumberProps) => {
  return (
    <InputNumber
      className="w-full"
      disabled={props.disabled}
      style={{ width: '100%' }}
      // Hiển thị: 1000000 -> "1.000.000"
      formatter={(value) => {
        if (value === null || value === undefined || value === '') return '';
        // cho phép đang gõ dở
        const str = String(value).replace(/\D/g, '');
        if (!str) return '';
        return str.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      }}
      // Giá trị thật lưu trong form: "1.000.000" -> 1000000
      parser={(value) => {
        if (!value) return 0;
        // bỏ dấu chấm và ký tự không phải số
        const num = value.replace(/\./g, '').replace(/\D/g, '');
        return Number(num || 0);
      }}
      {...props}
    />
  );
};

export default MoneyInput;
