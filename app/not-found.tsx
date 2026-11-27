export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-slate-400 mb-6">Trang bạn tìm không tồn tại.</p>
      <a href="/" className="px-5 py-2.5 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs">Về trang chủ</a>
    </div>
  );
}

