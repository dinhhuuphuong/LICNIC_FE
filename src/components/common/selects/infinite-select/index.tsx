import useDebounce from '@/hooks/useDebounce';
import { PaginationResponse } from '@/services/http';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { SelectProps } from 'antd';
import { Divider, Select, Spin, Typography } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import { get, uniqBy } from 'lodash';
import { useCallback, useMemo, useRef, useState } from 'react';

/**
 * Schema cơ bản cho các tham số query
 */
type BaseSchema = {
  /** Mã định danh (ví dụ persCode), dùng cho lookup chính xác khi edit */
  code?: string;

  /** Từ khóa tìm kiếm, dùng để filter dữ liệu theo text */
  keyword?: string;

  /** Số trang hiện tại, bắt đầu từ 1 */
  pageIndex?: number;

  /** Số lượng item trên mỗi trang */
  pageSize?: number;
};

/**
 * Props interface cho component InfiniteSelect
 * @template T - Kiểu dữ liệu của item trong select
 */
interface InfiniteSelectProps<T> extends SelectProps {
  isNumber?: boolean;

  /** Khi false sẽ tắt query (useQuery/useInfiniteQuery) */
  enabled?: boolean;
  /** ID để query dữ liệu khi edit. Khi có editId, component sẽ tự động query để lấy thông tin item cần edit */
  editId?: string;

  /** Key duy nhất cho React Query, dùng để cache và quản lý state của query
   * Accepts any serializable value (string, array, object) so callers can
   * include extra params (like departmentCode) to force refetch when they change.
   */
  queryKey: unknown;

  /** Danh sách các item mặc định hiển thị khi không có search. Chỉ hiển thị khi không có từ khóa tìm kiếm */
  defaultItems?: DefaultOptionType[];

  /**
   * Hàm để lấy label hiển thị từ item data
   * @param item - Item data gốc
   * @returns String label để hiển thị
   * @default (item: T) => get(item, 'label') ?? ''
   */
  getLabel?: (item: T) => string;

  /**
   * Hàm để lấy value từ item data
   * @param item - Item data gốc
   * @returns String value của item
   * @default (item: T) => get(item, 'value') ?? ''
   */
  getValue?: (item: T) => string | number;

  /**
   * Hàm parse response từ API thành array data
   * @param response - Response gốc từ API
   * @returns Array các item data
   * @default (response: unknown) => response as T[]
   */
  getResponse?: (response: unknown) => T[];

  /**
   * Hàm lấy tổng số record từ response API
   * @param response - Response gốc từ API
   * @returns Số lượng record tổng cộng
   * @default (response: unknown) => get(response, 'TotalRecord', 0)
   */
  getTotalRecord?: (response: unknown) => number;

  /**
   * Hàm tạo params cho edit query khi có editId
   * @param editId - ID cần edit
   * @returns Object params để query API
   * @default (editId: string) => ({ keyword: editId, pageIndex: 1, pageSize: 1 })
   */
  getEditQueryParams?: (editId: string) => BaseSchema;

  /**
   * Hàm riêng để gọi API khi lấy dữ liệu edit
   * Nếu được cung cấp, sẽ sử dụng hàm này thay vì queryFn + getEditQueryParams
   * @param editId - ID cần edit
   * @returns Promise chứa response data
   */
  editQueryFn?: (editId: string) => Promise<unknown>;

  /**
   * Hàm parse response từ edit query thành array data
   * @param response - Response gốc từ edit API
   * @returns Array các item data từ edit query
   * @default (response: unknown) => response as T[]
   */
  getEditResponse?: (response: unknown) => T[];

  /**
   * Hàm chính để gọi API, phải trả về Promise với cấu trúc DataRecord<T[]>
   * @param params - Tham số query (keyword, pageIndex, pageSize)
   * @param config - Config cho axios request
   * @returns Promise chứa response data
   */
  queryFn: (params?: BaseSchema) => Promise<PaginationResponse<T>>;

