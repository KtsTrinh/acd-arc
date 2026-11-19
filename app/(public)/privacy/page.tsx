import { prisma } from "@/lib/prisma";

export default async function PrivacyPage() {
  const setting = await prisma.systemSetting.findUnique({ where: { key: "privacy_policy" } });
  const content = setting?.value || "<p>Nội dung đang được cập nhật.</p>";
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl text-justify pt-24">
      <h1 className="text-2xl font-bold mb-6">Điều khoản và chính sách chung</h1>
      <div className="prose prose-invert" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
