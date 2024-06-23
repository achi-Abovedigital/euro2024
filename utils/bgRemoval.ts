import axios from "axios";

export const removeBackground = async (
  image: File
): Promise<{ success: boolean; processedImage: Blob | null }> => {
  try {
    const formData = new FormData();
    formData.append("image", image);

    const options = {
      method: "POST",
      url: "https://background-removal4.p.rapidapi.com/v1/results",
      params: { mode: "fg-image" },
      headers: {
        "X-RapidAPI-Key": "58c426e3c1mshda957fec22c00e5p12d1e5jsne41977590af6",
        "X-RapidAPI-Host": "background-removal4.p.rapidapi.com",
        "Content-Type": "multipart/form-data",
      },
      data: formData,
    };

    const response = await axios.request(options);

    if (
      response.data.results &&
      response.data.results[0].entities &&
      response.data.results[0].entities[0].image
    ) {
      const base64Image = response.data.results[0].entities[0].image;
      const croppedImageBlob = await cropImage(base64Image, 20, 20);
      return { success: true, processedImage: croppedImageBlob };
    } else {
      return { success: false, processedImage: null };
    }
  } catch (error) {
    console.error("Background removal failed:", error);
    return { success: false, processedImage: null };
  }
};

const cropImage = async (
  base64Image: string,
  cropLeft: number,
  cropRight: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Check if ctx is not null
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      canvas.width = img.width - cropLeft - cropRight;
      canvas.height = img.height;

      ctx.drawImage(
        img,
        cropLeft,
        0,
        canvas.width,
        canvas.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas to Blob conversion failed"));
        }
      }, "image/png");
    };
    img.src = `data:image/png;base64,${base64Image}`;
  });
};