  /**
   * Callback khi chọn item, trả về full item object
   */
  onSelectItem?: (item: T | null) => void;
}

/**
 * Component Select vô hạn với khả năng tải dữ liệu theo trang
 * Hỗ trợ tìm kiếm, edit và infinite scroll
 *
 * @template T - Kiểu dữ liệu của item
 * @param props - Props của component
 * @returns JSX.Element
 */
const InfiniteSelect = <T,>({
  editId,
  queryKey,
  defaultItems = [],
  getLabel = (item: T) => get(item, 'label') ?? '',
  getValue = (item: T) => get(item, 'value') ?? '',
  getResponse = (response: unknown) => response as T[],
  getTotalRecord = (response: unknown) => get(response, 'TotalRecord', 0),
  getEditQueryParams = (editId: string) => ({
    keyword: editId,
    pageIndex: 1,
    pageSize: 1,
  }),
  editQueryFn,
  getEditResponse = (response: unknown) => response as T[],
  queryFn,
  enabled = true,
  onSelectItem,
  ...props
}: InfiniteSelectProps<T>) => {
  // State cho params query và search value
  const [params] = useState<BaseSchema>({});
  const [searchValue, setSearchValue] = useState('');
  // Sử dụng ref để lưu selected option (tránh bị reset khi parent re-render)
  const selectedOptionRef = useRef<DefaultOptionType | undefined>();
  // State để force re-render khi selected option thay đổi
  const [, forceUpdate] = useState({});

  // Debounce search value để tránh gọi API quá nhiều
  const debouncedSearch = useDebounce(searchValue, 300);

  /**
   * Query để lấy dữ liệu khi edit (khi có editId)
   * Chỉ chạy khi có editId và không có search
   */
  const editQuery = useQuery({
    queryKey: [queryKey, editId],
    queryFn: async () => {
      // Sử dụng editQueryFn nếu được cung cấp, nếu không thì dùng queryFn + getEditQueryParams
      const response = editQueryFn ? await editQueryFn(editId!) : await queryFn(getEditQueryParams(editId!));

      const data = getEditResponse(response);
      const totalRecord = getTotalRecord(response) || 0;

      return { data: Array.isArray(data) ? data : [], totalRecord };
    },
    enabled: Boolean(editId) && !debouncedSearch && Boolean(enabled),
  });

  /**
   * Infinite query để lấy dữ liệu theo trang
   * Hỗ trợ infinite scroll và search
   */
  const query = useInfiniteQuery({
    queryKey: [queryKey, params, debouncedSearch],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await queryFn({
        ...params,
        keyword: debouncedSearch,
        pageIndex: pageParam as number,
        pageSize: 20,
      });

      const data = getResponse(response);
      const totalRecord = getTotalRecord(response) || 0;

      return {
        data: Array.isArray(data) ? data : [],
        totalRecord,
      };
    },
    // Logic để xác định có trang tiếp theo hay không
    getNextPageParam: (lastPage, allPages) => {
      const totalRecords = lastPage.totalRecord || 0;
      const currentRecords = allPages.reduce((total, page) => total + (page.data?.length || 0), 0);
      return currentRecords < totalRecords ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: Boolean(enabled),
  });

  // Destructure các giá trị cần thiết từ query
  const { isFetching, hasNextPage, fetchNextPage, isFetchingNextPage } = query;

  /**
   * Flatten tất cả dữ liệu từ các trang thành một array duy nhất
   */
  const flatData = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data || []) || [];
  }, [query.data]);

  /**
   * Tạo options cho Select component
   * Kết hợp selectedOption, defaultItems, editData và flatData
   * Loại bỏ duplicate và filter các item không có value
   */
  const options = useMemo(() => {
    const editData = (Array.isArray(editQuery.data?.data) && editQuery.data?.data) || [];
    const selectedOption = selectedOptionRef.current;

    return uniqBy(
      [
        ...(debouncedSearch ? [] : defaultItems), // Chỉ hiển thị defaultItems khi không search
        ...[...editData, ...flatData].map((item) => ({
          label: getLabel(item),
          value: getValue(item),
        })),
        // Thêm selectedOption vào cuối để nếu item đã có trong list thì giữ nguyên vị trí
        // Nếu chưa có (ví dụ từ search cũ) thì mới thêm vào cuối
        ...(selectedOption ? [selectedOption] : []),
      ],
      'value',
    ).filter((item: DefaultOptionType) => Boolean(item.value));
  }, [
    // forceUpdate dependency để trigger recalculation khi selected option thay đổi
    debouncedSearch,
    defaultItems,
    editQuery.data,
    flatData,
    getLabel,
    getValue,
  ]);

  /**
   * Handler cho việc search
   * Cập nhật searchValue state
   */
  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  /**
   * Handler cho việc scroll trong popup
   * Tự động load trang tiếp theo khi scroll gần cuối
   */
  const handlePopupScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { target } = e;
      const element = target as HTMLDivElement;
      const { scrollTop, scrollHeight, clientHeight } = element;

      // Load trang tiếp theo khi scroll gần cuối (còn 50px)
      if (scrollHeight - scrollTop <= clientHeight + 50 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );
  // Tìm item theo value từ flatData và editData
  const findItemByValue = useCallback(
    (value: string): T | null => {
      const editData = (Array.isArray(editQuery.data?.data) && editQuery.data?.data) || [];
      const allItems = [...editData, ...flatData];
      return allItems.find((item) => getValue(item) === value) || null;
    },
    [editQuery.data, flatData, getValue],
  );

  // Handler cho onSelect
  const handleSelect = useCallback(
    (value: string, option: DefaultOptionType) => {
      const item = findItemByValue(value);
      // Lưu option vào ref để đảm bảo luôn có trong options
      selectedOptionRef.current = option;
      // Force re-render để options được recalculate
      forceUpdate({});
      // Reset search value sau khi chọn
      setSearchValue('');
      if (onSelectItem) {
        onSelectItem(item);
      }
    },
    [findItemByValue, onSelectItem],
  );

  // Handler cho onClear
  const handleClear = useCallback(() => {
    selectedOptionRef.current = undefined;
    forceUpdate({});
    if (onSelectItem) {
      onSelectItem(null);
    }
  }, [onSelectItem]);

  return (
    <Select
      allowClear
      {...props}
      showSearch
      onSearch={handleSearch}
      onPopupScroll={handlePopupScroll}
      filterOption={false}
      options={options}
      optionLabelProp="label"
      loading={isFetching && flatData.length === 0}
      onSelect={handleSelect}
      onClear={handleClear}
      popupRender={(menu) => (
        <PopupRender
          menu={menu}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          flatData={flatData}
        />
      )}
    />
  );
};

