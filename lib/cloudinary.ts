// lib/cloudinary.ts : Seçilen görseli Cloudinary'ye unsigned yükler, güvenli URL döndürür.

const CLOUD_NAME = "uosdjzsa";
const UPLOAD_PRESET = "sahneprofil";

/**
 * Yerel bir görsel URI'sini Cloudinary'ye yükler.
 * @param uri expo-image-picker'dan gelen yerel dosya yolu
 * @returns yüklenen görselin https URL'i
 */
export async function uploadToCloudinary(uri: string): Promise<string> {
  const formData = new FormData();

  // React Native'de dosya bu formatta gönderilir
  formData.append("file", {
    uri,
    type: "image/jpeg",
    name: "avatar.jpg",
  } as any);

  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error("Görsel yüklenemedi");
  }

  const data = await res.json();
  return data.secure_url as string;
}