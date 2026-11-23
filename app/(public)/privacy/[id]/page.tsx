import { getSettings } from "@/lib/settings";
import { notFound } from "next/navigation";

function formatPolicyHtml(html: string) {
  if (!html) return "";
  return (
    html
      // Tự động chuyển các tiêu đề lớn (1.1., Phần I, Chính sách đổi trả...) thành thẻ <h2> có viền xanh
      .replace(
        /<p>\s*<(?:strong|b)>\s*((?:\d+\.\d+\.?|Phần\s+[IVX]+:?|Chính sách đổi trả)[^<]*)\s*<\/(?:strong|b)>\s*<\/p>/gi,
        "<h2>$1</h2>",
      )
      // Tự động chuyển các tiêu đề mục nhỏ (1., 2., 3. đứng đầu dòng riêng) thành thẻ <h3>
      .replace(
        /<p>\s*<(?:strong|b)>\s*(\d+\.\s+[^<]+)\s*<\/(?:strong|b)>\s*<\/p>/gi,
        "<h3>$1</h3>",
      )
  );
}

export default async function PrivacyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const settings = await getSettings();
  let sections: { title: string; content: string }[] = [];
  try {
    const parsed = JSON.parse(settings.privacyPolicy || "[]");
    if (Array.isArray(parsed)) sections = parsed;
  } catch {
    if (settings.privacyPolicy)
      sections = [{ title: "", content: settings.privacyPolicy }];
  }
  const idx = Number(params.id);
  const section = sections[idx];
  if (!section) notFound();

  return (
    <div className="container mx-auto px-4 sm:px-6 pt-28 pb-20 max-w-3xl text-justify">
      {section.title && (
        <header className="border-b border-slate-800 pb-6 mb-8 text-left">
          <p className="text-sky-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Điều khoản & Chính sách ACD Studio
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
            {section.title}
          </h1>
        </header>
      )}
      <div
        className="policy-rich-text"
        dangerouslySetInnerHTML={{ __html: formatPolicyHtml(section.content) }}
      />
    </div>
  );
}
