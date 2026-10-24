/**
 * Nội dung bản tin hiển thị ở mục "Tin tức & Cảnh báo" trên trang chủ và trang chi tiết /tin-tuc/[slug].
 * Muốn đổi ảnh nền: thay file trong public/images/news (xem README_TIN_TUC.md) hoặc sửa trường `image`.
 */
export type NewsTone = 'salt' | 'heat' | 'flood' | 'alert' | 'data';

export interface NewsBlock {
  title?: string; // điểm nhỏ: 1.1, 1.2, ...
  paragraphs?: string[];
  bullets?: string[];
}

export interface NewsSection {
  heading: string; // điểm lớn: I, II, III, ...
  intro?: string;
  blocks: NewsBlock[];
}

export interface NewsArticle {
  slug: string;
  category: string;
  tone: NewsTone;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
  updatedAt: string; // ISO
  readMinutes: number;
  sections: NewsSection[];
  faq: { q: string; a: string }[];
}

export const HOTLINE = '0767248775';
export const HOTLINE_DISPLAY = '0767 248 775';

export const NEWS: NewsArticle[] = [
  // =====================================================================================
  {
    slug: 'canh-bao-xam-nhap-man',
    category: 'MẶN',
    tone: 'salt',
    title: 'Cảnh báo xâm nhập mặn tại các cửa sông Cửu Long',
    summary: 'Khi độ mặn trên kênh rạch vượt 4‰, lúa và cây ăn trái có nguy cơ thiệt hại nặng. Bà con cần đóng cống đúng lúc, trữ nước ngọt và theo dõi số liệu từng ngày.',
    image: '/images/news/man.jpg',
    imageAlt: 'Cống ngăn mặn và đồng ruộng ven cửa sông vùng Đồng bằng sông Cửu Long',
    updatedAt: '2026-10-22',
    readMinutes: 6,
    sections: [
      {
        heading: 'Tổng quan tình hình',
        blocks: [
          {
            title: 'Xâm nhập mặn là gì',
            paragraphs: [
              'Xâm nhập mặn là hiện tượng nước biển theo thủy triều lấn sâu vào các cửa sông và kênh rạch, làm tăng nồng độ muối trong nguồn nước dùng để tưới tiêu, nuôi trồng và sinh hoạt.',
              'Tại Đồng bằng sông Cửu Long, mùa khô kéo dài từ khoảng tháng 12 đến tháng 5. Giai đoạn này lượng nước ngọt từ thượng nguồn giảm, trong khi triều cường kết hợp gió chướng đẩy nước mặn vào sâu hơn. Thời điểm mặn cao nhất thường rơi vào khoảng tháng 2 đến tháng 4.',
            ],
          },
          {
            title: 'Khu vực chịu ảnh hưởng',
            paragraphs: [
              'Các tỉnh ven biển và nằm sát cửa sông chịu tác động mạnh nhất, gồm Tiền Giang, Bến Tre, Trà Vinh, Sóc Trăng, Bạc Liêu, Cà Mau và Kiên Giang. Cửa Đại là một trong chín cửa của sông Cửu Long, nằm giữa Tiền Giang và Bến Tre, nên độ mặn tại đây là chỉ báo quan trọng cho cả khu vực.',
              'Ở những năm nước ngọt thượng nguồn về ít, mặn có thể đi sâu vào đất liền hàng chục ki-lô-mét, ảnh hưởng cả những vùng trước đây hiếm khi bị nhiễm mặn.',
            ],
          },
        ],
      },
      {
        heading: 'Ngưỡng độ mặn và mức ảnh hưởng',
        intro: 'Độ mặn được tính bằng phần nghìn (‰). 1‰ tương đương 1 gam muối hòa tan trong 1 lít nước.',
        blocks: [
          {
            title: 'Các mức cần ghi nhớ',
            bullets: [
              'Dưới 1‰: nước an toàn cho đa số cây trồng, có thể lấy nước tưới bình thường.',
              'Từ 1‰ đến dưới 4‰: mức cần theo dõi sát. Lúa giai đoạn mạ và đẻ nhánh bắt đầu bị ảnh hưởng, nhiều loại cây ăn trái xuất hiện hiện tượng cháy mép lá và rụng lá.',
              'Từ 4‰ đến dưới 8‰: nguy cơ thiệt hại nặng. Không bơm nước vào ruộng, vườn; chuyển sang dùng nước ngọt đã trữ.',
              'Từ 8‰ trở lên: nước không còn dùng được cho trồng trọt và không dùng để uống.',
            ],
          },
          {
            title: 'Lưu ý khi áp dụng ngưỡng',
            paragraphs: [
              'Các ngưỡng trên mang tính tham khảo chung. Mức chịu mặn thực tế phụ thuộc vào giống cây, giai đoạn sinh trưởng và điều kiện đất. Bà con nên đối chiếu thêm với hướng dẫn của cơ quan khuyến nông tại địa phương.',
            ],
          },
        ],
      },
      {
        heading: 'Hướng dẫn xử lý cho nông hộ',
        blocks: [
          {
            title: 'Trước khi mặn lên',
            bullets: [
              'Trữ nước ngọt vào ao, bể hoặc túi chứa khi nguồn nước còn đảm bảo.',
              'Kiểm tra, sửa chữa cống, đập và bờ bao; chuẩn bị sẵn vật liệu để đắp đập tạm khi cần.',
              'Điều chỉnh lịch xuống giống để tránh đợt mặn cao điểm; chỉ gieo sạ khi đã có mưa hoặc nguồn nước ngọt ổn định.',
              'Ưu tiên giống chịu mặn do địa phương khuyến cáo ở những vùng thường xuyên bị ảnh hưởng.',
            ],
          },
          {
            title: 'Khi độ mặn vượt ngưỡng',
            bullets: [
              'Đóng cống lấy nước, ngừng bơm cho tới khi độ mặn xuống dưới 1‰.',
              'Dùng nước ngọt đã trữ để tưới cho cây còn non, cây ăn trái và rau màu.',
              'Phủ gốc bằng rơm, cỏ khô để hạn chế bốc hơi và giảm muối tích tụ ở bề mặt đất.',
              'Đối với ao nuôi, kiểm tra độ mặn thường xuyên và điều chỉnh mật độ, lượng thức ăn theo khuyến cáo kỹ thuật.',
            ],
          },
          {
            title: 'Sau đợt mặn',
            bullets: [
              'Tranh thủ nước ngọt hoặc mưa để rửa mặn, xả tràn rồi thoát nước, lặp lại nhiều lần nếu cần.',
              'Bổ sung phân hữu cơ, vôi theo hướng dẫn để cải tạo đất.',
              'Ghi nhận diện tích bị thiệt hại, chụp ảnh và báo với Ủy ban nhân dân xã để được xem xét hỗ trợ.',
            ],
          },
        ],
      },
      {
        heading: 'Theo dõi trên hệ thống Delta Stress Lens',
        blocks: [
          {
            paragraphs: [
              'Sau khi đăng nhập, bà con mở mục Bản đồ rủi ro để xem độ mặn mới nhất của từng tỉnh do cơ quan quản lý cập nhật. Mỗi tỉnh được tô màu theo mức rủi ro và có khuyến cáo đi kèm. Khi cần hỏi thêm, bà con có thể nhắn trực tiếp cho cơ quan quản lý trong mục Tin nhắn.',
              'Bản tin này cung cấp hướng dẫn chung theo ngưỡng độ mặn. Số liệu quan trắc thực tế của từng tỉnh luôn được ưu tiên tham khảo trên bản đồ.',
            ],
          },
        ],
      },
    ],
    faq: [
      { q: 'Độ mặn bao nhiêu thì lúa bị hại?', a: 'Lúa bắt đầu chịu ảnh hưởng từ khoảng 1‰, đặc biệt ở giai đoạn mạ và đẻ nhánh. Từ 4‰ trở lên nguy cơ thiệt hại nặng. Mức chịu mặn cụ thể còn phụ thuộc giống lúa và thời điểm sinh trưởng.' },
      { q: 'Làm sao biết nước kênh đang mặn hay không?', a: 'Dùng máy đo độ mặn hoặc khúc xạ kế cầm tay. Nên đo vào lúc triều lên và lúc triều xuống vì độ mặn thay đổi theo con nước. Không nên nếm thử nước để đánh giá.' },
      { q: 'Mặn đã rút thì có trồng lại ngay được không?', a: 'Chưa nên vội. Cần rửa mặn ruộng bằng nước ngọt hoặc nước mưa, sau đó kiểm tra lại độ mặn của nước và đất trước khi gieo trồng.' },
      { q: 'Cây ăn trái có bị ảnh hưởng không?', a: 'Có. Nhiều loại cây ăn trái nhạy cảm với muối hơn lúa, thường biểu hiện cháy mép lá, rụng lá và giảm đậu trái. Cần ưu tiên tưới bằng nước ngọt đã trữ khi nguồn nước kênh có độ mặn cao.' },
      { q: 'Tôi bị thiệt hại do mặn thì báo cho ai?', a: 'Bà con báo với Ủy ban nhân dân xã hoặc cán bộ khuyến nông địa phương, kèm hình ảnh và diện tích bị ảnh hưởng. Có thể gọi hotline của hệ thống để được hướng dẫn thủ tục.' },
    ],
  },

  // =====================================================================================
  {
    slug: 'stress-nhiet-nang-nong',
    category: 'NHIỆT',
    tone: 'heat',
    title: 'Nắng nóng kéo dài: bảo vệ cây trồng, ao nuôi và vật nuôi',
    summary: 'Nhiệt độ cao liên tục làm lúa lép hạt, cá tôm thiếu oxy và gia súc giảm ăn. Bài viết hướng dẫn nhận biết sớm và các biện pháp giảm thiệt hại.',
    image: '/images/news/nhiet.jpg',
    imageAlt: 'Ruộng lúa dưới nắng gắt vùng đầu nguồn Đồng bằng sông Cửu Long',
    updatedAt: '2026-10-22',
    readMinutes: 5,
    sections: [
      {
        heading: 'Stress nhiệt là gì',
        blocks: [
          {
            paragraphs: [
              'Stress nhiệt là tình trạng cây trồng, vật nuôi và con người phải chịu nhiệt độ vượt quá mức cơ thể có thể thích nghi. Khi đó cây giảm quang hợp, héo lá, rụng hoa; vật nuôi giảm ăn, thở nhanh; nước ao nóng lên làm giảm lượng oxy hòa tan.',
              'Ở các tỉnh đầu nguồn như An Giang, Đồng Tháp và vùng ven biển ít bóng che, nắng nóng kéo dài thường làm tình trạng này nặng hơn.',
            ],
          },
        ],
      },
      {
        heading: 'Các mức nhiệt cần chú ý',
        intro: 'Hệ thống dùng nhiệt độ không khí cao nhất trong ngày để phân mức cảnh báo.',
        blocks: [
          {
            bullets: [
              'Dưới 35°C: bình thường.',
              'Từ 35°C đến dưới 37°C: nắng nóng. Cần tăng cường tưới nước và che nắng cho cây non.',
              'Từ 37°C đến dưới 39°C: nắng nóng gay gắt. Hạn chế làm việc ngoài trời từ 10 giờ đến 15 giờ.',
              'Từ 39°C trở lên: nắng nóng đặc biệt gay gắt. Ưu tiên bảo vệ sức khỏe con người và vật nuôi trước.',
            ],
          },
        ],
      },
      {
        heading: 'Ảnh hưởng và biện pháp theo từng đối tượng',
        blocks: [
          {
            title: 'Lúa và rau màu',
            paragraphs: ['Giai đoạn trổ bông và phơi màu rất nhạy cảm với nhiệt độ. Nhiệt độ trên khoảng 35°C vào thời điểm này dễ làm hạt lép.'],
            bullets: [
              'Giữ nước trong ruộng ở mức phù hợp để làm mát vùng rễ.',
              'Tưới vào sáng sớm hoặc chiều mát, tránh tưới giữa trưa.',
              'Che lưới hoặc phủ gốc cho rau màu và cây con.',
            ],
          },
          {
            title: 'Ao nuôi thủy sản',
            paragraphs: ['Nước nóng làm giảm oxy hòa tan, khiến tôm cá nổi đầu, giảm ăn và dễ mắc bệnh.'],
            bullets: [
              'Tăng thời gian chạy quạt nước, sục khí, nhất là ban đêm và gần sáng.',
              'Giảm lượng thức ăn, cho ăn vào lúc mát.',
              'Giữ mực nước ao cao hơn bình thường để hạn chế biến động nhiệt.',
            ],
          },
          {
            title: 'Gia súc, gia cầm',
            bullets: [
              'Bố trí chuồng thoáng, có mái che, dùng quạt hoặc phun sương làm mát.',
              'Cung cấp đủ nước sạch, có thể bổ sung điện giải và vitamin C theo hướng dẫn của thú y.',
              'Cho ăn vào sáng sớm và chiều tối, tránh vận chuyển vật nuôi vào buổi trưa.',
            ],
          },
        ],
      },
      {
        heading: 'Bảo vệ sức khỏe người lao động',
        blocks: [
          {
            bullets: [
              'Tránh làm việc ngoài đồng từ 10 giờ đến 15 giờ; nghỉ giải lao thường xuyên ở nơi có bóng mát.',
              'Uống đủ nước, mang theo nước uống khi ra đồng.',
              'Nhận biết dấu hiệu say nắng: chóng mặt, buồn nôn, da nóng đỏ, đau đầu. Đưa người bệnh vào nơi mát, làm mát cơ thể và đến cơ sở y tế gần nhất nếu không đỡ.',
            ],
          },
        ],
      },
    ],
    faq: [
      { q: 'Nhiệt độ nào thì lúa bị lép hạt?', a: 'Khi lúa đang trổ bông và phơi màu, nhiệt độ cao hơn khoảng 35°C có thể làm giảm khả năng thụ phấn và gây lép hạt. Mức ảnh hưởng còn tùy giống và độ ẩm.' },
      { q: 'Có nên tưới nước giữa trưa nắng để làm mát cây không?', a: 'Không nên. Tưới giữa trưa dễ làm sốc nhiệt rễ và lãng phí nước do bốc hơi nhanh. Nên tưới vào sáng sớm hoặc chiều mát.' },
      { q: 'Dấu hiệu nào cho thấy ao nuôi đang thiếu oxy do nóng?', a: 'Tôm cá nổi đầu, tập trung gần mặt nước hoặc quanh quạt, bỏ ăn, nước đổi màu. Cần bật quạt, sục khí ngay và giảm cho ăn.' },
      { q: 'Số liệu nhiệt độ trên bản đồ là nhiệt độ gì?', a: 'Là nhiệt độ không khí cao nhất trong ngày tại khu vực quan trắc do cơ quan quản lý cập nhật. Nhiệt độ thực tế trên ruộng có thể chênh lệch vài độ.' },
    ],
  },

  // =====================================================================================
  {
    slug: 'rui-ro-lu-trieu-cuong',
    category: 'LŨ',
    tone: 'flood',
    title: 'Rủi ro lũ và triều cường: chuẩn bị trước khi nước lên',
    summary: 'Mùa lũ ở Đồng bằng sông Cửu Long kéo dài từ tháng 7 đến tháng 11, cuối năm còn có triều cường. Hãy chuẩn bị bờ bao, máy bơm và phương án di dời từ sớm.',
    image: '/images/news/lu.jpg',
    imageAlt: 'Nước dâng cao trên đồng ruộng và đường làng trong mùa lũ',
    updatedAt: '2026-10-22',
    readMinutes: 6,
    sections: [
      {
        heading: 'Đặc điểm lũ và triều cường ở Đồng bằng sông Cửu Long',
        blocks: [
          {
            title: 'Mùa lũ',
            paragraphs: [
              'Lũ ở Đồng bằng sông Cửu Long chủ yếu do nước sông Mê Công từ thượng nguồn đổ về. Mùa lũ thường kéo dài từ khoảng tháng 7 đến tháng 11, đỉnh lũ thường rơi vào tháng 9 và tháng 10, rõ nhất ở các tỉnh đầu nguồn như An Giang và Đồng Tháp.',
              'Lũ cũng mang lại phù sa và nguồn lợi thủy sản, nhưng khi nước lên nhanh hoặc đúng lúc lúa sắp thu hoạch, thiệt hại có thể rất lớn.',
            ],
          },
          {
            title: 'Triều cường',
            paragraphs: [
              'Vào cuối năm, triều cường kết hợp với gió chướng có thể làm nước dâng cao tại các vùng ven sông, ven biển và khu vực đô thị thấp như Cần Thơ. Triều cường thường mạnh hơn vào những ngày rằm và cuối tháng âm lịch.',
            ],
          },
        ],
      },
      {
        heading: 'Mức ngập và tác động',
        blocks: [
          {
            bullets: [
              'Dưới 10 cm: gần như không ảnh hưởng, nhưng cần theo dõi nếu mưa lớn kéo dài.',
              'Từ 10 cm đến dưới 30 cm: bắt đầu ảnh hưởng đến rau màu và vườn cây thấp. Cần khơi thông mương thoát nước.',
              'Từ 30 cm đến dưới 60 cm: gây hại hoa màu, giao thông khó khăn. Cần chạy bơm tiêu và gia cố bờ bao.',
              'Từ 60 cm trở lên: rất nguy hiểm cho người và tài sản. Thực hiện phương án di dời khi chính quyền địa phương yêu cầu.',
            ],
          },
        ],
      },
      {
        heading: 'Hướng dẫn chuẩn bị và ứng phó',
        blocks: [
          {
            title: 'Trước khi nước lên',
            bullets: [
              'Kiểm tra, gia cố bờ bao, đê bao; chuẩn bị bao cát và máy bơm.',
              'Thu hoạch sớm những diện tích đã chín khi dự báo nước lên nhanh.',
              'Di dời gia súc, gia cầm, vật tư, thiết bị điện lên nơi cao.',
              'Cất giấy tờ quan trọng, thuốc men và đồ dùng thiết yếu vào túi chống nước.',
              'Lưu sẵn số điện thoại của trưởng ấp, Ủy ban nhân dân xã và hotline hỗ trợ.',
            ],
          },
          {
            title: 'Trong thời gian nước dâng',
            bullets: [
              'Ngắt cầu dao điện ở những khu vực nước có thể tràn vào nhà.',
              'Không cho trẻ em chơi gần sông, kênh; không đi qua nơi nước chảy xiết.',
              'Chỉ dùng nước đã đun sôi hoặc đã xử lý để uống.',
              'Theo dõi thông báo của chính quyền địa phương và hệ thống.',
            ],
          },
          {
            title: 'Sau khi nước rút',
            bullets: [
              'Vệ sinh nhà cửa, chuồng trại; khử trùng bằng vôi hoặc chất khử trùng phù hợp.',
              'Kiểm tra hệ thống điện trước khi sử dụng lại.',
              'Ghi nhận thiệt hại, chụp ảnh và báo với Ủy ban nhân dân xã.',
              'Phòng bệnh sau lũ: tiêu chảy, bệnh ngoài da, sốt xuất huyết do ứ đọng nước.',
            ],
          },
        ],
      },
    ],
    faq: [
      { q: 'Khi nào mùa lũ ở Đồng bằng sông Cửu Long bắt đầu và kết thúc?', a: 'Mùa lũ thường từ khoảng tháng 7 đến tháng 11, đỉnh lũ vào tháng 9 và tháng 10. Thời gian cụ thể thay đổi theo từng năm tùy lượng nước thượng nguồn.' },
      { q: 'Triều cường khác lũ như thế nào?', a: 'Lũ do nước từ thượng nguồn đổ về, lên chậm và kéo dài nhiều tuần. Triều cường do thủy triều kết hợp gió và nước dâng ven biển, lên nhanh theo con nước và thường rút sau vài giờ.' },
      { q: 'Mức ngập bao nhiêu thì cần di dời?', a: 'Khi mức ngập từ 60 cm trở lên hoặc khi chính quyền địa phương yêu cầu. Người già, trẻ em và người bệnh nên được di chuyển sớm, không chờ nước lên cao.' },
      { q: 'Tôi muốn biết mức ngập tại tỉnh của mình thì xem ở đâu?', a: 'Đăng nhập, vào mục Bản đồ rủi ro và chọn tỉnh của bạn. Chỉ số Mức ngập hiển thị theo số liệu mới nhất do cơ quan quản lý cập nhật.' },
    ],
  },

  // =====================================================================================
  {
    slug: 'canh-bao-chat-luong-nuoc',
    category: 'CẢNH BÁO',
    tone: 'alert',
    title: 'Cảnh báo chất lượng nước: nhận biết và xử lý nguồn nước ô nhiễm',
    summary: 'Nước kênh, rạch bị ô nhiễm có thể gây chết tôm cá, hại cây trồng và ảnh hưởng sức khỏe. Bài viết giúp bà con nhận biết sớm và xử lý đúng cách.',
    image: '/images/news/canh-bao.jpg',
    imageAlt: 'Kênh rạch có nước đục và rác thải ở vùng nông thôn Đồng bằng sông Cửu Long',
    updatedAt: '2026-10-22',
    readMinutes: 5,
    sections: [
      {
        heading: 'Chỉ số chất lượng nước (WQI)',
        blocks: [
          {
            paragraphs: [
              'Hệ thống dùng chỉ số chất lượng nước WQI với thang điểm từ 0 đến 100. Điểm càng cao thì nước càng sạch, khác với các chỉ số mặn, nhiệt và ngập là số càng lớn thì càng nguy hiểm.',
            ],
            bullets: [
              'Từ 76 điểm trở lên: chất lượng tốt, phù hợp cho hầu hết mục đích.',
              'Từ 51 đến 75 điểm: trung bình, dùng được cho tưới tiêu nhưng nên theo dõi.',
              'Từ 26 đến 50 điểm: kém, cần hạn chế sử dụng cho ao nuôi và sinh hoạt.',
              'Dưới 26 điểm: ô nhiễm nặng, không nên sử dụng.',
            ],
          },
        ],
      },
      {
        heading: 'Nguyên nhân thường gặp',
        blocks: [
          {
            bullets: [
              'Nước thải sinh hoạt và chăn nuôi xả trực tiếp ra kênh rạch.',
              'Chất thải từ ao nuôi thủy sản khi không được xử lý.',
              'Dư lượng phân bón và thuốc bảo vệ thực vật chảy từ ruộng ra kênh.',
              'Nước thải từ cơ sở chế biến, sản xuất.',
              'Nước mặn, nước phèn tràn vào khi vận hành cống không đúng lúc.',
            ],
          },
        ],
      },
      {
        heading: 'Dấu hiệu nhận biết nguồn nước có vấn đề',
        blocks: [
          {
            bullets: [
              'Nước đổi màu bất thường: đen, xanh đậm, đỏ nâu hoặc đục nhiều.',
              'Có mùi hôi, mùi trứng thối hoặc mùi hóa chất.',
              'Xuất hiện váng, bọt hoặc nhiều rác nổi.',
              'Cá tôm nổi đầu, chết rải rác hoặc bỏ ăn.',
              'Cây trồng tưới bằng nước này bị vàng lá, cháy lá.',
            ],
          },
        ],
      },
      {
        heading: 'Cách xử lý',
        blocks: [
          {
            title: 'Đối với nước sinh hoạt',
            bullets: [
              'Không dùng nước nghi ô nhiễm để uống, nấu ăn hoặc rửa rau sống.',
              'Lắng nước bằng phèn theo hướng dẫn, lọc qua lớp cát, sỏi, than rồi đun sôi trước khi uống.',
              'Tìm nguồn nước thay thế như nước mưa hoặc nước máy khi cần.',
            ],
          },
          {
            title: 'Đối với ao nuôi và ruộng',
            bullets: [
              'Tạm ngừng lấy nước từ nguồn nghi ô nhiễm.',
              'Tăng sục khí, dùng chế phẩm vi sinh xử lý nước theo khuyến cáo kỹ thuật.',
              'Khi tôm cá chết bất thường, không vứt xuống kênh; thu gom và chôn lấp, rắc vôi theo hướng dẫn thú y thủy sản.',
            ],
          },
          {
            title: 'Báo cáo sự cố',
            bullets: [
              'Thông báo cho trưởng ấp hoặc Ủy ban nhân dân xã ngay khi phát hiện nguồn nước có dấu hiệu ô nhiễm.',
              'Chụp ảnh, ghi lại vị trí và thời điểm để cơ quan chức năng kiểm tra.',
              'Nhắn cho cơ quan quản lý trong mục Tin nhắn hoặc gọi hotline hỗ trợ của hệ thống.',
            ],
          },
        ],
      },
    ],
    faq: [
      { q: 'WQI thấp nghĩa là gì?', a: 'WQI càng thấp thì nước càng ô nhiễm. Dưới 51 điểm là mức kém trở xuống, cần hạn chế dùng cho ao nuôi và sinh hoạt.' },
      { q: 'Có thể dùng nước kênh bị ô nhiễm để tưới rau không?', a: 'Không nên, đặc biệt với rau ăn lá và rau ăn sống. Chất ô nhiễm và vi sinh vật có thể bám vào rau và ảnh hưởng sức khỏe người ăn.' },
      { q: 'Nước đục có phải là nước ô nhiễm không?', a: 'Không phải lúc nào cũng vậy. Mùa lũ nước đục do phù sa. Cần xem thêm mùi, váng, bọt và phản ứng của tôm cá, cây trồng để đánh giá.' },
      { q: 'Tôm cá chết hàng loạt thì phải làm gì trước tiên?', a: 'Ngừng cấp nước và cho ăn, tăng sục khí, báo ngay cho cán bộ thú y thủy sản hoặc Ủy ban nhân dân xã. Không xả nước hoặc vứt xác tôm cá ra kênh chung.' },
    ],
  },

  // =====================================================================================
  {
    slug: 'huong-dan-doc-so-lieu',
    category: 'DỮ LIỆU',
    tone: 'data',
    title: 'Hướng dẫn đọc số liệu quan trắc trên hệ thống',
    summary: 'Số liệu của 13 tỉnh, thành do cơ quan quản lý cập nhật và hiển thị ngay trên bản đồ. Bài viết giải thích cách đọc màu sắc, các chỉ số và giới hạn của số liệu.',
    image: '/images/news/du-lieu.jpg',
    imageAlt: 'Toàn cảnh sông nước Đồng bằng sông Cửu Long nhìn từ trên cao',
    updatedAt: '2026-10-22',
    readMinutes: 5,
    sections: [
      {
        heading: 'Số liệu đến từ đâu',
        blocks: [
          {
            paragraphs: [
              'Cán bộ cơ quan quản lý nhập số liệu quan trắc cho từng tỉnh, thành thuộc Đồng bằng sông Cửu Long, gồm Long An, Tiền Giang, Bến Tre, Trà Vinh, Vĩnh Long, Đồng Tháp, An Giang, Kiên Giang, Cần Thơ, Hậu Giang, Sóc Trăng, Bạc Liêu và Cà Mau.',
              'Ngay sau khi lưu, số liệu mới hiển thị trên Bản đồ rủi ro của nông dân mà không cần tải lại trang. Mỗi lần nhập đều được lưu lịch sử để theo dõi diễn biến.',
            ],
          },
        ],
      },
      {
        heading: 'Bốn chỉ số theo dõi',
        blocks: [
          { title: 'Độ mặn (‰)', paragraphs: ['Nồng độ muối trong nước. Từ 1‰ cần theo dõi, từ 4‰ nguy cơ thiệt hại nặng cho lúa.'] },
          { title: 'Nhiệt độ (°C)', paragraphs: ['Nhiệt độ không khí cao nhất trong ngày. Từ 35°C là nắng nóng, từ 39°C là đặc biệt gay gắt.'] },
          { title: 'Mức ngập (cm)', paragraphs: ['Độ sâu nước ngập tại khu vực quan trắc. Từ 30 cm bắt đầu gây hại hoa màu.'] },
          { title: 'Chất lượng nước (WQI)', paragraphs: ['Thang điểm 0 đến 100, điểm càng cao nước càng sạch. Dưới 51 điểm là mức kém trở xuống.'] },
        ],
      },
      {
        heading: 'Cách đọc màu sắc trên bản đồ',
        blocks: [
          {
            bullets: [
              'Màu xanh lá: mức thấp, an toàn.',
              'Màu vàng: mức trung bình, cần theo dõi.',
              'Màu cam: mức cao, cần có biện pháp phòng ngừa.',
              'Màu đỏ: mức rất cao, cần hành động ngay.',
              'Màu xám: chưa có số liệu cho tỉnh này.',
            ],
          },
          {
            title: 'Mức tổng hợp',
            paragraphs: ['Khi xem chế độ Tổng hợp, màu của tỉnh là mức cao nhất trong bốn chỉ số. Một chỉ số ở mức rất cao đã đủ để tỉnh được tô màu đỏ.'],
          },
        ],
      },
      {
        heading: 'Giới hạn cần lưu ý',
        blocks: [
          {
            bullets: [
              'Số liệu đại diện cho điểm hoặc khu vực quan trắc, không thay thế việc đo trực tiếp tại ruộng, ao của bạn.',
              'Thời điểm cập nhật được ghi ngay trên từng tỉnh. Số liệu càng cũ thì càng cần thận trọng.',
              'Nhãn Số liệu mẫu cho biết đây là dữ liệu minh họa, chưa phải số liệu thực do cơ quan quản lý nhập.',
              'Khuyến cáo trên hệ thống mang tính hướng dẫn chung; khi cần quyết định quan trọng hãy hỏi cán bộ khuyến nông địa phương.',
            ],
          },
        ],
      },
    ],
    faq: [
      { q: 'Số liệu được cập nhật bao lâu một lần?', a: 'Tùy lịch quan trắc của cơ quan quản lý. Mỗi tỉnh hiển thị rõ thời điểm cập nhật gần nhất. Hệ thống tự làm mới bản đồ khi có số liệu mới.' },
      { q: 'Vì sao tỉnh của tôi chưa có số liệu?', a: 'Cơ quan quản lý chưa nhập số liệu cho tỉnh đó. Bà con có thể nhắn trong mục Tin nhắn để đề nghị cập nhật.' },
      { q: 'Số liệu mẫu là gì?', a: 'Là dữ liệu minh họa để bản đồ có nội dung khi chưa có số liệu thật. Số liệu mẫu được gắn nhãn và sẽ được thay thế khi cơ quan quản lý nhập số liệu thực.' },
      { q: 'Tôi có nhận được thông báo khi chỉ số ở mức cao không?', a: 'Có. Khi cơ quan quản lý chọn gửi thông báo, nội dung số liệu và khuyến cáo sẽ xuất hiện trong mục Tin nhắn, phần Thông báo chung.' },
    ],
  },
];

export const getArticle = (slug: string) => NEWS.find((a) => a.slug === slug);
