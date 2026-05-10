import { useEffect, useRef, useState } from "react";
import { uploadImage } from "../../services/api";

const ImageUpload = ({ imageUrl, onUploadSuccess }) => {
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(addCacheBust(imageUrl || ""));
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (imageUrl) {
      setPreviewUrl(addCacheBust(imageUrl));
    } else if (!selectedFile) {
      setPreviewUrl("");
    }
  }, [imageUrl, selectedFile]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const localPreviewUrl = URL.createObjectURL(file);
    objectUrlRef.current = localPreviewUrl;

    setError("");
    setSelectedFile(file);
    setPreviewUrl(localPreviewUrl);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const response = await uploadImage(selectedFile);
      const uploadedUrl = response?.data?.imageUrl;
      if (!uploadedUrl) {
        throw new Error("Upload succeeded but image URL is missing in response.");
      }

      onUploadSuccess(uploadedUrl);
      setPreviewUrl(addCacheBust(uploadedUrl));
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (uploadError) {
      setError(uploadError.response?.data?.message || uploadError.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-white/20 bg-white/5 p-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        className="focus-ring w-full rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-sm text-slate-100 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:px-3 file:py-1.5 file:text-cyan-200"
      />

      {previewUrl && (
        <div className="h-44 overflow-hidden rounded-xl border border-white/15 bg-black/20">
          <img src={previewUrl} alt="Campaign preview" className="h-full w-full object-cover" loading="lazy" />
        </div>
      )}

      <button
        type="button"
        onClick={handleUpload}
        className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Upload Image"}
      </button>

      {error && <p className="text-sm text-rose-300">{error}</p>}
    </div>
  );
};

export default ImageUpload;

function addCacheBust(url) {
  if (!url) return "";
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}t=${Date.now()}`;
}
