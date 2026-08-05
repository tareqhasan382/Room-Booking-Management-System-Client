"use client";
import { useRef, useState } from "react";
import { useAuth } from "@/Hooks/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { uploadImage } from "@/lib/api";
import { ImagePlus, Loader2, X } from "lucide-react";

/**
 * Reusable image upload field.
 * Reads a local file, uploads it to Cloudinary via /api/upload, then passes
 * the returned URL back through `onChange`. Works for profile avatars and
 * room photos.
 */
const ImageUploader = ({
  value,
  onChange,
  folder = "rbm/images",
  label = "Image",
}) => {
  const { token } = useAuth();
  const inputRef = useRef(null);
  const toast = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await uploadImage(dataUrl, folder, token);
      if (res?.success && res?.data?.url) {
        onChange(res.data.url);
        toast.success("Image uploaded");
      } else {
        toast.error(res?.message || "Upload failed");
      }
    } catch (err) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 text-sm font-medium">
      <span>{label}</span>
      <div className="flex items-center gap-3">
        <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <ImagePlus className="w-6 h-6 text-slate-400" />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ImagePlus className="w-3.5 h-3.5" />
            )}
            {uploading ? "Uploading..." : value ? "Change image" : "Upload image"}
          </button>
          {value && !uploading && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1 text-xs text-red-500 hover:underline"
            >
              <X className="w-3 h-3" /> Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
