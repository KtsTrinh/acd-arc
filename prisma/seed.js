const { PrismaClient, UserRole, ProductType, OrderStatus } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding ACD Architecture database with Ngũ Hành (Kim - Mộc - Thủy - Hỏa - Thổ)...");

  // 0. Safety guard: refuse to wipe real customer accounts in production
  const DEMO_EMAILS = ["admin@acd.vn", "user@acd.vn"];
  const realUsers = await prisma.user.findMany({
    where: { email: { notIn: DEMO_EMAILS } },
    select: { id: true, email: true },
  });
  if (realUsers.length > 0 && process.env.FORCE_SEED !== "true") {
    console.error(
      `❌ Seed aborted: database contains ${realUsers.length} non-demo account(s) ` +
        `(${realUsers.map((u) => u.email).join(", ")}). ` +
        `Set FORCE_SEED=true to wipe them anyway.`
    );
    process.exitCode = 1;
    return;
  }

  // 1. Clean existing records (in order of relations)
  await prisma.downloadLink.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.projectMedia.deleteMany();
  await prisma.projectTag.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.project.deleteMany();
  await prisma.post.deleteMany();
  await prisma.product.deleteMany();
  await prisma.projectCategory.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.media.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const userPasswordHash = await bcrypt.hash("user123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "ACD Studio Director",
      email: "admin@acd.vn",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80",
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "Nguyễn Hoàng Nam",
      email: "khachhang@gmail.com",
      passwordHash: userPasswordHash,
      role: UserRole.USER,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
    },
  });

  console.log("✅ Seeded Admin & Customer users");

  // 3. Seed Media Library
  const mediaList = [
    {
      id: "media_hero_main",
      filename: "villa-mariana-water-hero.jpg",
      originalName: "Villa Mariana Water Reflection Facade",
      url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=85",
      storageKey: "pinterest/architecture/hero-villa.jpg",
      folder: "villa",
      width: 1920,
      height: 1080,
      alt: "Kiến trúc Biệt Thự Mariana với hồ nước phong thủy ban đêm",
    },
    {
      id: "media_villa_1",
      filename: "villa-zen-exterior.jpg",
      originalName: "Villa Zen Minimalist Stone & Glass",
      url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
      storageKey: "pinterest/architecture/villa-zen-1.jpg",
      folder: "villa",
      width: 1600,
      height: 1067,
      alt: "Mặt tiền biệt thự đá xám và kính phản chiếu nước",
    },
    {
      id: "media_villa_2",
      filename: "villa-pool-night.jpg",
      originalName: "Villa Infinity Pool Night Architecture",
      url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80",
      storageKey: "pinterest/architecture/villa-pool-night.jpg",
      folder: "villa",
      width: 1600,
      height: 1067,
      alt: "Hồ bơi vô cực biệt thự nghỉ dưỡng về đêm",
    },
    {
      id: "media_villa_3",
      filename: "villa-living-atrium.jpg",
      originalName: "Villa High Ceiling Double Height Living",
      url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=80",
      storageKey: "pinterest/architecture/villa-atrium.jpg",
      folder: "interior",
      width: 1600,
      height: 1067,
      alt: "Phòng khách thông tầng phong cách Modern Luxury",
    },
    {
      id: "media_kim_marble",
      filename: "villa-kim-white-marble.jpg",
      originalName: "White Marble Luxury Villa Facade",
      url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80",
      storageKey: "pinterest/architecture/villa-kim.jpg",
      folder: "villa",
      width: 1600,
      height: 1067,
      alt: "Biệt thự đá cẩm thạch trắng và kim loại ánh kim - Hợp Mệnh Kim",
    },
    {
      id: "media_moc_wood",
      filename: "villa-moc-teakwood.jpg",
      originalName: "Tropical Wood and Lush Green Residence",
      url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=80",
      storageKey: "pinterest/architecture/villa-moc.jpg",
      folder: "villa",
      width: 1600,
      height: 1067,
      alt: "Biệt thự sinh thái gỗ tự nhiên và cây nhiệt đới - Hợp Mệnh Mộc",
    },
    {
      id: "media_hoa_light",
      filename: "villa-hoa-sunlight.jpg",
      originalName: "Sunlit Terraced Villa Geometric Architecture",
      url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600&q=80",
      storageKey: "pinterest/architecture/villa-hoa.jpg",
      folder: "villa",
      width: 1600,
      height: 1067,
      alt: "Biệt thự tràn ngập ánh sáng và lam chắn nắng nghệ thuật - Hợp Mệnh Hỏa",
    },
    {
      id: "media_tho_stone",
      filename: "villa-tho-sandstone.jpg",
      originalName: "Earth Sandstone and Basalt Villa",
      url: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1600&q=80",
      storageKey: "pinterest/architecture/villa-tho.jpg",
      folder: "villa",
      width: 1600,
      height: 1067,
      alt: "Biệt thự đá sa thạch và tone đất mộc vững chãi - Hợp Mệnh Thổ",
    },
    {
      id: "media_townhouse_1",
      filename: "townhouse-minimalist-facade.jpg",
      originalName: "Townhouse Concrete and Louvers",
      url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80",
      storageKey: "pinterest/architecture/townhouse-facade.jpg",
      folder: "townhouse",
      width: 1600,
      height: 1067,
      alt: "Nhà phố kiến trúc lam chắn nắng bê tông trần",
    },
    {
      id: "media_townhouse_2",
      filename: "townhouse-interior-zen.jpg",
      originalName: "Townhouse Courtyard Sky Light",
      url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1600&q=80",
      storageKey: "pinterest/architecture/townhouse-courtyard.jpg",
      folder: "townhouse",
      width: 1600,
      height: 1067,
      alt: "Giếng trời nhà phố lấy sáng tự nhiên kết hợp tiểu cảnh nước",
    },
    {
      id: "media_interior_1",
      filename: "interior-dark-luxury-lounge.jpg",
      originalName: "Dark Luxury Minimalist Lounge",
      url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=80",
      storageKey: "pinterest/interior/dark-luxury.jpg",
      folder: "interior",
      width: 1600,
      height: 1067,
      alt: "Nội thất tông trầm sang trọng phong thủy ngũ hành",
    },
    {
      id: "media_interior_2",
      filename: "interior-kitchen-marble.jpg",
      originalName: "Black Marble Kitchen Island",
      url: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1600&q=80",
      storageKey: "pinterest/interior/black-marble-kitchen.jpg",
      folder: "interior",
      width: 1600,
      height: 1067,
      alt: "Đảo bếp đá cẩm thạch đen và ánh sáng băng xanh",
    },
    {
      id: "media_penthouse_1",
      filename: "penthouse-skyline-view.jpg",
      originalName: "Penthouse Panoramic River View",
      url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1600&q=80",
      storageKey: "pinterest/penthouse/skyline.jpg",
      folder: "penthouse",
      width: 1600,
      height: 1067,
      alt: "Penthouse hướng nhìn toàn cảnh sông Sài Gòn",
    },
    {
      id: "media_resort_1",
      filename: "resort-water-villa.jpg",
      originalName: "Eco Resort Water Pavilion",
      url: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600&q=80",
      storageKey: "pinterest/resort/water-pavilion.jpg",
      folder: "resort",
      width: 1600,
      height: 1067,
      alt: "Khu nghỉ dưỡng sinh thái trên mặt nước",
    },
  ];

  const pinterestUrls = [
    "https://i.pinimg.com/736x/ef/ec/58/efec58efa298d13dca0dde95e2528f20.jpg",
    "https://i.pinimg.com/736x/e0/06/e7/e006e7457e647c608925488add4508dc.jpg",
    "https://i.pinimg.com/736x/fe/de/13/fede138688ddd9a595090734b109c7ff.jpg",
    "https://i.pinimg.com/736x/33/39/74/3339746a04aa480b39de3b0e6ba3529c.jpg",
    "https://i.pinimg.com/736x/60/d5/f2/60d5f223b54b4d5de2243a432512d96a.jpg",
    "https://i.pinimg.com/736x/cf/b0/40/cfb0408a8cb0d3e53a63aa2d765d3af6.jpg",
    "https://i.pinimg.com/736x/ea/71/16/ea7116315c372c05ecb1f14b06e67768.jpg",
    "https://i.pinimg.com/736x/48/49/09/484909cd303d2b48336ab5a390662ddf.jpg",
    "https://i.pinimg.com/736x/97/51/e5/9751e564b9763396b99f64b5ee035743.jpg",
    "https://i.pinimg.com/736x/12/71/ab/1271abd2fe2d6338c4177bba2a2bbdb1.jpg",
    "https://i.pinimg.com/736x/d5/72/da/d572da3293e42fbf24aed9bd60ae8fd4.jpg",
    "https://i.pinimg.com/736x/99/9c/17/999c172f28c24090698b0c04f86bd445.jpg",
    "https://i.pinimg.com/736x/a4/da/1e/a4da1e327e13325e3c1484391e1482bc.jpg",
    "https://i.pinimg.com/736x/fa/b5/96/fab5960ea3828980e7fd73055cb5a9dd.jpg",
    "https://i.pinimg.com/736x/8c/82/4a/8c824a564e2eceb172c74ae79c6bbd16.jpg",
    "https://i.pinimg.com/736x/95/50/66/955066bbcd2ba58762479bb257d193a9.jpg",
    "https://i.pinimg.com/736x/31/ae/9a/31ae9ad163b754055b566be105102773.jpg",
    "https://i.pinimg.com/736x/72/79/9e/72799e5475a77656dc76d1a9ec0947d5.jpg",
    "https://i.pinimg.com/736x/47/c2/01/47c20141106c13e2d48578485f9a70e5.jpg",
    "https://i.pinimg.com/736x/21/6b/92/216b92632567f492586ab3eba027f87c.jpg",
    "https://i.pinimg.com/736x/90/93/cd/9093cd641f71625cc8e99a81c6f86027.jpg",
    "https://i.pinimg.com/736x/13/05/2e/13052e4a879232d489d375616280602c.jpg",
    "https://i.pinimg.com/736x/c1/82/3a/c1823aa7be0a11944e2271f05d2b665c.jpg",
    "https://i.pinimg.com/736x/03/86/b2/0386b2d593fe1a526db647962a977e2c.jpg",
    "https://i.pinimg.com/736x/b1/94/fa/b194fa3f1c013f59d295b0bb2985a1d4.jpg",
    "https://i.pinimg.com/736x/12/49/01/124901657d08c887be589d93d7839c05.jpg",
    "https://i.pinimg.com/736x/51/d0/66/51d066f509e0e812cfb97c7b74277f7c.jpg",
    "https://i.pinimg.com/736x/0c/1c/e4/0c1ce4c2a622001510a06d4ab435f767.jpg",
    "https://i.pinimg.com/736x/ad/58/98/ad5898564994bb2fa49d320d00e7db9f.jpg",
  ];
  const extraCount = pinterestUrls.length;
  for (let i = 0; i < extraCount; i++) {
    await prisma.media.create({
      data: {
        id: `media_extra_${i}`,
        filename: `pinterest-${i}.jpg`,
        originalName: `Pinterest Image ${i + 1}`,
        url: pinterestUrls[i],
        storageKey: `pinterest/extra/${i}.jpg`,
        folder: "extra",
        width: 736,
        height: 736,
        alt: `Hình ảnh Pinterest ${i + 1}`,
      },
    });
  }
  console.log(`✅ Seeded ${extraCount} Pinterest Media items`);

  for (const m of mediaList) {
    await prisma.media.create({ data: m });
  }
  console.log(`✅ Seeded ${mediaList.length} Media items`);

  // 4. Seed Project Categories
  const catVilla = await prisma.projectCategory.create({
    data: {
      name: "Biệt Thự & Villa Nghỉ Dưỡng",
      slug: "biet-thu-villa",
      description: "Các kiệt tác biệt thự ven hồ, villa đồi và khu nghỉ dưỡng sinh thái đỉnh cao.",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    },
  });

  const catTownhouse = await prisma.projectCategory.create({
    data: {
      name: "Nhà Phố Hiện Đại",
      slug: "nha-pho-hien-dai",
      description: "Giải pháp kiến trúc nhà phố xanh, thoáng sáng và thông minh cho đô thị.",
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
    },
  });

  const catInterior = await prisma.projectCategory.create({
    data: {
      name: "Thiết Kế Nội Thất Cao Cấp",
      slug: "noi-that-cao-cap",
      description: "Không gian sống tinh tế với vật liệu cao cấp, ánh sáng nghệ thuật và phong thủy.",
      image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
    },
  });

  const catPenthouse = await prisma.projectCategory.create({
    data: {
      name: "Penthouse & Căn Hộ Sang Trọng",
      slug: "penthouse-can-ho",
      description: "Thiết kế penthouse độc bản trên tầng mây với view panorama tuyệt mỹ.",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
    },
  });

  const catResort = await prisma.projectCategory.create({
    data: {
      name: "Kiến Trúc Cảnh Quan & Resort",
      slug: "canh-quan-resort",
      description: "Hòa quyện kiến trúc với mặt nước, thiên nhiên nhiệt đới và không gian mở.",
      image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80",
    },
  });

  console.log("✅ Seeded 5 Project Categories");

  // 5. Seed Tags (Full 5 Elements Ngũ Hành: Kim, Mộc, Thủy, Hỏa, Thổ)
  const tagNames = [
    { name: "Mệnh Kim", slug: "menh-kim" },
    { name: "Mệnh Mộc", slug: "menh-moc" },
    { name: "Mệnh Thủy", slug: "menh-thuy" },
    { name: "Mệnh Hỏa", slug: "menh-hoa" },
    { name: "Mệnh Thổ", slug: "menh-tho" },
    { name: "Hiện Đại", slug: "hien-dai" },
    { name: "Tối Giản (Minimalism)", slug: "toi-gian" },
    { name: "Tropical Modern", slug: "tropical-modern" },
    { name: "Luxury Dark", slug: "luxury-dark" },
    { name: "Hồ Bơi Vô Cực", slug: "ho-boi-vo-cuc" },
    { name: "Tân Cổ", slug: "tans-co" },
    { name: "Indochi", slug: "indochi" },
    { name: "Nhà Phố", slug: "nha-pho" },
    { name: "Nội Thất", slug: "noi-that" },
    { name: "Nhà Vườn", slug: "nha-vuon" },
    { name: "Hà Nội", slug: "ha-noi" },
    { name: "Bắc Ninh", slug: "bac-ninh" },
    { name: "Quảng Ninh", slug: "quang-ninh" },
  ];

  const tagsMap = {};
  for (const t of tagNames) {
    const createdTag = await prisma.tag.create({ data: t });
    tagsMap[t.slug] = createdTag.id;
  }
  console.log("✅ Seeded 5 Elements & Architectural Tags");

  // 5.1 Seed default System Settings (Cấu hình hệ thống / SEO / Custom Script)
  const defaultSettings = {
    siteName: "ACD Architecture & Design",
    siteTagline: "Kiến Trúc Hợp Mệnh Ngũ Hành & Nội Thất Thượng Lưu",
    siteDescription:
      "ACD Studio - Đơn vị thiết kế kiến trúc biệt thự, nhà phố, penthouse và nội thất cao cấp theo phong thủy hợp mệnh (Kim - Mộc - Thủy - Hỏa - Thổ).",
    contactEmail: "contact@acd.vn",
    contactPhone: "0988.ACD.888",
    contactAddress:
      "Hà Nội: Tòa nhà Heritage, P. Phan Chu Trinh, Hoàn Kiếm | TP. HCM: Khu biệt thự ven sông Thảo Điền, TP. Thủ Đức",
    facebookUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    zaloNumber: "",
    maintenanceMode: "false",
    heroBackgroundImage:
      "https://i.pinimg.com/736x/ef/ec/58/efec58efa298d13dca0dde95e2528f20.jpg",
    heroBackgroundImageMobile: "",
    heroBackgroundType: "image",
    heroBackgroundVideo: "",
    heroBackgroundVideoMobile: "",
    heroVideoPoster: "",
    heroVideoEmbedCode: "",
    heroVideoFit: "cover",
    heroVideoAspect: "",
    heroOverlayOpacity: "60",
    seoTitle:
      "ACD Architecture & Design | Kiến Trúc Hợp Mệnh Ngũ Hành & Nội Thất Thượng Lưu",
    seoDescription:
      "ACD Studio - Đơn vị thiết kế kiến trúc biệt thự, nhà phố, penthouse và nội thất cao cấp theo phong thủy hợp mệnh (Kim - Mộc - Thủy - Hỏa - Thổ). Cung cấp hệ sinh thái tài nguyên bản vẽ CAD, model 3D chuyên nghiệp.",
    seoKeywords:
      "kiến trúc biệt thự,thiết kế nội thất,nhà phố hiện đại,phong thủy hợp mệnh,phong thủy ngũ hành,mệnh kim,mệnh mộc,mệnh thủy,mệnh hỏa,mệnh thổ,bản vẽ autocad,model 3d kiến trúc,acd architecture",
    seoOgImage: "",
    seoRobots: "index, follow",
    googleAnalyticsId: "",
    googleSiteVerification: "",
    headerEmbedCode: "",
    bodyEmbedCode: "",
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    const existing = await prisma.systemSetting.findUnique({ where: { key } });
    if (!existing) {
      await prisma.systemSetting.create({ data: { key, value } });
    }
  }
  console.log(
    `✅ Seeded ${Object.keys(defaultSettings).length} System Settings (existing admin values kept)`
  );

  // 6. Seed Projects for all 5 Elements
  // 6.1 Mệnh Thủy: The Aqua Horizon Villa
  const projectThuy = await prisma.project.create({
    data: {
      title: "The Aqua Horizon Villa",
      slug: "the-aqua-horizon-villa",
      shortDesc: "Biệt thự nghỉ dưỡng đương đại hòa quyện yếu tố nước phong thủy và đường nét tối giản bên bờ vịnh.",
      description: `### Triết lý kiến trúc hợp Mệnh Thủy
The Aqua Horizon Villa được định hướng riêng cho gia chủ mệnh Thủy, sử dụng các gam màu xanh biển sâu, đá bazan đen obsidian kết hợp kim loại ánh bạc (nguyên lý Kim sinh Thủy).

Hồ bơi vô cực điện phân muối khoáng và hồ phản chiếu tĩnh lặng tạo nên sự thư thái tuyệt đối, đối lưu vi khí hậu mát lành và thu hút dòng chảy tài lộc dồi dào.`,
      location: "Hạ Long, Quảng Ninh",
      client: "Ông Trần Minh Quân (Mệnh Thủy)",
      year: 2026,
      area: 680,
      style: "Modern Luxury • Phong Thủy Mệnh Thủy",
      buildingType: "Biệt thự nghỉ dưỡng đơn lập",
      isFeatured: true,
      categoryId: catVilla.id,
      coverId: "media_hero_main",
    },
  });

  await prisma.projectMedia.createMany({
    data: [
      { projectId: projectThuy.id, mediaId: "media_hero_main", sortOrder: 0 },
      { projectId: projectThuy.id, mediaId: "media_villa_1", sortOrder: 1 },
      { projectId: projectThuy.id, mediaId: "media_villa_2", sortOrder: 2 },
    ],
  });

  await prisma.projectTag.createMany({
    data: [
      { projectId: projectThuy.id, tagId: tagsMap["menh-thuy"] },
      { projectId: projectThuy.id, tagId: tagsMap["hien-dai"] },
      { projectId: projectThuy.id, tagId: tagsMap["ho-boi-vo-cuc"] },
    ],
  });

  // 6.2 Mệnh Kim: The Aurelia Marble Villa
  const projectKim = await prisma.project.create({
    data: {
      title: "The Aurelia White Marble Villa",
      slug: "the-aurelia-white-marble-villa",
      shortDesc: "Biệt thự phong cách Minimalism Luxury với đá cẩm thạch trắng Carrara, kim loại mạ vàng sâm panh và đường vòm bán nguyệt.",
      description: `### Triết lý kiến trúc hợp Mệnh Kim
Dành cho gia chủ mệnh Kim, công trình sử dụng gam màu trắng tinh khôi, xám bạc và vàng kim sang trọng (Thổ sinh Kim). Hình khối kiến trúc sử dụng các đường cong bán nguyệt mềm mại, khối nhà vuông vắn chắc chắn, mang lại trường khí sáng lạn, quyền uy và thịnh vượng.`,
      location: "Ciputra, Tây Hồ, Hà Nội",
      client: "Gia đình Doanh nhân Bạch Quốc Cường (Mệnh Kim)",
      year: 2026,
      area: 550,
      style: "Minimalist Luxury • Phong Thủy Mệnh Kim",
      buildingType: "Biệt thự đơn lập cao cấp",
      isFeatured: true,
      categoryId: catVilla.id,
      coverId: "media_kim_marble",
    },
  });

  await prisma.projectMedia.createMany({
    data: [
      { projectId: projectKim.id, mediaId: "media_kim_marble", sortOrder: 0 },
      { projectId: projectKim.id, mediaId: "media_interior_2", sortOrder: 1 },
    ],
  });

  await prisma.projectTag.createMany({
    data: [
      { projectId: projectKim.id, tagId: tagsMap["menh-kim"] },
      { projectId: projectKim.id, tagId: tagsMap["hien-dai"] },
      { projectId: projectKim.id, tagId: tagsMap["toi-gian"] },
    ],
  });

  // 6.3 Mệnh Mộc: Zenith Courtyard Residence
  const projectMoc = await prisma.project.create({
    data: {
      title: "Zenith Courtyard Residence",
      slug: "zenith-courtyard-residence",
      shortDesc: "Công trình nhiệt đới ngập tràn sinh khí với gỗ teak tự nhiên, vườn giếng trời xanh mát và giải pháp đón gió tự nhiên.",
      description: `### Triết lý kiến trúc hợp Mệnh Mộc
Lấy cảm hứng từ sự sinh sôi của đại ngàn, công trình ứng dụng vật liệu mộc hữu cơ: gỗ biến tính Thermo-Ash, tre ép khối và thảm thực vật nhiệt đới phong phú. Sự kết hợp giữa tiểu cảnh suối nước và cây xanh hiện thực hóa trọn vẹn nguyên lý Thủy sinh Mộc, đem lại sức khỏe dồi dào và tâm trí thanh tịnh.`,
      location: "Thảo Điền, TP. Thủ Đức, TP. HCM",
      client: "Bà Lê Hoàng Yến (Mệnh Mộc)",
      year: 2025,
      area: 420,
      style: "Tropical Modern • Phong Thủy Mệnh Mộc",
      buildingType: "Nhà vườn sinh thái cao cấp",
      isFeatured: true,
      categoryId: catTownhouse.id,
      coverId: "media_moc_wood",
    },
  });

  await prisma.projectMedia.createMany({
    data: [
      { projectId: projectMoc.id, mediaId: "media_moc_wood", sortOrder: 0 },
      { projectId: projectMoc.id, mediaId: "media_townhouse_1", sortOrder: 1 },
      { projectId: projectMoc.id, mediaId: "media_townhouse_2", sortOrder: 2 },
    ],
  });

  await prisma.projectTag.createMany({
    data: [
      { projectId: projectMoc.id, tagId: tagsMap["menh-moc"] },
      { projectId: projectMoc.id, tagId: tagsMap["tropical-modern"] },
    ],
  });

  // 6.4 Mệnh Hỏa: The Solarium Light Pavilion
  const projectHoa = await prisma.project.create({
    data: {
      title: "The Solarium Light Pavilion",
      slug: "the-solarium-light-pavilion",
      shortDesc: "Biệt thự đón sáng tự nhiên rực rỡ với hệ lam gỗ chắn nắng vát chéo nghệ thuật và không gian thông tầng thoáng đãng.",
      description: `### Triết lý kiến trúc hợp Mệnh Hỏa
Mệnh Hỏa đại diện cho nguồn năng lượng dồi dào, sự sáng tạo và đam mê. Công trình được thiết kế với hướng đón nắng gián tiếp tối ưu, các hình khối vát chóp năng động cùng vật liệu gỗ ấm áp (Mộc sinh Hỏa). Hệ thống thông gió xuyên phòng giúp không gian luôn mát mẻ, cân bằng nhiệt độ hoàn hảo.`,
      location: "Đà Lạt, Lâm Đồng",
      client: "Ông Hoàng Minh Đức (Mệnh Hỏa)",
      year: 2026,
      area: 480,
      style: "Contemporary • Phong Thủy Mệnh Hỏa",
      buildingType: "Biệt thự đồi sinh thái",
      isFeatured: true,
      categoryId: catVilla.id,
      coverId: "media_hoa_light",
    },
  });

  await prisma.projectMedia.createMany({
    data: [
      { projectId: projectHoa.id, mediaId: "media_hoa_light", sortOrder: 0 },
      { projectId: projectHoa.id, mediaId: "media_villa_3", sortOrder: 1 },
    ],
  });

  await prisma.projectTag.createMany({
    data: [
      { projectId: projectHoa.id, tagId: tagsMap["menh-hoa"] },
      { projectId: projectHoa.id, tagId: tagsMap["hien-dai"] },
    ],
  });

  // 6.5 Mệnh Thổ: Terra Basalt Stone Villa
  const projectTho = await prisma.project.create({
    data: {
      title: "Terra Basalt Stone Villa",
      slug: "terra-basalt-stone-villa",
      shortDesc: "Biệt thự đá sa thạch và bazan tự nhiên bám đất vững chãi, tone màu nâu đất mộc mạc và trường tồn với thời gian.",
      description: `### Triết lý kiến trúc hợp Mệnh Thổ
Đại diện cho đất mẹ vững chãi và bao dung, Terra Basalt Stone Villa ứng dụng đá tự nhiên sa thạch chẻ thô, gạch gốm nung mộc và các tone màu nâu đất, vàng cát, cam đất ấm áp (Hỏa sinh Thổ). Thiết kế bám sát địa hình, tạo nên cảm giác an yên tuyệt đối cho gia chủ.`,
      location: "Lương Sơn, Hòa Bình",
      client: "Bà Đặng Phương Thảo (Mệnh Thổ)",
      year: 2025,
      area: 520,
      style: "Earth Architecture • Phong Thủy Mệnh Thổ",
      buildingType: "Biệt thự nghỉ dưỡng đồi",
      isFeatured: true,
      categoryId: catVilla.id,
      coverId: "media_tho_stone",
    },
  });

  await prisma.projectMedia.createMany({
    data: [
      { projectId: projectTho.id, mediaId: "media_tho_stone", sortOrder: 0 },
      { projectId: projectTho.id, mediaId: "media_villa_1", sortOrder: 1 },
    ],
  });

  await prisma.projectTag.createMany({
    data: [
      { projectId: projectTho.id, tagId: tagsMap["menh-tho"] },
      { projectId: projectTho.id, tagId: tagsMap["toi-gian"] },
    ],
  });

  console.log("✅ Seeded 5 Projects representing Kim - Mộc - Thủy - Hỏa - Thổ");

  // 7. Seed Products (CAD, 3D Models, Templates)
  const productCAD = await prisma.product.create({
    data: {
      name: "Trọn Bộ Hồ Sơ Thiết Kế Thi Công Biệt Thự Hiện Đại 3 Tầng (AutoCAD Full Set)",
      slug: "ho-so-cad-biet-thu-hien-dai-3-tang",
      description: "Bao gồm đầy đủ bản vẽ kiến trúc (mặt bằng, mặt đứng, mặt cắt chi tiết), kết cấu bê tông cốt thép, điện nước (MEP), chi tiết vệ sinh, cầu thang, cửa và hồ sơ xin phép xây dựng chuẩn.",
      price: 850000,
      comparePrice: 1200000,
      type: ProductType.CAD,
      fileFormat: "AutoCAD .DWG 2018-2026 + PDF Trình chiếu",
      fileSize: "185 MB",
      fileKey: "cad/villa-modern-full-cad-pack.zip",
      thumbnail: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
      active: true,
      featured: true,
    },
  });

  const product3D = await prisma.product.create({
    data: {
      name: "Pack 3D Model Biệt Thự Luxury Hồ Bơi (3ds Max + Corona Renderer + SketchUp)",
      slug: "pack-3d-model-villa-luxury-ho-boi",
      description: "File 3D hoàn chỉnh đã setup full ánh sáng ngày và đêm, vật liệu PBR 4K chuẩn xác, camera góc đẹp, sẵn sàng render cho brochure dự án và diễn họa chuyên nghiệp.",
      price: 650000,
      comparePrice: 950000,
      type: ProductType.MODEL_3D,
      fileFormat: "3ds Max 2024 (Corona 10) + SketchUp 2024 (Enscape/Vray)",
      fileSize: "1.4 GB",
      fileKey: "models/luxury-villa-exterior-3d.zip",
      thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      active: true,
      featured: true,
    },
  });

  const productInterior = await prisma.product.create({
    data: {
      name: "Thư Viện 120+ Model Nội Thất Dark Minimalist Độc Quyền ACD",
      slug: "thu-vien-model-noi-that-dark-minimalist",
      description: "Bộ sưu tập sofa bọc da Ý, bàn ăn đá marble, đèn thả nghệ thuật, hệ tủ âm tường và decor cao cấp, tối ưu polygon nhẹ mượt mà vẫn sắc nét chi tiết.",
      price: 450000,
      comparePrice: 700000,
      type: ProductType.INTERIOR,
      fileFormat: "FBX, OBJ, Max, SKP kèm map texture PBR 4K",
      fileSize: "850 MB",
      fileKey: "interior/dark-minimalist-furniture-120.zip",
      thumbnail: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
      active: true,
      featured: true,
    },
  });

  const productTemplate = await prisma.product.create({
    data: {
      name: "Bộ Template Photoshop Trình Bày Mặt Bằng & Diễn Họa Concept Dự Án",
      slug: "bo-template-photoshop-mat-bang-dien-hoa",
      description: "30 layout PSD phối cảnh mặt bằng sàn, mặt cắt phối cảnh, moodboard vật liệu chuẩn nhận diện thương hiệu kiến trúc sang trọng.",
      price: 320000,
      comparePrice: 500000,
      type: ProductType.TEMPLATE,
      fileFormat: "Adobe Photoshop (.PSD layered) + Brushes",
      fileSize: "620 MB",
      fileKey: "templates/acd-architectural-presentation-psd.zip",
      thumbnail: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80",
      active: true,
      featured: false,
    },
  });

  console.log("✅ Seeded 4 Products");

  // 8. Seed Sample Orders and Download Links
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "ACD-10035",
      userId: customer.id,
      customerName: "Nguyễn Hoàng Nam",
      customerEmail: "khachhang@gmail.com",
      customerPhone: "0908123456",
      status: OrderStatus.PAID,
      total: 850000,
      paymentMethod: "VIETQR",
      paymentNote: "Thanh toán thành công qua QR chuyển khoản ngân hàng",
      items: {
        create: [
          {
            productId: productCAD.id,
            productName: productCAD.name,
            price: productCAD.price,
            quantity: 1,
          },
        ],
      },
    },
  });

  const sampleToken1 = "acd_demo_token_villa_cad_9837421";
  await prisma.downloadLink.create({
    data: {
      token: sampleToken1,
      orderId: order1.id,
      productId: productCAD.id,
      userId: customer.id,
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      maxDownloads: 5,
      downloadCount: 1,
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: "ACD-10034",
      userId: customer.id,
      customerName: "Nguyễn Hoàng Nam",
      customerEmail: "khachhang@gmail.com",
      customerPhone: "0908123456",
      status: OrderStatus.PAID,
      total: 450000,
      paymentMethod: "BANK_TRANSFER",
      items: {
        create: [
          {
            productId: productInterior.id,
            productName: productInterior.name,
            price: productInterior.price,
            quantity: 1,
          },
        ],
      },
    },
  });

  const sampleToken2 = "acd_demo_token_interior_pack_482910";
  await prisma.downloadLink.create({
    data: {
      token: sampleToken2,
      orderId: order2.id,
      productId: productInterior.id,
      userId: customer.id,
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      maxDownloads: 5,
      downloadCount: 0,
    },
  });

  // Pending order
  await prisma.order.create({
    data: {
      orderNumber: "ACD-10033",
      customerName: "Trần Anh Tuấn",
      customerEmail: "tuan.tran@gmail.com",
      customerPhone: "0912345678",
      status: OrderStatus.PENDING,
      total: 1200000,
      paymentMethod: "VIETQR",
      paymentNote: "Chờ khách quét mã QR VietQR",
      items: {
        create: [
          {
            productId: product3D.id,
            productName: product3D.name,
            price: product3D.price,
            quantity: 1,
          },
        ],
      },
    },
  });

  console.log("✅ Seeded Orders & Active Download Links");

  // 9. Seed Blog Posts for Feng Shui Ngũ Hành
  await prisma.post.create({
    data: {
      title: "Ứng Dụng Ngũ Hành Kim - Mộc - Thủy - Hỏa - Thổ Trong Kiến Trúc Biệt Thự",
      slug: "ung-dung-ngu-hanh-kim-moc-thuy-hoa-tho-trong-kien-truc",
      excerpt: "Mỗi gia chủ mang một bản mệnh riêng. Tìm hiểu cách kiến trúc sư ACD ứng dụng nguyên lý tương sinh tương khắc để lựa chọn màu sắc, vật liệu và hướng đón sinh khí hoàn hảo.",
      content: `Trong triết học phương Đông, vạn vật trong vũ trụ đều được cấu thành và vận hành theo quy luật tương sinh tương khắc của ngũ hành: **Kim, Mộc, Thủy, Hỏa, Thổ**.

Một ngôi nhà đẹp không chỉ dừng lại ở tính thẩm mỹ thị giác mà phải đem lại trường năng lượng tích cực, sự bình an và hanh thông tài lộc cho gia chủ dựa trên bản mệnh cụ thể.

### 1. Kiến Trúc Cho Gia Chủ Mệnh Kim
- **Đặc trưng**: Tượng trưng cho sự kiên định, sắc sảo và thanh khiết.
- **Màu sắc & vật liệu**: Màu trắng, xám bạc, vàng kim; kết hợp đá cẩm thạch trắng Carrara, kim loại phay xước và kính Low-E tràn viền (nguyên lý Thổ sinh Kim).
- **Hình khối**: Vuông vắn, góc bo tròn mềm mại và các đường cong bán nguyệt.

### 2. Kiến Trúc Cho Gia Chủ Mệnh Mộc
- **Đặc trưng**: Khởi nguồn của sự sinh sôi, phát triển và hòa ái.
- **Màu sắc & vật liệu**: Xanh lá cây nhiệt đới, nâu gỗ tự nhiên; kết hợp gỗ Teak, tre ép, thảm thực vật xanh (nguyên lý Thủy sinh Mộc).
- **Hình khối**: Hình chữ nhật đứng, các hệ lam chắn nắng thanh mảnh, giếng trời đón sáng tự nhiên.

### 3. Kiến Trúc Cho Gia Chủ Mệnh Thủy
- **Đặc trưng**: Đại diện cho trí tuệ sâu sắc, sự uyển chuyển và linh hoạt.
- **Màu sắc & vật liệu**: Xanh biển sâu, đen obsidian, kính phản chiếu nước kết hợp chi tiết kim loại ánh bạc (nguyên lý Kim sinh Thủy).
- **Hình khối**: Uốn lượn mềm mại, hồ bơi tràn viền và hồ cá cảnh quan đối lưu vi khí hậu.

### 4. Kiến Trúc Cho Gia Chủ Mệnh Hỏa
- **Đặc trưng**: Biểu tượng của nhiệt huyết, năng lượng rực rỡ và danh vọng.
- **Màu sắc & vật liệu**: Điểm nhấn đỏ burgundy, cam đất, tím nhẹ kết hợp nhiều vật liệu gỗ tự nhiên (nguyên lý Mộc sinh Hỏa).
- **Hình khối**: Góc cạnh vát chéo, mái chóp nghệ thuật, hệ thống lấy sáng tự nhiên chan hòa.

### 5. Kiến Trúc Cho Gia Chủ Mệnh Thổ
- **Đặc trưng**: Đại diện cho đất mẹ vững chãi, nuôi dưỡng và trường tồn.
- **Màu sắc & vật liệu**: Nâu đất, vàng cát, cam đất; sử dụng đá sa thạch thô mộc, gạch gốm nung và kết cấu bám sát địa hình (nguyên lý Hỏa sinh Thổ).
- **Hình khối**: Khối nhà thấp tầng bám đất, kiến trúc trải dài tạo cảm giác vững chãi và ấm cúng.`,
      coverUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
      published: true,
      authorId: admin.id,
      views: 520,
    },
  });

  await prisma.post.create({
    data: {
      title: "Cách Tra Cứu Bản Mệnh & Bố Trí Không Gian Sống Hợp Mệnh Tương Sinh",
      slug: "cach-tra-cuu-ban-menh-bo-tri-khong-gian-song",
      excerpt: "Hướng dẫn chi tiết cách gia chủ xác định bản mệnh ngũ hành theo năm sinh và các nguyên tắc chọn hướng cửa chính, phòng khách và phòng ngủ.",
      content: `Bố trí không gian theo phong thủy hợp mệnh không phải là mê tín mà là sự sắp đặt khoa học về trường khí, ánh sáng, nhiệt độ và màu sắc để tâm lý con người luôn đạt trạng thái an yên nhất.`,
      coverUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
      published: true,
      authorId: admin.id,
      views: 312,
    },
  });

  console.log("✅ Seeded Ngũ Hành Blog Posts");

  // 10. Seed ~50 bài viết dự án nhà phố, nội thất, nhà vườn (Hà Nội, Bắc Ninh, Quảng Ninh...)
  //     Kiến trúc: Hiện đại, Tân Cổ, Indochi
  const postsData = [
    {
      title: "Nhà phố hiện đại 4 tầng tại Cầu Giấy, Hà Nội",
      slug: "nha-pho-hien-dai-4-tang-cau-giay-ha-noi",
      excerpt: "Thiết kế nhà phố mặt tiền 4 tầng, tốt giản, ánh sáng tự nhiên, phù hợp khu đô thị đông đúc Hà Nội.",
      content: `Dự án nhà phố 4 tầng tại Cầu Giấy, Hà Nội được thiết kế theo phong cách hiện đại tốt giản. Hình khối vuông vức, hệ lam chắn nắng bê tông trần và kính_LOW-E giúp kiểm soát ánh nành, tạo không gian sống thoáng mát cho gia đình đô thị.`,
      coverUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      views: 840,
    },
    {
      title: "Nhà phố tân cổ điển 5 tầng tại Tây Hồ, Hà Nội",
      slug: "nha-pho-tan-co-5-tang-tay-ho-ha-noi",
      excerpt: "Kiến trúc tân cổ kết hợp đường vòm, cột tròn và màu sắc nhẹ nhàng, phù hợp vịnh đô thị Tây Hồ.",
      content: `Công trình nhà phố 5 tầng tại Tây Hồ, Hà Nội theo phong cách tân cổ (Neo-Classical). Đường nét cột tròn, vòm cửa chính và khuôn khổ đối xứng mang vẻ sang trọng, trầm ấm, vừa giữ bản sắc kiến trúc truyền thống vừa tiện nghi hiện đại.`,
      coverUrl: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80",
      views: 720,
    },
    {
      title: "Nhà phố indochi 3 tầng tại Hoàng Mai, Hà Nội",
      slug: "nha-pho-indochi-3-tang-hoang-mai-ha-noi",
      excerpt: "Phong cách Indochi kết hợp kiến trúc phương Đông và phương Tây, mái ngói, phanh lê và lang thang thoáng mát.",
      content: `Nhà phố 3 tầng tại Hoàng Mai, Hà Nội theo phong cách Indochi (Đông Tây hợp wall). Mái ngói Conical, phanh lê gỗ, hệ thống lang thang và cửa kính ván đem lại sự gần gũi, thoáng mát và phù hợp với khí hậu miền Bắc.`,
      coverUrl: "https://images.unsplash.com/photo-1580586287978-32b4a51c8c9a?w=1200&q=80",
      views: 690,
    },
    {
      title: "Thiết kế nội thất hiện đại cho căn hộ tầng cao ở Ba Đình, Hà Nội",
      slug: "noi-that-hien-dai-can-ho-tang-cao-ba-dinh-ha-noi",
      excerpt: "Nội thất hiện đại tối giản, palette trung tính, vật liệu gỗ tự nhiên và đá marble, tối ưu diện tích căn hộ cao cấp.",
      content: `Dự án thiết kế nội thất hiện đại cho căn hộ tầng cao tại Ba Đình, Hà Nội. Sử dụng gam màu trắng, xám, gỗ sồi và đá cẩm thạch, kết hợp đèn led các tính năng tạo không gian sang trọng, sạch sẽ và dễ bảo quản.`,
      coverUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
      views: 910,
    },
    {
      title: "Nhà phố mặt tiền tân cổ điển tại Long Biên, Hà Nội",
      slug: "nha-pho-mat-tien-tan-co-long-bien-ha-noi",
      excerpt: "Nhà phố mặt tiền 4 tầng phong cách tân cổ, hoa văn t따라, cột kép và mái vòm nhẹ nhàng.",
      content: `Công trình nhà phố mặt tiền tại Long Biên, Hà Nội được thiết kế theo phong cách tân cổ điển. Đường nét cột kép, huỳnh quang và khoan accueil tạo vẻ sang trọng, phù hợp gia đình yêu thích sự cổ điển hiện đại.`,
      coverUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      views: 650,
    },
    {
      title: "Nhà phố indochi 4 tầng tại Thanh Xuân, Hà Nội",
      slug: "nha-pho-indochi-4-tang-thanh-xuan-ha-noi",
      excerpt: "Kiến trúc Indochi 4 tầng, hệ lan can gỗ, mái ngói đỏ và không gian lang thang tạo nét đặc trưng miền Bắc.",
      content: `Nhà phố 4 tầng tại Thanh Xuân, Hà Nội theo phong cách Indochi. Kết hợp mái ngói đỏ, lan can gỗ tự nhiên và hệ thống cửa sổ xiênCross tạo không gian sống gần gũi, thoáng mát, tràn đầy nét văn hóa.`,
      coverUrl: "https://images.unsplash.com/photo-1580586287978-32b4a51c8c9a?w=1200&q=80",
      views: 610,
    },
    {
      title: "Nội thất tân cổ cho biệt thự đô thị tại Hà Đông, Hà Nội",
      slug: "noi-that-tan-co-biet-thu-ha-dong-ha-noi",
      excerpt: "Nội thất tân cổ sang trọng, gỗ sồi, vải 돕n, đèn thả sắt đúc và tủ ámtường khắc họa tinh tế.",
      content: `Dự án nội thất tân cổ cho biệt thự đô thị tại Hà Đông, Hà Nội. Sử dụng gỗ sồi tự nhiên, vải đêm cao cấp, đèn thả sắt đúc và các chi tiết khắc họa tinh tế tạo không gian sống sang trọng, ấm cúng.`,
      coverUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
      views: 780,
    },
    {
      title: "Nhà phố hiện đại 3 tầng tại Bắc Từ Liêm, Hà Nội",
      slug: "nha-pho-hien-dai-3-tang-bac-tu-liem-ha-noi",
      excerpt: "Nhà phố 3 tầng hiện đại, mặt kính toàn cao, hệ thống thông gió tự nhiên và vườn liền kề xanh mát.",
      content: `Dự án nhà phố 3 tầng tại Bắc Từ Liêm, Hà Nội. Thiết kế mặt kính toàn cao, hệ thông gió xuyên phòng và tiểu cảnh vườn liền kề giúp nhà luôn sáng, mát và kết nối với thiên nhiên.`,
      coverUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      views: 700,
    },
    {
      title: "Nhà phố indochi 5 tầng tại Hai Bà Trưng, Hà Nội",
      slug: "nha-pho-indochi-5-tang-hai-ba-trung-ha-noi",
      excerpt: "Nhà phố 5 tầng phong cách Indochi, mái ngói, phanh lê, hệ thống cửa kính ván và gỗ tự nhiên.",
      content: `Công trình nhà phố 5 tầng tại Hai Bà Trưng, Hà Nội theo phong cách Indochi. MáI ngói Conical, phanh lê gỗ và hệ thống cửa kính ván tạo sự đồng nhất giữa truyền thống và hiện đại, phù hợp với đời sống đô thị.`,
      coverUrl: "https://images.unsplash.com/photo-1580586287978-32b4a51c8c9a?w=1200&q=80",
      views: 670,
    },
    {
      title: "Nội thất hiện đại cho nhà phố 4 tầng tại Hoàng Long, Hà Nội",
      slug: "noi-that-hien-dai-nha-pho-hoang-long-ha-noi",
      excerpt: "Nội thất hiện đại tối giản cho nhà phố 4 tầng, gam màu xám trắng, gỗ và kim loại mạ.",
      content: `Dự án thiết kế nội thất hiện đại cho nhà phố 4 tầng tại Hoàng Long, Hà Nội. Sử dụng gam màu trung tính, gỗ tự nhiên và chi tiết kim loại mạ tạo không gian sống sạch sẽ, hiện đại và tiện nghi.`,
      coverUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
      views: 730,
    },
    {
      title: "Nhà phố tân cổ 4 tầng tại Nam Từ Liêm, Hà Nội",
      slug: "nha-pho-tan-co-4-tang-nam-tu-liem-ha-noi",
      excerpt: "Nhà phố 4 tầng tân cổ, đường nét đối xứng, cột tròn và hệ thống cửa vòm nhẹ nhàng.",
      content: `Công trình nhà phố 4 tầng tại Nam Từ Liêm, Hà Nội theo phong cách tân cổ. Đường nét đối xứng, cột tròn, vòm cửa chính và mái vòm nhẹ nhàng tạo vẻ sang trọng, trầm ấm cho gia đình.`,
      coverUrl: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80",
      views: 640,
    },
    {
      title: "Nhà phố indochi 3 tầng tại Đống Đa, Hà Nội",
      slug: "nha-pho-indochi-3-tang-dong-da-ha-noi",
      excerpt: "Nhà phố 3 tầng phong cách Indochi, mái ngói đỏ, lan can gỗ và không gian lang thang thoáng mát.",
      content: `Dự án nhà phố 3 tầng tại Đống Đa, Hà Nội theo phong cách Indochi. MáI ngói đỏ, lan can gỗ tự nhiên và hệ thống lang thang tạo không gian sống gần gũi, phù hợp khí hậu miền Bắc.`,
      coverUrl: "https://images.unsplash.com/photo-1580586287978-32b4a51c8c9a?w=1200&q=80",
      views: 590,
    },
    // Bắc Ninh - Nhà phố & Nhà vườn
    {
      title: "Nhà phố hiện đại 4 tầng tại khu đô thị mới Bắc Ninh",
      slug: "nha-pho-hien-dai-4-tang-bac-ninh",
      excerpt: "Nhà phố 4 tầng hiện đại tại Bắc Ninh, mặt kính, hệ thống thông gió và vườn nhỏ liền nhà.",
      content: `Dự án nhà phố 4 tầng tại khu đô thị mới Bắc Ninh. Thiết kế hiện đại với mặt kính toàn cao, hệ thống thông gió tự nhiên và tiểu cảnh vườn nhỏ liền nhà, tạo không gian sống tiện nghi cho gia đình miền Bắc.`,
      coverUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      views: 620,
    },
    {
      title: "Nhà phố tân cổ 5 tầng tại trung tâm Bắc Ninh",
      slug: "nha-pho-tan-co-5-tang-bac-ninh",
      excerpt: "Nhà phố 5 tầng tân cổ tại Bắc Ninh, đường nét cổ điển, cột tròn và mái vòm nhẹ nhàng.",
      content: `Công trình nhà phố 5 tầng tại trung tâm Bắc Ninh theo phong cách tân cổ. Đường nét đối xứng, cột tròn và hệ thống vòm cửa tạo vẻ sang trọng, phù hợp gia đình yêu thích kiến trúc cổ điển hiện đại.`,
      coverUrl: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80",
      views: 580,
    },
    {
      title: "Nhà phố indochi 4 tầng tại Bắc Ninh",
      slug: "nha-pho-indochi-4-tang-bac-ninh",
      excerpt: "Nhà phố 4 tầng phong cách Indochi tại Bắc Ninh, mái ngói, lan can gỗ và lang thang thoáng mát.",
      content: `Dự án nhà phố 4 tầng tại Bắc Ninh theo phong cách Indochi. MáI ngói đỏ, lan can gỗ tự nhiên và hệ thống lang thang tạo không gian sống gần gũi, phù hợp với sinh hoạt gia đình miền Bắc.`,
      coverUrl: "https://images.unsplash.com/photo-1580586287978-32b4a51c8c9a?w=1200&q=80",
      views: 560,
    },
    {
      title: "Nhà vườn sinh thái hiện đại tại Bắc Ninh",
      slug: "nha-vuon-sinh-thai-hien-dai-bac-ninh",
      excerpt: "Nhà vườn sinh thái hiện đại tại Bắc Ninh, gỗ tự nhiên, hồ nước nhỏ và cây xanh tràn trề.",
      content: `Dự án nhà vườn sinh thái hiện đại tại Bắc Ninh. Sử dụng gỗ tự nhiên, tiểu cảnh hồ nước và hệ thống cây xanh tràn trề tạo không gian sống proches với thiên nhiên, thả tha và bình yên.`,
      coverUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
      views: 680,
    },
    {
      title: "Nội thất hiện đại cho nhà phố tại Bắc Ninh",
      slug: "noi-that-hien-dai-nha-pho-bac-ninh",
      excerpt: "Nội thất hiện đại tối giản cho nhà phố tại Bắc Ninh, gam màu trắng xám và gỗ tự nhiên.",
      content: `Dự án thiết kế nội thất hiện đại cho nhà phố tại Bắc Ninh. Sử dụng gam màu trung tính, gỗ tự nhiên và đèn led tạo không gian sống sạch sẽ, hiện đại và dễ bảo quản.`,
      coverUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
      views: 600,
    },
    // Quảng Ninh
    {
      title: "Nhà phố hiện đại 3 tầng tại Hạ Long, Quảng Ninh",
      slug: "nha-pho-hien-dai-3-tang-ha-long-quang-ninh",
      excerpt: "Nhà phố 3 tầng hiện đại tại Hạ Long, Quảng Ninh, hướng nhìn biển, mặt kính và陽臺 rộng.",
      content: `Dự án nhà phố 3 tầng tại Hạ Long, Quảng Ninh. Thiết kế hiện đại hướng nhìn biển, mặt kính toàn cao và陽臺 rộng tận dụng gió biển, tạo không gian sống nghỉ dưỡng và sinh hoạt toàn diện.`,
      coverUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      views: 710,
    },
    {
      title: "Nhà phố tân cổ 4 tầng tại Hạ Long, Quảng Ninh",
      slug: "nha-pho-tan-co-4-tang-ha-long-quang-ninh",
      excerpt: "Nhà phố 4 tầng tân cổ tại Hạ Long, đường nét cổ điển, cột tròn và mái vòm sang trọng.",
      content: `Công trình nhà phố 4 tầng tại Hạ Long, Quảng Ninh theo phong cách tân cổ. Đường nét đối xứng, cột tròn và hệ thống vòm cửa tạo vẻ sang trọng, phù hợp sinh hoạt nghỉ dưỡng ven biển.`,
      coverUrl: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80",
      views: 570,
    },
    {
      title: "Nhà phố indochi 3 tầng tại Hạ Long, Quảng Ninh",
      slug: "nha-pho-indochi-3-tang-ha-long-quang-ninh",
      excerpt: "Nhà phố 3 tầng phong cách Indochi tại Hạ Long, mái ngói, lan can gỗ và không gian lang thang.",
      content: `Dự án nhà phố 3 tầng tại Hạ Long, Quảng Ninh theo phong cách Indochi. MáI ngói đỏ, lan can gỗ tự nhiên và hệ thống lang thang tạo không gian sống gần gũi, phù hợp khí hậu ven biển.`,
      coverUrl: "https://images.unsplash.com/photo-1580586287978-32b4a51c8c9a?w=1200&q=80",
      views: 540,
    },
    {
      title: "Nhà vườn nghỉ dưỡng hiện đại tại Quảng Ninh",
      slug: "nha-vuon-nghi-duong-hien-dai-quang-ninh",
      excerpt: "Nhà vườn nghỉ dưỡng hiện đại tại Quảng Ninh, gỗ tự nhiên, hồ bơi nhỏ và view biển.",
      content: `Dự án nhà vườn nghỉ dưỡng hiện đại tại Quảng Ninh. Sử dụng gỗ tự nhiên, tiểu cảnh hồ bơi nhỏ và hướng nhìn biển tạo không gian sống nghỉ dưỡng, thả tha và thư giãn.`,
      coverUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80",
      views: 750,
    },
    {
      title: "Nội thất hiện đại cho căn hộ view biển tại Quảng Ninh",
      slug: "noi-that-hien-dai-can-ho-view-bien-quang-ninh",
      excerpt: "Nội thất hiện đại cho căn hộ view biển tại Quảng Ninh, gam màu xanh trắng và gỗ trắng.",
      content: `Dự án thiết kế nội thất hiện đại cho căn hộ view biển tại Quảng Ninh. Sử dụng gam màu xanh trắng, gỗ trắng và đá marble tạo không gian sống sạch sẽ, tươi mát và tiện nghi.`,
      coverUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
      views: 630,
    },
    // Hà Nội - thêm nội thất & nhà phố đa dạng
    {
      title: "Nhà phố hiện đại 5 tầng tại Hoàng Mai, Hà Nội",
      slug: "nha-pho-hien-dai-5-tang-hoang-mai-ha-noi",
      excerpt: "Nhà phố 5 tầng hiện đại tại Hoàng Mai, hệ thông gió, mặt kính và vườn liền kề xanh mát.",
      content: `Dự án nhà phố 5 tầng tại Hoàng Mai, Hà Nội. Thiết kế hiện đại với hệ thống thông gió tự nhiên, mặt kính toàn cao và tiểu cảnh vườn liền kề, tạo không gian sống tiện nghi cho gia đình đô thị.`,
      coverUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      views: 690,
    },
    {
      title: "Nhà phố tân cổ 3 tầng tại Ba Đình, Hà Nội",
      slug: "nha-pho-tan-co-3-tang-ba-dinh-ha-noi",
      excerpt: "Nhà phố 3 tầng tân cổ tại Ba Đình, đường nét cổ điển, cột tròn và mái vòm nhẹ nhàng.",
      content: `Công trình nhà phố 3 tầng tại Ba Đình, Hà Nội theo phong cách tân cổ. Đường nét đối xứng, cột tròn và hệ thống vòm cửa tạo vẻ sang trọng, trầm ấm cho gia đình trung tâm thành phố.`,
      coverUrl: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80",
      views: 610,
    },
    {
      title: "Nhà phố indochi 4 tầng tại Cầu Giấy, Hà Nội",
      slug: "nha-pho-indochi-4-tang-cau-giay-ha-noi",
      excerpt: "Nhà phố 4 tầng phong cách Indochi tại Cầu Giấy, mái ngói, lan can gỗ và lang thang thoáng mát.",
      content: `Dự án nhà phố 4 tầng tại Cầu Giấy, Hà Nội theo phong cách Indochi. MáI ngói đỏ, lan can gỗ tự nhiên và hệ thống lang thang tạo không gian sống gần gũi, phù hợp đô thị.`,
      coverUrl: "https://images.unsplash.com/photo-1580586287978-32b4a51c8c9a?w=1200&q=80",
      views: 580,
    },
    {
      title: "Nội thất tân cổ cho căn hộ cao cấp tại Tây Hồ, Hà Nội",
      slug: "noi-that-tan-co-can-ho-tay-ho-ha-noi",
      excerpt: "Nội thất tân cổ sang trọng cho căn hộ cao cấp Tây Hồ, gỗ sồi, vải đêm và đèn thả.",
      content: `Dự án thiết kế nội thất tân cổ cho căn hộ cao cấp tại Tây Hồ, Hà Nội. Sử dụng gỗ sồi tự nhiên, vải đêm cao cấp và đèn thả sắt đúc tạo không gian sống sang trọng, cổ điển hiện đại.`,
      coverUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
      views: 770,
    },
    {
      title: "Nhà phố hiện đại 4 tầng tại Hà Đông, Hà Nội",
      slug: "nha-pho-hien-dai-4-tang-ha-dong-ha-noi",
      excerpt: "Nhà phố 4 tầng hiện đại tại Hà Đông, mặt kính, hệ thống thông gió và vườn nhỏ liền nhà.",
      content: `Dự án nhà phố 4 tầng tại Hà Đông, Hà Nội. Thiết kế hiện đại với mặt kính toàn cao, hệ thống thông gió tự nhiên và tiểu cảnh vườn nhỏ liền nhà, tạo không gian sống tiện nghi.`,
      coverUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      views: 640,
    },
    {
      title: "Nhà phố tân cổ 5 tầng tại Long Biên, Hà Nội",
      slug: "nha-pho-tan-co-5-tang-long-bien-ha-noi",
      excerpt: "Nhà phố 5 tầng tân cổ tại Long Biên, đường nét cổ điển, cột tròn và mái vòm sang trọng.",
      content: `Công trình nhà phố 5 tầng tại Long Biên, Hà Nội theo phong cách tân cổ. Đường nét đối xứng, cột tròn và hệ thống vòm cửa tạo vẻ sang trọng, trầm ấm cho gia đình.`,
      coverUrl: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80",
      views: 590,
    },
    {
      title: "Nhà phố indochi 3 tầng tại Hai Bà Trưng, Hà Nội",
      slug: "nha-pho-indochi-3-tang-hai-ba-trung-ha-noi-2",
      excerpt: "Nhà phố 3 tầng phong cách Indochi tại Hai Bà Trưng, mái ngói, lan can gỗ và lang thang.",
      content: `Dự án nhà phố 3 tầng tại Hai Bà Trưng, Hà Nội theo phong cách Indochi. MáI ngói đỏ, lan can gỗ tự nhiên và hệ thống lang thang tạo không gian sống gần gũi, phù hợp đô thị.`,
      coverUrl: "https://images.unsplash.com/photo-1580586287978-32b4a51c8c9a?w=1200&q=80",
      views: 550,
    },
    {
      title: "Nội thất hiện đại cho nhà phố 5 tầng tại Cầu Giấy, Hà Nội",
      slug: "noi-that-hien-dai-nha-pho-5-tang-cau-giay-ha-noi",
      excerpt: "Nội thất hiện đại tối giản cho nhà phố 5 tầng Cầu Giấy, gam màu trắng xám và gỗ tự nhiên.",
      content: `Dự án thiết kế nội thất hiện đại cho nhà phố 5 tầng tại Cầu Giấy, Hà Nội. Sử dụng gam màu trung tính, gỗ tự nhiên và đèn led tạo không gian sống sạch sẽ, hiện đại và dễ bảo quản.`,
      coverUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
      views: 710,
    },
    {
      title: "Nhà phố hiện đại 3 tầng tại Nam Từ Liêm, Hà Nội",
      slug: "nha-pho-hien-dai-3-tang-nam-tu-liem-ha-noi",
      excerpt: "Nhà phố 3 tầng hiện đại tại Nam Từ Liêm, hệ thông gió, mặt kính và vườn liền kề xanh mát.",
      content: `Dự án nhà phố 3 tầng tại Nam Từ Liêm, Hà Nội. Thiết kế hiện đại với hệ thống thông gió tự nhiên, mặt kính toàn cao và tiểu cảnh vườn liền kề, tạo không gian sống tiện nghi cho gia đình đô thị.`,
      coverUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      views: 620,
    },
    {
      title: "Nhà phố tân cổ 4 tầng tại Hoàng Mai, Hà Nội",
      slug: "nha-pho-tan-co-4-tang-hoang-mai-ha-noi",
      excerpt: "Nhà phố 4 tầng tân cổ tại Hoàng Mai, đường nét cổ điển, cột tròn và mái vòm nhẹ nhàng.",
      content: `Công trình nhà phố 4 tầng tại Hoàng Mai, Hà Nội theo phong cách tân cổ. Đường nét đối xứng, cột tròn và hệ thống vòm cửa tạo vẻ sang trọng, trầm ấm cho gia đình.`,
      coverUrl: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80",
      views: 570,
    },
    {
      title: "Nhà phố indochi 5 tầng tại Thanh Xuân, Hà Nội",
      slug: "nha-pho-indochi-5-tang-thanh-xuan-ha-noi",
      excerpt: "Nhà phố 5 tầng phong cách Indochi tại Thanh Xuân, mái ngói, lan can gỗ và không gian lang thang.",
      content: `Dự án nhà phố 5 tầng tại Thanh Xuân, Hà Nội theo phong cách Indochi. MáI ngói đỏ, lan can gỗ tự nhiên và hệ thống lang thang tạo không gian sống gần gũi, phù hợp khí hậu miền Bắc.`,
      coverUrl: "https://images.unsplash.com/photo-1580586287978-32b4a51c8c9a?w=1200&q=80",
      views: 540,
    },
    {
      title: "Nội thất tân cổ cho biệt thự đô thị tại Hà Đông, Hà Nội",
      slug: "noi-that-tan-co-biet-thu-ha-dong-ha-noi-2",
      excerpt: "Nội thất tân cổ sang trọng cho biệt thự đô thị Hà Đông, gỗ sồi, vải đêm và đèn thả sắt đúc.",
      content: `Dự án thiết kế nội thất tân cổ cho biệt thự đô thị tại Hà Đông, Hà Nội. Sử dụng gỗ sồi tự nhiên, vải đêm cao cấp và đèn thả sắt đúc tạo không gian sống sang trọng, cổ điển hiện đại.`,
      coverUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
      views: 760,
    },
    {
      title: "Nhà phố hiện đại 4 tầng tại Bắc Từ Liêm, Hà Nội",
      slug: "nha-pho-hien-dai-4-tang-bac-tu-liem-ha-noi-2",
      excerpt: "Nhà phố 4 tầng hiện đại tại Bắc Từ Liêm, mặt kính, hệ thống thông gió và vườn nhỏ liền nhà.",
      content: `Dự án nhà phố 4 tầng tại Bắc Từ Liêm, Hà Nội. Thiết kế hiện đại với mặt kính toàn cao, hệ thống thông gió tự nhiên và tiểu cảnh vườn nhỏ liền nhà, tạo không gian sống tiện nghi.`,
      coverUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      views: 630,
    },
    {
      title: "Nhà phố tân cổ 3 tầng tại Tây Hồ, Hà Nội",
      slug: "nha-pho-tan-co-3-tang-tay-ho-ha-noi",
      excerpt: "Nhà phố 3 tầng tân cổ tại Tây Hồ, đường nét cổ điển, cột tròn và mái vòm sang trọng.",
      content: `Công trình nhà phố 3 tầng tại Tây Hồ, Hà Nội theo phong cách tân cổ. Đường nét đối xứng, cột tròn và hệ thống vòm cửa tạo vẻ sang trọng, trầm ấm cho gia đình trung tâm thành phố.`,
      coverUrl: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80",
      views: 580,
    },
    {
      title: "Nhà phố indochi 4 tầng tại Hoàng Long, Hà Nội",
      slug: "nha-pho-indochi-4-tang-hoang-long-ha-noi",
      excerpt: "Nhà phố 4 tầng phong cách Indochi tại Hoàng Long, mái ngói, lan can gỗ và lang thang thoáng mát.",
      content: `Dự án nhà phố 4 tầng tại Hoàng Long, Hà Nội theo phong cách Indochi. MáI ngói đỏ, lan can gỗ tự nhiên và hệ thống lang thang tạo không gian sống gần gũi, phù hợp đô thị.`,
      coverUrl: "https://images.unsplash.com/photo-1580586287978-32b4a51c8c9a?w=1200&q=80",
      views: 530,
    },
    {
      title: "Nội thất hiện đại cho căn hộ tại Ba Đình, Hà Nội",
      slug: "noi-that-hien-dai-can-ho-ba-dinh-ha-noi",
      excerpt: "Nội thất hiện đại tối giản cho căn hộ Ba Đình, gam màu trắng xám và gỗ tự nhiên.",
      content: `Dự án thiết kế nội thất hiện đại cho căn hộ tại Ba Đình, Hà Nội. Sử dụng gam màu trung tính, gỗ tự nhiên và đèn led tạo không gian sống sạch sẽ, hiện đại và dễ bảo quản.`,
      coverUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
      views: 690,
    },
    {
      title: "Nhà phố hiện đại 5 tầng tại Long Biên, Hà Nội",
      slug: "nha-pho-hien-dai-5-tang-long-bien-ha-noi",
      excerpt: "Nhà phố 5 tầng hiện đại tại Long Biên, hệ thông gió, mặt kính và vườn liền kề xanh mát.",
      content: `Dự án nhà phố 5 tầng tại Long Biên, Hà Nội. Thiết kế hiện đại với hệ thống thông gió tự nhiên, mặt kính toàn cao và tiểu cảnh vườn liền kề, tạo không gian sống tiện nghi cho gia đình đô thị.`,
      coverUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      views: 660,
    },
    {
      title: "Nhà phố tân cổ 4 tầng tại Đống Đa, Hà Nội",
      slug: "nha-pho-tan-co-4-tang-dong-da-ha-noi",
      excerpt: "Nhà phố 4 tầng tân cổ tại Đống Đa, đường nét cổ điển, cột tròn và mái vòm nhẹ nhàng.",
      content: `Công trình nhà phố 4 tầng tại Đống Đa, Hà Nội theo phong cách tân cổ. Đường nét đối xứng, cột tròn và hệ thống vòm cửa tạo vẻ sang trọng, trầm ấm cho gia đình.`,
      coverUrl: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80",
      views: 560,
    },
    {
      title: "Nhà phố indochi 3 tầng tại Hà Đông, Hà Nội",
      slug: "nha-pho-indochi-3-tang-ha-dong-ha-noi",
      excerpt: "Nhà phố 3 tầng phong cách Indochi tại Hà Đông, mái ngói, lan can gỗ và lang thang thoáng mát.",
      content: `Dự án nhà phố 3 tầng tại Hà Đông, Hà Nội theo phong cách Indochi. MáI ngói đỏ, lan can gỗ tự nhiên và hệ thống lang thang tạo không gian sống gần gũi, phù hợp đô thị.`,
      coverUrl: "https://images.unsplash.com/photo-1580586287978-32b4a51c8c9a?w=1200&q=80",
      views: 520,
    },
    {
      title: "Nội thất hiện đại cho nhà phố tại Thanh Xuân, Hà Nội",
      slug: "noi-that-hien-dai-nha-pho-thanh-xuan-ha-noi",
      excerpt: "Nội thất hiện đại tối giản cho nhà phố Thanh Xuân, gam màu trắng xám và gỗ tự nhiên.",
      content: `Dự án thiết kế nội thất hiện đại cho nhà phố tại Thanh Xuân, Hà Nội. Sử dụng gam màu trung tính, gỗ tự nhiên và đèn led tạo không gian sống sạch sẽ, hiện đại và dễ bảo quản.`,
      coverUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
      views: 670,
    },
    {
      title: "Nhà vườn sinh thái hiện đại tại Hà Nội",
      slug: "nha-vuon-sinh-thai-hien-dai-ha-noi",
      excerpt: "Nhà vườn sinh thái hiện đại tại Hà Nội, gỗ tự nhiên, hồ nước nhỏ và cây xanh tràn trề.",
      content: `Dự án nhà vườn sinh thái hiện đại tại Hà Nội. Sử dụng gỗ tự nhiên, tiểu cảnh hồ nước và hệ thống cây xanh tràn trề tạo không gian sống proches với thiên nhiên, thả tha và bình yên.`,
      coverUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
      views: 720,
    },
    {
      title: "Nhà phố tân cổ 5 tầng tại Cầu Giấy, Hà Nội",
      slug: "nha-pho-tan-co-5-tang-cau-giay-ha-noi",
      excerpt: "Nhà phố 5 tầng tân cổ tại Cầu Giấy, đường nét cổ điển, cột tròn và mái vòm sang trọng.",
      content: `Công trình nhà phố 5 tầng tại Cầu Giấy, Hà Nội theo phong cách tân cổ. Đường nét đối xứng, cột tròn và hệ thống vòm cửa tạo vẻ sang trọng, trầm ấm cho gia đình trung tâm thành phố.`,
      coverUrl: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80",
      views: 590,
    },
    {
      title: "Nhà phố indochi 5 tầng tại Bắc Ninh",
      slug: "nha-pho-indochi-5-tang-bac-ninh",
      excerpt: "Nhà phố 5 tầng phong cách Indochi tại Bắc Ninh, mái ngói, lan can gỗ và không gian lang thang.",
      content: `Dự án nhà phố 5 tầng tại Bắc Ninh theo phong cách Indochi. MáI ngói đỏ, lan can gỗ tự nhiên và hệ thống lang thang tạo không gian sống gần gũi, phù hợp khí hậu miền Bắc.`,
      coverUrl: "https://images.unsplash.com/photo-1580586287978-32b4a51c8c9a?w=1200&q=80",
      views: 540,
    },
    {
      title: "Nội thất tân cổ cho căn hộ view biển tại Quảng Ninh",
      slug: "noi-that-tan-co-can-ho-view-bien-quang-ninh",
      excerpt: "Nội thất tân cổ sang trọng cho căn hộ view biển Quảng Ninh, gỗ sồi, vải đêm và đèn thả.",
      content: `Dự án thiết kế nội thất tân cổ cho căn hộ view biển tại Quảng Ninh. Sử dụng gỗ sồi tự nhiên, vải đêm cao cấp và đèn thả sắt đúc tạo không gian sống sang trọng, cổ điển hiện đại.`,
      coverUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
      views: 750,
    },
    {
      title: "Nhà phố hiện đại 4 tầng tại Hạ Long, Quảng Ninh",
      slug: "nha-pho-hien-dai-4-tang-ha-long-quang-ninh",
      excerpt: "Nhà phố 4 tầng hiện đại tại Hạ Long, mặt kính, hệ thông gió và hướng nhìn biển.",
      content: `Dự án nhà phố 4 tầng tại Hạ Long, Quảng Ninh. Thiết kế hiện đại với mặt kính toàn cao, hệ thống thông gió tự nhiên và hướng nhìn biển, tạo không gian sống nghỉ dưỡng và sinh hoạt toàn diện.`,
      coverUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      views: 700,
    },
    {
      title: "Nhà phố tân cổ 3 tầng tại Quảng Ninh",
      slug: "nha-pho-tan-co-3-tang-quang-ninh",
      excerpt: "Nhà phố 3 tầng tân cổ tại Quảng Ninh, đường nét cổ điển, cột tròn và mái vòm nhẹ nhàng.",
      content: `Công trình nhà phố 3 tầng tại Quảng Ninh theo phong cách tân cổ. Đường nét đối xứng, cột tròn và hệ thống vòm cửa tạo vẻ sang trọng, trầm ấm cho gia đình ven biển.`,
      coverUrl: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80",
      views: 550,
    },
    {
      title: "Nội thất hiện đại cho nhà phố tại Bắc Ninh",
      slug: "noi-that-hien-dai-nha-pho-bac-ninh-2",
      excerpt: "Nội thất hiện đại tối giản cho nhà phố Bắc Ninh, gam màu trắng xám và gỗ tự nhiên.",
      content: `Dự án thiết kế nội thất hiện đại cho nhà phố tại Bắc Ninh. Sử dụng gam màu trung tính, gỗ tự nhiên và đèn led tạo không gian sống sạch sẽ, hiện đại và dễ bảo quản.`,
      coverUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
      views: 610,
    },
    {
      title: "Nhà phố hiện đại 3 tầng tại Quảng Ninh",
      slug: "nha-pho-hien-dai-3-tang-quang-ninh",
      excerpt: "Nhà phố 3 tầng hiện đại tại Quảng Ninh, mặt kính, hệ thống thông gió và hướng nhìn biển.",
      content: `Dự án nhà phố 3 tầng tại Quảng Ninh. Thiết kế hiện đại với mặt kính toàn cao, hệ thống thông gió tự nhiên và hướng nhìn biển, tạo không gian sống nghỉ dưỡng và sinh hoạt toàn diện.`,
      coverUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      views: 680,
    },
    {
      title: "Nhà phố tân cổ 4 tầng tại Quảng Ninh",
      slug: "nha-pho-tan-co-4-tang-quang-ninh",
      excerpt: "Nhà phố 4 tầng tân cổ tại Quảng Ninh, đường nét cổ điển, cột tròn và mái vòm sang trọng.",
      content: `Công trình nhà phố 4 tầng tại Quảng Ninh theo phong cách tân cổ. Đường nét đối xứng, cột tròn và hệ thống vòm cửa tạo vẻ sang trọng, trầm ấm cho gia đình ven biển.`,
      coverUrl: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80",
      views: 560,
    },
    {
      title: "Nhà phố indochi 4 tầng tại Quảng Ninh",
      slug: "nha-pho-indochi-4-tang-quang-ninh",
      excerpt: "Nhà phố 4 tầng phong cách Indochi tại Quảng Ninh, mái ngói, lan can gỗ và lang thang thoáng mát.",
      content: `Dự án nhà phố 4 tầng tại Quảng Ninh theo phong cách Indochi. MáI ngói đỏ, lan can gỗ tự nhiên và hệ thống lang thang tạo không gian sống gần gũi, phù hợp khí hậu ven biển.`,
      coverUrl: "https://images.unsplash.com/photo-1580586287978-32b4a51c8c9a?w=1200&q=80",
      views: 530,
    },
    {
      title: "Tổng hợp 5 xu hướng thiết kế nhà phố hiện đại tại Hà Nội 2026",
      slug: "tong-hop-5-xu-huong-thiet-ke-nha-pho-hien-dai-ha-noi-2026",
      excerpt: "5 xu hướng thiết kế nhà phố hiện đại tại Hà Nội: mặt kính, thông gió, vườn liền kề, tốt giản và bền vững.",
      content: `Bài viết tổng hợp 5 xu hướng thiết kế nhà phố hiện đại tại Hà Nội năm 2026, bao gồm mặt kính toàn cao, hệ thống thông gió tự nhiên, tiểu cảnh vườn liền kề, phong cách tốt giản và kiến trúc bền vững.`,
      coverUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      views: 880,
    },
    {
      title: "Hướng dẫn chọn phong cách nội thất tân cổ cho nhà phố Hà Nội",
      slug: "huong-dan-chon-phong-cach-noi-that-tan-co-nha-pho-ha-noi",
      excerpt: "Hướng dẫn chọn nội thất tân cổ cho nhà phố Hà Nội: gỗ sồi, vải đêm, đèn thả và tủ ámtường khắc họa.",
      content: `Bài viết hướng dẫn cách chọn nội thất tân cổ cho nhà phố tại Hà Nội, tập trung vào gỗ sồi tự nhiên, vải đêm cao cấp, đèn thả sắt đúc và các chi tiết khắc họa tinh tế.`,
      coverUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
      views: 790,
    },
    {
      title: "Nhà phố indochi - văn hóa và kiến trúc tại miền Bắc",
      slug: "nha-pho-indochi-van-hoa-va-kien-truc-mien-bac",
      excerpt: "Nhà phố indochi kết hợp kiến trúc phương Đông và phương Tây, mái ngói, lan can gỗ và lang thang.",
      content: `Bài viết giới thiệu phong cách nhà phố indochi tại miền Bắc, kết hợp giữa mái ngói Conical, lan can gỗ tự nhiên và hệ thống lang thang tạo không gian sống gần gũi, phù hợp với khí hậu.`,
      coverUrl: "https://images.unsplash.com/photo-1580586287978-32b4a51c8c9a?w=1200&q=80",
      views: 650,
    },
  ];

  const categoryByType = (title) => {
    if (title.includes("nội thất")) return catInterior.id;
    if (title.includes("nhà vườn")) return catVilla.id;
    return catTownhouse.id;
  };
  const styleByTitle = (title) => {
    if (title.includes("tân cổ")) return "Tân Cổ / Neo-Classical";
    if (title.includes("indochi")) return "Indochi / Đông Tây Hợp Wall";
    return "Modern / Hiện Đại";
  };
  const coverByType = (title, idx) => {
    if (title.includes("nội thất")) return idx % 2 ? "media_interior_1" : "media_interior_2";
    if (title.includes("nhà vườn")) return idx % 2 ? "media_moc_wood" : "media_villa_3";
    return idx % 2 ? "media_townhouse_1" : "media_townhouse_2";
  };
  const tagsByTitle = (title) => {
    const t = [];
    if (title.includes("nội thất")) t.push("noi-that");
    else if (title.includes("nhà vườn")) t.push("nha-vuon");
    else t.push("nha-pho");
    if (title.includes("tân cổ")) t.push("tans-co");
    else if (title.includes("indochi")) t.push("indochi");
    else t.push("hien-dai");
    if (title.includes("Hà Nội")) t.push("ha-noi");
    if (title.includes("Bắc Ninh")) t.push("bac-ninh");
    if (title.includes("Quảng Ninh")) t.push("quang-ninh");
    return t;
  };

  let idx = 0;
  for (const p of postsData) {
    const tagSlugs = tagsByTitle(p.title);
    const locMatch = p.title.match(/tại (.+)$/);
    const location = locMatch ? locMatch[1] : "Hà Nội";
    const coverId = `media_extra_${idx % extraCount}`;
    const galleryIds = [
      `media_extra_${(idx + 1) % extraCount}`,
      `media_extra_${(idx + 2) % extraCount}`,
    ];
    const project = await prisma.project.create({
      data: {
        title: p.title,
        slug: p.slug,
        shortDesc: p.excerpt,
        description: p.content,
        location,
        year: p.title.includes("2026") ? 2026 : 2025,
        area: 120 + (idx % 8) * 30,
        style: styleByTitle(p.title),
        buildingType: p.title.includes("nội thất") ? "Nội thất cao cấp" : (p.title.includes("nhà vườn") ? "Nhà vườn sinh thái" : "Nhà phố hiện đại"),
        isFeatured: false,
        categoryId: categoryByType(p.title),
        coverId,
      },
    });
    await prisma.projectMedia.createMany({
      data: [
        { projectId: project.id, mediaId: coverId, sortOrder: 0 },
        ...galleryIds.map((m, i) => ({ projectId: project.id, mediaId: m, sortOrder: i + 1 })),
      ],
    });
    await prisma.projectTag.createMany({
      data: tagSlugs.map((s) => ({ projectId: project.id, tagId: tagsMap[s] })).filter((x) => x.tagId),
    });
    idx++;
  }
  console.log(`✅ Seeded ${postsData.length} Projects (Nhà Phố / Nội Thất / Nhà Vườn)`);

  console.log("🚀 ACD Architecture database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
