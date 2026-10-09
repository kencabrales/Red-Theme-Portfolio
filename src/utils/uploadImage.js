export async function uploadImage(file) {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloud || !preset) {
    throw new Error("Cloudinary settings are missing in .env");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image is too large (max 10 MB)");
  }

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", preset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: "POST",
    body,
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || "Upload failed");
  }
  return data.secure_url;
}
