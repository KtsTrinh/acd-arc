"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Star, Plus, Loader2 } from "lucide-react";
import MediaPickerModal, { MediaItem } from "../media/MediaPickerModal";

export interface GalleryItem {
  id: string; // projectMedia id
  mediaId: string;
  sortOrder: number;
  media: {
    id: string;
    filename: string;
    url: string;
    alt?: string | null;
  };
}

interface SortableGalleryProps {
  projectId: string;
  initialItems: GalleryItem[];
  coverMediaId?: string | null;
  onCoverChange?: (mediaId: string) => void;
}

// Single Sortable Image Card
function SortableCard({
  item,
  isCover,
  onSetCover,
  onDelete,
}: {
  item: GalleryItem;
  isCover: boolean;
  onSetCover: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.mediaId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 30 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative aspect-[4/3] rounded-xl overflow-hidden bg-thuy-950 border-2 transition-all shadow-md ${
        isCover
          ? "border-amber-400 ring-2 ring-amber-400/20"
          : "border-thuy-700 hover:border-thuy-500"
      }`}
    >
      <Image
        src={item.media.url}
        alt={item.media.alt || item.media.filename}
        fill
        className="object-cover"
        unoptimized
      />

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1.5 rounded-lg bg-thuy-950/80 backdrop-blur-sm text-slate-300 hover:text-[#142338] cursor-grab active:cursor-grabbing border border-thuy-700/80 transition-colors"
        title="Kéo thả để đổi thứ tự"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Cover indicator & button */}
      <button
        type="button"
        onClick={onSetCover}
        className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-sm transition-all border ${
          isCover
            ? "bg-amber-400 text-thuy-950 border-amber-300 font-bold"
            : "bg-thuy-950/80 text-slate-400 hover:text-amber-300 border-thuy-700"
        }`}
        title={isCover ? "Đang là ảnh đại diện Cover" : "Đặt làm Cover của dự án"}
      >
        <Star className={`w-4 h-4 ${isCover ? "fill-thuy-950" : ""}`} />
      </button>

      {/* Bottom actions & filename */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-thuy-950 via-thuy-950/70 to-transparent p-2.5 flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity">
        <span className="text-[11px] text-slate-200 truncate max-w-[130px]">
          #{item.sortOrder + 1} {item.media.filename}
        </span>
        <button
          type="button"
          onClick={onDelete}
          className="p-1 text-slate-400 hover:text-red-400 transition-colors"
          title="Xóa khỏi gallery"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function SortableGallery({
  projectId,
  initialItems = [],
  coverMediaId,
  onCoverChange,
}: SortableGalleryProps) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.mediaId === active.id);
      const newIndex = items.findIndex((i) => i.mediaId === over.id);

      const reordered = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        sortOrder: idx,
      }));

      setItems(reordered);

      // Save reordered items immediately to backend without full page reload
      setIsSaving(true);
      try {
        await fetch(`/api/projects/${projectId}/gallery`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: reordered.map((item) => ({
              mediaId: item.mediaId,
              sortOrder: item.sortOrder,
            })),
          }),
        });
      } catch (err) {
        console.error("Failed to save gallery order:", err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleAddMedia = async (selected: MediaItem | MediaItem[]) => {
    const mediaArray = Array.isArray(selected) ? selected : [selected];
    if (mediaArray.length === 0) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/gallery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaIds: mediaArray.map((m) => m.id),
        }),
      });
      const data = await res.json();
      if (data.gallery) {
        setItems(data.gallery);
      }
    } catch (err) {
      console.error("Failed to add media to gallery:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (mediaId: string) => {
    if (!confirm("Bạn có chắc muốn gỡ ảnh này khỏi gallery?")) return;

    setIsSaving(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/gallery?mediaId=${mediaId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.gallery) {
        setItems(data.gallery);
      }
    } catch (err) {
      console.error("Failed to delete gallery item:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetCover = (mediaId: string) => {
    if (onCoverChange) {
      onCoverChange(mediaId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-thuy-850 border border-thuy-700/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-200">
            Tổng cộng: <b className="text-thuy-400">{items.length}</b> ảnh gallery
          </span>
          {isSaving && (
            <span className="flex items-center gap-1.5 text-xs text-thuy-300 ml-3">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Đang đồng bộ...</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMediaModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-thuy-400 text-thuy-950 font-bold text-xs hover:brightness-110 transition-all shadow-glow-cyan"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Thêm từ Media Library</span>
        </button>
      </div>

      {/* DND Sortable Context Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.mediaId)}
          strategy={rectSortingStrategy}
        >
          {items.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-thuy-800 rounded-2xl bg-thuy-900/40">
              <p className="text-xs text-slate-400 mb-3">
                Chưa có ảnh nào trong Gallery. Nhấn nút bên dưới để chọn ảnh.
              </p>
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-thuy-800 hover:bg-thuy-750 text-thuy-400 text-xs font-semibold border border-thuy-700"
              >
                + Chọn từ Media Library
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {items.map((item) => (
                <SortableCard
                  key={item.mediaId}
                  item={item}
                  isCover={coverMediaId === item.mediaId}
                  onSetCover={() => handleSetCover(item.mediaId)}
                  onDelete={() => handleDeleteItem(item.mediaId)}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </DndContext>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleAddMedia}
        multiple={true}
        selectedIds={items.map((i) => i.mediaId)}
        title="Chọn ảnh vào Gallery dự án"
      />
    </div>
  );
}

