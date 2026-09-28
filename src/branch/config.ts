export type BranchId = 'markham' | 'vaughan';

export interface BranchConfig {
  id: BranchId;
  name: string;
  address: string;
  phone: string;
  phoneDial: string;
  email: string;
  hours: string;
  mapUrl: string;
}

export const BRANCHES: Record<BranchId, BranchConfig> = {
  markham: {
    id: 'markham',
    name: 'Markham',
    address: '23 Laidlaw Blvd Unit 3, Markham, ON L3P 1W7',
    phone: '(437) 340-1121',
    phoneDial: '4373401121',
    email: 'wraptitude.ca@gmail.com',
    hours: 'Monday–Saturday 11:00 AM–7:00 PM; Sunday Closed',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=23+Laidlaw+Blvd+Unit+3+Markham+ON',
  },
  vaughan: {
    id: 'vaughan',
    name: 'Vaughan',
    address: '8635 Keele Street, Unit 8, Vaughan, ON L4K 3P5',
    phone: '(416) 818-1293',
    phoneDial: '4168181293',
    email: 'info@wraptitude-vaughan.ca',
    hours: 'Monday–Saturday 11:00 AM–7:00 PM; Sunday Closed',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=8635+Keele+Street+Unit+8+Vaughan+ON+L4K+3P5',
  },
};

export const DEFAULT_BRANCH_ID: BranchId = 'markham';
export const BRANCH_API_URL = 'https://veqwrpreo6.execute-api.us-east-2.amazonaws.com';
