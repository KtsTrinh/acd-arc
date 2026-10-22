"use client";

import React, { useState, useEffect } from "react";
import { Plus, Tags, Loader2 } from "lucide-react";
import { autoSyncAfterSave } from "@/components/admin/CmsSyncButton";

export default function AdminTagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const fetchTags = async () => {
    try {
      const res = await fetch("/api/tags");
      const data = await res.json();
      if (data.tags) setTags(data.tags);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.tag) {
        setName("");
        fetchTags();
        await autoSyncAfterSave(`tag "${data.tag.name}"`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
          Quáº£n LÃ½ Tháº» PhÃ¢n Loáº¡i (Tags)
        </h1>
        <p className="text-xs text-slate-400">
          GÃ¡n nhÃ£n phong cÃ¡ch vÃ  Ä‘áº·c Ä‘iá»ƒm kiáº¿n trÃºc cho dá»± Ã¡n vÃ  bÃ i viáº¿t
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-thuy-850 border border-thuy-750 space-y-4">
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            required
            placeholder="TÃªn tháº» tag má»›i (vÃ­ dá»¥: Biá»‡t Thá»± Äá»“i, Wabi-Sabi, Há»“ BÆ¡i VÃ´ Cá»±c...)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs text-white focus:outline-none focus:border-thuy-400"
          />
          <button
            type="submit"
            disabled={isCreating}
            className="px-5 py-2.5 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase hover:brightness-110 shadow-glow-cyan flex items-center gap-1.5"
          >
            {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>ThÃªm Tag</span>
          </button>
        </form>

        <div className="pt-4 border-t border-thuy-750 flex flex-wrap gap-2.5">
          {tags.map((t) => (
            <div
              key={t.id}
              className="px-3.5 py-1.5 rounded-xl bg-thuy-900 border border-thuy-700 text-xs font-medium text-slate-200 flex items-center gap-2"
            >
              <span>#{t.name}</span>
              <span className="text-[10px] text-thuy-400 font-bold bg-thuy-800 px-1.5 py-0.5 rounded">
                {t._count?.projects || 0} dá»± Ã¡n
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

