import { StatePanel } from '@/components/common/StatePanel';
import { DoctorScheduleCalendarGrid } from '@/components/doctor-work-schedules/DoctorScheduleCalendarGrid';
import { DoctorScheduleDayDetails } from '@/components/doctor-work-schedules/DoctorScheduleDayDetails';
import { DoctorScheduleDayOverview } from '@/components/doctor-work-schedules/DoctorScheduleDayOverview';
import { DoctorSchedulePageHeader } from '@/components/doctor-work-schedules/DoctorSchedulePageHeader';
import { DoctorScheduleYearView } from '@/components/doctor-work-schedules/DoctorScheduleYearView';
import DATE_FORMAT from '@/constants/date-format';
import ROLE from '@/constants/role';
import { ROUTES } from '@/constants/routes';
import { SEARCH_PARAMS } from '@/constants/search-params';
import { useLanguage } from '@/contexts/NgonNguContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getDoctors } from '@/services/doctorService';
import { type DoctorWorkSchedule, getDoctorWorkSchedulesFromStore } from '@/services/doctorWorkScheduleService';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryParam } from 'use-query-params';

const WEEKDAY_LABELS_VI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const WEEKDAY_LABELS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function normalizeRoleName(roleName?: string | null) {
  return roleName?.trim().toLowerCase() ?? '';
}

type CalendarCell = {
  date: dayjs.Dayjs;
  inCurrentMonth: boolean;
};

type CalendarMode = 'day' | 'week' | 'month' | 'year' | 'custom';

function buildMonthCells(viewMonth: dayjs.Dayjs) {
  const firstDayOfMonth = viewMonth.startOf('month');
  const firstWeekday = (firstDayOfMonth.day() + 6) % 7;
  const firstGridDate = firstDayOfMonth.subtract(firstWeekday, 'day');

  return Array.from({ length: 42 }).map((_, index) => {
    const date = firstGridDate.add(index, 'day');
    const inCurrentMonth = date.month() === viewMonth.month();
    return { date, inCurrentMonth } satisfies CalendarCell;
  });
}

function getCalendarMode(dateMode?: string): CalendarMode {
  if (
    dateMode === 'day' ||
    dateMode === 'week' ||
    dateMode === 'month' ||
    dateMode === 'year' ||
    dateMode === 'custom'
  ) {
    return dateMode;
  }
  return 'month';
}

