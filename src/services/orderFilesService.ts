import apiClient from './apiClient';

export interface OrderFileRecord {
  id: number;
  order_id: number;
  user_id: string;
  file_url: string;
  file_type: string;
  original_name: string;
  created_at: string;
}

export interface OrderFilesResponse {
  success: boolean;
  count: number;
  files: OrderFileRecord[];
}

export const getFilesByUser = (userId: string) =>
  apiClient.get<OrderFilesResponse>(`/order-files/user/${userId}`);

