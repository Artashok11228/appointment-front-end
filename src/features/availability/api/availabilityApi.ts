import {
  apiClient,
  unwrapApiResult,
  type components,
} from '../../../shared/api';

export type TimeSlot = components['schemas']['TimeSlot'];

export async function getServiceAvailability(
  serviceId: number,
  dateYmd: string,
): Promise<TimeSlot[]> {
  const payload = await unwrapApiResult(
    await apiClient.GET('/services/{service}/availability', {
      params: {
        path: { service: serviceId },
        query: { date: dateYmd },
      },
    }),
  );
  return payload.data;
}
