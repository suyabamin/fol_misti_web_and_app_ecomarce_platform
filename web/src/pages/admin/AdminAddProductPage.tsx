import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { productRepository } from '../../repositories/productRepository';
import { categoryRepository } from '../../repositories/categoryRepository';
import { Product, Category } from '../../models';

export const AdminAddProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('fruits');
  const [unit, setUnit] = useState('প্রতি কেজি');
  const [price, setPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);
  const [stock, setStock] = useState<number>(100);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionBn, setDescriptionBn] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSeasonal, setIsSeasonal] = useState(false);
  const [seasonType, setSeasonType] = useState<'mango' | 'orange' | 'lychee' | 'general'>('general');
  const [isActive, setIsActive] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const cats = await categoryRepository.getAll();
      setCategories(cats);

      if (id) {
        const prod = await productRepository.getById(id);
        if (prod) {
          setName(prod.name);
          setNameBn(prod.nameBn);
          setSlug(prod.slug);
          setCategory(prod.category);
          setUnit(prod.unit);
          setPrice(prod.price);
          setDiscountPrice(prod.discountPrice);
          setStock(prod.stock);
          setImageUrl(prod.imageUrl);
          setDescription(prod.description);
          setDescriptionBn(prod.descriptionBn || '');
          setIsFeatured(Boolean(prod.isFeatured));
          setIsSeasonal(Boolean(prod.isSeasonal));
          setSeasonType(prod.seasonType || 'general');
          setIsActive(prod.isActive);
        }
      }
    }
    init();
  }, [id]);

  const handleNameBnChange = (val: string) => {
    setNameBn(val);
    if (!id && !slug) {
      setSlug(val.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-'));
    }
  };

  // Cloudinary image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset || uploadPreset === 'your_unsigned_upload_preset') {
      // In dev mode when credentials aren't provided by user, create an instant object URL or placeholder
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) {
        setImageUrl(data.secure_url);
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (err: any) {
      console.warn('Cloudinary upload error:', err);
      // Fallback local file reader
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nameBn.trim()) {
      setError('পণ্যের বাংলা নাম আবশ্যক।');
      return;
    }
    if (price <= 0) {
      setError('সঠিক মূল্য প্রদান করুন।');
      return;
    }
    if (!imageUrl.trim()) {
      setError('পণ্যের ছবি বা ছবির লিংক দিন।');
      return;
    }

    setSaving(true);
    try {
      const productObj: Product = {
        id: id || `prod-${Date.now()}`,
        name: name.trim() || nameBn.trim(),
        nameBn: nameBn.trim(),
        slug: slug.trim() || `prod-${Date.now()}`,
        category,
        unit: unit.trim(),
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        stock: Number(stock),
        imageUrl: imageUrl.trim(),
        description: description.trim(),
        descriptionBn: descriptionBn.trim() || description.trim(),
        isFeatured,
        isSeasonal,
        seasonType: isSeasonal ? seasonType : undefined,
        rating: 5.0,
        reviewCount: 0,
        isActive,
        updatedAt: new Date().toISOString()
      };

      await productRepository.save(productObj);
      navigate('/admin/products');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'পণ্য সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          <ArrowLeft size={16} /> পণ্য তালিকায় ফিরুন
        </Link>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
          {id ? 'পণ্য সম্পাদনা (Edit Product)' : 'নতুন পণ্য যোগ করুন (Add Product)'}
        </h1>
      </div>

      {error && (
        <div style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-card)' }}>
        {/* Name Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">পণ্যের বাংলা নাম *</label>
            <input
              type="text"
              className="form-input"
              placeholder="যেমন: রাজশাহীর সেরা হিমসাগর আম"
              value={nameBn}
              onChange={(e) => handleNameBnChange(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">ইংরেজি নাম (English Name)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Rajshahi Himsagar Mango"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* Category & Unit */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">ক্যাটাগরি *</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="fruits">তাজা ফল (Fruits)</option>
              <option value="sweets">ঐতিহ্যবাহী মিষ্টি (Sweets)</option>
              <option value="mango-collection">আমের স্পেশাল (Mangoes)</option>
              <option value="sweet-boxes">উপহার ও মিষ্টি বক্স</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">পরিমাপের একক (Unit) *</label>
            <input
              type="text"
              className="form-input"
              placeholder="যেমন: প্রতি কেজি, মাটির সরা (১ কেজি), প্রতি বক্স"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">নিয়মিত মূল্য (৳) *</label>
            <input
              type="number"
              className="form-input"
              min="1"
              value={price || ''}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">ছাড় মূল্য (৳ Discount Price)</label>
            <input
              type="number"
              className="form-input"
              placeholder="ঐচ্ছিক"
              value={discountPrice || ''}
              onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">স্টক পরিমাণ (Stock) *</label>
            <input
              type="number"
              className="form-input"
              min="0"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              required
            />
          </div>
        </div>

        {/* Image Upload Box from reference A3 */}
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">পণ্যের ছবি (Image) *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: 'var(--radius-md)', border: '2px dashed var(--color-border)', background: 'var(--color-surface-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {imageUrl ? (
                <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <ImageIcon size={32} color="var(--color-text-muted)" />
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="file"
                accept="image/*"
                id="product-image-file"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <label
                htmlFor="product-image-file"
                className="btn btn-subtle btn-sm"
                style={{ width: 'fit-content', cursor: 'pointer' }}
              >
                <Upload size={16} />
                <span>{uploading ? 'আপলোড হচ্ছে...' : 'কম্পিউটার থেকে ছবি আপলোড করুন'}</span>
              </label>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>অথবা সরাসরি ইমেজ লিংক (URL) লিখুন:</span>
              <input
                type="url"
                className="form-input"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">পণ্যের বিবরণ (বাংলা)</label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="পণ্যটির বৈশিষ্ট্য, উৎস ও স্বাদ বিস্তারিত লিখুন..."
            value={descriptionBn}
            onChange={(e) => setDescriptionBn(e.target.value)}
          ></textarea>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap', padding: '1rem', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            <strong>ফিচার্ড পণ্য (Featured)</strong>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={isSeasonal}
              onChange={(e) => setIsSeasonal(e.target.checked)}
            />
            <strong>মৌসুমি পণ্য (Seasonal)</strong>
          </label>

          {isSeasonal && (
            <select
              className="form-select"
              style={{ width: '150px' }}
              value={seasonType}
              onChange={(e) => setSeasonType(e.target.value as any)}
            >
              <option value="general">সাধারণ মৌসুমি</option>
              <option value="mango">আম (Mango)</option>
              <option value="orange">কমলা/মাল্টা</option>
              <option value="lychee">লিচু (Lychee)</option>
            </select>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <strong>পণ্য সক্রিয় রাখুন (Active)</strong>
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          style={{ width: '100%', height: '48px' }}
          disabled={saving || uploading}
        >
          {saving ? 'সংরক্ষণ হচ্ছে...' : id ? 'পণ্য আপডেট করুন' : 'পণ্য প্রকাশ করুন'}
        </button>
      </form>
    </div>
  );
};
