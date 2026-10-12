const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";


export async function uploadImage(
  file: File
) {

  const formData = new FormData();

  formData.append(
    "file",
    file
  );


  const response = await fetch(
    `${API_URL}/api/upload`,
    {
      method: "POST",
      body: formData,
    }
  );


  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `Upload gagal (${response.status})`);
  }

  return response.json();
}

export async function upscaleImage(image_id: string, scale: number) {
  const response = await fetch(`${API_URL}/api/upscale`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_id,
      scale,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `Upscale gagal (${response.status})`);
  }

  return response.json();
}