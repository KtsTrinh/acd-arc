import { NextResponse } from "next/server";
import { updateMediaMetadata, deleteMediaItem } from "@/lib/storage";
import { triggerCmsAutoSync } from "@/lib/cms-auto-sync";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { filename, alt, folder } = body;

    const updated = await updateMediaMetadata(id, { filename, alt, folder });
    const sync = await triggerCmsAutoSync("cập nhật media");
    return NextResponse.json({ success: true, media: updated, sync });
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
    const sync = await triggerCmsAutoSync("xóa media");
    return NextResponse.json({
      success: true,
      message: "Đã xóa media thành công.",
      sync,
    });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { error: "Không thể xóa media." },
      { status: 500 }
    );
  }
}

