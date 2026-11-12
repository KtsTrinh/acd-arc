"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  resolveHeroVideo,
  playableVideoUrl,
  isVideoUrl,
  normalizeMediaUrl,
} from "@/lib/media-url";
import { formatVND, slugify } from "@/lib/utils";
import MediaPickerModal, {
  MediaItem,
} from "@/components/media/MediaPickerModal";
import {
  Plus,
  Trash2,
  Pencil,
  Download,
  Loader2,
  X,
  Upload,
  Link2,
  FolderTree,
  Building2,
  Check,
  FileCode,
  Clock,
  ShieldCheck,
  Package,
  Star,
  Image as ImageIcon,
  Video as VideoIcon,
  GripVertical,
  AlertCircle,
} from "lucide-react";

interface ItemForm {
  id?: string;
  name: string;
  slug: string;
  shortDesc: string;
  description: string;
  price: string;
  discount: string;
  priceAfterDiscount: string;
  productGroup: string;
  productCategory: string;
  fileFormat: string;
  fileSize: string;
  fileKey: string;
  fileName: string;
  downloadLinkUrl: string;
  downloadExpiresMinutes: string;
  thumbnail: string;
  location: string;
  client: string;
  year: string;
  landArea: string;
  buildingArea: string;
  floors: string;
  basementFloors: string;
  totalFloorArea: string;
  style: string;
  tagIds: string[];
  active: boolean;
  featured: boolean;
}

const EMPTY_FORM: ItemForm = {
  id: undefined,
  name: "",
  slug: "",
  shortDesc: "",
  description: "",
  price: "",
  discount: "",
  priceAfterDiscount: "",
  productGroup: "",
  productCategory: "",
  fileFormat: "",
  fileSize: "",
  fileKey: "",
  fileName: "",
  downloadLinkUrl: "",
  downloadExpiresMinutes: "5",
  thumbnail: "",
  location: "",
  client: "",
  year: "",
  landArea: "",
  buildingArea: "",
  floors: "",
  basementFloors: "",
  totalFloorArea: "",
  style: "",
  tagIds: [],
  active: true,
  featured: false,
};

const EXPIRY_OPTIONS = [
  { value: "5", label: "5 phút (mặc định)" },
  { value: "15", label: "15 phút" },
  { value: "30", label: "30 phút" },
  { value: "60", label: "1 giờ" },
  { value: "1440", label: "24 giờ" },
];

interface GalleryItem {
  id: string; // projectMedia id
  mediaId: string;
  sortOrder: number;
  media: MediaItem;
}

