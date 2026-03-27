# InfiniteSelect Component

Component InfiniteSelect là một wrapper của Ant Design Select với khả năng tải dữ liệu vô hạn (infinite loading), hỗ trợ tìm kiếm và debounce, được xây dựng trên React Query.

## Props

### InfiniteSelectProps<T>

| Prop                 | Type                                               | Mô tả                                                                           | Mặc định                           | Bắt buộc |
| -------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------- | -------- |
| `queryKey`           | `string`                                           | Key duy nhất cho React Query cache. Nên đặt tên mô tả (vd: "users", "products") | -                                  | ✅       |
| `queryFn`            | `(params?, config?) => Promise<BaseResponse<T[]>>` | Hàm async để fetch dữ liệu từ API                                               | -                                  | ✅       |
| `editId`             | `string`                                           | ID của item cần load trong chế độ edit/update                                   | -                                  | ❌       |
| `defaultItems`       | `DefaultOptionType[]`                              | Các option mặc định hiển thị khi chưa search                                    | `[]`                               | ❌       |
| `getLabel`           | `(item: T) => string`                              | Hàm trích xuất text hiển thị từ item                                            | `(item) => item.label`             | ❌       |
| `getValue`           | `(item: T) => string`                              | Hàm trích xuất giá trị value từ item                                            | `(item) => item.value`             | ❌       |
| `getResponse`        | `(response) => T[]`                                | Hàm parse mảng data từ API response                                             | `response => response`             | ❌       |
| `getTotalRecord`     | `(response) => number`                             | Hàm lấy tổng số record từ API response                                          | `response => response.TotalRecord` | ❌       |
| `getEditQueryParams` | `(editId: string) => BaseSchema`                   | Tạo params để query item theo editId                                            | Tìm theo keyword                   | ❌       |
| `getEditResponse`    | `(response) => T[]`                                | Parse response cho edit query                                                   | `response => response`             | ❌       |

**Lưu ý**: Tất cả props khác của Ant Design Select đều được hỗ trợ (như `placeholder`, `style`, `disabled`, v.v.)

## Sử dụng cơ bản

```tsx
import InfiniteSelect from './InfiniteSelect';

interface User {
  id: string;
  name: string;
  email: string;
}

const UserSelect = () => {
  const fetchUsers = async (params?: BaseSchema) => {
    const response = await axios.get('/api/users', { params });
    return response.data;
  };

  return (
    <InfiniteSelect<User>
      queryKey="users"
      queryFn={fetchUsers}
      getLabel={(user) => user.name}
      getValue={(user) => user.id}
      placeholder="Chọn người dùng..."
      style={{ width: 300 }}
    />
  );
};
```

## Ví dụ nâng cao

### 1. Với custom response structure

```tsx
interface ApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
}

<InfiniteSelect<Product>
  queryKey="products"
  queryFn={fetchProducts}
  getResponse={(response: ApiResponse<Product>) => response.data}
  getTotalRecord={(response: ApiResponse<Product>) => response.pagination.total}
  getLabel={(product) => `${product.name} - ${product.code}`}
  getValue={(product) => product.id}
  placeholder="Chọn sản phẩm..."
/>;
```

### 2. Với edit mode (để hiển thị item đã chọn trước đó)

```tsx
<InfiniteSelect<Category>
  queryKey="categories"
  queryFn={fetchCategories}
  editId={selectedCategoryId} // ID của item đã chọn
  getEditQueryParams={(editId) => ({
    ids: [editId], // Custom query để lấy item theo ID
    pageSize: 1,
  })}
  getLabel={(category) => category.name}
  getValue={(category) => category.id}
/>
```

### 3. Với default options

```tsx
const defaultOptions = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Không có', value: 'none' },
];

<InfiniteSelect<Status>
  queryKey="statuses"
  queryFn={fetchStatuses}
  defaultItems={defaultOptions}
  getLabel={(status) => status.name}
  getValue={(status) => status.code}
/>;
```

### 4. Sử dụng trong form

