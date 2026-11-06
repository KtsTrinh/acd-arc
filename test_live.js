const BASE = "https://acd-1cwrigrab-trinhhongtukts-4426s-projects.vercel.app";
(async () => {
  try {
    const r = await fetch(BASE + "/api/products?includeInactive=1");
    const d = await r.json();
    console.log("GET status:", r.status);
    console.log("BODY:", JSON.stringify(d));
  } catch (e) { console.error("ERR:", e.message); }
})();