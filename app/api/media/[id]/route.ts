import { NextResponse } from "next/server";
import { updateMediaMetadata, deleteMediaItem } from "@/lib/storage";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { filename, alt, folder } = body;

    const updated = await updateMediaMetadata(id, { filename, alt, folder });
    return NextResponse.json({ success: true, media: updated });
  } catch (error) {
    console.error("Error updating media:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật thông tin media." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await deleteMediaItem(id);
    return NextResponse.json({ success: true, message: "Đã xóa media thành công." });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { error: "Không thể xóa media." },
      { status: 500 }
    );
  }
}

