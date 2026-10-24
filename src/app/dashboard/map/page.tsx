import { redirect } from 'next/navigation';

// Trang bản đồ cũ đã được thay bằng Bản đồ rủi ro (/dashboard/stress-map)
export default function LegacyMapRedirect() {
  redirect('/dashboard/stress-map');
}
