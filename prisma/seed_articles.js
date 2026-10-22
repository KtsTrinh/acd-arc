const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const articles = [
  // =========================================================================
  // NHÓM 1: NHÀ PHỐ MẶT TIỀN HƯỚNG TÂY (CHỐNG NÓNG, LAM CHẮN NẮNG, CÂY XANH)
  // =========================================================================
  {
    title: "Giải Pháp Xử Lý Nhà Phố Mặt Tiền Hướng Tây 4 Tầng Tại Cầu Giấy, Hà Nội",
    slug: "giai-phap-nha-pho-mat-tien-huong-tay-4-tang-cau-giay-ha-noi",
    excerpt: "Thiết kế hệ lam nhôm xoay đa góc kết hợp ban công giật cấp tạo lớp đệm nhiệt, giảm 6 độ C cho nhà phố hướng chính Tây tại ngõ lớn Cầu Giấy.",
    coverUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
    views: 1240,
    tags: ["nha-pho", "mat-tien-huong-tay", "hien-dai", "ha-noi", "phong-thuy-hop-menh"],
    content: `### 1. Thách thức khu đất hướng chính Tây tại Hà Nội
Ngôi nhà tọa lạc tại quận Cầu Giấy với diện tích 5x18m, mặt tiền đón trọn luồng bức xạ mặt trời gay gắt từ 12h trưa đến 17h chiều trong mùa hè miền Bắc. Yêu cầu của gia chủ (mệnh Hỏa) là vừa phải mát mẻ, tiết kiệm điện năng điều hòa, vừa không bị cảm giác tù túng như bị bọc trong hộp kín.

### 2. Giải pháp kiến trúc vỏ bọc 3 lớp (Triple-Skin)
ACD Studio đã áp dụng giải pháp mặt đứng vỏ bọc ba lớp thông minh:
- **Lớp ngoài cùng**: Hệ lam nhôm hộp vân gỗ composite vát nghiêng 45 độ, vừa cản nắng xiên vừa cho phép gió đối lưu đi vào nhà.
- **Lớp đệm xanh**: Ban công sâu 1.4m trồng các loại cây tán rậm như bàng Đài Loan, tường vi và thảm cúc tần Ấn Độ rủ xuống tạo thành bức rèm sinh học tươi mát.
- **Lớp trong**: Cửa nhôm kính Xingfa hệ lùa với kính phản quang Low-E 2 lớp cách âm, cản 95% tia UV.

### 3. Hiệu quả nhiệt vi khí hậu & Phong thủy hợp mệnh
Nhiệt độ phòng ngủ phía trước giảm trung bình 5-6 độ C so với ngoài trời. Theo phong thủy, gam màu xanh lá cây của vườn ban công kết hợp lam gỗ tạo tương sinh Mộc sinh Hỏa, giúp gia chủ luôn dồi dào sinh khí và cảm giác thư thái khi trở về nhà.`
  },
  {
    title: "Nhà Ống Hướng Tây 5x20m Với Mặt Đứng Bê Tông Trần Và Vườn Treo Tại Long Biên, Hà Nội",
    slug: "nha-ong-huong-tay-5x20m-be-tong-tran-vuon-treo-long-bien-ha-noi",
    excerpt: "Sự kết hợp táo bạo giữa các khối bê tông trần vát chéo và vườn cây lọc bụi cản nắng cho gia đình trẻ tại quận Long Biên.",
    coverUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    views: 980,
    tags: ["nha-pho", "mat-tien-huong-tay", "toi-gian", "ha-noi"],
    content: `### 1. Bối cảnh dự án
Khu đất nằm tại phường Bồ Đề, Long Biên, mặt tiền hướng Tây Nam chịu nắng nóng gay gắt vào buổi chiều và khói bụi xe cộ. Gia chủ yêu thích vẻ đẹp mộc mạc, bền vững của bê tông trần (brutalist architecture) kết hợp thảm thực vật tự nhiên.

### 2. Thiết kế khối vòm vát che nắng
Thay vì các ô cửa sổ kính phẳng thông thường, các KTS thiết kế các khối ban công hộp vát chéo 30 độ. Khi mặt trời lặn về hướng Tây, các cạnh vát này tự tạo bóng đổ lên bề mặt kính cửa phòng, giảm bức xạ nhiệt trực tiếp lên tới 70%.

### 3. Vườn cây treo lọc bụi
Mỗi tầng đều có bồn cây âm sàn trồng cây nguyệt quế và hoa giấy trắng. Hệ tưới nhỏ giọt tự động hẹn giờ giúp cây luôn xanh tốt quanh năm mà gia chủ không mất nhiều công chăm sóc.`
  },
  {
    title: "Mặt Tiền Gạch Bông Gió Hạ Nhiệt Cho Nhà Phố Hướng Tây Tại Tây Hồ, Hà Nội",
    slug: "mat-tien-gach-bong-gio-ha-nhiet-nha-pho-huong-tay-tay-ho-ha-noi",
    excerpt: "Ứng dụng gạch hoa gió đất nung truyền thống kết hợp khung thép tiền chế giải quyết triệt để vấn đề nắng nóng hướng Tây ven hồ Tây.",
    coverUrl: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&q=80",
    views: 1120,
    tags: ["nha-pho", "mat-tien-huong-tay", "hien-dai", "ha-noi", "phong-thuy-hop-menh"],
    content: `### 1. Ý tưởng thiết kế gạch hoa gió
Gạch bông gió là vật liệu chống nóng kinh điển của kiến trúc nhiệt đới Việt Nam. Tại căn nhà phố 4 tầng ở ngõ Lạc Long Quân, Tây Hồ, KTS đã xếp hơn 1.200 viên gạch hoa gió trắng tạo thành bức bình phong khổng lồ che chở toàn bộ mặt tiền hướng Tây.

### 2. Hiệu ứng ánh sáng nghệ thuật
Vào ban ngày, ánh nắng xuyên qua các lỗ hoa văn tạo nên những vệt hoa nắng lung linh trên sàn nhà. Đến buổi tối, ánh đèn nội thất hắt ngược ra ngoài biến mặt tiền thành một chiếc đèn lồng khổng lồ ấm áp.

### 3. Yếu tố phong thủy Mệnh Kim
Gạch màu trắng sứ kết hợp kim loại sơn tĩnh điện xám bạc tạo nên trường khí tương hợp cho gia chủ mệnh Kim, vừa vững chãi vừa sáng sủa.`
  },
  {
    title: "Biệt Thự Phố Tân Cổ Điển Hướng Tây Ban Công Con Tiện Tại TP. Bắc Ninh",
    slug: "biet-thu-pho-tan-co-dien-huong-tay-ban-cong-con-tien-tp-bac-ninh",
    excerpt: "Thiết kế mái sảnh vươn xa và hành lang logia đệm sâu 2 mét bảo vệ không gian sống khỏi bức xạ mặt trời Tây Bắc tại trung tâm Bắc Ninh.",
    coverUrl: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80",
    views: 890,
    tags: ["nha-pho", "tan-co", "mat-tien-huong-tay", "bac-ninh"],
    content: `### 1. Phong cách Tân cổ điển thích ứng nhiệt đới
Nhiều người e ngại phong cách Tân cổ điển với nhiều cửa kính sẽ bị hấp nhiệt khi quay mặt về hướng Tây. Dự án tại đường Nguyễn Trãi, TP. Bắc Ninh chứng minh điều ngược lại nhờ giải pháp logia sâu 2m và hệ mái sảnh vòm cổ điển.

### 2. Chi tiết phào chỉ & vật liệu sơn cách nhiệt
Mặt tiền sử dụng sơn hiệu ứng đá tự nhiên kèm phụ gia hạt gốm vi cầu phản xạ nhiệt mặt trời. Các hàng cột Ionic nâng đỡ ban công tầng 2 và 3 vừa tạo vẻ uy nghi vừa là tấm chắn nắng xiên tự nhiên cho các phòng ngủ bên trong.`
  },
  {
    title: "Nhà Ống Hướng Tây 4 Tầng Tại Hạ Long, Quảng Ninh: Đón Gió Vịnh & Cản Nắng Nóng",
    slug: "nha-ong-huong-tay-4-tang-ha-long-quang-ninh-don-gio-vinh",
    excerpt: "Thiết kế mặt đứng louver nhôm hàng hải chống ăn mòn muối biển kết hợp giải pháp thông gió chéo giúp ngôi nhà mát rượi bên bờ biển Bãi Cháy.",
    coverUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
    views: 1050,
    tags: ["nha-pho", "mat-tien-huong-tay", "hien-dai", "quang-ninh", "phong-thuy-hop-menh"],
    content: `### 1. Thách thức kép: Hướng Tây gay gắt và muối biển ăn mòn
Công trình tại khu đô thị ven biển Bãi Cháy vừa chịu nắng gay gắt buổi chiều vừa chịu gió biển có nồng độ muối cao gây oxy hóa vật liệu nhanh chóng.

### 2. Vật liệu nhôm Anodized & Kính Low-E Solar
Toàn bộ hệ lam xoay mặt tiền sử dụng hợp kim nhôm Anodized tiêu chuẩn hàng hải, không bị ăn mòn rỉ sét. Cửa kính hộp 2 lớp phủ lớp Solar Shield chặn bức xạ nhiệt hồng ngoại nhưng giữ trọn tầm nhìn hướng ra vịnh Hạ Long.`
  },
  {
    title: "Giải Pháp Mặt Tiền Double Skin Cho Nhà Phố Hướng Tây Tại Hà Đông, Hà Nội",
    slug: "giai-phap-mat-tien-double-skin-nha-pho-huong-tay-ha-dong-ha-noi",
    excerpt: "Cấu trúc 2 lớp áo thông minh với tấm xi măng sợi đục lỗ CNC và khoảng đệm thông gió tự nhiên giúp nhà phố Hà Đông luôn mát mẻ.",
    coverUrl: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=80",
    views: 870,
    tags: ["nha-pho", "mat-tien-huong-tay", "hien-dai", "ha-noi"],
    content: `### 1. Nguyên lý ống khói nhiệt (Stack effect)
Khoảng hở 60cm giữa lớp vỏ xi măng sợi đục lỗ ngoài cùng và vách kính phòng ngủ bên trong tạo thành luồng đối lưu khí nóng bay lên trên và thoát ra ngoài mái, ngăn nhiệt truyền vào tường nhà.

### 2. Giảm 40% chi phí điện điều hòa
Sau 1 năm vận hành, hóa đơn tiền điện mùa hè của gia đình 5 thành viên giảm hơn 40% so với căn nhà cũ, chứng minh hiệu quả đầu tư bền vững của thiết kế Double Skin.`
  },

  // =========================================================================
  // NHÓM 2: GIẾNG TRỜI LẤY SÁNG & THÔNG GIÓ TỰ NHIÊN CHO NHÀ PHỐ
  // =========================================================================
  {
    title: "Thiết Kế Giếng Trời Thông Tầng Lõi Thang Cho Nhà Ống 4x16m Tại Đống Đa, Hà Nội",
    slug: "thiet-ke-gieng-troi-thong-tang-loi-thang-nha-ong-dong-da-ha-noi",
    excerpt: "Biến lõi cầu thang tối tăm thành trục hút sáng và đối lưu gió tự nhiên cho ngôi nhà ống sâu hun hút giữa phố cổ Đống Đa.",
    coverUrl: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
    views: 1350,
    tags: ["nha-pho", "gieng-troi-lay-sang", "toi-gian", "ha-noi"],
    content: `### 1. Vấn đề thiếu sáng điển hình của nhà ống Hà Nội
Với chiều ngang 4m và chiều sâu 16m kẹp giữa 2 bức tường nhà hàng xóm xây cao, không gian tầng 1 và tầng 2 gần như phải bật đèn 24/24. 

### 2. Giải pháp giếng trời kết hợp thang xương cá
KTS ACD đã dời cầu thang vào giữa nhà, thiết kế dạng thang xương cá thép bậc gỗ sồi không có cổ bậc để ánh sáng từ mái kính trên đỉnh tum rót thẳng xuống đáy giếng trời tầng 1.

### 3. Vườn cây dương xỉ & tiểu cảnh nước đáy giếng
Dưới chân giếng trời là hồ cá mini kết hợp cây khế cảnh và dương xỉ xanh mướt. Hơi nước bốc lên gặp luồng khí nóng thoát ra ở nóc giếng tạo ra vòng tuần hoàn vi khí hậu tự nhiên mát lành.`
  },
  {
    title: "Mái Kính Giếng Trời Tự Động Cảm Biến Mưa Cho Nhà Phố Tại Từ Sơn, Bắc Ninh",
    slug: "mai-kinh-gieng-troi-tu-dong-cam-bien-mua-tu-son-bac-ninh",
    excerpt: "Ứng dụng công nghệ nhà thông minh đóng mở mái kính giếng trời tự động khi trời mưa, đảm bảo đón trọn nắng và gió mát cho nhà phố Từ Sơn.",
    coverUrl: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200&q=80",
    views: 920,
    tags: ["nha-pho", "gieng-troi-lay-sang", "hien-dai", "bac-ninh"],
    content: `### 1. Nỗi lo dột nước và tích nhiệt của giếng trời kính cố định
Nhiều gia chủ e ngại giếng trời kính cố định gây hiệu ứng nhà kính hầm bí vào mùa hè và nguy cơ tạt nước khi gặp mưa rào bất chợt.

### 2. Cơ cấu trượt tự động tích hợp Smart Home
Mái kính dán an toàn 12.38mm gắn motor trượt thông minh kết hợp cảm biến mưa mưa tự đóng sau 5 giây, đồng thời tích hợp app điện thoại cho phép gia chủ mở thông gió từ xa trước khi đi làm về.`
  },
  {
    title: "Nhà Phố 3 Giếng Trời 'Thở Cùng Thiên Nhiên' Tại Nam Từ Liêm, Hà Nội",
    slug: "nha-pho-3-gieng-troi-tho-cung-thien-nhien-nam-tu-liem-ha-noi",
    excerpt: "Bố trí 3 khoảng thông tầng trước - giữa - sau tạo hệ thống đối lưu khí hoàn hảo cho căn nhà phố 5 tầng tại khu đô thị Mỹ Đình.",
    coverUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80",
    views: 1180,
    tags: ["nha-pho", "gieng-troi-lay-sang", "toi-gian", "ha-noi", "phong-thuy-hop-menh"],
    content: `### 1. Triết lý kiến trúc vi khí hậu
Thay vì tối đa hóa mét vuông sàn xây dựng, gia chủ quyết định dành 25% diện tích đất cho 3 giếng trời: giếng trời mặt tiền, giếng trời lõi cầu thang và giếng trời sân sau.

### 2. Sự luân chuyển khí quyển liên tục
Không khí tươi mát đi từ sân trước qua giếng trời giữa nhà và thoát ra ở giếng trời sau tạo dòng chảy khí thông suốt, xóa bỏ hoàn toàn mùi ẩm mốc và sự ngột ngạt thường thấy ở các căn nhà liền kề.`
  },
  {
    title: "Giếng Trời Kết Hợp Vườn Khô Zen Garden Cho Nhà Ống Tại TP. Cẩm Phả, Quảng Ninh",
    slug: "gieng-troi-ket-hop-vuon-kho-zen-garden-cam-pha-quang-ninh",
    excerpt: "Mang tinh thần Nhật Bản vào lòng ngôi nhà ống phố mỏ Cẩm Phả với sỏi trắng, đá cuội tự nhiên và cây tùng la hán đón nắng đỉnh mái.",
    coverUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
    views: 790,
    tags: ["nha-pho", "gieng-troi-lay-sang", "toi-gian", "quang-ninh"],
    content: `### 1. Không gian tĩnh lặng cho gia chủ yêu thiền định
Giếng trời diện tích 2.5x3m được thiết kế như một ốc đảo thiền định tĩnh tại giữa nhịp sống bận rộn. Bề mặt tường được cào nhám thủ công tái hiện vân đá tự nhiên.

### 2. Kỹ thuật lấy sáng tán xạ dịu nhẹ
Kính giếng trời được phủ phim mờ tán xạ ánh sáng, giúp ánh nắng buổi trưa không bị chói mắt mà lan tỏa êm dịu khắp các phòng khách và phòng ăn liền kề.`
  },
  {
    title: "Cải Tạo Nhà Phố Cũ Tăm Tối Thành Không Gian Ngập Tràn Ánh Sáng Tại Ba Đình, Hà Nội",
    slug: "cai-tao-nha-pho-cu-tam-toi-thanh-khong-gian-anh-sang-ba-dinh-ha-noi",
    excerpt: "Hành trình đục sàn bê tông tạo giếng trời 6m2 lột xác căn nhà phố 3 tầng xây từ năm 1995 thành không gian sống hiện đại chuẩn Bắc Âu.",
    coverUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80",
    views: 1420,
    tags: ["nha-pho", "gieng-troi-lay-sang", "hien-dai", "ha-noi"],
    content: `### 1. Hiện trạng ẩm thấp của nhà ống thập niên 90
Căn nhà nằm sâu trong ngõ phố Kim Mã bị ẩm mốc, tường nứt và thiếu sáng trầm trọng khiến sinh hoạt của ba thế hệ gặp nhiều bất tiện.

### 2. Giải pháp cấy khung thép gia cường mở giếng trời
Đội ngũ kỹ sư ACD đã gia cố dầm cột bằng thép hình I-beam, cắt bỏ 6m2 sàn giữa nhà để tạo giếng trời xuyên suốt 3 tầng. Sau cải tạo, ngôi nhà ngập tràn ánh sáng mặt trời tự nhiên và thông thoáng tối đa.`
  },

  // =========================================================================
  // NHÓM 3: NHÀ PHỐ KIẾN TRÚC HIỆN ĐẠI & TỐI GIẢN (MINIMALISM)
  // =========================================================================
  {
    title: "Nhà Phố Tối Giản Phong Cách Japandi 4 Tầng Tại Hoàng Mai, Hà Nội",
    slug: "nha-pho-toi-gian-phong-cach-japandi-4-tang-hoang-mai-ha-noi",
    excerpt: "Sự kết hợp hoàn mỹ giữa vẻ đẹp thanh lịch Scandinavia và tinh thần Wabi-sabi mộc mạc của Nhật Bản trong căn nhà phố Hoàng Mai.",
    coverUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80",
    views: 1100,
    tags: ["nha-pho", "toi-gian", "ha-noi", "phong-thuy-hop-menh"],
    content: `### 1. Định nghĩa phong cách Japandi trong nhà phố
Japandi là sự giao thoa giữa tính công năng gọn gàng của Bắc Âu và sự trân trọng vẻ đẹp tự nhiên không hoàn hảo của Nhật Bản. 

### 2. Bảng màu & vật liệu hữu cơ
Sử dụng gỗ sồi tự nhiên màu sáng, tường sơn vôi trắng kem, vải lanh thô mộc và gốm sứ thủ công Bát Tràng. Mọi đồ đạc thừa thãi đều được cất gọn trong hệ tủ âm tường kịch trần không tay nắm.`
  },
  {
    title: "Nhà Ống Hiện Đại 5 Tầng Có Thang Máy Tại Cầu Giấy, Hà Nội",
    slug: "nha-ong-hien-dai-5-tang-co-thang-may-cau-giay-ha-noi",
    excerpt: "Giải pháp công năng hoàn hảo kết hợp vừa ở vừa làm văn phòng công ty với mặt tiền kính Low-E tràn viền và thang máy kính tròn.",
    coverUrl: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&q=80",
    views: 950,
    tags: ["nha-pho", "hien-dai", "ha-noi"],
    content: `### 1. Mô hình nhà phố kết hợp văn phòng hiện đại
Tầng 1 và 2 dành cho văn phòng làm việc của công ty công nghệ, tầng 3, 4, 5 là không gian sinh hoạt biệt lập, tiện nghi của gia đình chủ doanh nghiệp.

### 2. Thang máy vách kính Panorama
Thang máy kính đặt cạnh giếng trời trung tâm vừa là phương tiện giao thông thuận tiện cho người lớn tuổi vừa là điểm nhấn thị giác đẳng cấp.`
  },
  {
    title: "Nhà Phố Khối Hộp Điêu Khắc Tại Yên Phong, Bắc Ninh",
    slug: "nha-pho-khoi-hop-dieu-khac-yen-phong-bac-ninh",
    excerpt: "Ngôn ngữ kiến trúc hình khối bất đối xứng táo bạo khẳng định cá tính của gia chủ làm trong ngành công nghệ cao tại Yên Phong.",
    coverUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80",
    views: 810,
    tags: ["nha-pho", "hien-dai", "bac-ninh"],
    content: `### 1. Hình khối kiến trúc năng động
Các khối nhà được giật cấp và xoay nhẹ góc 15 độ tạo cảm giác chuyển động đa chiều, khác biệt hoàn toàn với những dãy nhà ống đơn điệu xung quanh.

### 2. Chi tiết chiếu sáng mỹ thuật ban đêm
Hệ đèn LED linear âm rãnh kiến trúc làm nổi bật các đường cắt vát khi màn đêm buông xuống, biến ngôi nhà thành một tác phẩm nghệ thuật ánh sáng đương đại.`
  },
  {
    title: "Nhà Phố Xanh Đa Tầng Bền Vững Tại Uông Bí, Quảng Ninh",
    slug: "nha-pho-xanh-da-tang-ben-vung-uong-bi-quang-ninh",
    excerpt: "Hệ thống pin mặt trời áp mái kết hợp bồn thu gom nước mưa tưới cây tự động tạo nên mô hình nhà phố xanh tự chủ năng lượng tại Uông Bí.",
    coverUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    views: 740,
    tags: ["nha-pho", "hien-dai", "quang-ninh"],
    content: `### 1. Kiến trúc bền vững thực tế
Công trình trang bị hệ thống pin quang điện 8kWp trên mái kính tum, cung cấp đủ 80% nhu cầu điện năng ban ngày cho cả gia đình.

### 2. Vườn rau hữu cơ trên sân thượng
Tầng thượng được quy hoạch thành vườn rau sạch organic bằng chậu ghép thông minh, cung cấp nguồn thực phẩm tươi sạch hàng ngày cho các bữa ăn gia đình.`
  },
  {
    title: "Nhà Phố Tối Giản Monochrome Tone Xám Đen Sang Trọng Tại Tây Hồ, Hà Nội",
    slug: "nha-pho-toi-gian-monochrome-xam-den-tay-ho-ha-noi",
    excerpt: "Vẻ đẹp vượt thời gian của bảng màu đơn sắc xám bê tông, đen huyền bí và kính cường lực đen trong căn nhà phố bên đường Võ Chí Công.",
    coverUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    views: 1290,
    tags: ["nha-pho", "toi-gian", "ha-noi", "phong-thuy-hop-menh"],
    content: `### 1. Triết lý màu sắc hợp Mệnh Thủy
Gia chủ là nhà thiết kế thời trang mệnh Thủy, yêu thích gam màu đen đá bazan và xám khói. Sự tương phản giữa các vật liệu bóng mờ và ánh sáng vàng ấm tạo nên chiều sâu không gian huyền bí và sang trọng.`
  },

  // =========================================================================
  // NHÓM 4: NHÀ PHỐ & CÔNG TRÌNH KIẾN TRÚC TÂN CỔ ĐIỂN (NEOCLASSICAL)
  // =========================================================================
  {
    title: "Nhà Phố Tân Cổ Điển Pháp 5 Tầng Mặt Tiền 6m Tại Hoàn Kiếm, Hà Nội",
    slug: "nha-pho-tan-co-dien-phap-5-tang-mat-tien-6m-hoan-kiem-ha-noi",
    excerpt: "Nét hoa lệ trường tồn của kiến trúc cổ điển Paris giữa lòng phố cổ Hà Nội với phào chỉ xi măng đắp nổi thủ công tinh xảo.",
    coverUrl: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80",
    views: 1380,
    tags: ["nha-pho", "tan-co", "ha-noi"],
    content: `### 1. Tôn trọng cảnh quan di sản phố cổ
Nằm tại tuyến phố trung tâm quận Hoàn Kiếm, công trình tuân thủ nghiêm ngặt quy hoạch chiều cao và màu sắc nhưng vẫn toát lên vẻ quyền quý nhờ hệ mái Mansard ốp ngói đá đen tự nhiên.

### 2. Hoa sắt mỹ thuật đúc đồng nguyên khối
Ban công tầng 2 đến tầng 4 uốn lượn với lan can hoa sắt mạ đồng tinh xảo, chống gỉ sét trong thời tiết nồm ẩm đặc trưng của miền Bắc.`
  },
  {
    title: "Biệt Thự Phố Tân Cổ Điển Mái Mansard Sang Trọng Tại TP. Bắc Ninh",
    slug: "biet-thu-pho-tan-co-dien-mai-mansard-tp-bac-ninh",
    excerpt: "Không gian sống vương giả với sảnh đón ốp đá Marble Tây Ban Nha và đại sảnh thông tầng lộng lẫy tại khu đô thị Him Lam Bắc Ninh.",
    coverUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
    views: 1020,
    tags: ["nha-pho", "tan-co", "bac-ninh"],
    content: `### 1. Cấu trúc đối xứng mẫu mực
Ngôi nhà gây ấn tượng mạnh với hệ thức cột Corinthian đôi đối xứng, phào chỉ chỉn chu và đèn chùm pha lê Baccarat lung linh tại khu vực sảnh chính.`
  },
  {
    title: "Nhà Liền Kề Tân Cổ Điển Tinh Giản (Transitional Neoclassical) Tại Gia Lâm, Hà Nội",
    slug: "nha-lien-ke-tan-co-dien-tinh-gian-gia-lam-ha-noi",
    excerpt: "Lược bỏ những chi tiết rườm rà nặng nề, giữ lại tỷ lệ vàng thanh thoát phù hợp với lối sống hiện đại của gia đình trẻ Vinhomes Ocean Park.",
    coverUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80",
    views: 890,
    tags: ["nha-pho", "tan-co", "ha-noi"],
    content: `### 1. Xu hướng Tân cổ điển tinh giản
Không rườm rà đắp vẽ nhiều lớp, kiến trúc sư chỉ tạo điểm nhấn bằng các đường chỉ bo cong mềm mại và hệ cửa vòm kính khung nhôm cao cấp.`
  },
  {
    title: "Dinh Thự Phố Tân Cổ Điển 4 Tầng View Biển Tại Bãi Cháy, Quảng Ninh",
    slug: "dinh-thu-pho-tan-co-dien-4-tang-view-bien-bai-chay-quang-ninh",
    excerpt: "Biệt thự phố tân cổ điển trắng muốt nổi bật trên đồi Bãi Cháy, phóng tầm mắt ôm trọn kỳ quan thiên nhiên thế giới vịnh Hạ Long.",
    coverUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    views: 1150,
    tags: ["nha-pho", "tan-co", "quang-ninh"],
    content: `### 1. Vị thế đắc địa lưng tựa núi mặt hướng biển
Theo phong thủy, thế đất 'tọa sơn hướng thủy' mang lại vượng khí dồi dào. Gam màu sơn trắng sứ phối mái vòm xanh navy hòa quyện tuyệt vời với biển xanh mây trắng.`
  },

  // =========================================================================
  // NHÓM 5: KIẾN TRÚC & NỘI THẤT PHONG CÁCH INDOCHINE (ĐÔNG DƯƠNG)
  // =========================================================================
  {
    title: "Nhà Phố Phong Cách Indochine Giao Thoa Á - Âu 4 Tầng Tại Ba Đình, Hà Nội",
    slug: "nha-pho-phong-cach-indochine-giao-thoa-a-au-ba-dinh-ha-noi",
    excerpt: "Không gian sống đầy hoài niệm với gạch bông cổ điển, cửa chớp gỗ lim và những đường vòm cong lãng mạn gần hồ Trúc Bạch.",
    coverUrl: "https://images.unsplash.com/photo-1580586287978-32b4a51c8c9a?w=1200&q=80",
    views: 1480,
    tags: ["nha-pho", "indochine", "ha-noi", "phong-thuy-hop-menh"],
    content: `### 1. Dấu ấn kiến trúc Đông Dương giữa lòng Hà Nội
Phong cách Indochine đem lại cảm giác bình yên sâu lắng. Từng viên gạch bông lát sàn được đặt làm thủ công theo hoa văn cổ điển của Pháp đầu thế kỷ 20.

### 2. Gỗ lim tự nhiên và con tiện gỗ
Cầu thang tay vịn gỗ uốn lượn kết hợp hàng con tiện sơn đen mờ, vách ngăn CNC họa tiết kỷ hà và quạt trần cánh gỗ tạo nên bầu không khí phong lưu của người Tràng An.`
  },
  {
    title: "Biệt Thự Phố Indochine Sang Trọng Với Sân Vườn Trong Lòng Phố Tại Bắc Ninh",
    slug: "biet-thu-pho-indochine-sang-trong-san-vuon-bac-ninh",
    excerpt: "Sự kết hợp tinh tế giữa ngói âm dương, tường vàng kem đặc trưng phố cổ và hồ cá Koi thư thái tại trung tâm TP. Bắc Ninh.",
    coverUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
    views: 860,
    tags: ["nha-pho", "indochine", "bac-ninh"],
    content: `### 1. Hồn quê Kinh Bắc trong nét kiến trúc Đông Dương
Gia chủ là người yêu nét văn hóa truyền thống Kinh Bắc. KTS đã khéo léo đưa tranh gốm dân gian Đông Hồ kết hợp cùng nội thất phong cách Indochine gỗ óc chó ấm cúng.`
  },
  {
    title: "Nhà Ống Phong Cách Indochine Hiện Đại Với Giếng Trời Ánh Sáng Tại Thanh Xuân, Hà Nội",
    slug: "nha-ong-indochine-hien-dai-gieng-troi-thanh-xuan-ha-noi",
    excerpt: "Ứng dụng vật liệu mây tre đan và gỗ tự nhiên trong không gian nhà ống 4x18m hiện đại, thoáng mát nhờ giếng trời đón gió.",
    coverUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
    views: 990,
    tags: ["nha-pho", "indochine", "gieng-troi-lay-sang", "ha-noi"],
    content: `### 1. Trẻ hóa phong cách Đông Dương
Không để không gian bị quá nặng nề về chi tiết cổ, thiết kế sử dụng nền tường trắng sáng, các đường nẹp gỗ mảnh mai và đồ nội thất khung mây đan mắt cáo thanh thoát.`
  },
  {
    title: "Villa Nghỉ Dưỡng Phong Cách Indochine Bên Đồi Thông Vân Đồn, Quảng Ninh",
    slug: "villa-nghi-duong-indochine-doi-thong-van-don-quang-ninh",
    excerpt: "Mái hiên rộng rợp bóng mát, sàn gỗ tự nhiên và view rừng thông biển cả tạo nên chốn ẩn mình hoàn hảo cuối tuần tại Vân Đồn.",
    coverUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80",
    views: 930,
    tags: ["nha-vuon", "indochine", "quang-ninh"],
    content: `### 1. Bản giao hưởng giữa rừng và biển
Hệ cửa lá sách gỗ tự nhiên cho phép đón gió biển mát rượi vào mùa hè, kết hợp lò sưởi ốp đá cuội ấm áp trong những ngày đông giá lạnh.`
  },

  // =========================================================================
  // NHÓM 6: THIẾT KẾ NỘI THẤT CAO CẤP (NHÀ PHỐ, CĂN HỘ, PENTHOUSE)
  // =========================================================================
  {
    title: "Nội Thất Căn Hộ Duplex 220m2 Phong Cách Luxury Dark Tại Tây Hồ, Hà Nội",
    slug: "noi-that-can-ho-duplex-220m2-luxury-dark-tay-ho-ha-noi",
    excerpt: "Đá cẩm thạch Nero Marquina đen tia chớp kết hợp kim loại mạ PVD vàng ánh kim và đèn chùm pha lê khẳng định vị thế thượng lưu bên hồ Tây.",
    coverUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
    views: 1520,
    tags: ["noi-that", "toi-gian", "ha-noi", "phong-thuy-hop-menh"],
    content: `### 1. Không gian thông tầng 6 mét choáng ngợp
Phòng khách sở hữu vách đá Marble nguyên tấm cao 6m nhập khẩu từ Ý, kết hợp lò sưởi hơi nước 3D tạo hiệu ứng lửa lung linh huyền ảo.

### 2. Phong thủy hợp Mệnh Thủy & Mệnh Kim
Tông màu đen chủ đạo đại diện cho Thủy quyền năng, kết hợp viền kim loại ánh vàng sáng loáng (Kim sinh Thủy) mang đến vượng tài cho chủ nhân căn penthouse.`
  },
  {
    title: "Thiết Kế Nội Thất Nhà Phố Tân Cổ Điển Nhẹ Nhàng (Neo Classic) Tại Hà Đông, Hà Nội",
    slug: "thiet-ke-noi-that-nha-pho-tan-co-dien-ha-dong-ha-noi",
    excerpt: "Gam màu trắng kem và be nhung ấm cúng phối hợp phào chỉ tường PU tinh tế, đem lại vẻ đẹp thanh lịch vượt thời gian cho nhà phố Văn Quán.",
    coverUrl: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&q=80",
    views: 970,
    tags: ["noi-that", "tan-co", "ha-noi"],
    content: `### 1. Bố cục không gian mở liên hoàn
Phòng khách, bếp và bàn ăn được kết nối mở nhưng phân định khéo léo qua các vòm cong tân cổ điển và hoa văn đá lát sàn mosaic.`
  },
  {
    title: "Nội Thất Căn Hộ Penthouse Tối Giản Scandinavian Tại Cầu Giấy, Hà Nội",
    slug: "noi-that-penthouse-toi-gian-scandinavian-cau-giay-ha-noi",
    excerpt: "Không gian tràn ngập ánh sáng tự nhiên với sàn gỗ sồi xương cá, sofa da bò nhập khẩu Ý và view panorama toàn cảnh thủ đô Hà Nội.",
    coverUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
    views: 1210,
    tags: ["noi-that", "toi-gian", "ha-noi"],
    content: `### 1. Tận hưởng tầm nhìn không giới hạn
Vách kính cong tràn viền mở ra góc nhìn 270 độ ngắm hoàng hôn rực rỡ và thành phố lung linh ánh đèn đêm từ tầng 36.`
  },
  {
    title: "Nội Thất Biệt Thự Gỗ Óc Chó Tự Nhiên Đẳng Cấp Tại TP. Bắc Ninh",
    slug: "noi-that-biet-thu-go-oc-cho-tu-nhien-tp-bac-ninh",
    excerpt: "Toàn bộ nội thất chế tác từ gỗ óc chó Bắc Mỹ (Walnut) vân mây cuộn sóng, khẳng định đẳng cấp xa hoa của gia chủ tại Bắc Ninh.",
    coverUrl: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200&q=80",
    views: 1040,
    tags: ["noi-that", "hien-dai", "bac-ninh", "phong-thuy-hop-menh"],
    content: `### 1. Đẳng cấp từ chất gỗ quý
Gỗ óc chó nhập khẩu có độ bền vĩnh cửu, không cong vênh co ngót, tỏa ra mùi thơm dịu nhẹ và màu nâu chocolate trầm ấm sang trọng.`
  },
  {
    title: "Thiết Kế Phòng Bếp & Đảo Bếp Sang Trọng Bằng Đá Thạch Anh Tại Hạ Long, Quảng Ninh",
    slug: "thiet-ke-phong-bep-dao-bep-da-thach-anh-ha-long-quang-ninh",
    excerpt: "Đảo bếp dài 3.6m ốp đá thạch anh nhân tạo gốc tự nhiên tích hợp bếp từ âm, bồn rửa thác nước và tủ bảo quản rượu vang sang trọng.",
    coverUrl: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&q=80",
    views: 880,
    tags: ["noi-that", "hien-dai", "quang-ninh"],
    content: `### 1. Trái tim của ngôi nhà ven biển
Không gian bếp mở là nơi tụ họp ấm cúng của các thành viên gia đình với đầy đủ thiết bị bếp thông minh nhập khẩu từ Đức.`
  },
  {
    title: "Nội Thất Phong Cách Wabi-Sabi Tinh Tế Cho Nhà Phố 3 Tầng Tại Nam Từ Liêm, Hà Nội",
    slug: "noi-that-wabi-sabi-tinh-te-nha-pho-nam-tu-liem-ha-noi",
    excerpt: "Vẻ đẹp của sự mộc mạc và an yên với tường đất nện cào nhám, bàn trà gỗ nguyên tấm và ánh sáng đèn giấy washi huyền ảo.",
    coverUrl: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1200&q=80",
    views: 940,
    tags: ["noi-that", "toi-gian", "ha-noi"],
    content: `### 1. Chữa lành tâm hồn bằng không gian sống
Wabi-sabi loại bỏ những gì hào nhoáng giả tạo để giữ lại sự chân thật của vật liệu, giúp con người tìm lại sự cân bằng sau ngày dài áp lực.`
  },

  // =========================================================================
  // NHÓM 7: NHÀ VƯỜN SINH THÁI & BIỆT THỰ VƯỜN VEN ĐÔ
  // =========================================================================
  {
    title: "Biệt Thự Nhà Vườn 1 Tầng Mái Thái Đẹp Như Mơ Tại Sóc Sơn, Hà Nội",
    slug: "biet-thu-nha-vuon-1-tang-mai-thai-soc-son-ha-noi",
    excerpt: "Khu vườn rộng 1.200m2 với hồ cá Koi, vườn hồng cổ và đồi cỏ xanh ngát bao quanh căn biệt thự vườn nghỉ dưỡng cuối tuần ở Sóc Sơn.",
    coverUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
    views: 1650,
    tags: ["nha-vuon", "hien-dai", "ha-noi", "phong-thuy-hop-menh"],
    content: `### 1. Rời xa khói bụi thành phố
Chỉ cách trung tâm Hà Nội 45 phút lái xe, ngôi nhà vườn 1 tầng mái ngói dốc là chốn về an yên cho gia đình đa thế hệ sum vầy mỗi dịp cuối tuần.

### 2. Hồ cá Koi & Thác nước phong thủy
Hồ nước dung tích 45 khối uốn quanh phòng khách lớn tạo dòng chảy luân chuyển liên tục, mang lại vượng khí dồi dào và điều hòa không khí mát rượi.`
  },
  {
    title: "Nhà Vườn Sinh Thái Nghỉ Dưỡng Phong Cách Tropical Tại Ba Vì, Hà Nội",
    slug: "nha-vuon-sinh-thai-nghi-duong-tropical-ba-vi-ha-noi",
    excerpt: "Hòa quyện kiến trúc gỗ tre tự nhiên và rừng cây nhiệt đới dưới chân núi Ba Vì linh thiêng, một kiệt tác nghỉ dưỡng sinh thái chữa lành.",
    coverUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80",
    views: 1400,
    tags: ["nha-vuon", "indochine", "ha-noi"],
    content: `### 1. Kiến trúc không xâm lấn tự nhiên
Ngôi nhà được xây dựng trên hệ cọc nâng đỡ, giữ nguyên địa hình dốc đồi tự nhiên và không chặt hạ bất kỳ cây cổ thụ nào trong khuôn viên.`
  },
  {
    title: "Biệt Thự Vườn Cổ Điển Châu Âu 2 Tầng Tại Thuận Thành, Bắc Ninh",
    slug: "biet-thu-vuon-co-dien-chau-au-2-tang-thuan-thanh-bac-ninh",
    excerpt: "Khuôn viên nhà vườn 800m2 phong cách lâu đài Pháp với đài phun nước đá cẩm thạch và lối đi dạo rợp bóng hoa ban tại Thuận Thành.",
    coverUrl: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80",
    views: 920,
    tags: ["nha-vuon", "tan-co", "bac-ninh"],
    content: `### 1. Không gian sống chuẩn nghỉ dưỡng quý tộc
Biệt thự sở hữu bể bơi 4 mùa ngoài trời, chòi vọng cảnh lục giác và vườn cây ăn trái sum suê đặc sản miền Kinh Bắc.`
  },
  {
    title: "Nhà Vườn Nghỉ Dưỡng Lưng Tựa Đồi View Vịnh Tại Tuần Châu, Quảng Ninh",
    slug: "nha-vuon-nghi-duong-lung-tua-doi-view-vinh-tuan-chau-quang-ninh",
    excerpt: "Thiết kế mở 4 mặt với hệ vách kính panorama bắt trọn cảnh hoàng hôn rực rỡ buông xuống vịnh Tuần Châu, Hạ Long.",
    coverUrl: "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=1200&q=80",
    views: 1110,
    tags: ["nha-vuon", "hien-dai", "quang-ninh", "phong-thuy-hop-menh"],
    content: `### 1. Kết nối không gian nội - ngoại thất
Bể bơi tràn bờ nước mặn nối liền với sàn gỗ teak ngoài trời, tạo cảm giác mặt nước như hòa vào làn sóng biển Hạ Long ở phía chân trời xa.`
  },
  {
    title: "Mô Hình Nhà Vườn Kết Hợp Nông Trại Xanh (Farmstay) Tại Đông Anh, Hà Nội",
    slug: "mo-hinh-nha-vuon-nong-trai-xanh-farmstay-dong-anh-ha-noi",
    excerpt: "Không gian sống kết hợp trải nghiệm trồng rau hữu cơ, nuôi gà thảo mộc và bể bơi sinh thái cho trẻ nhỏ vui đùa tại huyện Đông Anh.",
    coverUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
    views: 1250,
    tags: ["nha-vuon", "toi-gian", "ha-noi"],
    content: `### 1. Giáo dục con trẻ gắn kết thiên nhiên
Thay vì cắm mặt vào màn hình điện thoại, các em nhỏ được tự tay thu hoạch cà chua, bắt cá và tận hưởng tuổi thơ trong trẻo giữa vườn cây xanh ngát.`
  },

  // =========================================================================
  // NHÓM 8: PHÂN TÍCH CHUYÊN SÂU GIẢI PHÁP KỸ THUẬT & PHONG THỦY NGŨ HÀNH
  // =========================================================================
  {
    title: "Bí Quyết Chọn Hướng Bếp & Đặt Bàn Thờ Hợp Mệnh Gia Chủ Trong Nhà Phố Hiện Đại",
    slug: "bi-quyet-chon-huong-bep-dat-ban-tho-hop-menh-nha-pho",
    excerpt: "Nguyên tắc tọa hung hướng cát trong phong thủy Bát Trạch ứng dụng cho nhà ống hẹp ngang, mang lại tài lộc và gia đạo bình an.",
    coverUrl: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&q=80",
    views: 1720,
    tags: ["phong-thuy-hop-menh", "nha-pho", "ha-noi"],
    content: `### 1. Nguyên lý Tọa Hung Hướng Cát
Bếp là nơi đốt cháy những luồng khí xấu nên cần đặt ở cung hung và nhìn về cung tốt (hướng cát) theo quái mệnh của gia chủ.

### 2. Tránh các lỗi kiêng kỵ thường gặp
Không đặt bếp đối diện cửa nhà vệ sinh, không đặt bếp dưới gầm cầu thang tăm tối và không để xà ngang đè lên trên bếp nấu.`
  },
  {
    title: "So Sánh 4 Loại Lam Chắn Nắng Mặt Tiền Nhà Hướng Tây Tốt Nhất Hiện Nay",
    slug: "so-sanh-4-loai-lam-chan-nang-mat-tien-nha-huong-tay",
    excerpt: "Đánh giá chi tiết ưu nhược điểm, độ bền và chi phí giữa lam nhôm, lam gỗ nhựa composite, lam bê tông trần và lam gốm nung.",
    coverUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
    views: 1530,
    tags: ["mat-tien-huong-tay", "nha-pho", "hien-dai"],
    content: `### 1. Bảng so sánh vật liệu chắn nắng
- **Lam nhôm sơn tĩnh điện**: Siêu nhẹ, độ bền 25 năm, xoay được góc thông minh nhưng chi phí cao.
- **Lam gỗ nhựa composite**: Thẩm mỹ mộc mạc ấm áp, cách nhiệt tốt, chi phí tầm trung.
- **Lam bê tông trần**: Bền vững vĩnh viễn, vẻ đẹp điêu khắc cá tính nhưng tải trọng nặng cần tính toán kết cấu kỹ lưỡng.
- **Lam gạch hoa gió đất nung**: Chi phí tiết kiệm nhất, thân thiện môi trường, giữ nét truyền thống.`
  },
  {
    title: "Kích Thước Vàng Của Giếng Trời Nhà Ống Để Không Bị Bẫy Nhiệt Mùa Hè",
    slug: "kich-thuoc-vang-gieng-troi-nha-ong-tranh-bay-nhiet-mua-he",
    excerpt: "Cách tính toán tỷ lệ diện tích giếng trời theo quy chuẩn xây dựng, giải pháp thông gió đỉnh mái và chống chói hiệu quả cho nhà phố.",
    coverUrl: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
    views: 1610,
    tags: ["gieng-troi-lay-sang", "nha-pho", "toi-gian"],
    content: `### 1. Tỷ lệ diện tích tối ưu
Diện tích giếng trời lý tưởng chiếm từ 5% đến 10% diện tích sàn nhà ống. Nếu làm quá nhỏ sẽ không đủ sáng, nếu làm quá lớn mà không che chắn sẽ biến thành lò hấp nhiệt khổng lồ.`
  },
  {
    title: "Ứng Dụng Vật Liệu Sinh Thái Địa Phương Trong Kiến Trúc Xanh Miền Bắc",
    slug: "ung-dung-vat-lieu-sinh-thai-dia-phuong-kien-truc-xanh-mien-bac",
    excerpt: "Khai thác đá cuội suối, gạch gốm Phù Lãng Bắc Ninh và tre ngâm sinh học giảm phát thải carbon cho các công trình đương đại.",
    coverUrl: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&q=80",
    views: 940,
    tags: ["nha-vuon", "indochine", "bac-ninh"],
    content: `### 1. Gốm Phù Lãng & Nét đẹp mộc mạc
Những viên gạch gốm nung men da lươn tự nhiên của làng nghề Phù Lãng được ốp tường tạo cảm giác ấm áp, trầm mặc và bền màu qua hàng thế kỷ.`
  },
  {
    title: "Thiết Kế Cầu Thang Xương Cá Đón Sáng Tự Nhiên Cho Nhà Lô Phố Hẹp",
    slug: "thiet-ke-cau-thang-xuong-ca-don-sang-nha-lo-pho-hep",
    excerpt: "Tối ưu hóa không gian với kết cấu dầm thép chữ I đơn bản kết hợp mặt bậc gỗ teak dày 40mm thanh mảnh và lan can kính cường lực trong suốt.",
    coverUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80",
    views: 1190,
    tags: ["nha-pho", "gieng-troi-lay-sang", "toi-gian"],
    content: `### 1. Cầu thang - Trái tim đối lưu ánh sáng
Cầu thang không đơn thuần là đường đi lại mà là tác phẩm điêu khắc nghệ thuật cho phép ánh sáng tự do xuyên qua các khe bậc chiếu sáng cho toàn bộ ngôi nhà.`
  },

  // =========================================================================
  // BỔ SUNG CÁC DỰ ÁN CỤ THỂ TẠI CÁC QUẬN HUYỆN HÀ NỘI & BẮC NINH, QUẢNG NINH
  // =========================================================================
  {
    title: "Nhà Phố 4 Tầng Mặt Tiền 4.5m Hướng Tây Tại Khu Đô Thị Ngoại Giao Đoàn, Bắc Từ Liêm",
    slug: "nha-pho-4-tang-huong-tay-ngoai-giao-doan-bac-tu-liem",
    excerpt: "Thiết kế ban công hộp thụt lùi che nắng kết hợp hệ cây hoa giấy tím nở rộ quanh năm tại Ngoại Giao Đoàn.",
    coverUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
    views: 1080,
    tags: ["nha-pho", "mat-tien-huong-tay", "hien-dai", "ha-noi"],
    content: `### 1. Giải pháp ban công logia lùi sâu
Bằng cách đẩy mặt kính lùi vào 1.5m so với mặt ngoài ban công, KTS tạo ra khoảng đệm bóng râm tự nhiên, giúp phòng ngủ tầng 2 và 3 luôn mát rượi.`
  },
  {
    title: "Nhà Ống 3.8x15m Có Giếng Trời Đôi Giữa Và Sau Nhà Tại Phố Cổ Bạch Mai, Hai Bà Trưng",
    slug: "nha-ong-gieng-troi-doi-bach-mai-hai-ba-trung-ha-noi",
    excerpt: "Bí quyết giải quyết ánh sáng và không khí cho căn nhà ống siêu hẹp trong ngõ nhỏ Bạch Mai nhờ hệ thống 2 giếng trời thông minh.",
    coverUrl: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
    views: 1280,
    tags: ["nha-pho", "gieng-troi-lay-sang", "toi-gian", "ha-noi"],
    content: `### 1. Bố trí 2 giếng trời độc lập
Giếng trời giữa lấy sáng cho cầu thang và phòng khách, giếng trời sau phục vụ thông gió cho khu vực bếp ăn và nhà vệ sinh, chấm dứt hoàn toàn mùi thức ăn lưu lại trong nhà.`
  },
  {
    title: "Nội Thất Căn Hộ 3 Phòng Ngủ Phong Cách Indochine Tại Vinhomes Smart City, Tây Mỗ",
    slug: "noi-that-can-ho-3pn-indochine-vinhomes-smart-city",
    excerpt: "Mang hơi thở Đông Dương ấm áp vào căn hộ hiện đại 95m2 với gạch bông hoa văn cổ, vách ngăn gỗ con tiện và đèn lồng mây tre.",
    coverUrl: "https://images.unsplash.com/photo-1580586287978-32b4a51c8c9a?w=1200&q=80",
    views: 1340,
    tags: ["noi-that", "indochine", "ha-noi"],
    content: `### 1. Không gian sống ấm áp và hoài niệm
Căn hộ là sự hòa quyện giữa công nghệ tiện nghi của đô thị thông minh và nét đẹp văn hóa truyền thống thanh lịch của người Hà Nội xưa.`
  },
  {
    title: "Biệt Thự Song Lập Tân Cổ Điển Nhẹ Nhàng Tại KĐT Ecopark Văn Giang, Hưng Yên",
    slug: "biet-thu-song-lap-tan-co-dien-ecopark-van-giang",
    excerpt: "Thiết kế cảnh quan sân vườn và kiến trúc tân cổ điển trắng muốt hòa mình trọn vẹn vào đại ngàn cây xanh đại đô thị Ecopark.",
    coverUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    views: 1130,
    tags: ["nha-vuon", "tan-co", "ha-noi"],
    content: `### 1. Ngôi nhà trong lòng công viên
Mỗi ô cửa sổ mở ra đều là bức tranh xanh ngút ngàn của rừng cây cổ thụ, mang đến không gian sống nghỉ dưỡng thanh bình cho gia đình.`
  },
  {
    title: "Nhà Phố 5 Tầng Tân Cổ Điển Có Hầm Rượu Vang Tại Phố Nối, Hưng Yên",
    slug: "nha-pho-5-tang-tan-co-dien-ham-ruou-pho-noi-hung-yen",
    excerpt: "Chiêm ngưỡng không gian sống bề thế với mặt tiền đá Granite vàng hoàng gia và hầm rượu vang phong cách lâu đài Bordeaux nước Pháp.",
    coverUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
    views: 890,
    tags: ["nha-pho", "tan-co", "noi-that"],
    content: `### 1. Sự kết hợp giữa công năng kinh doanh và hưởng thụ
Tầng trệt dành cho không gian đón tiếp sang trọng, hầm rượu dưới lòng đất kiểm soát nhiệt độ ẩm độ lý tưởng để lưu trữ những chai vang hảo hạng.`
  },
  {
    title: "Nhà Ống Mặt Tiền 5m Hiện Đại Giếng Trời Vòm Cong Tại Tiên Du, Bắc Ninh",
    slug: "nha-ong-mat-tien-5m-gieng-troi-vom-cong-tien-du-bac-ninh",
    excerpt: "Những đường vòm cong uyển chuyển phá vỡ sự cứng nhắc của các khối bê tông, tạo nên điểm nhấn kiến trúc ấn tượng tại thị trấn Lim.",
    coverUrl: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200&q=80",
    views: 790,
    tags: ["nha-pho", "gieng-troi-lay-sang", "hien-dai", "bac-ninh"],
    content: `### 1. Đường cong mềm mại dẫn lối ánh sáng
Giếng trời hình bán nguyệt kết hợp mái vòm kính tạo ra vệt sáng di chuyển theo thời gian trong ngày trên bức tường gạch mộc mạc.`
  },
  {
    title: "Nội Thất Biệt Thự Gỗ Gõ Đỏ Cổ Điển Hoàng Gia Tại Quế Võ, Bắc Ninh",
    slug: "noi-that-biet-thu-go-go-do-co-dien-que-vo-bac-ninh",
    excerpt: "Gỗ gõ đỏ Pachy tự nhiên đục chạm hoa văn thủ công tinh xảo, trần gỗ dát vàng 24K khẳng định đẳng cấp quyền quý tại Quế Võ.",
    coverUrl: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&q=80",
    views: 840,
    tags: ["noi-that", "tan-co", "bac-ninh"],
    content: `### 1. Đỉnh cao của nghệ thuật điêu khắc gỗ
Sự kết hợp giữa bàn tay tài hoa của nghệ nhân mộc Đồng Kỵ và tư duy thiết kế không gian khoa học của đội ngũ kiến trúc sư ACD.`
  },
  {
    title: "Nhà Phố 4 Tầng Mặt Tiền Lam Xoay Chống Nắng Tại Hòn Gai, TP. Hạ Long",
    slug: "nha-pho-4-tang-lam-xoay-chong-nang-hon-gai-ha-long",
    excerpt: "Hệ thống lam nhôm xoay cơ học theo hướng nắng mặt trời, vừa chắn nóng buổi chiều vừa mở rộng tối đa tầm nhìn ngắm biển Hạ Long.",
    coverUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
    views: 960,
    tags: ["nha-pho", "mat-tien-huong-tay", "hien-dai", "quang-ninh"],
    content: `### 1. Thích ứng khí hậu ven biển
Các lá lam có thể điều chỉnh 3 góc độ: đóng kín cản nắng gắt trưa hè, nghiêng 45 độ đón gió mát chiều tà và mở phẳng ngắm trọn biển đêm.`
  },
  {
    title: "Thiết Kế Spa & Căn Hộ Nghỉ Dưỡng Indochine Ven Biển Tại Bãi Cháy, Quảng Ninh",
    slug: "thiet-ke-spa-can-ho-indochine-ven-bien-bai-chay-quang-ninh",
    excerpt: "Sự thư thái tột đỉnh với hương tinh dầu sả chanh, bồn tắm đá mài terrazzo và ánh sáng đèn lồng ấm cúng phong cách Đông Dương.",
    coverUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
    views: 1020,
    tags: ["noi-that", "indochine", "quang-ninh"],
    content: `### 1. Không gian trị liệu và chữa lành
Mỗi góc nhỏ đều được chăm chút tỉ mỉ từ bình gốm cổ, tranh hoa sen sơn mài đến tiếng róc rách của thác nước đá cuội tự nhiên.`
  },
  {
    title: "Biệt Thự Vườn Xanh Bên Sườn Núi Bài Thơ, TP. Hạ Long, Quảng Ninh",
    slug: "biet-thu-vuon-xanh-ben-suon-nui-bai-tho-ha-long",
    excerpt: "Ngôi biệt thự ẩn mình dưới bóng râm của vách núi Bài Thơ huyền thoại, tận hưởng không khí trong lành và cảnh sắc non nước hữu tình.",
    coverUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    views: 1170,
    tags: ["nha-vuon", "hien-dai", "quang-ninh", "phong-thuy-hop-menh"],
    content: `### 1. Tựa sơn hướng hải đắc địa
Vị trí hội tụ đầy đủ linh khí của đất trời, mang lại sự bình yên, trí tuệ sáng suốt và sức khỏe trường thọ cho các thành viên trong gia đình.`
  },
  {
    title: "Nhà Ống Tối Giản 3 Tầng Giếng Trời Tiểu Cảnh Cây Bàng Đài Loan Tại Cầu Giấy",
    slug: "nha-ong-toi-gian-3-tang-gieng-troi-bang-dai-loan-cau-giay",
    excerpt: "Cây bàng Đài Loan cao 8m vươn mình giữa lòng giếng trời mang màu xanh mướt và sinh khí dạt dào cho căn nhà phố đường Hoàng Quốc Việt.",
    coverUrl: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80",
    views: 1390,
    tags: ["nha-pho", "gieng-troi-lay-sang", "toi-gian", "ha-noi"],
    content: `### 1. Đưa cây thân gỗ vào trong nhà
Nhờ mái kính giếng trời mở thông gió và hệ thống thoát nước ngầm chuyên dụng, cây bàng Đài Loan phát triển khỏe mạnh, tạo bóng mát cho các tầng sinh hoạt.`
  },
  {
    title: "Cải Tạo Nhà Lô Phố Hướng Tây Nát Thành Biệt Thự Phố Hiện Đại Tại Thanh Xuân, Hà Nội",
    slug: "cai-tao-nha-lo-pho-huong-tay-thanh-xuan-ha-noi",
    excerpt: "Lột xác ngoạn mục căn nhà 3 tầng xây năm 2002 thành công trình hiện đại đẳng cấp với mặt dựng lam nhôm hộp vân gỗ chống nóng.",
    coverUrl: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=80",
    views: 1220,
    tags: ["nha-pho", "mat-tien-huong-tay", "hien-dai", "ha-noi"],
    content: `### 1. Tận dụng tối đa khung kết cấu cũ
Bằng cách giữ lại hệ khung bê tông dầm cột chịu lực và mở rộng ban công đệm, chi phí cải tạo tiết kiệm hơn 45% so với đập đi xây lại mới hoàn toàn.`
  },
  {
    title: "Nhà Phố Kiến Trúc Nhiệt Đới (Tropical Modernism) Có Giếng Trời Sân Trong Tại Tây Hồ",
    slug: "nha-pho-kien-truc-nhiet-doi-tropical-gieng-troi-tay-ho",
    excerpt: "Không gian sống mộc mạc với gạch trần không trát, sàn bê tông mài bóng và giếng trời sân trong ngập tràn cây dương xỉ bên đường Xuân Diệu.",
    coverUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
    views: 1470,
    tags: ["nha-pho", "gieng-troi-lay-sang", "hien-dai", "ha-noi", "phong-thuy-hop-menh"],
    content: `### 1. Vẻ đẹp mộc mạc của vật liệu trần
Tường gạch đất nung để trần kết hợp bê tông mài mang lại cảm giác mát lạnh tức thì vào mùa hè, thân thiện và ấm áp vào mùa đông.`
  },
  {
    title: "Nhà Phố 4 Tầng Phong Cách Bắc Âu (Scandi Style) Giếng Trời Sau Nhà Tại Bắc Ninh",
    slug: "nha-pho-4-tang-scandi-gieng-troi-sau-nha-bac-ninh",
    excerpt: "Không gian sống ngập tràn ánh sáng với bảng màu trắng sáng, nội thất gỗ sồi tự nhiên và giếng trời sân sau xanh mát tại TP. Bắc Ninh.",
    coverUrl: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&q=80",
    views: 810,
    tags: ["nha-pho", "gieng-troi-lay-sang", "toi-gian", "bac-ninh"],
    content: `### 1. Tối ưu hóa ánh sáng vùng viền
Giếng trời sau nhà kích thước 2x4.5m giúp bếp và các phòng ngủ phía sau không còn bị ẩm thấp, luôn đón được gió tươi mát mẻ.`
  },
  {
    title: "Thiết Kế Nội Thất Penthouse Phong Cách Indochine Luxury Tại Sun Grand City Thụy Khuê",
    slug: "noi-that-penthouse-indochine-luxury-sun-grand-city-thuy-khue",
    excerpt: "Đỉnh cao của sự giao thoa văn hóa với view ôm trọn hồ Tây lộng gió, sàn gỗ mun hoa và đồ nội thất khảm trai sơn mài độc bản.",
    coverUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
    views: 1680,
    tags: ["noi-that", "indochine", "ha-noi", "phong-thuy-hop-menh"],
    content: `### 1. Không gian sống độc bản dành cho giới tinh hoa
Căn penthouse 350m2 sở hữu sân vườn trên mây, bể sục Jacuzzi ngoài trời và nội thất Indochine được chế tác riêng biệt không có phiên bản thứ hai.`
  },
  {
    title: "Nhà Vườn Sinh Thái Trồng Cây Ăn Trái Phong Cách Nam Bộ Giữa Lòng Gia Lâm, Hà Nội",
    slug: "nha-vuon-sinh-thai-cay-an-trai-nam-bo-gia-lam-ha-noi",
    excerpt: "Tái hiện không gian miệt vườn thanh bình với cầu khỉ tre, mương dẫn nước và hàng dừa xiêm trĩu quả tại vùng ven sông Đuống Gia Lâm.",
    coverUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80",
    views: 1310,
    tags: ["nha-vuon", "hien-dai", "ha-noi"],
    content: `### 1. Không gian xanh cân bằng cuộc sống
Vườn cây không chỉ cung cấp trái ngọt quanh năm mà còn đóng vai trò là lá phổi xanh thanh lọc bụi mịn, mang lại không khí trong lành cho cả gia đình.`
  },
  {
    title: "Nhà Ống Hướng Tây 4 Tầng Có Hồ Cá Koi Đón Nắng Giếng Trời Tại Hà Đông, Hà Nội",
    slug: "nha-ong-huong-tay-4-tang-ho-ca-koi-gieng-troi-ha-dong",
    excerpt: "Sự kết hợp hoàn hảo giữa giải pháp lam nhôm chắn nắng mặt tiền hướng Tây và hồ cá Koi làm mát lõi giếng trời tại KĐT Mỗ Lao.",
    coverUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    views: 1430,
    tags: ["nha-pho", "mat-tien-huong-tay", "gieng-troi-lay-sang", "ha-noi", "phong-thuy-hop-menh"],
    content: `### 1. Khép kín vòng tuần hoàn nhiệt - ẩm
Mặt tiền cản bức xạ nhiệt bên ngoài, giếng trời kết hợp hồ cá bốc hơi nước làm mát không khí bên trong, tạo ra vi khí hậu mát lành lý tưởng cho cả căn nhà.`
  },
  {
    title: "Nhà Ống 4 Tầng Mặt Tiền Hướng Tây 4x18m Tại Cầu Giấy Với Hệ Lam Nhôm Gỗ Xoay Tự Động",
    slug: "nha-ong-4-tang-huong-tay-4x18m-cau-giay-lam-nhom-xoay",
    excerpt: "Công nghệ lam xoay tự động cảm biến góc mặt trời giúp nhà ống hướng Tây tại Cầu Giấy luôn đón gió mát mà không bị chói gắt.",
    coverUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
    views: 1150,
    tags: ["nha-pho", "mat-tien-huong-tay", "hien-dai", "ha-noi"],
    content: `### 1. Ứng dụng cảm biến vi khí hậu
Các thanh lam tự động xoay theo vị trí biểu kiến của mặt trời trong ngày, vừa chặn nắng xiên vừa tạo hiệu ứng bóng đổ nghệ thuật cho phòng khách.`
  },
  {
    title: "Thiết Kế Giếng Trời Trung Tâm Kết Hợp Hồ Thác Nước Tầng 1 Tại Ba Đình, Hà Nội",
    slug: "gieng-troi-thac-nuoc-tang-1-ba-dinh-ha-noi",
    excerpt: "Tiếng nước róc rách và mảng tường đá slate ốp thác nước cao 12m mang lại sự thư thái tuyệt đối cho căn nhà phố Liễu Giai.",
    coverUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    views: 1320,
    tags: ["nha-pho", "gieng-troi-lay-sang", "toi-gian", "ha-noi", "phong-thuy-hop-menh"],
    content: `### 1. Dòng chảy tài lộc Thủy sinh khí
Hồ thác nước trung tâm giếng trời giữ vai trò tụ thủy tích tài cho gia chủ mệnh Thủy, đồng thời làm ẩm và giảm nhiệt độ phòng khách 3-4 độ C vào mùa hè.`
  },
  {
    title: "Nhà Phố 3 Tầng Mặt Tiền Hướng Tây Tường Đôi Cách Nhiệt 20cm Tại Hà Đông",
    slug: "nha-pho-3-tang-tuong-doi-cach-nhiet-ha-dong",
    excerpt: "Giải pháp xây tường đôi dày 20cm có khe rỗng ở giữa kết hợp xốp cách nhiệt XPS ngăn nhiệt truyền vào nhà tại KĐT Văn Phú Hà Đông.",
    coverUrl: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&q=80",
    views: 940,
    tags: ["nha-pho", "mat-tien-huong-tay", "hien-dai", "ha-noi"],
    content: `### 1. Cấu tạo tường hộp cách nhiệt
Lớp tường ngoài dày 10cm, khe không khí 5cm có chèn tấm XPS cách nhiệt và lớp tường trong 10cm tạo rào cản nhiệt tuyệt đối cho phòng ngủ hướng Tây.`
  },
  {
    title: "Nhà Phố Indochine 4 Tầng Mái Dốc Ngói Đỏ Phố Cổ Tại Hoàn Kiếm, Hà Nội",
    slug: "nha-pho-indochine-4-tang-mai-doc-hoan-kiem",
    excerpt: "Gợi nhớ ký ức Hà Nội xưa với mái ngói dốc nung thủ công, cửa gỗ chớp xanh lá cây và ban công uốn lượn tại phố Hàng Bông.",
    coverUrl: "https://images.unsplash.com/photo-1580586287978-32b4a51c8c9a?w=1200&q=80",
    views: 1540,
    tags: ["nha-pho", "indochine", "ha-noi"],
    content: `### 1. Tinh hoa kiến trúc Pháp cổ giao thoa bản địa
Ngôi nhà nổi bật với nước sơn vàng kem cổ điển, hàng con tiện gốm tráng men xanh và những ô cửa vòm đón gió mát từ hồ Hoàn Kiếm.`
  },
  {
    title: "Căn Hộ Duplex Tân Cổ Điển Tinh Giản 180m2 Tại Ciputra Tây Hồ",
    slug: "can-ho-duplex-tan-co-dien-180m2-ciputra-tay-ho",
    excerpt: "Sự kết hợp tinh tế giữa phào chỉ tường thanh nhã, sàn gỗ Chevron và đèn chùm thả thông tầng lung linh tại khu đô thị quốc tế Ciputra.",
    coverUrl: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&q=80",
    views: 1260,
    tags: ["noi-that", "tan-co", "ha-noi"],
    content: `### 1. Không gian sống chuẩn châu Âu
Tông màu trắng xám kết hợp sofa bọc nỉ cao cấp và lò sưởi giả cổ điển mang lại vẻ ấm cúng, sang trọng và phóng khoáng cho cả gia đình.`
  },
  {
    title: "Nhà Vườn Sinh Thái Nghỉ Dưỡng Phong Cách Mộc Tại Đông Anh, Hà Nội",
    slug: "nha-vuon-sinh-thai-phong-cach-moc-dong-anh",
    excerpt: "Khu vườn xanh mát với nhà gỗ 5 gian truyền thống cải biên hiện đại, hồ sen thơm ngát và vườn cây ăn trái sum suê tại xã Vân Nội Đông Anh.",
    coverUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
    views: 1380,
    tags: ["nha-vuon", "indochine", "ha-noi", "phong-thuy-hop-menh"],
    content: `### 1. Gìn giữ cội nguồn văn hóa
Cấu trúc vì kèo gỗ lim kết hợp hệ vách kính cường lực giúp ánh sáng thiên nhiên ngập tràn gian nhà gỗ truyền thống, vừa thân thuộc vừa tiện nghi.`
  },
  {
    title: "Nhà Phố Tối Giản Mặt Tiền Hướng Tây 5 Tầng Với Vườn Treo Tại Nam Từ Liêm",
    slug: "nha-pho-toi-gian-huong-tay-5-tang-nam-tu-liem",
    excerpt: "Hệ giàn leo hoa giấy và cúc tần phủ xanh 5 tầng mặt tiền tạo tấm rèm lọc bụi cản nhiệt tự nhiên cho căn nhà phố Trung Văn.",
    coverUrl: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=80",
    views: 1040,
    tags: ["nha-pho", "mat-tien-huong-tay", "toi-gian", "ha-noi"],
    content: `### 1. Vườn treo đa tầng lọc nhiệt
Cây xanh hạ nhiệt độ bề mặt tường từ 42 độ C xuống còn 29 độ C vào những ngày hè nắng nóng đỉnh điểm của thủ đô.`
  },
  {
    title: "Thiết Kế Giếng Trời Thông Tầng Kết Hợp Cầu Thang Xoắn Điêu Khắc Tại Long Biên",
    slug: "gieng-troi-thong-tang-cau-thang-xoan-long-bien",
    excerpt: "Cầu thang xoắn ốc bằng thép đúc nguyên khối uốn lượn giữa giếng trời tròn mang ánh sáng đỉnh mái rót xuống từng tầng nhà phố Bồ Đề.",
    coverUrl: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80",
    views: 1190,
    tags: ["nha-pho", "gieng-troi-lay-sang", "hien-dai", "ha-noi"],
    content: `### 1. Điêu khắc kiến trúc giữa lòng nhà phố
Mỗi góc bước chân trên cầu thang xoắn là một góc nhìn ánh sáng khác biệt, biến không gian giao thông đứng thành một trải nghiệm nghệ thuật đầy cảm hứng.`
  },
  {
    title: "Nội Thất Biệt Thự Gỗ Gõ Đỏ Sang Trọng Phong Cách Tân Cổ Tại TP. Bắc Ninh",
    slug: "noi-that-biet-thu-go-go-do-tan-co-tp-bac-ninh",
    excerpt: "Không gian sống quyền uy với bộ bàn ăn 12 ghế gỗ gõ đỏ nguyên khối, tủ rượu âm tường chạm trổ hoa văn cổ điển tại KĐT Đại Hoàng Long.",
    coverUrl: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200&q=80",
    views: 910,
    tags: ["noi-that", "tan-co", "bac-ninh"],
    content: `### 1. Tinh hoa làng nghề gỗ Kinh Bắc
Chất gỗ gõ đỏ dày dặn, nước sơn PU mờ cao cấp giữ nguyên vân gỗ tự nhiên, tôn vinh đẳng cấp của chủ nhân công trình.`
  },
  {
    title: "Nhà Phố Hiện Đại 4 Tầng Mặt Tiền 5m Hướng Tây Tại Yên Phong, Bắc Ninh",
    slug: "nha-pho-hien-dai-4-tang-huong-tay-yen-phong-bac-ninh",
    excerpt: "Giải pháp lam bê tông đúc sẵn hình chữ Z cản nắng xiên hướng Tây cho gia đình chuyên gia công nghệ tại trung tâm công nghiệp Yên Phong.",
    coverUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80",
    views: 870,
    tags: ["nha-pho", "mat-tien-huong-tay", "hien-dai", "bac-ninh"],
    content: `### 1. Lam chữ Z chắn nắng thông minh
Hình dáng chữ Z ngăn toàn bộ tia nắng gắt buổi chiều chiếu vào cửa kính nhưng vẫn giữ được tầm nhìn thông thoáng xuống lòng đường.`
  },
  {
    title: "Nhà Vườn Sinh Thái Hồ Sen Nghỉ Dưỡng Tại Thuận Thành, Bắc Ninh",
    slug: "nha-vuon-sinh-thai-ho-sen-thuan-thanh-bac-ninh",
    excerpt: "Khuôn viên nhà vườn 1.500m2 bao quanh đầm sen thơm ngát, chòi trà ngắm trăng và vườn bưởi Diễn trĩu cành bên dòng sông Đuống.",
    coverUrl: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80",
    views: 980,
    tags: ["nha-vuon", "toi-gian", "bac-ninh"],
    content: `### 1. Chốn về an yên giữa miền di sản
Ngôi nhà 1 tầng mái ngói dốc mộc mạc là nơi gia chủ tìm lại sự tĩnh lặng trong tâm hồn, thưởng trà ngắm hoa sen mỗi sớm mai.`
  },
  {
    title: "Nhà Phố Hiện Đại 4 Tầng View Vịnh Hạ Long Với Kính Low-E Tại Quảng Ninh",
    slug: "nha-pho-hien-dai-view-vinh-ha-long-quang-ninh",
    excerpt: "Hệ vách kính Low-E 2 lớp khổ lớn tràn viền thu trọn vẻ đẹp kỳ vĩ của hàng nghìn hòn đảo đá vôi vịnh Hạ Long vào phòng khách.",
    coverUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    views: 1220,
    tags: ["nha-pho", "hien-dai", "quang-ninh"],
    content: `### 1. Tối đa hóa tầm nhìn hướng biển
Cửa lùa không ray sàn kết hợp kính cường lực cách nhiệt giúp không gian trong nhà hòa làm một với không gian mênh mông của biển cả.`
  },
  {
    title: "Biệt Thự Đồi Tân Cổ Điển 3 Tầng Giếng Trời Mái Vòm Kính Tại Cẩm Phả, Quảng Ninh",
    slug: "biet-thu-doi-tan-co-dien-3-tang-cam-pha-quang-ninh",
    excerpt: "Mái vòm kính giếng trời phong cách Phục Hưng rọi sáng đại sảnh trung tâm biệt thự đồi nhìn ra vịnh Bái Tử Long.",
    coverUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
    views: 890,
    tags: ["nha-pho", "tan-co", "gieng-troi-lay-sang", "quang-ninh"],
    content: `### 1. Ánh sáng hoàng gia từ đỉnh vòm
Mái vòm kính hoa đồng tạo ra những luồng sáng sắc màu lung linh trên sàn đá cẩm thạch trắng của sảnh đón tiếp.`
  },
  {
    title: "Nhà Vườn Sinh Thái Nghỉ Dưỡng View Biển Bãi Cháy Tại Quảng Ninh",
    slug: "nha-vuon-nghi-duong-view-bien-bai-chay-quang-ninh",
    excerpt: "Biệt thự vườn nhiệt đới với bể bơi vô cực ngắm pháo hoa vịnh Hạ Long và rặng dừa xanh mướt đu đưa trước gió biển.",
    coverUrl: "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=1200&q=80",
    views: 1090,
    tags: ["nha-vuon", "hien-dai", "quang-ninh", "phong-thuy-hop-menh"],
    content: `### 1. Trải nghiệm nghỉ dưỡng 5 sao tại gia
Khuôn viên có đầy đủ bếp nướng BBQ ngoài trời, quầy bar ven hồ bơi và lối đi dạo bậc thang đá tự nhiên len lỏi qua các bụi hoa ngọc lan thơm ngát.`
  },
  {
    title: "Giải Pháp Giếng Trời Kết Hợp Mảng Xanh Lọc Bụi Cho Nhà Ống Mặt Phố Hà Nội",
    slug: "giai-phap-gieng-troi-mang-xanh-loc-bui-ha-noi",
    excerpt: "Tổng kết kinh nghiệm 10 năm thiết kế giếng trời lọc sạch bụi mịn PM2.5 và tăng đối lưu khí sạch cho nhà phố thủ đô Hà Nội.",
    coverUrl: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
    views: 1850,
    tags: ["gieng-troi-lay-sang", "nha-pho", "ha-noi"],
    content: `### 1. Phễu hút gió và màng lọc sinh học
Không khí ô nhiễm ngoài đường phố khi đi qua hệ cây lọc bụi đáy giếng trời sẽ được làm ẩm và giữ lại các hạt bụi mịn, mang luồng khí tươi sạch đến từng phòng ngủ.`
  }
];