```tsx
import { Form } from 'antd';

<Form.Item name="userId" label="Người dùng" rules={[{ required: true }]}>
  <InfiniteSelect<User>
    queryKey="users"
    queryFn={fetchUsers}
    getLabel={(user) => `${user.name} (${user.email})`}
    getValue={(user) => user.id}
    placeholder="Chọn người dùng..."
  />
</Form.Item>;
```

### Chi tiết các props quan trọng:

#### `queryFn`

```tsx
// Ví dụ queryFn cơ bản
const queryFn = async (params?: BaseSchema, config?: AxiosRequestConfig) => {
  const response = await api.get('/users', {
    params: {
      search: params?.keyword,
      page: params?.pageIndex,
      limit: params?.pageSize,
    },
    ...config,
  });
  return response.data;
};
```

#### `getResponse` và `getTotalRecord`

```tsx
// Nếu API response có dạng:
{
  "success": true,
  "result": {
    "items": [...],
    "totalCount": 100
  }
}

// Thì config như sau:
getResponse={(res) => res.result.items}
getTotalRecord={(res) => res.result.totalCount}
```

#### `getEditQueryParams`

```tsx
// Mặc định sẽ search theo keyword
getEditQueryParams: (editId) => ({
  keyword: editId,
  pageIndex: 1,
  pageSize: 1,
});

// Custom để query theo ID
getEditQueryParams: (editId) => ({
  id: editId,
  pageSize: 1,
});
```

## API Response Format

Component mong đợi API nhận các query params sau:

```typescript
interface BaseSchema {
  keyword?: string; // Từ khóa tìm kiếm
  pageIndex?: number; // Số trang (bắt đầu từ 1)
  pageSize?: number; // Số item per page (mặc định 20)
}
```

Response mặc định:

```typescript
interface BaseResponse<T> {
  data?: T[]; // Mảng dữ liệu
  TotalRecord?: number; // Tổng số record
}
```

## Tính năng

- ✅ **Infinite Loading**: Tự động tải thêm dữ liệu khi scroll xuống cuối danh sách
- ✅ **Search với Debounce**: Tìm kiếm với độ trễ 300ms để tối ưu performance
- ✅ **Edit Mode**: Hỗ trợ load dữ liệu cho chế độ chỉnh sửa
- ✅ **Customizable**: Có thể tùy chỉnh cách lấy label, value và response
- ✅ **Loading States**: Hiển thị loading indicator khi đang tải dữ liệu
- ✅ **TypeScript Support**: Hỗ trợ đầy đủ TypeScript với generics

## Dependencies

```json
{
  "@tanstack/react-query": "^4.x.x",
  "antd": "^5.x.x",
  "axios": "^1.x.x",
  "lodash": "^4.x.x",
  "react": "^18.x.x",
  "zod": "^3.x.x"
}
```

## Cài đặt

```bash
npm install @tanstack/react-query antd axios lodash react zod
```

## Performance Tips

1. **QueryKey**: Sử dụng queryKey duy nhất cho mỗi Select để tránh cache conflict
2. **Debounce**: Search đã được debounce 300ms, không cần thêm debounce bên ngoài
3. **Page Size**: Mặc định pageSize là 20, có thể tăng lên nếu cần
4. **Memory**: Component tự động cache và dedupe các request giống nhau

## Troubleshooting

### Loading không kết thúc

- Kiểm tra `getTotalRecord` có trả về đúng tổng số record không
- Đảm bảo API pagination hoạt động đúng

### Không thể scroll để load thêm

- Kiểm tra CSS của container có set height và overflow không
- Đảm bảo `hasNextPage` logic hoạt động đúng

### Search không hoạt động

- Kiểm tra API có nhận parameter `keyword` không
- Verify `queryFn` xử lý search params đúng cách

### Edit mode không hiển thị item đã chọn

- Đảm bảo `editId` được truyền đúng
- Kiểm tra `getEditQueryParams` và `getEditResponse`

## License

MIT
