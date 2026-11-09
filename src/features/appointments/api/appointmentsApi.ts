import {
  apiClient,
  unwrapApiResult,
  type components,
} from '../../../shared/api';

export type Appointment = components['schemas']['Appointment'];
export type AppointmentStatus = components['schemas']['AppointmentStatus'];
export type AppointmentPage = components['schemas']['AppointmentPage'];
export type StoreAppointmentRequest =
  components['schemas']['StoreAppointmentRequest'];
export type RescheduleAppointmentRequest =
  components['schemas']['RescheduleAppointmentRequest'];

export type ListAppointmentsQuery = {
  status?: AppointmentStatus;
  service_id?: number;
  from?: string;
  to?: string;
  page?: number;
};

export async function listAppointments(
  query: ListAppointmentsQuery = {},
): Promise<AppointmentPage> {
  return unwrapApiResult(
    await apiClient.GET('/appointments', {
      params: { query },
    }),
  );
}

export async function getAppointment(
  appointmentId: number,
): Promise<Appointment> {
  const payload = await unwrapApiResult(
    await apiClient.GET('/appointments/{appointment}', {
      params: { path: { appointment: appointmentId } },
    }),
  );
  return payload.data;
}

export async function createAppointment(
  body: StoreAppointmentRequest,
): Promise<Appointment> {
  const payload = await unwrapApiResult(
    await apiClient.POST('/appointments', { body }),
  );
  return payload.data;
}

export async function rescheduleAppointment(
  appointmentId: number,
  body: RescheduleAppointmentRequest,
): Promise<Appointment> {
  const payload = await unwrapApiResult(
    await apiClient.PATCH('/appointments/{appointment}', {
      params: { path: { appointment: appointmentId } },
      body,
    }),
  );
  return payload.data;
}

export async function cancelAppointment(
  appointmentId: number,
): Promise<Appointment> {
  const payload = await unwrapApiResult(
    await apiClient.POST('/appointments/{appointment}/cancel', {
      params: { path: { appointment: appointmentId } },
    }),
  );
  return payload.data;
}