const LichLamViecBacSiPageV2 = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [viewMonth, setViewMonth] = useState(() => dayjs().startOf('month'));
  const [selectedDate, setSelectedDate] = useState(() => dayjs().format(DATE_FORMAT.DB_DATE));
  const [dateParam] = useQueryParam<string | undefined>(SEARCH_PARAMS.DATE);
  const [fromDateParam] = useQueryParam<string | undefined>(SEARCH_PARAMS.FROM_DATE);
  const [toDateParam] = useQueryParam<string | undefined>(SEARCH_PARAMS.TO_DATE);
  const [dateMode] = useQueryParam<string | undefined>(SEARCH_PARAMS.DATE_MODE);

  useDocumentTitle(isVi ? 'NHA KHOA TẬN TÂM | Lịch làm việc bác sĩ' : 'NHA KHOA TAN TAM | Doctor work schedules');

  const doctorMeQuery = useQuery({
    queryKey: ['doctorProfileByUser', user?.userId],
    queryFn: async () => {
      const res = await getDoctors({ page: 1, limit: 1000 });
      return res.data.items.find((item) => item.userId === user?.userId) ?? null;
    },
    enabled: !!user && normalizeRoleName(user.role?.roleName) === ROLE.DOCTOR.toLowerCase(),
  });

  useEffect(() => {
    if (!fromDateParam) return;
    const fromDateValue = dayjs(fromDateParam, DATE_FORMAT.DB_DATE);
    if (!fromDateValue.isValid()) return;

    setViewMonth(fromDateValue.startOf('month'));
  }, [fromDateParam]);

  const fromDate = fromDateParam ?? viewMonth.startOf('month').format(DATE_FORMAT.DB_DATE);
  const toDate = toDateParam ?? viewMonth.endOf('month').format(DATE_FORMAT.DB_DATE);
  const calendarMode = getCalendarMode(dateMode);
  const rangeStart = dayjs(fromDate, DATE_FORMAT.DB_DATE).startOf('day');
  const rangeEnd = dayjs(toDate, DATE_FORMAT.DB_DATE).endOf('day');

  useEffect(() => {
    if (calendarMode !== 'day') return;
    if (!dateParam) {
      setSelectedDate(fromDate);
      return;
    }
    const pickedDate = dayjs(dateParam);
    if (!pickedDate.isValid()) {
      setSelectedDate(fromDate);
      return;
    }
    setSelectedDate(pickedDate.format(DATE_FORMAT.DB_DATE));
  }, [calendarMode, dateParam, fromDate]);

  useEffect(() => {
    const selected = dayjs(selectedDate, DATE_FORMAT.DB_DATE);
    if (!selected.isValid()) {
      setSelectedDate(fromDate);
      return;
    }
    if (selected.isBefore(rangeStart) || selected.isAfter(rangeEnd)) {
      setSelectedDate(fromDate);
    }
  }, [selectedDate, fromDate, rangeStart, rangeEnd]);

  const schedulesQuery = useQuery({
    queryKey: ['doctorMonthlySchedulesV2', doctorMeQuery.data?.doctorId, fromDate, toDate],
    queryFn: () =>
      getDoctorWorkSchedulesFromStore({
        page: 1,
        limit: 500,
        doctorId: doctorMeQuery.data?.doctorId,
        fromDate,
        toDate,
      }),
    enabled: !!doctorMeQuery.data?.doctorId,
  });

  const schedulesByDate = useMemo(() => {
    const map = new Map<string, DoctorWorkSchedule[]>();
    for (const item of schedulesQuery.data?.data.items ?? []) {
      const key = item.workDate;
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return map;
  }, [schedulesQuery.data]);

  const selectedDateSchedules = schedulesByDate.get(selectedDate) ?? [];
  const monthCells = useMemo(() => buildMonthCells(viewMonth), [viewMonth]);
  const weekdayLabels = isVi ? WEEKDAY_LABELS_VI : WEEKDAY_LABELS_EN;
  const rangeDays = useMemo(() => {
    const days: dayjs.Dayjs[] = [];
    let cursor = rangeStart.startOf('day');
    const end = rangeEnd.startOf('day');
    let guard = 0;
    while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
      days.push(cursor);
      cursor = cursor.add(1, 'day');
      guard += 1;
      if (guard > 370) break;
    }
    return days;
  }, [rangeStart, rangeEnd]);
  const modeTitle =
    calendarMode === 'day'
      ? isVi
        ? 'Lịch làm việc theo ngày'
        : 'Daily schedule'
      : calendarMode === 'week'
        ? isVi
          ? 'Lịch làm việc theo tuần'
          : 'Weekly schedule'
        : calendarMode === 'year'
          ? isVi
            ? 'Lịch làm việc theo năm'
            : 'Yearly schedule'
          : calendarMode === 'custom'
            ? isVi
              ? 'Lịch làm việc theo khoảng ngày'
              : 'Schedule by custom range'
            : isVi
              ? 'Lịch làm việc theo tháng'
              : 'Monthly schedule';
  const modeDescription =
    calendarMode === 'day'
      ? isVi
        ? 'Xem chi tiết ca làm việc trong ngày được chọn.'
        : 'View work shifts for selected day.'
      : calendarMode === 'week'
        ? isVi
          ? 'Chọn ngày trong tuần để xem chi tiết.'
          : 'Select a day in week to see details.'
        : calendarMode === 'year'
          ? isVi
            ? 'Xem tổng quan số ca theo từng tháng trong năm.'
            : 'See shift totals by month.'
          : calendarMode === 'custom'
            ? isVi
              ? 'Xem theo khoảng thời gian tự chọn.'
              : 'View schedules in your custom date range.'
            : isVi
              ? 'Chọn ngày để xem danh sách ca làm việc.'
              : 'Select a date to view work shifts.';
  const monthSummary = useMemo(() => {
    const summary = new Map<string, number>();
    for (const item of schedulesQuery.data?.data.items ?? []) {
      const key = dayjs(item.workDate, DATE_FORMAT.DB_DATE).format('YYYY-MM');
      summary.set(key, (summary.get(key) ?? 0) + 1);
    }
    return summary;
  }, [schedulesQuery.data]);
  const selectedMonthKey = dayjs(selectedDate, DATE_FORMAT.DB_DATE).format('YYYY-MM');
  const selectedMonthSchedules = useMemo(() => {
    return (schedulesQuery.data?.data.items ?? [])
      .filter((item) => dayjs(item.workDate, DATE_FORMAT.DB_DATE).format('YYYY-MM') === selectedMonthKey)
      .sort((a, b) => {
        const dateDiff =
          dayjs(a.workDate, DATE_FORMAT.DB_DATE).valueOf() - dayjs(b.workDate, DATE_FORMAT.DB_DATE).valueOf();
        if (dateDiff !== 0) return dateDiff;
        return a.startTime.localeCompare(b.startTime);
      });
  }, [schedulesQuery.data, selectedMonthKey]);

  if (!user) {
    return (
      <StatePanel
        centered
        tone="warning"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Cần đăng nhập' : 'Sign in required'}
        description={isVi ? 'Vui lòng đăng nhập để xem lịch làm việc.' : 'Please sign in to view your work schedules.'}
        action={
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-bold text-white"
            onClick={() => navigate(ROUTES.login)}
          >
            {isVi ? 'Đăng nhập' : 'Login'}
          </button>
        }
      />
    );
  }

  if (normalizeRoleName(user.role?.roleName) !== ROLE.DOCTOR.toLowerCase()) {
    return (
      <StatePanel
        centered
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Không có quyền truy cập' : 'Access denied'}
        description={
          isVi ? 'Trang này chỉ dành cho tài khoản bác sĩ.' : 'This page is only available for doctor accounts.'
        }
        action={
          <button
            type="button"
            className="text-sm font-semibold text-blue-600 underline"
            onClick={() => navigate(ROUTES.home)}
          >
            {isVi ? 'Về trang chủ' : 'Back to home'}
          </button>
        }
      />
    );
  }

  if (doctorMeQuery.isLoading || schedulesQuery.isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 rounded-lg bg-slate-200" />
        <div className="h-[520px] rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (doctorMeQuery.isError) {
    return (
      <StatePanel
        tone="danger"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Không tải được hồ sơ bác sĩ' : 'Could not load doctor profile'}
        description={doctorMeQuery.error instanceof Error ? doctorMeQuery.error.message : 'Error'}
      />
    );
  }

  if (!doctorMeQuery.data) {
    return (
      <StatePanel
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Chưa tìm thấy hồ sơ bác sĩ' : 'Doctor profile not found'}
        description={
          isVi
            ? 'Tài khoản này chưa được gắn với bản ghi bác sĩ trong hệ thống.'
            : 'This account is not linked to a doctor record yet.'
        }
      />
    );
  }

  if (schedulesQuery.isError) {
    return (
      <StatePanel
        tone="danger"
        className="mx-auto w-full max-w-[1360px] rounded-3xl p-8"
        title={isVi ? 'Không tải được lịch làm việc' : 'Could not load work schedules'}
        description={schedulesQuery.error instanceof Error ? schedulesQuery.error.message : 'Error'}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1360px] space-y-3">
      <DoctorSchedulePageHeader
        isVi={isVi}
        modeTitle={modeTitle}
        modeDescription={modeDescription}
        fromDate={fromDate}
        onCreateSchedule={() => navigate('/bac-si/lich-lam-viec/tao-moi')}
      />

      <div className={calendarMode === 'day' ? 'grid gap-3' : 'grid gap-3 lg:grid-cols-[1fr_500px]'}>
        <div className="overflow-hidden rounded border border-slate-300 bg-white">
          {calendarMode === 'year' ? (
            <DoctorScheduleYearView
              isVi={isVi}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              selectedMonthKey={selectedMonthKey}
              monthSummary={monthSummary}
              schedules={schedulesQuery.data?.data.items ?? []}
              onSelectDate={setSelectedDate}
            />
          ) : calendarMode === 'day' ? (
            <DoctorScheduleDayOverview isVi={isVi} selectedDate={selectedDate} schedules={selectedDateSchedules} />
          ) : (
            <DoctorScheduleCalendarGrid
              calendarMode={calendarMode}
              weekdayLabels={weekdayLabels}
              dates={calendarMode === 'month' ? monthCells.map((item) => item.date) : rangeDays}
              schedulesByDate={schedulesByDate}
              selectedDate={selectedDate}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              viewMonth={viewMonth}
              isVi={isVi}
              onSelectDate={setSelectedDate}
            />
          )}
        </div>

        {calendarMode === 'year' ? (
          <DoctorScheduleDayDetails
            isVi={isVi}
            selectedDate={selectedDate}
            schedules={selectedMonthSchedules}
            scope="month"
          />
        ) : calendarMode !== 'day' ? (
          <DoctorScheduleDayDetails isVi={isVi} selectedDate={selectedDate} schedules={selectedDateSchedules} />
        ) : null}
      </div>
    </div>
  );
};

export default LichLamViecBacSiPageV2;
