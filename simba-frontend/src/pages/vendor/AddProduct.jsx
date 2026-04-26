import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import VendorLayout from '../../components/VendorLayout';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { 
  ArrowLeft, 
  Upload, 
  Save, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../../lib/utils';

const AddProduct = () => {
  const { user, token } = useAuth();
  const { id } = useParams(); // For Edit mode
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    image: '',
    description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const isApproved = user?.vendorProfile?.status === 'APPROVED';

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`);
      const data = await res.json();
      
      if (data.vendorId !== user.id) {
        navigate('/dashboard/vendor/products');
        return;
      }

      setFormData({
        name: data.name,
        price: data.price.toString(),
        category: data.category,
        image: data.image,
        description: data.description || ''
      });
    } catch (err) {
      setError('Failed to load product data');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isApproved && !isEditMode) return;
    
    setLoading(true);
    setError(null);

    const url = isEditMode 
      ? `${API_URL}/api/products/${id}` 
      : `${API_URL}/api/products`;
    
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Operation failed');

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard/vendor/products');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Groceries", "Electronics", "Furniture", "Bakery", 
    "Meat & Seafood", "Fruits & Veggies", "Dairy", "Beverages"
  ];

  if (fetching) {
    return (
      <VendorLayout>
        <div className="flex flex-col items-center justify-center py-40 text-outline">
          <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
          <p className="font-black text-xl">Loading product details...</p>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard/vendor/products" className="p-3 bg-surface border border-outline-variant rounded-2xl hover:bg-surface-container transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5 text-on-surface" />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-on-surface">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-outline font-medium">
              {isEditMode ? 'Update your product information' : 'List a new item in your supermarket'}
            </p>
          </div>
        </div>

        {!isApproved && !isEditMode && (
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-[32px] flex items-center gap-5">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 flex-shrink-0">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-amber-900 font-black text-lg">Action Required</h3>
              <p className="text-amber-800 font-medium">Your account is pending approval. You'll be able to add new products once our team verifies your store.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-error/10 border border-error/20 p-5 rounded-[32px] flex items-center gap-4 text-error">
            <AlertCircle className="w-6 h-6" />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-success/10 border border-success/20 p-5 rounded-[32px] flex items-center gap-4 text-success">
            <CheckCircle2 className="w-6 h-6" />
            <span className="font-bold text-lg">Product {isEditMode ? 'updated' : 'published'} successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image Preview */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface p-6 rounded-[32px] border border-outline-variant shadow-sm space-y-4">
              <label className="text-sm font-black uppercase tracking-widest text-outline ml-1">Product Preview</label>
              <div className="aspect-square rounded-3xl bg-surface-container-low border-2 border-dashed border-outline-variant flex flex-col items-center justify-center overflow-hidden relative group">
                {formData.image ? (
                  <>
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={() => setError("Invalid image URL")}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-black uppercase tracking-widest">Image Preview</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-outline-variant">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">No Image</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-outline text-center font-medium px-2 leading-relaxed">
                Provide a high-quality image URL for your product to attract more customers.
              </p>
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface p-8 rounded-[40px] border border-outline-variant shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-on-surface ml-1">Product Name</label>
                  <Input 
                    placeholder="e.g. Organic Rwandan Honey"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                    disabled={!isApproved && !isEditMode}
                    className="h-14 rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-on-surface ml-1">Price (RWF)</label>
                  <Input 
                    type="number"
                    placeholder="5000"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    required
                    disabled={!isApproved && !isEditMode}
                    className="h-14 rounded-2xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-on-surface ml-1">Category</label>
                  <select 
                    className="w-full h-14 px-5 rounded-2xl border border-outline bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold appearance-none disabled:opacity-50"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    required
                    disabled={!isApproved && !isEditMode}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-on-surface ml-1">Image URL</label>
                  <Input 
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image}
                    onChange={e => setFormData({...formData, image: e.target.value})}
                    required
                    disabled={!isApproved && !isEditMode}
                    className="h-14 rounded-2xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-on-surface ml-1">Description</label>
                <textarea 
                  className="w-full px-6 py-5 rounded-[32px] border border-outline bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[160px] font-bold resize-none disabled:opacity-50"
                  placeholder="Describe your product's quality, source, and benefits..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  disabled={!isApproved && !isEditMode}
                />
              </div>

              <div className="pt-6 border-t border-outline-variant/50 flex flex-col sm:flex-row gap-4">
                <Button 
                  type="submit" 
                  className="flex-grow h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 disabled:grayscale"
                  disabled={loading || (!isApproved && !isEditMode)}
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Save className="w-5 h-5" />
                      {isEditMode ? 'Update Product' : 'Publish Product'}
                    </div>
                  )}
                </Button>
                <Button 
                  type="button"
                  variant="ghost" 
                  className="h-14 px-10 rounded-2xl font-black"
                  onClick={() => navigate('/dashboard/vendor/products')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </VendorLayout>
  );
};

export default AddProduct;
