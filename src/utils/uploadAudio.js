
export function uploadAudio(file, onProgress) {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = import.meta.env.VITE_CLOUDINARY_AUDIO_PRESET;

  return new Promise((resolve, reject) => {
    if (!cloud || !preset) {
      reject(
        new Error(
          "Cloudinary settings are missing. Check your .env file."
        )
      );
      return;
    }

    if (!file || !file.type.startsWith("audio/")) {
      reject(new Error("Please choose a valid audio file."));
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      reject(new Error("Audio file is too large (max 20 MB)."));
      return;
    }

    const body = new FormData();
    body.append("file", file);
    body.append("upload_preset", preset);

    const xhr = new XMLHttpRequest();

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${cloud}/video/upload`
    );

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(
          Math.round((event.loaded / event.total) * 100)
        );
      }
    };

    xhr.onload = () => {
      let data;

      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("Cloudinary returned an invalid response."));
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
        resolve(data.secure_url);
      } else {
        reject(
          new Error(
            data?.error?.message ||
            `Upload failed with status ${xhr.status}.`
          )
        );
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during audio upload."));
    };

    xhr.onabort = () => {
      reject(new Error("Audio upload was cancelled."));
    };

    xhr.send(body);
  });
}