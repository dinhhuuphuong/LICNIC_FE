import { DoctorScheduleCalendarGrid } from '@/components/doctor-work-schedules/DoctorScheduleCalendarGrid';
import { DoctorScheduleYearView } from '@/components/doctor-work-schedules/DoctorScheduleYearView';
import DATE_FORMAT from '@/constants/date-format';
import { SEARCH_PARAMS } from '@/constants/search-params';
import { useLanguage } from '@/contexts/NgonNguContext';
import type { DoctorWorkSchedule } from '@/services/doctorWorkScheduleService';
import { Alert, Flex, Spin, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryParam } from 'use-query-params';

import { useGetDoctorWorkSchedulesQuery } from '../hooks/queries/useGetDoctorWorkSchedulesQuery';

const WEEKDAY_LABELS_VI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const WEEKDAY_LABELS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type CalendarMode = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

function buildMonthCells(viewMonth: dayjs.Dayjs) {
  const firstDayOfMonth = viewMonth.startOf('month');
  const firstWeekday = (firstDayOfMonth.day() + 6) % 7;
  const firstGridDate = firstDayOfMonth.subtract(firstWeekday, 'day');

  return Array.from({ length: 42 }).map((_, index) => {
    const date = firstGridDate.add(index, 'day');
    return { date, inCurrentMonth: date.month() === viewMonth.month() };
  });
}

function getCalendarMode(dateMode?: string): CalendarMode {
  if (
    dateMode === 'day' ||
    dateMode === 'week' ||
    dateMode === 'month' ||
    dateMode === 'quarter' ||
    dateMode === 'year' ||
    dateMode === 'custom'
  ) {
    return dateMode;
  }
  return 'month';
}

function statusTag(status: DoctorWorkSchedule['status']) {
  if (status === 'approved') return <Tag color="green">approved</Tag>;
  if (status === 'rejected') return <Tag color="red">rejected</Tag>;
  return <Tag color="gold">pending</Tag>;
}

function ScheduleCards(props: { schedules: DoctorWorkSchedule[] }) {
  const { schedules } = props;
  return (
    <Flex vertical gap={12} className="max-h-[min(520px,70vh)] overflow-y-auto pr-1">
      {schedules.map((s) => (
        <div
          key={s.scheduleId}
          className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-sm shadow-sm"
        >
          <Flex justify="space-between" align="flex-start" gap={8} wrap>
            <div>
              <div className="font-semibold text-slate-900">
                {s.doctor?.user?.name ?? `doctorId=${s.doctorId}`}
              </div>
              <div className="text-slate-600">
                {s.startTime.slice(0, 5)} – {s.endTime.slice(0, 5)}
              </div>
            </div>
            {statusTag(s.status)}
          </Flex>
        </div>
      ))}
    </Flex>
  );
}

