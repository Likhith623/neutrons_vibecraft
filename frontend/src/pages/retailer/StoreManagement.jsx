import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Clock,
  X,
  Save,
  Loader2,
  Upload,
  CheckCircle,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { supabase, uploadImage } from '../../lib/supabase';
import toast from 'react-hot-toast';

const StoreManagement = () => {
  const { user } = useAuthStore();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    store_name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    license_number: '',
    opening_time: '09:00',
    closing_time: '21:00',
    is_open: true,
  });

  useEffect(() => {
    fetchStores();
  }, [user]);

  const fetchStores = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toFixed(8),
            longitude: position.coords.longitude.toFixed(8),
          });
          toast.success('Location captured!');
        },
        (error) => {
          toast.error('Failed to get location');
        }
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  const openModal = (store = null) => {
    if (store) {
      setEditingStore(store);
      setFormData({
        store_name: store.store_name || '',
        description: store.description || '',
        address: store.address || '',
        city: store.city || '',
        state: store.state || '',
        pincode: store.pincode || '',
        latitude: store.latitude || '',
        longitude: store.longitude || '',
        phone: store.phone || '',
        email: store.email || '',
        license_number: store.license_number || '',
        opening_time: store.opening_time || '09:00',
        closing_time: store.closing_time || '21:00',
        is_open: store.is_open ?? true,
      });
      setImagePreview(store.store_image_url);
    } else {
      setEditingStore(null);
      setFormData({
        store_name: '',
        description: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        latitude: '',
        longitude: '',
        phone: '',
        email: '',
        license_number: '',
        opening_time: '09:00',
        closing_time: '21:00',
        is_open: true,
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStore(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.store_name?.trim()) {
      toast.error('Store name is required');
      return;
    }
    if (!formData.address?.trim() || !formData.city?.trim() || !formData.state?.trim()) {
      toast.error('Please fill in all address fields');
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      toast.error('Please set your store location');
      return;
    }
    if (!formData.phone?.trim()) {
      toast.error('Phone number is required');
      return;
    }
    
    setSaving(true);

    try {
      let imageUrl = editingStore?.store_image_url || null;

      // Upload image if selected
      if (imageFile) {
        try {
          const timestamp = Date.now();
          const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filePath = `${user.id}/${timestamp}-${safeName}`;
          imageUrl = await uploadImage('store-images', filePath, imageFile);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          toast.error('Image upload failed, saving without image');
          imageUrl = editingStore?.store_image_url || null;
        }
      }

      const storeData = {
        store_name: formData.store_name.trim(),
        description: formData.description?.trim() || null,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode?.trim() || null,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || null,
        license_number: formData.license_number?.trim() || null,
        opening_time: formData.opening_time || '09:00',
        closing_time: formData.closing_time || '21:00',
        is_open: formData.is_open !== false,
        store_image_url: imageUrl,
        owner_id: user.id,
      };

      if (editingStore) {
        const { error } = await supabase
          .from('stores')
          .update(storeData)
          .eq('id', editingStore.id);

        if (error) throw error;
        toast.success('Store updated successfully!');
      } else {
        const { error } = await supabase.from('stores').insert(storeData);

        if (error) throw error;
        toast.success('Store added successfully!');
      }

      closeModal();
      fetchStores();
    } catch (error) {
      console.error('Error saving store:', error);
      toast.error(error.message || 'Failed to save store');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (storeId) => {
    const confirmed = window.confirm('Are you sure you want to delete this store? All medicines will also be deleted.');
    if (!confirmed) {
      return;
    }

    try {
      const { error } = await supabase.from('stores').delete().eq('id', storeId);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }
      
      toast.success('Store deleted successfully');
      // Update local state immediately
      setStores(prev => prev.filter(s => s.id !== storeId));
    } catch (error) {
      console.error('Error deleting store:', error);
      toast.error(error.message || 'Failed to delete store');
    }
  };

  const toggleStoreStatus = async (store) => {
    try {
      const { error } = await supabase
        .from('stores')
        .update({ is_open: !store.is_open })
        .eq('id', store.id);

      if (error) throw error;
      toast.success(`Store marked as ${!store.is_open ? 'open' : 'closed'}`);
      fetchStores();
    } catch (error) {
      console.error('Error updating store:', error);
      toast.error('Failed to update store status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">
              My <span className="gradient-text">Stores</span>
            </h1>
            <p className="text-white/60">
              Manage your pharmacy stores and their details
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="glass-button flex items-center gap-2"
          >
            <Plus size={20} />
            <span>Add Store</span>
          </motion.button>
        </motion.div>

        {/* Stores Grid */}
        {stores.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-12 text-center"
          >
            <Store size={64} className="mx-auto text-white/20 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Stores Yet</h3>
            <p className="text-white/50 mb-6">
              Add your first pharmacy store to start listing medicines
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openModal()}
              className="glass-button"
            >
              <Plus size={20} className="inline mr-2" />
              Add Your First Store
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store, index) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card overflow-hidden"
              >
                {/* Store Image */}
                <div className="h-40 bg-gradient-to-br from-primary-500/20 to-purple-600/20 relative">
                  {store.store_image_url ? (
                    <img
                      src={store.store_image_url}
                      alt={store.store_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store size={48} className="text-white/30" />
                    </div>
                  )}
                  <div
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
                      store.is_open
                        ? 'bg-green-500/90 text-white'
                        : 'bg-red-500/90 text-white'
                    }`}
                  >
                    {store.is_open ? 'Open' : 'Closed'}
                  </div>
                </div>

                {/* Store Details */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-2">{store.store_name}</h3>

                  <div className="space-y-2 text-sm text-white/70">
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                      <span>
                        {store.address}, {store.city}, {store.state} -{' '}
                        {store.pincode}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      <span>{store.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>
                        {store.opening_time} - {store.closing_time}
                      </span>
                    </div>
                  </div>

                  {/* Rating */}
                  {store.rating > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex items-center gap-1 text-yellow-400">
                        {'★'.repeat(Math.round(store.rating))}
                        {'☆'.repeat(5 - Math.round(store.rating))}
                      </div>
                      <span className="text-sm text-white/50">
                        ({store.total_reviews} reviews)
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleStoreStatus(store)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        store.is_open
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      }`}
                    >
                      {store.is_open ? 'Close Store' : 'Open Store'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openModal(store)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
                    >
                      <Edit size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(store.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">
                      {editingStore ? 'Edit Store' : 'Add New Store'}
                    </h2>
                    <button
                      onClick={closeModal}
                      className="p-2 rounded-lg hover:bg-white/10"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Store Image */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Store Image
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Upload size={24} className="text-white/30" />
                          )}
                        </div>
                        <label className="glass-button-secondary cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <Upload size={16} className="inline mr-2" />
                          Upload Image
                        </label>
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Store Name *
                        </label>
                        <input
                          type="text"
                          name="store_name"
                          value={formData.store_name}
                          onChange={handleChange}
                          required
                          className="glass-input"
                          placeholder="Apollo Pharmacy"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          License Number
                        </label>
                        <input
                          type="text"
                          name="license_number"
                          value={formData.license_number}
                          onChange={handleChange}
                          className="glass-input"
                          placeholder="DL-XXXX-XXXX"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={2}
                        className="glass-input resize-none"
                        placeholder="Brief description of your pharmacy..."
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        className="glass-input"
                        placeholder="123, Main Street"
                      />
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          className="glass-input"
                          placeholder="Mumbai"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                          className="glass-input"
                          placeholder="Maharashtra"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleChange}
                          required
                          className="glass-input"
                          placeholder="400001"
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Location Coordinates *
                      </label>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <input
                          type="number"
                          name="latitude"
                          value={formData.latitude}
                          onChange={handleChange}
                          required
                          step="any"
                          className="glass-input"
                          placeholder="Latitude (e.g., 19.0760)"
                        />
                        <input
                          type="number"
                          name="longitude"
                          value={formData.longitude}
                          onChange={handleChange}
                          required
                          step="any"
                          className="glass-input"
                          placeholder="Longitude (e.g., 72.8777)"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="mt-2 text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
                      >
                        <MapPin size={14} />
                        Use current location
                      </button>
                    </div>

                    {/* Contact */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="glass-input"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="glass-input"
                          placeholder="store@example.com"
                        />
                      </div>
                    </div>

                    {/* Timings */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Opening Time
                        </label>
                        <input
                          type="time"
                          name="opening_time"
                          value={formData.opening_time}
                          onChange={handleChange}
                          className="glass-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Closing Time
                        </label>
                        <input
                          type="time"
                          name="closing_time"
                          value={formData.closing_time}
                          onChange={handleChange}
                          className="glass-input"
                        />
                      </div>
                    </div>

                    {/* Store Status */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="is_open"
                        id="is_open"
                        checked={formData.is_open}
                        onChange={handleChange}
                        className="w-5 h-5 rounded bg-white/10 border-white/20"
                      />
                      <label htmlFor="is_open" className="text-sm">
                        Store is currently open
                      </label>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center gap-4 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="flex-1 glass-button-secondary"
                      >
                        Cancel
                      </button>
                      <motion.button
                        type="submit"
                        disabled={saving}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 glass-button flex items-center justify-center gap-2"
                      >
                        {saving ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <>
                            <Save size={20} />
                            <span>{editingStore ? 'Update' : 'Add'} Store</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StoreManagement;