export default function AdminCatalogClient({
  initialTab,
}: {
  initialTab?: string;
}) {
  const [activeTab, setActiveTab] = useState(
    initialTab && initialTab !== "ALL" ? initialTab : "ALL",
  );
  const [items, setItems] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string | null;
    name: string | null;
    open: boolean;
    type: "product" | "group" | "category";
    group?: string;
  }>({ id: null, name: null, open: false, type: "product" });
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: "", message: "" });

  /* ------------------------------------------------------------------ */
  /* Nhóm sản phẩm & Hạng mục (tự thêm mới)                             */
  /* ------------------------------------------------------------------ */
  const [customGroups, setCustomGroups] = useState<string[]>([]);
  const [customCategories, setCustomCategories] = useState<
    {
      name: string;
      group: string;
    }[]
  >([]);
  const [customGroupInput, setCustomGroupInput] = useState("");
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [showCustomGroupInput, setShowCustomGroupInput] = useState(false);
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);

  const dbGroups = useMemo(() => {
    return Array.from(
      new Set(
        items
          .map((i) => i.productGroup)
          .filter((g): g is string => g !== null && g !== undefined),
      ),
    ).sort();
  }, [items]);

  const allGroups = useMemo(() => {
    return Array.from(new Set(dbGroups.concat(customGroups))).sort();
  }, [dbGroups, customGroups]);

  const handleDeleteGroup = (group: string) => {
    const usedBy = items.filter((i) => i.productGroup === group);
    if (usedBy.length > 0) {
      setAlertDialog({
        open: true,
        title: "Không thể xoá nhóm",
        message: `Không xoá được nhóm "${group}". Có ${usedBy.length} sản phẩm đang thuộc nhóm này.`,
      });
      return;
    }
    setConfirmDelete({ id: group, name: group, open: true, type: "group" });
  };

  const handleConfirmDeleteGroup = () => {
    if (!confirmDelete.id) return;
    const usedBy = items.filter((i) => i.productGroup === confirmDelete.id);
    if (usedBy.length > 0) {
      setConfirmDelete({ id: null, name: null, open: false, type: "product" });
      setAlertDialog({
        open: true,
        title: "Không thể xoá nhóm",
        message: `Không xoá được nhóm "${confirmDelete.name}". Có ${usedBy.length} sản phẩm đang thuộc nhóm này.`,
      });
      return;
    }
    setCustomGroups((prev) => prev.filter((g) => g !== confirmDelete.id!));
    setCustomCategories((prev) =>
      prev.filter((c) => c.group !== confirmDelete.id!),
    );
    setItems((prev) =>
      prev.map((i) =>
        i.productGroup === confirmDelete.id
          ? { ...i, productGroup: "" }
          : i,
      ),
    );
    if (activeTab === confirmDelete.id) {
      const next = allGroups.filter((g) => g !== confirmDelete.id);
      setActiveTab(next.length ? next[0] : "ALL");
    }
    setConfirmDelete({ id: null, name: null, open: false, type: "product" });
    setNotice({
      type: "ok",
      text: `Đã xoá nhóm "${confirmDelete.name}".`,
    });
  };

  const handleAddCustomGroup = () => {
    const val = customGroupInput.trim();
    if (!val || allGroups.includes(val)) {
      setCustomGroupInput("");
      setShowCustomGroupInput(false);
      updateForm({ productGroup: val || "" });
      return;
    }
    setCustomGroups((prev) => {
      const next = [...prev, val];
      return next;
    });
    setCustomGroupInput("");
    setShowCustomGroupInput(false);
    updateForm({ productGroup: val });
    setNotice({ type: "ok", text: `Đã thêm nhóm "${val}".` });
  };

  const handleAddCustomCategory = () => {
    const val = customCategoryInput.trim();
    const group = form?.productGroup || "";
    if (!val) {
      setCustomCategoryInput("");
      setShowCustomCategoryInput(false);
      return;
    }
    if (!group) {
      setNotice({
        type: "err",
        text: "Vui lòng chọn nhóm trước khi thêm hạng mục.",
      });
      return;
    }
    const exists = customCategories.some(
      (c) => c.group === group && c.name === val,
    );
    if (exists) {
      setCustomCategoryInput("");
      setShowCustomCategoryInput(false);
      updateForm({ productCategory: val });
      return;
    }
    setCustomCategories((prev) => [...prev, { name: val, group }]);
    setCustomCategoryInput("");
    setShowCustomCategoryInput(false);
    updateForm({ productCategory: val });
    setNotice({ type: "ok", text: `Đã thêm hạng mục "${val}".` });
  };

  const handleDeleteCategory = (name: string, group: string) => {
    const usedBy = items.filter(
      (i) =>
        i.productCategory === name && i.productGroup === group,
    );
    if (usedBy.length > 0) {
      setAlertDialog({
        open: true,
        title: "Không thể xoá hạng mục",
        message: `Không xoá được hạng mục "${name}". Có ${usedBy.length} sản phẩm đang thuộc hạng mục này.`,
      });
      return;
    }
    setConfirmDelete({
      id: name,
      name,
      open: true,
      type: "category",
      group,
    });
  };

  const handleConfirmDeleteCategory = () => {
    if (!confirmDelete.id || !confirmDelete.group) return;
    const usedBy = items.filter(
      (i) =>
        i.productCategory === confirmDelete.id &&
        i.productGroup === confirmDelete.group,
    );
    if (usedBy.length > 0) {
      setConfirmDelete({ id: null, name: null, open: false, type: "product" });
      setAlertDialog({
        open: true,
        title: "Không thể xoá hạng mục",
        message: `Không xoá được hạng mục "${confirmDelete.name}". Có ${usedBy.length} sản phẩm đang thuộc hạng mục này.`,
      });
      return;
    }
    setCustomCategories((prev) =>
      prev.filter(
        (c) => !(c.name === confirmDelete.id && c.group === confirmDelete.group),
      ),
    );
    setItems((prev) =>
      prev.map((i) =>
        i.productCategory === confirmDelete.id &&
        i.productGroup === confirmDelete.group
          ? { ...i, productCategory: "" }
          : i,
      ),
    );
    setConfirmDelete({ id: null, name: null, open: false, type: "product" });
    setNotice({ type: "ok", text: "Đã xoá hạng mục." });
  };

  const groupCategories = (group: string): string[] => {
    const dbCats = Array.from(
      new Set(
        items
          .filter((i) => i.productGroup === group)
          .map((i) => i.productCategory)
          .filter((c): c is string => c !== null && c !== undefined),
      ),
    ).sort();
    const customs = customCategories
      .filter((c) => c.group === group)
      .map((c) => c.name);
    return [...dbCats, ...customs];
  };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<
    "thumbnailImage" | "thumbnailVideo" | null
  >(null);
  const [thumbImage, setThumbImage] = useState("");
  const [thumbVideo, setThumbVideo] = useState("");
  const [notice, setNotice] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const [form, setForm] = useState<ItemForm | null>(null);

  /* ------------------------------------------------------------------ */
  /* Gallery state                                                      */
  /* ------------------------------------------------------------------ */
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryMediaPickerOpen, setGalleryMediaPickerOpen] = useState(false);
  const [galleryCoverMediaId, setGalleryCoverMediaId] = useState<string | null>(
    null,
  );
  const [gallerySaving, setGallerySaving] = useState(false);
  const [gallerySelectedForDelete, setGallerySelectedForDelete] = useState<
    Set<string>
  >(new Set());

  const fetchAll = useCallback(async () => {
    try {
      const [itemsRes, projectsRes, categoriesRes, tagsRes] = await Promise.all(
        [
          fetch("/api/products?includeInactive=1"),
          fetch("/api/projects"),
          fetch("/api/categories"),
          fetch("/api/tags"),
        ],
      );
      const itemsData = await itemsRes.json();
      const projectsData = await projectsRes.json();
      const categoriesData = await categoriesRes.json();
      const tagsData = await tagsRes.json();
      setItems(itemsData.products || []);
      setProjects(projectsData.projects || []);
      setCategories(categoriesData.categories || []);
      setTags(tagsData.tags || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      try {
        const [itemsRes, projectsRes, categoriesRes, tagsRes] =
          await Promise.allSettled([
            fetch("/api/products?includeInactive=1"),
            fetch("/api/projects"),
            fetch("/api/categories"),
            fetch("/api/tags"),
          ]);
        if (!mounted) return;
        const itemsData =
          itemsRes.status === "fulfilled"
            ? await itemsRes.value.json().catch(() => ({}))
            : {};
        const projectsData =
          projectsRes.status === "fulfilled"
            ? await projectsRes.value.json().catch(() => ({}))
            : {};
        const categoriesData =
          categoriesRes.status === "fulfilled"
            ? await categoriesRes.value.json().catch(() => ({}))
            : {};
        const tagsData =
          tagsRes.status === "fulfilled"
            ? await tagsRes.value.json().catch(() => ({}))
            : {};
        setItems(itemsData.products || []);
        setProjects(projectsData.projects || []);
        setCategories(categoriesData.categories || []);
        setTags(tagsData.tags || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAll();
    return () => {
      mounted = false;
    };
  }, []);

  const groupItems = useMemo(() => {
    let result = items;
    if (activeTab !== "ALL") {
      result = result.filter((i) => i.productGroup === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (i) =>
          (i.name || "").toLowerCase().includes(q) ||
          (i.slug || "").toLowerCase().includes(q),
      );
    }
    return result;
  }, [items, activeTab, searchQuery]);

  const openEdit = async (item: any) => {
    setForm({
      id: item.id,
      name: item.name || "",
      slug: item.slug || "",
      shortDesc: item.shortDesc || "",
      description: item.description || "",
      price: String(item.price ?? ""),
      discount: item.discount != null ? String(item.discount) : "",
      priceAfterDiscount:
        item.priceAfterDiscount != null ? String(item.priceAfterDiscount) : "",
      productGroup: item.productGroup || "",
      productCategory: item.productCategory || "",
      fileFormat: item.fileFormat || "",
      fileSize: item.fileSize || "",
      fileKey: item.fileKey || "",
      fileName: item.fileName || "",
      downloadLinkUrl: item.downloadLinkUrl || "",
      downloadExpiresMinutes: String(item.downloadExpiresMinutes ?? 5),
      thumbnail: item.thumbnail || "",
      location: item.location || "",
      client: item.client || "",
      year: item.year ? item.year.toString() : "",
      landArea: item.landArea ? item.landArea.toString() : "",
      buildingArea: item.buildingArea ? item.buildingArea.toString() : "",
      floors: item.floors?.toString() || "",
      basementFloors: item.basementFloors?.toString() || "",
      totalFloorArea: item.totalFloorArea ? item.totalFloorArea.toString() : "",
      style: item.style || "",
      tagIds: item.tags?.map((t: any) => t.tagId) || [],
      active: item.active !== false,
      featured: Boolean(item.featured),
    });
    setThumbImage(isVideoUrl(item.thumbnail || "") ? "" : item.thumbnail || "");
    setThumbVideo(isVideoUrl(item.thumbnail || "") ? item.thumbnail || "" : "");

    // Load gallery items for this product
    try {
      const res = await fetch(`/api/products/${item.id}/gallery`);
      const data = await res.json();
      if (data.gallery) {
        const mapped: GalleryItem[] = data.gallery.map(
          (g: any, idx: number) => ({
            id: g.id,
            mediaId: g.mediaId,
            sortOrder: g.sortOrder ?? idx,
            media: {
              id: g.media.id,
              filename: g.media.filename,
              originalName: g.media.originalName,
              url: g.media.url,
              folder: g.media.folder,
              alt: g.media.alt,
              mimeType: g.media.mimeType,
            },
          }),
        );
        setGalleryItems(mapped);
        // Use first item as cover if no cover set
        if (mapped.length > 0) {
          setGalleryCoverMediaId(mapped[0].mediaId);
        }
      }
    } catch (err) {
      console.error("Failed to load product gallery:", err);
    }
  };

  const updateForm = (patch: Partial<ItemForm>) =>
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));

  const toggleTag = (id: string) => {
    if (!form) return;
    if (form.tagIds.includes(id)) {
      setForm((prev: ItemForm | null) => {
        if (!prev) return prev;
        return { ...prev, tagIds: prev.tagIds.filter((t) => t !== id) };
      });
    } else {
      setForm((prev: ItemForm | null) => {
        if (!prev) return prev;
        return { ...prev, tagIds: [...prev.tagIds, id] };
      });
    }
  };

  const createTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success && data.tag) {
        setTags((prev) => [...prev, data.tag]);
        setNewTagName("");
        if (form && !form.tagIds.includes(data.tag.id)) {
          setForm((prev: ItemForm | null) => {
            if (!prev) return prev;
            return { ...prev, tagIds: [...prev.tagIds, data.tag.id] };
          });
        }
        setNotice({ type: "ok", text: `Đã tạo thẻ "${name}".` });
      } else {
        setNotice({ type: "err", text: data.error || "Không thể tạo thẻ tag." });
      }
    } catch (err) {
      console.error(err);
      setNotice({ type: "err", text: "Lỗi khi tạo thẻ tag." });
    }
  };

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setGalleryItems([]);
    setGalleryCoverMediaId(null);
    setThumbImage("");
    setThumbVideo("");
  };

  const handleUploadFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/products/file", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        updateForm({
          fileKey: data.fileKey,
          fileName: data.fileName,
          fileSize: data.fileSize,
        });
        setNotice({
          type: "ok",
          text: `Đã tải file "${data.fileName}" lên kho private.`,
        });
      } else {
        setNotice({ type: "err", text: data.error || "Không tải được file." });
      }
    } catch (err) {
      console.error(err);
      setNotice({ type: "err", text: "Lỗi khi tải file lên." });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        shortDesc: form.shortDesc,
        description: form.description,
        price: form.price ? parseFloat(form.price) : null,
        discount: form.discount ? parseFloat(form.discount) : null,
        priceAfterDiscount: form.priceAfterDiscount
          ? parseFloat(form.priceAfterDiscount)
          : null,
        productGroup: form.productGroup || null,
        productCategory: form.productCategory || null,
        fileFormat: form.fileFormat,
        fileSize: form.fileSize,
        fileKey: form.fileKey || null,
        fileName: form.fileName || null,
        downloadLinkUrl: form.downloadLinkUrl || null,
        downloadExpiresMinutes: parseInt(
          form.downloadExpiresMinutes || "5",
          10,
        ),
        thumbnail: form.thumbnail,
        location: form.location || null,
        client: form.client || null,
        year: form.year ? parseInt(form.year, 10) : null,
        landArea: form.landArea ? parseFloat(form.landArea) : null,
        buildingArea: form.buildingArea ? parseFloat(form.buildingArea) : null,
        style: form.style || null,
        tagIds: form.tagIds,
        active: form.active,
        featured: form.featured,
      };

      const res = await fetch(
        form.id ? `/api/products/${form.id}` : "/api/products",
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            galleryMediaIds: galleryItems.map((g) => g.mediaId),
          }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setForm(null);
        setNotice({ type: "ok", text: "Đã lưu mục danh mục sản phẩm." });
        fetchAll();
      } else {
        setNotice({ type: "err", text: data.error || "Không lưu được." });
      }
    } catch (err) {
      console.error(err);
      setNotice({ type: "err", text: "Lỗi khi lưu mục danh mục." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setConfirmDelete({ id, name, open: true, type: "product" });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      const res = await fetch(`/api/products/${confirmDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setConfirmDelete({ id: null, name: null, open: false, type: "product" });
        setNotice({ type: "ok", text: "Đã xoá mục danh mục." });
        fetchAll();
      } else {
        setNotice({ type: "err", text: data.error || "Không xoá được." });
      }
    } catch (err) {
      setNotice({ type: "err", text: "Lỗi khi xoá mục danh mục." });
    }
  };

  /* ------------------------------------------------------------------ */
  /* Gallery CRUD                                                       */
  /* ------------------------------------------------------------------ */

  const isVideoItem = (item: MediaItem) => {
    if (item.mimeType && item.mimeType.startsWith("video/")) return true;
    return /\.(mp4|webm|mov|avi)(\?|$)/i.test(item.url || "");
  };

  const handleGalleryAdd = async (selected: MediaItem | MediaItem[]) => {
    const mediaArray = Array.isArray(selected) ? selected : [selected];
    if (mediaArray.length === 0) return;

    if (!form?.id) {
      // Chưa lưu sản phẩm: thêm vào state galleryItems để lưu cùng form
      const newItems: GalleryItem[] = mediaArray.map((m, idx) => ({
        id: `temp-${m.id}`,
        mediaId: m.id,
        sortOrder: galleryItems.length + idx,
        media: m,
      }));
      setGalleryItems((prev) => [...prev, ...newItems]);
      setNotice({
        type: "ok",
        text: `Đã thêm ${mediaArray.length} mục vào Gallery.`,
      });
      return;
    }

    setGallerySaving(true);
    try {
      const res = await fetch(`/api/products/${form.id}/gallery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaIds: mediaArray.map((m) => m.id),
        }),
      });
      const data = await res.json();
      if (data.gallery) {
        const mapped: GalleryItem[] = data.gallery.map(
          (g: any, idx: number) => ({
            id: g.id,
            mediaId: g.mediaId,
            sortOrder: g.sortOrder ?? idx,
            media: {
              id: g.media.id,
              filename: g.media.filename,
              originalName: g.media.originalName,
              url: g.media.url,
              folder: g.media.folder,
              alt: g.media.alt,
              mimeType: g.media.mimeType,
            },
          }),
        );
        setGalleryItems(mapped);
        if (!galleryCoverMediaId && mapped.length > 0) {
          setGalleryCoverMediaId(mapped[0].mediaId);
        }
        setNotice({
          type: "ok",
          text: `Đã thêm ${mediaArray.length} mục vào Gallery.`,
        });
      }
    } catch (err) {
      console.error("Failed to add to product gallery:", err);
      setNotice({ type: "err", text: "Không thêm được vào Gallery." });
    } finally {
      setGallerySaving(false);
    }
  };

  const handleGalleryDelete = async (mediaId: string) => {
    if (!confirm("Bạn có chắc muốn gỡ mục này khỏi Gallery?")) return;

    if (!form?.id) {
      const remaining = galleryItems.filter((i) => i.mediaId !== mediaId);
      setGalleryItems(remaining);
      if (galleryCoverMediaId === mediaId) {
        setGalleryCoverMediaId(
          remaining.length > 0 ? remaining[0].mediaId : null,
        );
      }
      setNotice({ type: "ok", text: "Đã gỡ mục khỏi Gallery." });
      return;
    }

    setGallerySaving(true);
    try {
      const res = await fetch(
        `/api/products/${form.id}/gallery?mediaId=${mediaId}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (data.gallery) {
        const mapped: GalleryItem[] = data.gallery.map(
          (g: any, idx: number) => ({
            id: g.id,
            mediaId: g.mediaId,
            sortOrder: g.sortOrder ?? idx,
            media: {
              id: g.media.id,
              filename: g.media.filename,
              originalName: g.media.originalName,
              url: g.media.url,
              folder: g.media.folder,
              alt: g.media.alt,
              mimeType: g.media.mimeType,
            },
          }),
        );
        setGalleryItems(mapped);
        if (galleryCoverMediaId === mediaId) {
          setGalleryCoverMediaId(mapped.length > 0 ? mapped[0].mediaId : null);
        }
      }
    } catch (err) {
      console.error("Failed to delete gallery item:", err);
    } finally {
      setGallerySaving(false);
    }
  };

  const toggleGalleryDeleteSelection = (mediaId: string) => {
    setGallerySelectedForDelete((prev) => {
      const next = new Set(prev);
      if (next.has(mediaId)) next.delete(mediaId);
      else next.add(mediaId);
      return next;
    });
  };

  const handleGalleryDeleteSelected = async () => {
    if (gallerySelectedForDelete.size === 0) return;
    if (
      !confirm(
        `Bạn có chắc muốn xoá ${gallerySelectedForDelete.size} mục đã chọn khỏi Gallery?`,
      )
    )
      return;

    if (!form?.id) {
      setGalleryItems((prev) =>
        prev.filter((i) => !gallerySelectedForDelete.has(i.mediaId)),
      );
      const remaining = galleryItems.filter(
        (i) => !gallerySelectedForDelete.has(i.mediaId),
      );
      if (
        galleryCoverMediaId &&
        gallerySelectedForDelete.has(galleryCoverMediaId)
      ) {
        setGalleryCoverMediaId(
          remaining.length > 0 ? remaining[0].mediaId : null,
        );
      }
      setGallerySelectedForDelete(new Set());
      setNotice({
        type: "ok",
        text: `Đã gỡ ${gallerySelectedForDelete.size} mục khỏi Gallery.`,
      });
      return;
    }

    setGallerySaving(true);
    try {
      await Promise.all(
        Array.from(gallerySelectedForDelete).map((mediaId) =>
          fetch(`/api/products/${form.id}/gallery?mediaId=${mediaId}`, {
            method: "DELETE",
          }),
        ),
      );
      const res = await fetch(`/api/products/${form.id}/gallery`);
      const data = await res.json();
      if (data.gallery) {
        const mapped: GalleryItem[] = data.gallery.map(
          (g: any, idx: number) => ({
            id: g.id,
            mediaId: g.mediaId,
            sortOrder: g.sortOrder ?? idx,
            media: {
              id: g.media.id,
              filename: g.media.filename,
              originalName: g.media.originalName,
              url: g.media.url,
              folder: g.media.folder,
              alt: g.media.alt,
              mimeType: g.media.mimeType,
            },
          }),
        );
        setGalleryItems(mapped);
        setGallerySelectedForDelete(new Set());
        if (
          galleryCoverMediaId &&
          gallerySelectedForDelete.has(galleryCoverMediaId)
        ) {
          setGalleryCoverMediaId(mapped.length > 0 ? mapped[0].mediaId : null);
        }
      }
    } catch (err) {
      console.error("Failed to delete selected gallery items:", err);
    } finally {
      setGallerySaving(false);
    }
  };

  const handleGalleryReorder = async (reordered: GalleryItem[]) => {
    if (!form?.id) return;
    setGalleryItems(reordered);
    setGallerySaving(true);
    try {
      await fetch(`/api/products/${form.id}/gallery`, {
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
      setGallerySaving(false);
    }
  };

  const handleGalleryCover = (mediaId: string) => {
    setGalleryCoverMediaId(mediaId);
    if (form?.id) {
      fetch(`/api/products/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thumbnail: null }),
      }).catch(console.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#142338]">
            Danh Mục Sản Phẩm
          </h1>
          <p className="text-xs text-slate-600">Các sản phẩm của ACD.</p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => openCreate()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase hover:brightness-110 shadow-glow-cyan transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Sản Phẩm Mới</span>
          </button>
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors"
          >
            <option value="ALL">Nhóm sản phẩm</option>
            {allGroups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Tìm sản phẩm theo tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors sm:w-64"
          />
        </div>
      </div>

      {/* Policy banner */}
      <div className="p-4 rounded-2xl bg-thuy-850/70 border border-thuy-750 flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-slate-700">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <p>
          File/link tải về chỉ mở cho{" "}
          <b className="text-[#142338]">đúng tài khoản đã thanh toán</b>. Link
          tự xuất hiện trong vòng <b className="text-[#142338]">5 phút</b> kể từ
          lúc đơn hàng được xác nhận thanh toán, hết hạn sau 5 phút và tối đa 5
          lượt tải. Link gốc do quản trị cấu hình được phát qua máy chủ nên
          khách không thể chia sẻ cho người khác tải.
        </p>
      </div>

      {notice && (
        <div
          className={`p-3 rounded-xl text-xs border ${
            notice.type === "ok"
              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
              : "bg-red-500/10 border-red-500/40 text-red-300"
          }`}
        >
          {notice.text}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-slate-600 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Đang tải danh mục sản
          phẩm...
        </div>
      ) : activeTab === "MANAGE" ? (
        <ManagePanel
          categories={categories}
          projects={projects}
          items={items}
          onRefresh={fetchAll}
          onNotice={setNotice}
        />
      ) : (
        <CatalogTable
          items={groupItems}
          groupKey={activeTab}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modal create / edit */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-thuy-950/80 backdrop-blur-sm"
            onClick={() => setForm(null)}
          />
          <div className="relative z-10 w-full max-w-2xl bg-thuy-900 border border-thuy-700 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-thuy-750">
              <h3 className="font-semibold text-base text-white">
                {form.id ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
              </h3>
              <button
                onClick={() => setForm(null)}
                className="text-slate-600 hover:text-[#142338]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-white">Tên sản phẩm: (*)</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    updateForm({
                      name: e.target.value,
                      slug: form.id ? form.slug : slugify(e.target.value),
                    })
                  }
                  placeholder="Trọn bộ hồ sơ thiết kế biệt thự hiện đại 3 tầng"
                  className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white">Slug: (*)</label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => updateForm({ slug: e.target.value })}
                  placeholder="tranh-bo-hso-thiet-ke-biet-thu"
                  className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-xs text-white">Nhóm sản phẩm:</label>
                  <div className="relative">
                    <select
                      value={form.productGroup || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "+new") {
                          setShowCustomGroupInput(true);
                          updateForm({ productGroup: "" });
                          return;
                        }
                        updateForm({ productGroup: val });
                        setShowCustomGroupInput(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                    >
                      <option value="">— Chọn nhóm —</option>
                      {allGroups.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                      <option value="+new">+ Tạo nhóm mới</option>
                    </select>
                    {showCustomGroupInput && (
                      <div className="mt-1.5 flex gap-2">
                        <input
                          autoFocus
                          value={customGroupInput}
                          onChange={(e) =>
                            setCustomGroupInput(e.target.value.trim())
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddCustomGroup();
                            if (e.key === "Escape") {
                              setShowCustomGroupInput(false);
                              setCustomGroupInput("");
                            }
                          }}
                          placeholder="Tên nhóm mới..."
                          className="flex-1 px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                        />
                        <button
                          onClick={handleAddCustomGroup}
                          className="px-3 py-2 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs hover:brightness-110"
                        >
                          Thêm
                        </button>
                        <button
                          onClick={() => {
                            setShowCustomGroupInput(false);
                            setCustomGroupInput("");
                          }}
                          className="px-3 py-2 rounded-xl bg-thuy-800 hover:bg-thuy-700 text-slate-400"
                        >
                          Hủy
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-1">
                  <label className="text-xs text-white">Hạng mục:</label>
                  <div className="relative">
                    <select
                      value={form.productCategory || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "+new") {
                          setShowCustomCategoryInput(true);
                          updateForm({ productCategory: "" });
                          return;
                        }
                        updateForm({ productCategory: val });
                        setShowCustomCategoryInput(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                    >
                      <option value="">— Chọn hạng mục —</option>
                      {groupCategories(form.productGroup).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="+new">+ Tạo hạng mục mới</option>
                    </select>
                    {showCustomCategoryInput && (
                      <div className="mt-1.5 flex gap-2">
                        <input
                          autoFocus
                          value={customCategoryInput}
                          onChange={(e) =>
                            setCustomCategoryInput(e.target.value.trim())
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddCustomCategory();
                            if (e.key === "Escape") {
                              setShowCustomCategoryInput(false);
                              setCustomCategoryInput("");
                            }
                          }}
                          placeholder="Tên hạng mục mới..."
                          className="flex-1 px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                        />
                        <button
                          onClick={handleAddCustomCategory}
                          className="px-3 py-2 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs hover:brightness-110"
                        >
                          Thêm
                        </button>
                        <button
                          onClick={() => {
                            setShowCustomCategoryInput(false);
                            setCustomCategoryInput("");
                          }}
                          className="px-3 py-2 rounded-xl bg-thuy-800 hover:bg-thuy-700 text-slate-400"
                        >
                          Hủy
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-xs text-white">Quản lý nhóm:</label>
                  <div className="flex flex-wrap gap-2">
                    {allGroups.map((g) => {
                      const used = items.filter(
                        (i) => i.productGroup === g,
                      ).length;
                      return (
                        <span
                          key={g}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-thuy-800 border border-thuy-700 text-[10px] text-slate-300"
                        >
                          {g}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGroup(g);
                            }}
                            className="p-0.5 hover:text-red-400"
                            title={used > 0 ? "Nhóm đang được sử dụng" : "Xoá nhóm"}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
                {form.productGroup && (
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-xs text-white">
                      Quản lý hạng mục:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {groupCategories(form.productGroup).map((c) => {
                        const used = items.filter(
                          (i) =>
                            i.productCategory === c &&
                            i.productGroup === form.productGroup,
                        ).length;
                        return (
                          <span
                            key={c}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-thuy-800 border border-thuy-700 text-[10px] text-slate-300"
                          >
                            {c}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(c, form.productGroup);
                              }}
                              className="p-0.5 hover:text-red-400"
                              title={used > 0 ? "Hạng mục đang được sử dụng" : "Xoá"}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white">Mô tả chi tiết sản phẩm:</label>
                <input
                  type="text"
                  value={form.shortDesc}
                  onChange={(e) => updateForm({ shortDesc: e.target.value })}
                  placeholder="Mô tả ngắn gọn về sản phẩm..."
                  className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-white">Chủ đầu tư:</label>
                  <input
                    type="text"
                    value={form.client || ""}
                    onChange={(e) => updateForm({ client: e.target.value })}
                    placeholder="Tên chủ đầu tư..."
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white">Địa điểm:</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => updateForm({ location: e.target.value })}
                    placeholder="Quận 1, TP.HCM..."
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white">Năm thiết kế:</label>
                  <input
                    type="number"
                    value={form.year}
                    onChange={(e) => updateForm({ year: e.target.value })}
                    placeholder="2024"
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-white">
                    Diện tích đất (m²):
                  </label>
                  <input
                    type="number"
                    value={form.landArea}
                    onChange={(e) => updateForm({ landArea: e.target.value })}
                    placeholder="500"
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white">
                    Diện tích xây dựng (m²):
                  </label>
                  <input
                    type="number"
                    value={form.buildingArea}
                    onChange={(e) =>
                      updateForm({ buildingArea: e.target.value })
                    }
                    placeholder="250"
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white">Tầng cao:</label>
                  <input
                    type="number"
                    value={form.floors}
                    onChange={(e) => updateForm({ floors: e.target.value })}
                    placeholder="5"
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-white">Tầng hầm:</label>
                  <input
                    type="number"
                    value={form.basementFloors}
                    onChange={(e) =>
                      updateForm({ basementFloors: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white">
                    Tổng diện tích sàn (m²):
                  </label>
                  <input
                    type="number"
                    value={form.totalFloorArea}
                    onChange={(e) =>
                      updateForm({ totalFloorArea: e.target.value })
                    }
                    placeholder="1000"
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white">Phong cách:</label>
                  <input
                    type="text"
                    value={form.style}
                    onChange={(e) => updateForm({ style: e.target.value })}
                    placeholder="Hiện đại, cổ điển..."
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-white">Định dạng file:</label>
                  <input
                    type="text"
                    value={form.fileFormat}
                    onChange={(e) => updateForm({ fileFormat: e.target.value })}
                    placeholder="AutoCAD .DWG / 3ds Max 2024"
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white">Dung lượng:</label>
                  <input
                    type="text"
                    value={form.fileSize}
                    onChange={(e) => updateForm({ fileSize: e.target.value })}
                    placeholder="185 MB / 1.2 GB"
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-white font-medium">
                  Thumbnail
                </label>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-slate-300">
                        Ảnh Thumbnail
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMediaTarget("thumbnailImage");
                          setMediaPickerOpen(true);
                        }}
                        className="text-[10px] text-thuy-400 hover:underline"
                      >
                        Chọn ảnh
                      </button>
                    </div>
                    <div className="relative w-full h-40 rounded-xl overflow-hidden bg-thuy-950 border border-thuy-700">
                      {thumbImage ? (
                        <img
                          src={(() => {
                            const isDrive =
                              /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)/.test(
                                thumbImage,
                              );
                            return isDrive
                              ? `/api/media/image-proxy?url=${encodeURIComponent(
                                  thumbImage,
                                )}`
                              : normalizeMediaUrl(thumbImage);
                          })()}
                          alt="Image thumbnail preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      value={thumbImage}
                      onChange={(e) => {
                        const val = e.target.value;
                        setThumbImage(val);
                        updateForm({ thumbnail: val });
                      }}
                      placeholder="https://... (URL ảnh thumbnail)"
                      className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-slate-300">
                        Video Thumbnail
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMediaTarget("thumbnailVideo");
                          setMediaPickerOpen(true);
                        }}
                        className="text-[10px] text-thuy-400 hover:underline"
                      >
                        Chọn video
                      </button>
                    </div>
                    <div className="relative w-full h-40 rounded-xl overflow-hidden bg-thuy-950 border border-thuy-700">
                      {thumbVideo ? (
                        <video
                          src={playableVideoUrl(thumbVideo) || thumbVideo}
                          muted
                          loop
                          playsInline
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                          <VideoIcon className="w-6 h-6" />
                          <span className="text-[10px]">
                            Chưa chọn video thumbnail
                          </span>
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      value={thumbVideo}
                      onChange={(e) => {
                        const val = e.target.value;
                        setThumbVideo(val);
                        updateForm({ thumbnail: val });
                      }}
                      placeholder="https://... (URL video .mp4/.webm)"
                      className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Product Gallery */}
              <div className="p-4 rounded-2xl bg-thuy-850/60 border border-thuy-750 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-thuy-300 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Thư viện Hình Ảnh/Video
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Chọn ảnh/video từ Media Library hoặc nhập link bên ngoài.
                      Hỗ trợ định dạng ảnh và video.
                    </p>
                  </div>
                </div>

                {gallerySaving && (
                  <div className="flex items-center justify-center py-4 text-xs text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang đồng bộ
                    Gallery...
                  </div>
                )}

                {galleryItems.length === 0 && !gallerySaving ? (
                  <div className="text-center py-12 border-2 border-dashed border-thuy-800 rounded-xl bg-thuy-900/40">
                    <p className="text-xs text-slate-400 mb-3">
                      Chưa có ảnh/video nào trong Gallery.
                    </p>
                    <button
                      type="button"
                      onClick={() => setGalleryMediaPickerOpen(true)}
                      className="px-4 py-2 rounded-lg bg-thuy-800 hover:bg-thuy-750 text-thuy-400 text-xs font-semibold border border-thuy-700"
                    >
                      Thêm hình ảnh/video
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-thuy-850 border border-thuy-700/80">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-800">
                          Tổng cộng:{" "}
                          <b className="text-thuy-400">{galleryItems.length}</b>{" "}
                          mục gallery
                        </span>
                        {gallerySelectedForDelete.size > 0 && (
                          <span className="flex items-center gap-1.5 text-xs text-red-400">
                            Đã chọn:
                            {
                              <b className="font-bold">
                                {gallerySelectedForDelete.size}
                              </b>
                            }{" "}
                            mục
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setGalleryMediaPickerOpen(true)}
                          className="px-3 py-1.5 rounded-lg bg-thuy-800 hover:bg-thuy-750 text-thuy-400 text-xs font-semibold border border-thuy-700 transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Thêm
                        </button>
                        {gallerySelectedForDelete.size > 0 && (
                          <button
                            type="button"
                            onClick={handleGalleryDeleteSelected}
                            disabled={gallerySaving}
                            className="px-3 py-1.5 rounded-lg bg-red-900 hover:bg-red-800 text-red-400 text-xs font-semibold border border-red-700 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-3 h-3" /> Xóa đã chọn
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              !confirm(
                                "Bạn có chắc muốn xoá tất cả ảnh trong Gallery?",
                              )
                            )
                              return;
                            setGalleryItems([]);
                            setGallerySelectedForDelete(new Set());
                            setGalleryCoverMediaId(null);
                            setNotice({
                              type: "ok",
                              text: "Đã xoá tất cả ảnh trong Gallery.",
                            });
                          }}
                          disabled={gallerySaving}
                          className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 text-xs font-semibold border border-red-800 transition-colors disabled:opacity-50"
                        >
                          Xóa tất cả
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {galleryItems.map((item) => {
                        const isVideoFromMime =
                          item.media.mimeType?.startsWith("video/") === true;
                        const isVideoFromExt =
                          /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(
                            item.media.url,
                          );
                        const itemIsVideo = isVideoFromMime || isVideoFromExt;
                        const isCover = galleryCoverMediaId === item.mediaId;
                        const isSelectedForDelete =
                          gallerySelectedForDelete.has(item.mediaId);
                        const vidSrc = playableVideoUrl(item.media.url);
                        const imgSrc = (() => {
                          const isDrive =
                            /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)/.test(
                              item.media.url,
                            );
                          return isDrive
                            ? `/api/media/image-proxy?url=${encodeURIComponent(
                                item.media.url,
                              )}`
                            : normalizeMediaUrl(item.media.url);
                        })();
                        return (
                          <div
                            key={item.mediaId}
                            className={`group relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all shadow-sm ${isCover ? "border-amber-400 ring-2 ring-amber-400/20" : isSelectedForDelete ? "border-red-500 ring-2 ring-red-500/20" : "border-thuy-700 hover:border-thuy-500"}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelectedForDelete}
                              onChange={() =>
                                toggleGalleryDeleteSelection(item.mediaId)
                              }
                              className="absolute top-2 left-2 z-20 w-4 h-4 rounded bg-thuy-900 border border-thuy-500 text-thuy-400 focus:ring-2 focus:ring-thuy-400 accent-thuy-400"
                              readOnly
                            />

                            {itemIsVideo && vidSrc ? (
                              <video
                                src={vidSrc}
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={imgSrc}
                                alt={item.media.alt || item.media.filename}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  objectPosition: "center",
                                }}
                                loading="lazy"
                                decoding="async"
                                onError={(e) => {
                                  console.error(
                                    "Gallery image load error:",
                                    (e.target as HTMLImageElement)?.src,
                                  );
                                }}
                              />
                            )}

                            {itemIsVideo && (
                              <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-thuy-300 uppercase">
                                Video
                              </div>
                            )}

                            {/* Cover star */}
                            <button
                              type="button"
                              onClick={() => handleGalleryCover(item.mediaId)}
                              className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-sm transition-all border ${
                                isCover
                                  ? "bg-amber-400 text-thuy-950 border-amber-300 font-bold"
                                  : "bg-thuy-950/80 text-slate-400 hover:text-amber-300 border-thuy-700"
                              }`}
                              title={
                                isCover
                                  ? "Đang là ảnh đại diện"
                                  : "Đặt làm ảnh đại diện"
                              }
                            >
                              <Star
                                className={`w-4 h-4 ${isCover ? "fill-thuy-950" : ""}`}
                              />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleGalleryDelete(item.mediaId)}
                              className="absolute top-2 left-10 p-1.5 rounded-lg bg-red-950/60 text-red-400 hover:bg-red-900 border border-red-800 text-xs transition-colors opacity-0 group-hover:opacity-100"
                              title="Xóa khỏi gallery"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Filename + sort order */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-thuy-950 via-thuy-950/70 to-transparent p-2.5 flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity">
                              <span className="text-[11px] text-slate-200 truncate max-w-[120px]">
                                #{item.sortOrder + 1} {item.media.filename}
                              </span>
                              {isSelectedForDelete && (
                                <span className="text-[10px] text-red-400 font-bold">
                                  Đã chọn
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white">Mô tả sản phẩm:</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => updateForm({ description: e.target.value })}
                  placeholder="Chi tiết các file đính kèm..."
                  className="w-full p-3 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs text-white font-medium block">
                  Thẻ Tags:
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value.trim())}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") createTag();
                    }}
                    placeholder="Nhập tên thẻ mới và nhấn Enter..."
                    className="flex-1 px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                  <button
                    onClick={createTag}
                    className="px-3 py-2 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs hover:brightness-110"
                  >
                    Thêm
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => {
                    const isSelected = form.tagIds.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        className="flex items-center gap-1"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isSelected) {
                              setForm((prev: ItemForm | null) => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  tagIds: prev.tagIds.filter(
                                    (x) => x !== t.id,
                                  ),
                                };
                              });
                            } else {
                              setForm((prev: ItemForm | null) => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  tagIds: [...prev.tagIds, t.id],
                                };
                              });
                            }
                          }}
                          className={`px-3 py-1.5 rounded-l-lg text-xs font-medium transition-all ${
                            isSelected
                              ? "bg-thuy-400 text-thuy-950 font-bold"
                              : "bg-thuy-900 text-slate-600 border border-thuy-700 hover:text-[#142338]"
                          }`}
                        >
                          #{t.name}
                        </button>
                        {isSelected && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setForm((prev: ItemForm | null) => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  tagIds: prev.tagIds.filter(
                                    (x) => x !== t.id,
                                  ),
                                };
                              });
                            }}
                            className="rounded-r-lg bg-red-600 text-white text-xs px-2 py-1.5 hover:bg-red-500 transition-colors"
                            title="Bỏ chọn thẻ"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-xs text-white">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => updateForm({ active: e.target.checked })}
                    className="accent-thuy-400"
                  />
                  Đang kinh doanh
                </label>
                <label className="flex items-center gap-2 text-xs text-white">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => updateForm({ featured: e.target.checked })}
                    className="accent-thuy-400"
                  />
                  Nổi bật
                </label>
              </div>

              {/* Price section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-white">Giá bán (VNĐ):</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => updateForm({ price: e.target.value })}
                    placeholder="850000 (để trống nếu miễn phí)"
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white">Giảm giá (VNĐ):</label>
                  <input
                    type="number"
                    value={form.discount}
                    onChange={(e) => updateForm({ discount: e.target.value })}
                    placeholder="100000"
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white">
                    Giá sau khi giảm (VNĐ):
                  </label>
                  <input
                    type="number"
                    value={form.priceAfterDiscount}
                    onChange={(e) =>
                      updateForm({ priceAfterDiscount: e.target.value })
                    }
                    placeholder="Tự động tính nếu để trống"
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                </div>
              </div>

              {/* File download configuration */}
              <div className="p-4 rounded-2xl bg-thuy-850/60 border border-thuy-750 space-y-3">
                <h4 className="text-xs font-bold text-thuy-300 flex items-center gap-2">
                  <Download className="w-4 h-4" /> File &amp; link tải cho khách
                  đã thanh toán
                </h4>

                <div className="space-y-1">
                  <label className="text-xs text-white">
                    Tải file trực tiếp lên kho private (tối đa 4MB):
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-slate-700 cursor-pointer hover:border-thuy-500">
                      <Upload className="w-3.5 h-3.5" />
                      <span className="truncate">
                        {form.fileName || "Chọn file (zip, dwg, skp, rar...)"}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUploadFile(f);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {uploading && (
                      <Loader2 className="w-4 h-4 animate-spin text-thuy-400" />
                    )}
                  </div>
                  {form.fileKey && (
                    <p className="text-[10px] text-emerald-400 font-mono truncate">
                      Đang lưu: {form.fileKey}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5" /> Link tải nội bộ (Google
                    Drive/Dropbox/CDN):
                  </label>
                  <input
                    type="url"
                    value={form.downloadLinkUrl}
                    onChange={(e) =>
                      updateForm({ downloadLinkUrl: e.target.value })
                    }
                    placeholder="https://drive.google.com/... (dán link chia sẻ nội bộ)"
                    className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                  />
                  <p className="text-[10px] text-slate-300">
                    Link này KHÔNG được hiển thị cho khách. Máy chủ sẽ phát lại
                    file qua /api/downloads sau khi kiểm tra đúng tài khoản đã
                    thanh toán.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Thời hạn link sau khi
                      thanh toán:
                    </label>
                    <select
                      value={form.downloadExpiresMinutes}
                      onChange={(e) =>
                        updateForm({ downloadExpiresMinutes: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
                    >
                      {EXPIRY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-red-950/10 border border-red-900/30">
                  <p className="text-xs text-red-400 font-semibold">
                    ⚠ Bắt buộc thanh toán mới tải được
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase hover:brightness-110 shadow-glow-cyan flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Upload sản phẩm</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker for thumbnail */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => {
          setMediaPickerOpen(false);
          setMediaTarget(null);
        }}
        onSelect={(selected: MediaItem | MediaItem[]) => {
          if (!Array.isArray(selected)) {
            if (mediaTarget === "thumbnailVideo") {
              setThumbVideo(selected.url);
              updateForm({ thumbnail: selected.url });
            } else if (mediaTarget === "thumbnailImage") {
              setThumbImage(selected.url);
              updateForm({ thumbnail: selected.url });
            } else {
              updateForm({ thumbnail: selected.url });
            }
          }
          setMediaPickerOpen(false);
          setMediaTarget(null);
        }}
        multiple={false}
        title={
          mediaTarget === "thumbnailVideo"
            ? "Chọn Video Thumbnail"
            : mediaTarget === "thumbnailImage"
              ? "Chọn Ảnh Thumbnail"
              : "Chọn Thumbnail"
        }
        mediaType={
          mediaTarget === "thumbnailVideo"
            ? "video"
            : mediaTarget === "thumbnailImage"
              ? "image"
              : "all"
        }
        allowExternalUrl={false}
      />

      {/* Media Picker for Gallery */}
      <MediaPickerModal
        isOpen={galleryMediaPickerOpen}
        onClose={() => setGalleryMediaPickerOpen(false)}
        onSelect={handleGalleryAdd}
        multiple={true}
        selectedIds={galleryItems.map((i) => i.mediaId)}
        title="Chọn ảnh/video vào Gallery sản phẩm"
        mediaType="all"
      />

      {/* Xoá xác nhận dialog */}
      {confirmDelete.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget)
              setConfirmDelete((prev) => ({ ...prev, open: false }));
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
          <div className="relative w-full max-w-md mx-4 transition-all duration-200 opacity-100 scale-100">
            <div className="bg-thuy-900 border border-thuy-700 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-white font-bold text-sm">
                      {confirmDelete.type === "group"
                        ? "Xác nhận xoá nhóm sản phẩm"
                        : confirmDelete.type === "category"
                          ? "Xác nhận xoá hạng mục"
                          : "Xác nhận xoá sản phẩm"}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Bạn có chắc muốn xoá{" "}
                      <b className="text-white">{confirmDelete.name}</b>{" "}
                      {confirmDelete.type === "group"
                        ? "và tất cả hạng mục thuộc nhóm này?"
                        : confirmDelete.type === "category"
                          ? "?"
                                                        : "?"} Hành động
                      này không thể hoàn tác.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() =>
                      setConfirmDelete((prev) => ({ ...prev, open: false }))
                    }
                    className="px-4 py-2 rounded-xl bg-thuy-800 text-slate-400 hover:bg-thuy-700 hover:text-white text-xs font-semibold border border-thuy-700 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={
                      confirmDelete.type === "group"
                        ? handleConfirmDeleteGroup
                        : confirmDelete.type === "category"
                          ? handleConfirmDeleteCategory
                          : handleConfirmDelete
                    }
                    className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-500 text-xs font-semibold shadow-lg shadow-red-500/20 transition-all"
                  >
                    Xoá
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thông báo lỗi khi không thể xoá */}
      {alertDialog.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget)
              setAlertDialog((prev) => ({ ...prev, open: false }));
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
          <div className="relative w-full max-w-md mx-4 transition-all duration-200 opacity-100 scale-100">
            <div className="bg-thuy-900 border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-white font-bold text-sm">
                      {alertDialog.title}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1 leading-snug">
                      {alertDialog.message}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() =>
                      setAlertDialog((prev) => ({ ...prev, open: false }))
                    }
                    className="px-6 py-2 rounded-xl bg-red-600 text-white hover:bg-red-500 text-xs font-semibold shadow-lg shadow-red-500/20 transition-all"
                  >
                    Đã hiểu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bảng danh mục của 1 nhóm                                            */
/* ------------------------------------------------------------------ */
function CatalogTable({
  items,
  groupKey,
  onEdit,
  onDelete,
}: {
  items: any[];
  groupKey: string;
  onEdit: (item: any) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const group = groupKey;

  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-slate-600 text-xs rounded-2xl bg-thuy-850/50 border border-thuy-750">
        <Package className="w-8 h-8 mx-auto mb-3 text-slate-600" />
        Nhóm <b className="text-[#142338]">{group}</b> chưa có mục nào. Bấm
        “Thêm mục” để tạo mục danh mục đầu tiên.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-thuy-850 border border-thuy-750 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-thuy-900/80 text-white uppercase font-semibold text-[10px] tracking-wider border-b border-thuy-750">
            <tr>
              <th className="py-3 px-5">Ảnh</th>
              <th className="py-3 px-5">Tên mục</th>
              <th className="py-3 px-5">Giá bán</th>
              <th className="py-3 px-5">File / Link tải</th>
              <th className="py-3 px-5">Hiệu lực link</th>
              <th className="py-3 px-5">Trạng thái</th>
              <th className="py-3 px-5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-thuy-750/60">
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-thuy-800/40">
                <td className="py-3.5 px-5">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-thuy-950 border border-thuy-700">
                    {p.thumbnail ? (
                      (() => {
                        const src =
                          playableVideoUrl(p.thumbnail) || p.thumbnail;
                        const lower = (p.thumbnail || "").toLowerCase();
                        const isImageExt =
                          /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?|$)/i.test(
                            lower,
                          );
                        const isVideoExt =
                          /\.(mp4|mov|webm|mkv|avi)(\?|$)/i.test(lower);
                        const isDriveView =
                          /drive\.google\.com\/uc\?export=view/i.test(lower);
                        const isStream = src?.includes("/api/media/stream");
                        const isDriveFile =
                          /drive\.google\.com\/file\/d\//.test(lower);

                        if (isDriveView && !isVideoExt) {
                          const idMatch =
                            p.thumbnail.match(/id=([a-zA-Z0-9_-]+)/);
                          const imgSrc = idMatch
                            ? `https://drive.google.com/uc?export=view&id=${idMatch[1]}`
                            : p.thumbnail;
                          return (
                            <img
                              src={imgSrc}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          );
                        }

                        if (isImageExt && !isVideoExt && !isStream) {
                          return (
                            <Image
                              src={p.thumbnail}
                              alt={p.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          );
                        }

                        if (isStream) {
                          return (
                            <video
                              src={src}
                              muted
                              loop
                              playsInline
                              preload="metadata"
                              className="w-full h-full object-cover"
                            />
                          );
                        }

                        if (
                          isVideoExt ||
                          (isVideoUrl(p.thumbnail) && !isImageExt)
                        ) {
                          if (src) {
                            return (
                              <video
                                src={src}
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                className="w-full h-full object-cover"
                              />
                            );
                          }
                        }

                        if (isDriveFile) {
                          const idMatch =
                            p.thumbnail.match(/id=([a-zA-Z0-9_-]+)/);
                          const imgSrc = idMatch
                            ? `https://drive.google.com/uc?export=view&id=${idMatch[1]}`
                            : p.thumbnail;
                          return (
                            <Image
                              src={imgSrc}
                              alt={p.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          );
                        }

                        return (
                          <Image
                            src={p.thumbnail}
                            alt={p.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        );
                      })()
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <FileCode className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-5">
                  <span className="font-bold text-[#142338] block text-sm">
                    {p.name}
                  </span>
                  <span className="text-[10px] text-slate-600 font-mono block">
                    /products/{p.slug}
                  </span>
                  <span className="text-[10px] text-thuy-300 mt-1 inline-block px-2 py-0.5 rounded-full bg-thuy-800 border border-thuy-700">
                    {p.productGroup || p.productCategory || p.productGroup}
                  </span>
                </td>
                <td className="py-3.5 px-5 font-bold text-thuy-400 text-sm">
                  {formatVND(p.price)}
                </td>
                <td className="py-3.5 px-5 text-slate-700">
                  {p.fileKey || p.downloadLinkUrl ? (
                    <>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <Check className="w-3.5 h-3.5" /> Đã cấu hình
                      </div>
                      <span className="text-[10px] text-slate-600 font-mono block truncate max-w-[220px]">
                        {p.fileName || p.fileKey || "Link nội bộ"}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {p.fileSize || p.fileFormat || "—"}
                      </span>
                    </>
                  ) : (
                    <span className="text-amber-400 text-[11px]">
                      Chưa có file — khách mua sẽ không tải được
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-5 text-slate-700">
                  {p.downloadExpiresMinutes || 5} phút
                </td>
                <td className="py-3.5 px-5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      p.active
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        : "bg-thuy-800 text-slate-600 border-thuy-700"
                    }`}
                  >
                    {p.active ? "Đang bán" : "Đang ẩn"}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-right">
                  <div className="inline-flex gap-1.5">
                    <button
                      onClick={() => onEdit(p)}
                      className="p-2 rounded-lg bg-cyan-900/50 hover:bg-cyan-800 text-cyan-400 border border-cyan-700/50 hover:border-cyan-500 transition-all"
                      title="Sửa"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(p.id, p.name)}
                      className="p-2 rounded-lg bg-red-900/50 hover:bg-red-800 text-red-400 border border-red-700/50 hover:border-red-500 transition-all"
                      title="Xoá"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab quản lý danh mục dự án + dự án hiển thị                        */
/* ------------------------------------------------------------------ */
function ManagePanel({
  categories,
  projects,
  items,
  onRefresh,
  onNotice,
}: {
  categories: any[];
  projects: any[];
  items: any[];
  onRefresh: () => void;
  onNotice: (n: { type: "ok" | "err"; text: string }) => void;
}) {
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [savingCat, setSavingCat] = useState(false);

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setSavingCat(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: catName, description: catDesc }),
      });
      const data = await res.json();
      if (data.success) {
        setCatName("");
        setCatDesc("");
        onNotice({ type: "ok", text: "Đã thêm danh mục dự án." });
        onRefresh();
      } else {
        onNotice({ type: "err", text: data.error || "Không thêm được." });
      }
    } finally {
      setSavingCat(false);
    }
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`Xoá danh mục "${name}"?`)) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    onNotice(
      data.success
        ? { type: "ok", text: "Đã xoá danh mục." }
        : { type: "err", text: data.error || "Không xoá được." },
    );
    if (data.success) onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Danh mục dự án */}
      <div className="rounded-2xl bg-thuy-850 border border-thuy-750 overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-thuy-750 flex items-center justify-between">
          <h2 className="font-bold text-sm text-[#142338] flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-thuy-400" /> Danh Mục Dự Án Hiển
            Thị
          </h2>
          <span className="text-[10px] text-slate-600">
            Phân loại dự án trên website (biệt thự, nhà phố, nội thất...)
          </span>
        </div>

        <form
          onSubmit={createCategory}
          className="px-5 py-4 grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-3 border-b border-thuy-750/60 bg-thuy-900/40"
        >
          <input
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="Tên danh mục *"
            className="px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
          />
          <input
            value={catDesc}
            onChange={(e) => setCatDesc(e.target.value)}
            placeholder="Mô tả ngắn"
            className="px-3 py-2 rounded-xl bg-thuy-800 border border-thuy-700 text-xs text-white"
          />
          <button
            type="submit"
            disabled={savingCat}
            className="px-4 py-2 rounded-xl bg-thuy-400 text-thuy-950 font-bold text-xs uppercase hover:brightness-110 flex items-center gap-1.5 justify-center"
          >
            {savingCat ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            Thêm
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-thuy-900/80 text-white uppercase font-semibold text-[10px] tracking-wider border-b border-thuy-750">
              <tr>
                <th className="py-3 px-5">Tên danh mục</th>
                <th className="py-3 px-5">Slug</th>
                <th className="py-3 px-5">Số dự án</th>
                <th className="py-3 px-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-thuy-750/60">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-thuy-800/40">
                  <td className="py-3 px-5 font-bold text-[#142338]">
                    {c.name}
                  </td>
                  <td className="py-3 px-5 text-slate-600 font-mono text-[10px]">
                    {c.slug}
                  </td>
                  <td className="py-3 px-5 text-slate-700">
                    {c._count?.projects ?? 0}
                  </td>
                  <td className="py-3 px-5 text-right">
                    <button
                      onClick={() => deleteCategory(c.id, c.name)}
                      className="p-1.5 rounded-lg bg-thuy-800 hover:bg-red-950 hover:text-red-400 text-slate-600 border border-thuy-700"
                      title="Xoá"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 text-center text-slate-500 text-xs"
                  >
                    Chưa có danh mục dự án nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dự án hiển thị */}
      <div className="rounded-2xl bg-thuy-850 border border-thuy-750 overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-thuy-750 flex items-center justify-between">
          <h2 className="font-bold text-sm text-[#142338] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-thuy-400" /> Dự Án Kiến Trúc
          </h2>
          <Link
            href="/admin/projects/new"
            className="px-3 py-1.5 rounded-lg bg-thuy-800 hover:bg-thuy-750 text-thuy-300 text-[10px] font-bold uppercase border border-thuy-700 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Tạo dự án
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-thuy-900/80 text-white uppercase font-semibold text-[10px] tracking-wider border-b border-thuy-750">
              <tr>
                <th className="py-3 px-5">Ảnh</th>
                <th className="py-3 px-5">Tên dự án</th>
                <th className="py-3 px-5">Danh mục</th>
                <th className="py-3 px-5">Mục danh mục đã bán</th>
                <th className="py-3 px-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-thuy-750/60">
              {projects.map((p) => {
                const linked = items.filter((i) => i.projectId === p.id);
                return (
                  <tr key={p.id} className="hover:bg-thuy-800/40">
                    <td className="py-3 px-5">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-thuy-950 border border-thuy-700">
                        {p.cover?.url ? (
                          <Image
                            src={p.cover.url}
                            alt={p.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <Building2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span className="font-bold text-[#142338] block">
                        {p.title}
                      </span>
                      <span className="text-[10px] text-slate-600 font-mono">
                        /projects/{p.slug}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-slate-700">
                      {p.category?.name || "—"}
                    </td>
                    <td className="py-3 px-5">
                      {linked.length === 0 ? (
                        <span className="text-[10px] text-slate-500">
                          Chưa gắn mục bán
                        </span>
                      ) : (
                        linked.map((l) => (
                          <span
                            key={l.id}
                            className="inline-block mr-1.5 px-2 py-0.5 rounded-full bg-thuy-800 text-thuy-300 text-[10px] font-bold border border-thuy-700"
                          >
                            {l.name}
                          </span>
                        ))
                      )}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <Link
                        href={`/admin/projects/${p.id}`}
                        className="inline-block p-1.5 rounded-lg bg-thuy-800 hover:bg-thuy-700 text-slate-700 border border-thuy-700"
                        title="Sửa dự án"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {projects.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-6 text-center text-slate-500 text-xs"
                  >
                    Chưa có dự án nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
