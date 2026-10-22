import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VisitorTracker from "@/components/tracking/VisitorTracker";
import { getSettings } from "@/lib/settings";

export const revalidate = 0;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  if (settings.maintenanceMode === "true") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-thuy-950">
        <span className="font-display font-black text-4xl text-white mb-4">ACD</span>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-3">
          Website đang được bảo trì
        </h1>
        <p className="text-sm text-slate-400 max-w-md">
          {settings.siteName} tạm thời không phục vụ. Vui lòng quay lại sau ít phút.
        </p>
        <a
          href={`mailto:${settings.contactEmail}`}
          className="mt-6 px-5 py-2.5 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs"
        >
          {settings.contactEmail}
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <VisitorTracker />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
