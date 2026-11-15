export async function postFormWithProgress(
  url: string,
  form: FormData,
  onProgress: (percent: number, phase: "upload" | "processing") => void,
): Promise<{ status: number; json: Record<string, unknown>; text: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.timeout = 15 * 60 * 1000;
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        const pct = Math.min(99, Math.round((event.loaded / event.total) * 100));
        onProgress(pct, "upload");
      } else {
        onProgress(0, "upload");
      }
    };
    xhr.upload.onload = () => onProgress(100, "processing");
    xhr.onload = () => {
      const text = xhr.responseText || "";
      let json: Record<string, unknown> = {};
      try {
        json = JSON.parse(text) as Record<string, unknown>;
      } catch {
        /* не JSON */
      }
      resolve({ status: xhr.status, json, text });
    };
    xhr.onerror = () => reject(new Error("не удалось отправить — проверьте сеть"));
    xhr.ontimeout = () => reject(new Error("слишком долго — попробуйте меньше фото за раз"));
    xhr.send(form);
  });
}