async function main() {
  console.log("🌱 Bắt đầu gieo mầm hơn 50 bài viết kiến trúc chuyên sâu...");

  // 1. Đảm bảo Admin tồn tại
  let admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!admin) {
    admin = await prisma.user.findFirst();
  }

  if (!admin) {
    console.error("❌ Không tìm thấy người dùng nào trong cơ sở dữ liệu!");
    return;
  }

  // 2. Định nghĩa và đảm bảo toàn bộ Tags cần thiết tồn tại
  const requiredTags = [
    { name: "Mặt Tiền Hướng Tây", slug: "mat-tien-huong-tay" },
    { name: "Giếng Trời Lấy Sáng", slug: "gieng-troi-lay-sang" },
    { name: "Hiện Đại", slug: "hien-dai" },
    { name: "Tối Giản", slug: "toi-gian" },
    { name: "Tân Cổ Điển", slug: "tan-co" },
    { name: "Indochine (Đông Dương)", slug: "indochine" },
    { name: "Nhà Phố", slug: "nha-pho" },
    { name: "Nội Thất", slug: "noi-that" },
    { name: "Nhà Vườn", slug: "nha-vuon" },
    { name: "Hà Nội", slug: "ha-noi" },
    { name: "Bắc Ninh", slug: "bac-ninh" },
    { name: "Quảng Ninh", slug: "quang-ninh" },
    { name: "Phong Thủy Hợp Mệnh", slug: "phong-thuy-hop-menh" },
    { name: "Mệnh Kim", slug: "menh-kim" },
    { name: "Mệnh Mộc", slug: "menh-moc" },
    { name: "Mệnh Thủy", slug: "menh-thuy" },
    { name: "Mệnh Hỏa", slug: "menh-hoa" },
    { name: "Mệnh Thổ", slug: "menh-tho" },
  ];

  const tagMap = {};
  for (const t of requiredTags) {
    const existing = await prisma.tag.findUnique({ where: { slug: t.slug } });
    if (existing) {
      tagMap[t.slug] = existing.id;
    } else {
      const created = await prisma.tag.create({ data: t });
      tagMap[t.slug] = created.id;
    }
  }

  console.log(`✅ Đã kiểm tra & chuẩn bị ${Object.keys(tagMap).length} Tags phân loại.`);

  // 3. Tạo các bài viết trong bảng Post
  let countCreated = 0;
  for (const art of articles) {
    const existing = await prisma.post.findUnique({
      where: { slug: art.slug },
    });

    if (existing) {
      // Cập nhật lại nội dung nếu đã có
      await prisma.post.update({
        where: { slug: art.slug },
        data: {
          title: art.title,
          excerpt: art.excerpt,
          content: art.content,
          coverUrl: art.coverUrl,
          views: art.views,
          published: true,
        },
      });
    } else {
      const post = await prisma.post.create({
        data: {
          title: art.title,
          slug: art.slug,
          excerpt: art.excerpt,
          content: art.content,
          coverUrl: art.coverUrl,
          views: art.views,
          published: true,
          authorId: admin.id,
        },
      });

      // Liên kết Tags
      if (art.tags && art.tags.length > 0) {
        for (const tSlug of art.tags) {
          if (tagMap[tSlug]) {
            await prisma.postTag.upsert({
              where: {
                postId_tagId: {
                  postId: post.id,
                  tagId: tagMap[tSlug],
                },
              },
              update: {},
              create: {
                postId: post.id,
                tagId: tagMap[tSlug],
              },
            });
          }
        }
      }
      countCreated++;
    }
  }

  const totalPosts = await prisma.post.count();
  console.log(`🎉 Đã thêm thành công các bài viết mới. Tổng số bài viết hiện tại trong hệ thống: ${totalPosts}`);
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error("❌ Lỗi khi seed bài viết:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { articles, seedArticles: main };
