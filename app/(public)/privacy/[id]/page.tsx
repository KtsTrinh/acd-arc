import { getSettings } from "@/lib/settings";
import { notFound } from "next/navigation";

export default async function PrivacyDetailPage({ params }: { params: { id: string } }) {
  const settings = await getSettings();
  let sections: { title: string; content: string }[] = [];
  try {
    const parsed = JSON.parse(settings.privacyPolicy || "[]");
    if (Array.isArray(parsed)) sections = parsed;
  } catch {
    if (settings.privacyPolicy) sections = [{ title: "", content: settings.privacyPolicy }];
  }
  const idx = Number(params.id);
  const section = sections[idx];
  if (!section) notFound();
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl text-justify pt-24">
      {section.title && <h1 className="text-2xl font-bold mb-6">{section.title}</h1>}
      <div className="prose prose-invert" dangerouslySetInnerHTML={{ __html: section.content }} />
    </div>
  );
}