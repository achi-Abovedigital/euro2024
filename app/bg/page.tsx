"use client";

import React, { useRef, useState } from "react";
import { removeBackground } from "../../utils/bgRemoval";

const Page = () => {
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log("File input changed"); // Debug log
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) {
      console.log("No file selected");
      return;
    }

    try {
      console.log("Calling removeBackground with file", file);
      const { success, processedImage } = await removeBackground(file);
      if (success && processedImage) {
        const imageUrl = URL.createObjectURL(processedImage);
        setProcessedImageUrl(imageUrl);
        console.log("Image processed and set to state");
      } else {
        alert("Failed to process the image.");
      }
    } catch (error) {
      console.error("Error processing image:", error);
      alert("An error occurred while processing the image.");
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
      <button
        className="bg-blue-500 text-white p-2 rounded"
        onClick={() => {
          console.log("Upload button clicked");
          fileInputRef.current?.click();
        }}
      >
        Upload Image
      </button>
      {processedImageUrl && (
        <img
          src={processedImageUrl}
          alt="Processed Image"
          style={{ maxWidth: "100%", maxHeight: "96px" }}
        />
      )}
    </div>
  );
};

export default Page;
