/** 13 đơn vị hành chính cấp tỉnh của Đồng bằng sông Cửu Long (12 tỉnh + TP. Cần Thơ). Khớp với backend/src/config/regions.ts */
export interface Region {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

export interface RegionReading {
  id: string;
  provinceCode: string;
  provinceName: string;
  salinity: number; // ‰
  temperature: number; // °C
  waterLevel: number; // cm ngập
  waterQuality: number; // WQI 0-100
  note: string;
  isSample: boolean;
  updatedByName: string | null;
  updatedAt: string;
}

export const MEKONG_REGIONS: Region[] = [
  { code: 'LA', name: 'Long An', lat: 10.6956, lng: 106.2431 },
  { code: 'TG', name: 'Tiền Giang', lat: 10.4493, lng: 106.3421 },
  { code: 'BT', name: 'Bến Tre', lat: 10.2434, lng: 106.3756 },
  { code: 'TV', name: 'Trà Vinh', lat: 9.9347, lng: 106.3453 },
  { code: 'VL', name: 'Vĩnh Long', lat: 10.2537, lng: 105.9722 },
  { code: 'DT', name: 'Đồng Tháp', lat: 10.4938, lng: 105.6882 },
  { code: 'AG', name: 'An Giang', lat: 10.5216, lng: 105.1259 },
  { code: 'KG', name: 'Kiên Giang', lat: 10.0125, lng: 105.0809 },
  { code: 'CT', name: 'Cần Thơ', lat: 10.0452, lng: 105.7469 },
  { code: 'HG', name: 'Hậu Giang', lat: 9.7579, lng: 105.6413 },
  { code: 'ST', name: 'Sóc Trăng', lat: 9.6037, lng: 105.9739 },
  { code: 'BL', name: 'Bạc Liêu', lat: 9.2941, lng: 105.7278 },
  { code: 'CM', name: 'Cà Mau', lat: 9.1769, lng: 105.15 },
];

export const regionName = (code?: string | null) => MEKONG_REGIONS.find((r) => r.code === code)?.name ?? '';
