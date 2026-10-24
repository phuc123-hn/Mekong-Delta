'use client';

import AiChat from '@/components/ai-chat';

export default function AiAnalysisPage() {
  return (
    <AiChat
      endpoint="/api/chat/gov"
      title="Phân tích AI"
      subtitle="Chuyên gia phân tích dữ liệu nông nghiệp Đồng bằng sông Cửu Long, dành cho cơ quan quản lý"
      intro="Xin chào. Tôi hỗ trợ phân tích dữ liệu, dự báo, cảnh báo rủi ro và gợi ý khuyến nghị chính sách cho vùng Đồng bằng sông Cửu Long."
      placeholder="Hỏi về phân tích dữ liệu, dự báo, cảnh báo, khuyến nghị..."
      thinking="Đang phân tích dữ liệu..."
      errorText="Lỗi kết nối, vui lòng thử lại sau."
      suggestions={[
        { label: 'So sánh năng suất', text: 'So sánh năng suất lúa giữa 3 tỉnh Cần Thơ, An Giang, Cà Mau năm nay' },
        { label: 'Cảnh báo mặn', text: 'Cảnh báo rủi ro mặn cho mùa vụ tới' },
        { label: 'Dự báo diện tích', text: 'Dự báo xu hướng diện tích gieo trồng' },
      ]}
      footnote="Phân tích mang tính tham khảo, cần đối chiếu với số liệu quan trắc chính thức trước khi ban hành khuyến nghị."
    />
  );
}
