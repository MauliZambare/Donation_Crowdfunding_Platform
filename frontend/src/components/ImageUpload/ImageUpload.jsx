import { useEffect, useRef, useState } from "react";
import { uploadImage } from "../../services/api";
import "./ImageUpload.css";

const ImageUpload = ({ imageUrl, onUploadSuccess }) => {
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(addCacheBust(imageUrl || ""));
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Sync with parent when uploaded URL changes.
    if (imageUrl) {
      setPreviewUrl(addCacheBust(imageUrl));
    } else if (!selectedFile) {
      setPreviewUrl("");
    }
  }, [imageUrl]);

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
    <div className="image-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        className="image-upload-input"
      />

      {previewUrl && (
        <div className="image-upload-preview">
          <img src={previewUrl} alt="Campaign preview" />
        </div>
      )}

      <button
        type="button"
        onClick={handleUpload}
        className="image-upload-button"
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Upload Image"}
      </button>

      {error && <p className="image-upload-error">{error}</p>}
    </div>
  );
};

export default ImageUpload;

function addCacheBust(url) {
  if (!url) return "";
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}t=${Date.now()}`;
}
