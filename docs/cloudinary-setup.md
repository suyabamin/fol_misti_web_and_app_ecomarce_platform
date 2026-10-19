# Fol Mishti (ফল মিষ্টি) — Cloudinary Image Management Setup

## 1. Overview
Cloudinary is used to host, optimize, and serve all high-resolution imagery for seasonal fruits, Bengali sweets, categories, and promotional banners. The frontend uses a secure upload workflow with an unsigned or signed upload preset, ensuring that **the Cloudinary API Secret is never exposed in browser bundles**.

---

## 2. Cloudinary Account Creation & Credentials
1. Register for a free account at [Cloudinary](https://cloudinary.com/).
2. On your Cloudinary Dashboard, find:
   - **Cloud Name** (e.g. `fol-mishti`)
   - **API Key**

---

## 3. Creating an Unsigned Upload Preset for Web Uploads
1. Go to **Settings (gear icon) > Upload**.
2. Scroll to the **Upload presets** section and click **Add upload preset**.
3. Configure the preset:
   - **Upload preset name:** `folmishti_preset`
   - **Signing Mode:** **Unsigned**
   - **Folder:** `fol-mishti/products`
   - **Allowed formats:** `jpg, png, webp, jpeg`
   - **Max file size:** `5 MB`
   - **Incoming Transformation:** (Optional) Limit max width to `1200px` and format to `auto/webp` for optimal page load speed.
4. Save the preset.

---

## 4. Environment Configuration
Add the Cloud Name and Upload Preset to `web/.env`:
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=folmishti_preset
```

> [!CAUTION]
> **Never add `CLOUDINARY_API_SECRET` to frontend `.env` or client files.** Only the Cloud Name and Unsigned Preset belong in the client.

---

## 5. Fallback Behavior
If Cloudinary credentials are not configured, the application gracefully allows adding image URLs directly from trusted photography sources (e.g. Unsplash) or previews local file data URLs.
