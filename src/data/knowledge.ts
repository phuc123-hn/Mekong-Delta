/** Nội dung trang Kiến thức dành cho nông dân. Mỗi chủ đề gồm tóm tắt, các việc cần làm và lưu ý. */
export interface KnowledgeTopic {
  title: string;
  summary: string;
  steps: string[];
  caution?: string;
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  intro: string;
  /** Liên kết đến bản tin chi tiết (nếu có) */
  newsSlug?: string;
  topics: KnowledgeTopic[];
}

export const KNOWLEDGE: KnowledgeCategory[] = [
  {
    id: 'man',
    name: 'Xâm nhập mặn',
    intro: 'Mặn lên sớm và đi sâu là rủi ro lớn nhất ở các tỉnh ven biển. Nắm vững ngưỡng mặn và cách lấy nước giúp tránh mất trắng vụ.',
    newsSlug: 'canh-bao-xam-nhap-man',
    topics: [
      {
        title: 'Đo và hiểu độ mặn của nước',
        summary: 'Độ mặn tính bằng phần nghìn (‰). 1‰ tương đương 1 gam muối trong 1 lít nước.',
        steps: [
          'Dùng máy đo độ mặn hoặc khúc xạ kế cầm tay, không nếm thử nước.',
          'Đo vào lúc triều lên và lúc triều xuống vì độ mặn thay đổi theo con nước.',
          'Dưới 1‰ là an toàn; từ 1‰ cần theo dõi; từ 4‰ lúa có nguy cơ thiệt hại nặng.',
          'Ghi lại kết quả đo mỗi ngày để thấy xu hướng tăng hay giảm.',
        ],
        caution: 'Ngưỡng chịu mặn còn phụ thuộc giống và giai đoạn sinh trưởng. Mạ và giai đoạn đẻ nhánh nhạy cảm hơn.',
      },
      {
        title: 'Lấy nước và trữ nước ngọt',
        summary: 'Chỉ lấy nước vào ruộng khi nước đủ ngọt, phần còn lại phải dựa vào nước đã trữ.',
        steps: [
          'Chỉ mở cống lấy nước khi độ mặn xuống dưới 1‰, thường là lúc triều kém.',
          'Đóng cống ngay khi độ mặn tăng; kiểm tra gioăng và cửa cống trước mùa khô.',
          'Trữ nước ngọt vào ao, bể hoặc túi chứa khi nguồn nước còn tốt.',
          'Ưu tiên nước đã trữ cho cây non, cây ăn trái và rau màu.',
        ],
      },
      {
        title: 'Thích ứng lâu dài với mặn',
        summary: 'Điều chỉnh lịch thời vụ và cơ cấu cây trồng để giảm phụ thuộc vào nước ngọt trong mùa khô.',
        steps: [
          'Xuống giống sớm để thu hoạch trước đợt mặn cao điểm, hoặc chờ mưa đầu mùa mới gieo sạ.',
          'Chọn giống chịu mặn do cơ quan khuyến nông địa phương khuyến cáo.',
          'Ở vùng mặn thường xuyên, cân nhắc mô hình luân canh lúa và tôm theo hướng dẫn kỹ thuật.',
          'Phủ gốc bằng rơm, cỏ khô để giảm bốc hơi và muối tích tụ trên mặt đất.',
        ],
        caution: 'Chuyển đổi mô hình sản xuất cần tham khảo ý kiến cán bộ khuyến nông trước khi đầu tư.',
      },
    ],
  },
  {
    id: 'nhiet',
    name: 'Nắng nóng và hạn',
    intro: 'Nhiệt độ cao làm cây mất nước nhanh, ao nuôi thiếu oxy và vật nuôi giảm ăn. Phòng ngừa sớm rẻ hơn nhiều so với khắc phục.',
    newsSlug: 'stress-nhiet-nang-nong',
    topics: [
      {
        title: 'Tưới nước đúng lúc',
        summary: 'Tưới sai giờ vừa lãng phí nước vừa làm cây bị sốc nhiệt.',
        steps: [
          'Tưới vào sáng sớm hoặc chiều mát, tránh giữa trưa.',
          'Tưới đủ ẩm vùng rễ thay vì tưới nhiều lần ít nước.',
          'Phủ gốc bằng rơm, mụn dừa hoặc màng phủ để giữ ẩm.',
          'Che lưới cho cây con và rau màu khi nắng gắt kéo dài.',
        ],
      },
      {
        title: 'Bảo vệ ao nuôi và vật nuôi',
        summary: 'Nước nóng chứa ít oxy hơn nên tôm cá dễ nổi đầu và mắc bệnh.',
        steps: [
          'Tăng thời gian chạy quạt nước, sục khí, nhất là ban đêm và gần sáng.',
          'Giảm lượng thức ăn và cho ăn vào lúc mát.',
          'Chuồng nuôi thoáng, có mái che; cung cấp đủ nước sạch cho gia súc, gia cầm.',
          'Theo dõi dấu hiệu thở dốc, bỏ ăn để xử lý kịp thời.',
        ],
      },
    ],
  },
  {
    id: 'lu',
    name: 'Lũ và triều cường',
    intro: 'Mùa lũ từ tháng 7 đến tháng 11, cuối năm có triều cường. Chuẩn bị sớm giúp giảm thiệt hại về người và tài sản.',
    newsSlug: 'rui-ro-lu-trieu-cuong',
    topics: [
      {
        title: 'Chuẩn bị trước khi nước lên',
        summary: 'Kiểm tra hạ tầng và sắp xếp tài sản khi chưa có nguy cơ cấp bách.',
        steps: [
          'Kiểm tra, gia cố bờ bao và đê bao; chuẩn bị bao cát, máy bơm.',
          'Thu hoạch sớm phần lúa đã chín khi dự báo nước lên nhanh.',
          'Di dời vật nuôi, vật tư, thiết bị điện lên nơi cao.',
          'Cất giấy tờ, thuốc men vào túi chống nước; lưu số điện thoại khẩn cấp.',
        ],
      },
      {
        title: 'Sau khi nước rút',
        summary: 'Vệ sinh và phòng bệnh là việc cần làm ngay để tránh dịch bệnh sau lũ.',
        steps: [
          'Vệ sinh nhà cửa, chuồng trại và khử trùng.',
          'Kiểm tra hệ thống điện trước khi dùng lại.',
          'Chỉ uống nước đã đun sôi hoặc đã xử lý.',
          'Chụp ảnh, ghi nhận thiệt hại và báo Ủy ban nhân dân xã.',
        ],
      },
    ],
  },
  {
    id: 'nuoc',
    name: 'Chất lượng nước',
    intro: 'Nguồn nước sạch quyết định sức khỏe ao nuôi, cây trồng và gia đình. Nhận biết sớm dấu hiệu ô nhiễm giúp hạn chế thiệt hại.',
    newsSlug: 'canh-bao-chat-luong-nuoc',
    topics: [
      {
        title: 'Nhận biết nước có vấn đề',
        summary: 'Quan sát bằng mắt và mùi là bước kiểm tra đầu tiên mà ai cũng làm được.',
        steps: [
          'Nước đổi màu bất thường, có váng, bọt hoặc mùi hôi.',
          'Tôm cá nổi đầu, bỏ ăn hoặc chết rải rác.',
          'Cây tưới bằng nước đó vàng lá, cháy lá.',
          'Khi thấy dấu hiệu, tạm ngừng lấy nước và báo cho trưởng ấp hoặc Ủy ban nhân dân xã.',
        ],
        caution: 'Nước đục vào mùa lũ thường do phù sa, chưa chắc là ô nhiễm. Cần xem thêm mùi, váng và phản ứng của tôm cá.',
      },
      {
        title: 'Xử lý nước sinh hoạt',
        summary: 'Nước kênh, rạch không dùng trực tiếp để uống.',
        steps: [
          'Lắng nước bằng phèn theo hướng dẫn, gạn lấy nước trong.',
          'Lọc qua lớp cát, sỏi và than hoạt tính.',
          'Đun sôi trước khi uống.',
          'Dùng nước mưa hoặc nước máy khi nguồn nước kênh có dấu hiệu ô nhiễm.',
        ],
      },
    ],
  },
  {
    id: 'vat-tu',
    name: 'Phân bón và thuốc bảo vệ thực vật',
    intro: 'Dùng đúng giúp tiết kiệm chi phí và bảo vệ nguồn nước. Dùng sai vừa tốn tiền vừa gây ô nhiễm.',
    topics: [
      {
        title: 'Bón phân theo nguyên tắc bốn đúng',
        summary: 'Đúng loại, đúng lượng, đúng lúc và đúng cách.',
        steps: [
          'Đúng loại: chọn phân phù hợp nhu cầu cây trồng và giai đoạn sinh trưởng.',
          'Đúng lượng: bón theo khuyến cáo, không bón thừa đạm.',
          'Đúng lúc: bón chia nhiều lần vào các giai đoạn cây cần dinh dưỡng.',
          'Đúng cách: bón vùi hoặc bón lót để giảm thất thoát; kết hợp phân hữu cơ để cải tạo đất.',
        ],
      },
      {
        title: 'Dùng thuốc bảo vệ thực vật an toàn',
        summary: 'Chỉ dùng thuốc khi cần thiết và theo đúng nhãn hướng dẫn.',
        steps: [
          'Đúng thuốc: chọn thuốc đúng đối tượng sâu bệnh cần trừ.',
          'Đúng liều lượng và nồng độ: đọc kỹ hướng dẫn trên bao bì.',
          'Đúng lúc: phun khi mật độ sâu bệnh đạt ngưỡng, tránh phun lúc nắng gắt hoặc gần mưa.',
          'Đúng cách: mang đủ găng tay, khẩu trang, kính; thực hiện thời gian cách ly trước thu hoạch.',
          'Không đổ nước rửa bình phun hoặc vứt bao bì ra kênh rạch; thu gom đúng nơi quy định.',
        ],
        caution: 'Bảo quản thuốc ở nơi khô, mát, có khóa và xa tầm tay trẻ em, vật nuôi.',
      },
    ],
  },
  {
    id: 'sx-ben-vung',
    name: 'Canh tác bền vững',
    intro: 'Giảm chi phí, giảm phát thải và giữ đất khỏe là hướng đi lâu dài cho vùng sản xuất lúa.',
    topics: [
      {
        title: 'Chương trình 1 phải 5 giảm',
        summary: 'Bộ biện pháp kỹ thuật được khuyến khích cho sản xuất lúa ở Đồng bằng sông Cửu Long.',
        steps: [
          '1 phải: sử dụng giống lúa xác nhận hoặc giống đạt chuẩn.',
          '5 giảm: giảm lượng giống gieo sạ, giảm phân đạm, giảm thuốc bảo vệ thực vật, giảm lượng nước tưới và giảm thất thoát sau thu hoạch.',
          'Áp dụng kết hợp với quản lý dịch hại tổng hợp và tưới ngập khô xen kẽ nếu điều kiện cho phép.',
        ],
        caution: 'Hãy trao đổi với cán bộ khuyến nông địa phương để điều chỉnh các biện pháp cho phù hợp với đất đai và thời vụ của bạn.',
      },
      {
        title: 'Quản lý dịch hại tổng hợp',
        summary: 'Kết hợp nhiều biện pháp để giữ sâu bệnh dưới ngưỡng gây hại, hạn chế dùng thuốc.',
        steps: [
          'Thăm đồng thường xuyên để phát hiện sớm sâu bệnh.',
          'Dùng giống kháng, gieo sạ đồng loạt, vệ sinh đồng ruộng.',
          'Bảo vệ thiên địch như nhện, bọ rùa, ong ký sinh.',
          'Chỉ dùng thuốc hóa học khi các biện pháp khác không đủ hiệu quả.',
        ],
      },
    ],
  },
  {
    id: 'chan-nuoi',
    name: 'Chăn nuôi và thủy sản',
    intro: 'Phòng bệnh luôn hiệu quả hơn chữa bệnh. An toàn sinh học là nền tảng cho cả chăn nuôi và nuôi trồng thủy sản.',
    topics: [
      {
        title: 'Phòng bệnh cho vật nuôi',
        summary: 'Tuân thủ lịch tiêm phòng và giữ vệ sinh chuồng trại hằng ngày.',
        steps: [
          'Tiêm phòng đầy đủ theo hướng dẫn của cán bộ thú y địa phương.',
          'Vệ sinh, khử trùng chuồng trại định kỳ.',
          'Cách ly vật nuôi mới nhập ít nhất vài tuần trước khi nhập đàn.',
          'Hạn chế người lạ và phương tiện ra vào khu chăn nuôi.',
          'Khi vật nuôi có dấu hiệu bệnh bất thường, tách riêng và báo thú y ngay.',
        ],
      },
      {
        title: 'Quản lý ao nuôi thủy sản',
        summary: 'Theo dõi các chỉ tiêu nước thường xuyên để xử lý trước khi tôm cá bị sốc.',
        steps: [
          'Đo độ mặn, nhiệt độ, độ pH và oxy hòa tan theo lịch cố định.',
          'Không lấy nước vào ao khi nguồn nước có dấu hiệu mặn bất thường hoặc ô nhiễm.',
          'Giữ mật độ thả và lượng thức ăn phù hợp với điều kiện ao.',
          'Ghi chép nhật ký ao nuôi để truy xuất khi có sự cố.',
        ],
      },
    ],
  },
  {
    id: 'kinh-te',
    name: 'Quản lý nông hộ và thị trường',
    intro: 'Ghi chép và liên kết giúp nông hộ biết mình lãi lỗ ở đâu và bán được giá tốt hơn.',
    topics: [
      {
        title: 'Ghi chép sản xuất',
        summary: 'Sổ ghi chép đơn giản cho thấy rõ khoản nào đang tốn nhiều nhất.',
        steps: [
          'Ghi ngày xuống giống, giống sử dụng, lượng phân, thuốc và công lao động.',
          'Ghi sản lượng và giá bán mỗi vụ.',
          'Cuối vụ so sánh chi phí và lợi nhuận để điều chỉnh vụ sau.',
          'Giữ lại hóa đơn mua vật tư để truy xuất nguồn gốc khi cần.',
        ],
      },
      {
        title: 'Liên kết tiêu thụ',
        summary: 'Bán theo nhóm giúp có giá tốt hơn và giảm rủi ro một mình.',
        steps: [
          'Tham gia hợp tác xã hoặc tổ hợp tác tại địa phương.',
          'Tìm hiểu hợp đồng bao tiêu và yêu cầu chất lượng của doanh nghiệp thu mua.',
          'Theo dõi giá lúa, giá thủy sản qua đài, báo và các hiệp hội nông dân.',
          'Cân nhắc kỹ trước khi ký hợp đồng, nhờ cán bộ địa phương tư vấn nếu cần.',
        ],
      },
    ],
  },
];
