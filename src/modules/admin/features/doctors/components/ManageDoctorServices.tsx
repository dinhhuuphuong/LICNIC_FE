import { Button, Form, Modal, Select, Spin, message } from 'antd';
import type { ReactElement } from 'react';
import { cloneElement, useEffect, useMemo, useState } from 'react';

import { useGetServicesQuery } from '@/modules/admin/features/services/hooks/queries/useGetServicesQuery';
import type { Service } from '@/services/serviceService';

import { useSetDoctorServicesMutation } from '@/modules/admin/features/doctors/hooks/mutations/useSetDoctorServicesMutation';
import { useGetDoctorServicesQuery } from '@/modules/admin/features/doctors/hooks/queries/useGetDoctorServicesQuery';
import type { SetDoctorServicesResponse } from '@/services/doctorService';

type ManageDoctorServicesProps = {
  doctorId: number;
  doctorName?: string;
  trigger: ReactElement;
};

type FormValues = {
  serviceIds: number[];
};

const ManageDoctorServices = ({ doctorId, doctorName, trigger }: ManageDoctorServicesProps) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<FormValues>();

  const doctorServicesQuery = useGetDoctorServicesQuery(doctorId, open);
  const servicesQuery = useGetServicesQuery({ page: 1, limit: 1000 });
  const setDoctorServicesMutation = useSetDoctorServicesMutation();

  const serviceOptions = useMemo(
    () =>
      servicesQuery.data?.data.items.map((service) => ({
        label: service.serviceName,
        value: service.serviceId,
      })) ?? [],
    [servicesQuery.data],
  );

  useEffect(() => {
    if (!open) return;
    const assignedServiceIds = doctorServicesQuery.data?.data?.map((service: Service) => service.serviceId) ?? [];
    form.setFieldsValue({ serviceIds: assignedServiceIds });
  }, [doctorServicesQuery.data, form, open]);

  async function handleFinish(values: FormValues) {
    try {
      const res = (await setDoctorServicesMutation.mutateAsync({
        doctorId,
        payload: { serviceIds: values.serviceIds ?? [] },
      })) as SetDoctorServicesResponse;
      message.success(res.message || 'Thành công');
      setOpen(false);
      form.resetFields();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Thao tác thất bại';
      message.error(msg);
    }
  }

  const triggerNode = cloneElement(trigger, {
    onClick: (e: unknown) => {
      trigger.props?.onClick?.(e);
      setOpen(true);
    },
  });

  return (
    <>
      {triggerNode}
      <Modal
        open={open}
        title={`Dịch vụ của bác sĩ${doctorName ? `: ${doctorName}` : ''}`}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={setDoctorServicesMutation.isPending}
        destroyOnHidden
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Spin spinning={doctorServicesQuery.isLoading}>
          <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ serviceIds: [] }}>
            <Form.Item name="serviceIds" label="Dịch vụ phụ trách">
              <Select
                mode="multiple"
                placeholder="Chọn dịch vụ"
                options={serviceOptions}
                loading={servicesQuery.isFetching}
                showSearch
                optionFilterProp="label"
                allowClear
              />
            </Form.Item>

            <Button
              type="link"
              className="px-0!"
              onClick={() => doctorServicesQuery.refetch()}
              disabled={doctorServicesQuery.isFetching}
            >
              Tải lại danh sách dịch vụ đã gán
            </Button>
          </Form>
        </Spin>
      </Modal>
    </>
  );
};

export default ManageDoctorServices;
