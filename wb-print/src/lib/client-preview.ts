/** Лёгкое превью на телефоне (тяжёлые оригиналы не рвут ВК WebView). */
export async function previewUrlForFile(file: File): Promise<string> {
  const direct = () => URL.createObjectURL(file);
  if (file.size < 8 * 1024 * 1024) return direct();
  if (typeof createImageBitmap !== "function") return direct();
  try {
    const bitmap = await createImageBitmap(file, {
      resizeWidth: 1400,
      resizeHeight: 1400,
      resizeQuality: "high",
    });
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return direct();
    }
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((value) => resolve(value), "image/jpeg", 0.88),
    );
    if (blob) return URL.createObjectURL(blob);
  } catch {
    /* HEIC / старый WebView */
  }
  return direct();
}