export default InfiniteSelect;

/**
 * Props interface cho component PopupRender
 * @template T - Kiểu dữ liệu của item
 */
interface PopupRenderProps<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  menu: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  isFetchingNextPage: boolean; // Đang tải trang tiếp theo
  hasNextPage: boolean; // Có trang tiếp theo hay không
  flatData: T[]; // Dữ liệu đã flatten
}

/**
 * Component render popup của Select
 * Hiển thị menu, loading state và hint cho infinite scroll
 *
 * @template T - Kiểu dữ liệu của item
 * @param props - Props của component
 * @returns JSX.Element
 */
const { Text } = Typography;

const PopupRender = <T,>({ menu, isFetchingNextPage, hasNextPage, flatData }: PopupRenderProps<T>) => (
  <>
    {menu}
    {isFetchingNextPage && (
      <>
        <Divider className="my-2" />
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <Spin size="small" />
          <Text type="secondary" className="text-xs">
            Đang tải thêm...
          </Text>
        </div>
      </>
    )}
    {hasNextPage && !isFetchingNextPage && flatData.length > 0 && (
      <>
        <Divider className="my-2" />
        <Text type="secondary" className="block text-center text-xs">
          Cuộn xuống để tải thêm
        </Text>
      </>
    )}
  </>
);