export default function WorkScheduleGrid() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [searchParams] = useSearchParams();
  const [dateMode] = useQueryParam<string | undefined>(SEARCH_PARAMS.DATE_MODE);
  const [dateParam] = useQueryParam<string | undefined>(SEARCH_PARAMS.DATE);

  const doctorId = searchParams.get(SEARCH_PARAMS.DOCTOR_ID)
    ? Number(searchParams.get(SEARCH_PARAMS.DOCTOR_ID))
    : undefined;
  const fromDate =
    searchParams.get(SEARCH_PARAMS.FROM_DATE) ?? dayjs().startOf('month').format(DATE_FORMAT.DB_DATE);
  const toDate = searchParams.get(SEARCH_PARAMS.TO_DATE) ?? dayjs().endOf('month').format(DATE_FORMAT.DB_DATE);

  const calendarMode = getCalendarMode(dateMode);

  const rangeStart = useMemo(() => dayjs(fromDate, DATE_FORMAT.DB_DATE).startOf('day'), [fromDate]);
  const rangeEnd = useMemo(() => dayjs(toDate, DATE_FORMAT.DB_DATE).endOf('day'), [toDate]);

  const [viewMonth, setViewMonth] = useState(() => dayjs(fromDate, DATE_FORMAT.DB_DATE).startOf('month'));
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = dayjs().format(DATE_FORMAT.DB_DATE);
    const t = dayjs(today, DATE_FORMAT.DB_DATE);
    const rs = dayjs(fromDate, DATE_FORMAT.DB_DATE);
    const re = dayjs(toDate, DATE_FORMAT.DB_DATE);
    if (!t.isValid() || t.isBefore(rs, 'day') || t.isAfter(re, 'day')) return fromDate;
    return today;
  });

  useEffect(() => {
    const start = dayjs(fromDate, DATE_FORMAT.DB_DATE);
    if (start.isValid()) {
      setViewMonth(start.startOf('month'));
    }
  }, [fromDate]);

  useEffect(() => {
    setSelectedDate((current) => {
      const selected = dayjs(current, DATE_FORMAT.DB_DATE);
      const rs = dayjs(fromDate, DATE_FORMAT.DB_DATE);
      const re = dayjs(toDate, DATE_FORMAT.DB_DATE);
      if (!selected.isValid()) return fromDate;
      if (selected.isBefore(rs, 'day') || selected.isAfter(re, 'day')) return fromDate;
      return current;
    });
  }, [fromDate, toDate]);

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

  const { data, isFetching, isError, error } = useGetDoctorWorkSchedulesQuery({
    page: 1,
    limit: 500,
    doctorId,
    fromDate,
    toDate,
  });

  const items: DoctorWorkSchedule[] = useMemo(() => data?.data.items ?? [], [data?.data.items]);

  const schedulesByDate = useMemo(() => {
    const map = new Map<string, DoctorWorkSchedule[]>();
    for (const item of items) {
      const key = item.workDate;
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return map;
  }, [items]);

  const selectedDateSchedules = useMemo(() => {
    const list = schedulesByDate.get(selectedDate) ?? [];
    return [...list].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [schedulesByDate, selectedDate]);

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

  const monthSummary = useMemo(() => {
    const summary = new Map<string, number>();
    for (const item of items) {
      const key = dayjs(item.workDate, DATE_FORMAT.DB_DATE).format('YYYY-MM');
      summary.set(key, (summary.get(key) ?? 0) + 1);
    }
    return summary;
  }, [items]);

  const selectedMonthKey = dayjs(selectedDate, DATE_FORMAT.DB_DATE).format('YYYY-MM');
  const selectedMonthSchedules = useMemo(() => {
    return items
      .filter((item) => dayjs(item.workDate, DATE_FORMAT.DB_DATE).format('YYYY-MM') === selectedMonthKey)
      .sort((a, b) => {
        const dateDiff =
          dayjs(a.workDate, DATE_FORMAT.DB_DATE).valueOf() - dayjs(b.workDate, DATE_FORMAT.DB_DATE).valueOf();
        if (dateDiff !== 0) return dateDiff;
        return a.startTime.localeCompare(b.startTime);
      });
  }, [items, selectedMonthKey]);

  const gridCalendarMode =
    calendarMode === 'month' ? 'month' : calendarMode === 'week' ? 'week' : ('custom' as const);

  const modeTitle =
    calendarMode === 'day'
      ? isVi
        ? 'Lịch làm việc theo ngày'
        : 'Daily schedule'
      : calendarMode === 'week'
        ? isVi
          ? 'Lịch làm việc theo tuần'
          : 'Weekly schedule'
        : calendarMode === 'quarter'
          ? isVi
            ? 'Lịch làm việc theo quý'
            : 'Quarterly schedule'
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
        ? 'Danh sách ca trong ngày được chọn.'
        : 'Shifts on the selected day.'
      : calendarMode === 'week'
        ? isVi
          ? 'Chọn một ngày trong tuần để xem ca bên cạnh.'
          : 'Pick a day in the week to see shifts in the panel.'
        : calendarMode === 'quarter'
          ? isVi
            ? 'Chọn ngày trong quý để xem chi tiết.'
            : 'Pick a day in the quarter for details.'
          : calendarMode === 'year'
            ? isVi
              ? 'Chọn tháng hoặc ngày để xem danh sách ca.'
              : 'Pick a month or date to list shifts.'
            : calendarMode === 'custom'
              ? isVi
                ? 'Theo khoảng ngày tùy chỉnh.'
                : 'Custom date range.'
              : isVi
                ? 'Chọn ngày trên lịch để xem ca.'
                : 'Select a date on the calendar to see shifts.';

  const periodRangeLabel = `${dayjs(fromDate, DATE_FORMAT.DB_DATE).format(DATE_FORMAT.DATE)} — ${dayjs(toDate, DATE_FORMAT.DB_DATE).format(DATE_FORMAT.DATE)}`;

  const sidebarSchedules = calendarMode === 'year' ? selectedMonthSchedules : selectedDateSchedules;
  const sidebarTitle =
    calendarMode === 'year'
      ? isVi
        ? 'Ca trong tháng đã chọn'
        : 'Shifts in selected month'
      : isVi
        ? 'Ca trong ngày đã chọn'
        : 'Shifts on selected date';

  const sidebarEmpty =
    calendarMode === 'year'
      ? isVi
        ? 'Không có ca trong tháng này.'
        : 'No shifts in this month.'
      : isVi
        ? 'Không có ca trong ngày này.'
        : 'No shifts on this date.';

  const selectedSidebarLabel =
    calendarMode === 'year'
      ? dayjs(selectedDate, DATE_FORMAT.DB_DATE).format(isVi ? 'MM/YYYY' : 'MMM YYYY')
      : dayjs(selectedDate, DATE_FORMAT.DB_DATE).format(DATE_FORMAT.DATE);

  if (isError) {
    return (
      <Alert
        type="error"
        showIcon
        message={isVi ? 'Không tải được lịch làm việc' : 'Could not load schedules'}
        description={error instanceof Error ? error.message : 'Error'}
      />
    );
  }

  return (
    <Spin spinning={isFetching}>
      <Flex vertical gap={12}>
        <div>
          <Typography.Title level={5} className="mb-1! mt-0!">
            {modeTitle}
          </Typography.Title>
          <Typography.Text type="secondary" className="text-sm">
            {modeDescription}
          </Typography.Text>
          <Typography.Text type="secondary" className="mt-1 block text-xs">
            {periodRangeLabel}
          </Typography.Text>
        </div>

        <div className={calendarMode === 'day' ? 'grid gap-3' : 'grid gap-3 lg:grid-cols-[1fr_380px]'}>
          <div className="overflow-hidden rounded border border-slate-300 bg-white">
            {calendarMode === 'year' ? (
              <DoctorScheduleYearView
                isVi={isVi}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                selectedMonthKey={selectedMonthKey}
                monthSummary={monthSummary}
                schedules={items}
                onSelectDate={setSelectedDate}
              />
            ) : calendarMode === 'day' ? (
              <div className="p-4">
                <Typography.Text type="secondary" className="mb-3 block text-sm">
                  {dayjs(selectedDate, DATE_FORMAT.DB_DATE).format(DATE_FORMAT.DATE)}
                </Typography.Text>
                {selectedDateSchedules.length === 0 ? (
                  <Typography.Text type="secondary">{sidebarEmpty}</Typography.Text>
                ) : (
                  <ScheduleCards schedules={selectedDateSchedules} />
                )}
              </div>
            ) : (
              <DoctorScheduleCalendarGrid
                calendarMode={gridCalendarMode}
                weekdayLabels={weekdayLabels}
                dates={calendarMode === 'month' ? monthCells.map((c) => c.date) : rangeDays}
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

          {calendarMode !== 'day' ? (
            <div className="rounded border border-slate-300 bg-white p-4">
              <Typography.Title level={5} className="mb-2! mt-0!">
                {sidebarTitle}
              </Typography.Title>
              <Typography.Text type="secondary" className="mb-3 block text-sm">
                {selectedSidebarLabel}
              </Typography.Text>
              {sidebarSchedules.length === 0 ? (
                <Typography.Text type="secondary">{sidebarEmpty}</Typography.Text>
              ) : (
                <ScheduleCards schedules={sidebarSchedules} />
              )}
            </div>
          ) : null}
        </div>
      </Flex>
    </Spin>
  );
}
