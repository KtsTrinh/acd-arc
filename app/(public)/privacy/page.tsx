import { getSettings } from "@/lib/settings";

export default async function PrivacyPage() {
  const settings = await getSettings();
  let sections: { title: string; content: string }[] = [];
  try {
    const parsed = JSON.parse(settings.privacyPolicy || "[]");
    if (Array.isArray(parsed)) sections = parsed;
  } catch {
    if (settings.privacyPolicy) sections = [{ title: "", content: settings.privacyPolicy }];
  }
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl text-justify pt-24">
      {sections.map((s, i) => (
        <div key={i} className="mb-6">
          {s.title && <h2 className="text-xl font-bold mb-2">{s.title}</h2>}
          <div className="prose prose-invert" dangerouslySetInnerHTML={{ __html: s.content }} />
        </div>
      ))}
      {sections.length === 0 && <p>Nội dung đang được cập nhật.</p>}
    </div>
  );
}