import { useEffect, useState } from "react";
import { uploadImage } from "../../services/api";
import "./ImageUpload.css";

const ImageUpload = ({ imageUrl, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(imageUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(imageUrl || "");
    }
  }, [imageUrl, selectedFile]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
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
      const uploadedUrl = response.data.imageUrl;
      onUploadSuccess(uploadedUrl);
      setPreviewUrl(uploadedUrl);
      setSelectedFile(null);
    } catch (uploadError) {
      setError(uploadError.response?.data?.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="image-upload">
      <input
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
