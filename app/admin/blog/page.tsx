"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Trash2, BookOpen, ExternalLink, Loader2, X } from "lucide-react";
import { autoSyncAfterSave } from "@/components/admin/CmsSyncButton";
import { slugify, formatDateTime } from "@/lib/utils";
import MediaPickerModal, { MediaItem } from "@/components/media/MediaPickerModal";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/blog");
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(slugify(val));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          content,
          coverUrl,
        }),
      });
      const data = await res.json();
      if (data.post) {
        setIsModalOpen(false);
        setTitle("");
        setSlug("");
        setExcerpt("");
        setContent("");
        setCoverUrl("");
        fetchPosts();
        await autoSyncAfterSave(`bÃ i viáº¿t "${data.post.title}"`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Quáº£n LÃ½ Táº¡p ChÃ­ & BÃ i Viáº¿t Kiáº¿n TrÃºc
          </h1>
          <p className="text-xs text-slate-400">
            NghiÃªn cá»©u phong thá»§y Má»‡nh Thá»§y, xu hÆ°á»›ng thiáº¿t káº¿ biá»‡t thá»± vÃ  tÃ i liá»‡u chuyÃªn sÃ¢u
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase hover:brightness-110 shadow-glow-cyan transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Viáº¿t BÃ i Má»›i</span>
        </button>
      </div>

      {/* Posts Table */}
      <div className="rounded-2xl bg-thuy-850 border border-thuy-750 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-thuy-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-thuy-750">
              <tr>
                <th className="py-3 px-5">áº¢nh BÃ¬a</th>
                <th className="py-3 px-5">TiÃªu Äá» BÃ i Viáº¿t</th>
                <th className="py-3 px-5">LÆ°á»£t Xem</th>
                <th className="py-3 px-5">NgÃ y ÄÄƒng</th>
                <th className="py-3 px-5 text-right">Xem Public</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-thuy-750/60">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-thuy-800/40">
                  <td className="py-3.5 px-5">
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-thuy-950 border border-thuy-700">
                      {post.coverUrl ? (
                        <Image src={post.coverUrl} alt={post.title} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <BookOpen className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="font-bold text-white block text-sm">{post.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">/blog/{post.slug}</span>
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-thuy-400">
                    {post.views} lÆ°á»£t xem
                  </td>
                  <td className="py-3.5 px-5 text-slate-300">
                    {formatDateTime(post.createdAt)}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="p-2 rounded-lg bg-thuy-800 hover:bg-thuy-700 text-slate-200 inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create Post */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-thuy-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl bg-thuy-900 border border-thuy-700 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-thuy-750">
              <h3 className="font-semibold text-base text-white">Soáº¡n Tháº£o BÃ i Viáº¿t Má»›i</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300">TiÃªu Ä‘á» bÃ i viáº¿t *:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="á»¨ng dá»¥ng yáº¿u tá»‘ Thá»§y trong kiáº¿n trÃºc..."
                  className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-300">áº¢nh bÃ¬a bÃ i viáº¿t (URL):</label>
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    className="text-[10px] text-thuy-400 hover:underline"
                  >
                    Chá»n tá»« Media Library
                  </button>
                </div>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">TÃ³m táº¯t ngáº¯n (Excerpt):</label>
                <input
                  type="text"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="TÃ³m táº¯t ná»™i dung 1-2 cÃ¢u..."
                  className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Ná»™i dung chi tiáº¿t *:</label>
                <textarea
                  rows={8}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Ná»™i dung bÃ i viáº¿t kiáº¿n trÃºc..."
                  className="w-full p-3.5 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-2.5 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase hover:brightness-110 shadow-glow-cyan flex items-center justify-center gap-2"
              >
                {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Xuáº¥t Báº£n BÃ i Viáº¿t</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(selected) => {
          if (!Array.isArray(selected)) {
            setCoverUrl(selected.url);
          }
        }}
        multiple={false}
        title="Chá»n áº£nh bÃ¬a bÃ i viáº¿t tá»« Media Library"
      />
    </div>
  );
}

