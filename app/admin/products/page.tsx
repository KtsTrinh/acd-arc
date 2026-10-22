"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { formatVND, slugify } from "@/lib/utils";
import { Plus, Trash2, Package, Download, Loader2, Check, X } from "lucide-react";
import MediaPickerModal, { MediaItem } from "@/components/media/MediaPickerModal";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("CAD");
  const [fileFormat, setFileFormat] = useState("AutoCAD .DWG");
  const [fileSize, setFileSize] = useState("120 MB");
  const [fileKey, setFileKey] = useState("cad/villa-modern-full-cad-pack.zip");
  const [thumbnail, setThumbnail] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(slugify(val));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          price: parseFloat(price),
          type,
          fileFormat,
          fileSize,
          fileKey,
          thumbnail,
          active: true,
        }),
      });
      const data = await res.json();
      if (data.product) {
        setIsModalOpen(false);
        setName("");
        setSlug("");
        setDescription("");
        setPrice("");
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a sáº£n pháº©m nÃ y?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Quáº£n LÃ½ Sáº£n Pháº©m & TÃ i NguyÃªn Ká»¹ Thuáº­t Sá»‘
          </h1>
          <p className="text-xs text-slate-400">
            Há»“ sÆ¡ AutoCAD, mÃ´ hÃ¬nh 3D (3ds Max, SketchUp), bá»™ model ná»™i tháº¥t vÃ  template
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase hover:brightness-110 shadow-glow-cyan transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ ThÃªm Sáº£n Pháº©m Má»›i</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-thuy-850 border border-thuy-750 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-thuy-900/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-thuy-750">
              <tr>
                <th className="py-3 px-5">Thumbnail</th>
                <th className="py-3 px-5">TÃªn Sáº£n Pháº©m</th>
                <th className="py-3 px-5">Loáº¡i</th>
                <th className="py-3 px-5">GiÃ¡ BÃ¡n</th>
                <th className="py-3 px-5">File Táº£i Vá» & Äá»‹nh Dáº¡ng</th>
                <th className="py-3 px-5 text-right">Thao TÃ¡c</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-thuy-750/60">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-thuy-800/40">
                  <td className="py-3.5 px-5">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-thuy-950 border border-thuy-700">
                      {p.thumbnail ? (
                        <Image src={p.thumbnail} alt={p.name} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Download className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="font-bold text-white block text-sm">{p.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">/products/{p.slug}</span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="px-2.5 py-0.5 rounded-full bg-thuy-800 text-thuy-300 text-[10px] font-bold border border-thuy-700">
                      {p.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-bold text-thuy-400 text-sm">
                    {formatVND(p.price)}
                  </td>
                  <td className="py-3.5 px-5 text-slate-300">
                    <div>{p.fileFormat || "ChÆ°a cáº­p nháº­t"}</div>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Key: {p.fileKey || "none"} ({p.fileSize || "N/A"})
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 rounded-lg bg-thuy-800 hover:bg-red-950 hover:text-red-400 text-slate-400 border border-thuy-700"
                      title="XÃ³a"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-thuy-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-xl bg-thuy-900 border border-thuy-700 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-thuy-750">
              <h3 className="font-semibold text-base text-white">ThÃªm Sáº£n Pháº©m Má»›i</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300">TÃªn sáº£n pháº©m *:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Bá»™ Há»“ SÆ¡ AutoCAD Biá»‡t Thá»± Hiá»‡n Äáº¡i..."
                  className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">GiÃ¡ bÃ¡n (VNÄ) *:</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="850000"
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Loáº¡i sáº£n pháº©m:</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  >
                    <option value="CAD">Báº£n váº½ CAD (.DWG)</option>
                    <option value="MODEL_3D">Model 3D (Max/SKP)</option>
                    <option value="INTERIOR">Ná»™i tháº¥t & Decor</option>
                    <option value="TEMPLATE">Template Photoshop</option>
                    <option value="DOCUMENT">TÃ i liá»‡u thiáº¿t káº¿</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Äá»‹nh dáº¡ng file:</label>
                  <input
                    type="text"
                    value={fileFormat}
                    onChange={(e) => setFileFormat(e.target.value)}
                    placeholder="AutoCAD .DWG / 3ds Max 2024"
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Dung lÆ°á»£ng:</label>
                  <input
                    type="text"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    placeholder="185 MB / 1.2 GB"
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">
                  KhÃ³a file báº£o máº­t (fileKey trong storage/private):
                </label>
                <input
                  type="text"
                  value={fileKey}
                  onChange={(e) => setFileKey(e.target.value)}
                  placeholder="cad/villa-modern-full-cad-pack.zip"
                  className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-thuy-300 font-mono"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-300">áº¢nh Thumbnail (URL):</label>
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
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">MÃ´ táº£ sáº£n pháº©m:</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Chi tiáº¿t cÃ¡c file Ä‘Ã­nh kÃ¨m..."
                  className="w-full p-3 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-2.5 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase hover:brightness-110 shadow-glow-cyan flex items-center justify-center gap-2"
              >
                {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>LÆ°u Sáº£n Pháº©m</span>
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
            setThumbnail(selected.url);
          }
        }}
        multiple={false}
        title="Chá»n thumbnail sáº£n pháº©m tá»« Media Library"
      />
    </div>
  );
}

