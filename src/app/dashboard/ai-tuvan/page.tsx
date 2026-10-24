'use client';

import AiChat from '@/components/ai-chat';

export default function AiTuvanPage() {
  return (
    <AiChat
      endpoint="/api/chat/farmer"
      title="Bác Tư Vấn (AI)"
      subtitle="Chuyên gia nông nghiệp Đồng bằng sông Cửu Long, chỉ trả lời chuyện ruộng đồng"
      intro="Chào con! Bác là chuyên gia nông nghiệp vùng Đồng bằng sông Cửu Long. Con cứ hỏi về giống lúa, phân bón, sâu bệnh, thời tiết hay lịch gieo trồng nhé."
      placeholder="Nhập câu hỏi của con..."
      thinking="Bác đang suy nghĩ..."
      errorText="Bác đang bận quá, con hỏi lại sau ít phút nha."
      suggestions={[
        { label: 'Giống lúa', text: 'Tôi muốn trồng lúa tốt, giống nào phù hợp với Cần Thơ?' },
        { label: 'Sâu bệnh', text: 'Cách phòng trừ sâu rầy như thế nào?' },
        { label: 'Lịch gieo', text: 'Bây giờ nên gieo lúa hay chờ?' },
        { label: 'Nước nhiễm mặn', text: 'Nước kênh bị mặn thì có tưới lúa được không?' },
      ]}
      footnote="Câu trả lời của AI chỉ mang tính tham khảo. Hãy hỏi cán bộ khuyến nông khi cần quyết định quan trọng."
    />
  );
}
