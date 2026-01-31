import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  X,
  Save,
  Loader2,
  Upload,
  AlertTriangle,
  IndianRupee,
  Calendar,
  Store,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { supabase, uploadImage, getCategories } from '../../lib/supabase';
import toast from 'react-hot-toast';

const InventoryManagement = () => {
  const { storeId } = useParams();
  const { user } = useAuthStore();
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(storeId || '');
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    manufacturer: '',
    description: '',
    dosage: '',
    price: '',
    quantity: '',
    unit: 'strips',
    expiry_date: '',
    batch_number: '',
    requires_prescription: false,
    min_stock_alert: 10,
    category_id: '',
    is_available: true,
  });

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    if (selectedStore) {
      fetchMedicines();
      // Check and remove expired medicines
      removeExpiredMedicines();
    }
  }, [selectedStore]);

  // Function to remove expired medicines automatically
  const removeExpiredMedicines = async () => {
    if (!selectedStore) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get expired medicines
      const { data: expiredMeds, error: fetchError } = await supabase
        .from('medicines')
        .select('id, name')
        .eq('store_id', selectedStore)
        .lt('expiry_date', today)
        .not('expiry_date', 'is', null);
      
      if (fetchError) {
        console.error('Error fetching expired medicines:', fetchError);
        return;
      }
      
      if (expiredMeds && expiredMeds.length > 0) {
        // Delete expired medicines
        const { error: deleteError } = await supabase
          .from('medicines')
          .delete()
          .eq('store_id', selectedStore)
          .lt('expiry_date', today);
        
        if (deleteError) {
          console.error('Error deleting expired medicines:', deleteError);
        } else {
          const names = expiredMeds.map(m => m.name).join(', ');
          toast(`Removed ${expiredMeds.length} expired medicine(s): ${names}`, { 
            icon: '⚠️',
            duration: 5000 
          });
        }
      }
    } catch (error) {
      console.error('Error in removeExpiredMedicines:', error);
    }
  };

  const fetchInitialData = async () => {
    if (!user) return;

    try {
      // Fetch stores
      const { data: storesData } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id);

      setStores(storesData || []);

      if (storeId && storesData?.some((s) => s.id === storeId)) {
        setSelectedStore(storeId);
      } else if (storesData?.length > 0 && !storeId) {
        setSelectedStore(storesData[0].id);
      }

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('medicine_categories')
        .select('*');

      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    if (!selectedStore) return;

    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*, medicine_categories(name)')
        .eq('store_id', selectedStore)
        .order('name');

      if (error) throw error;
      setMedicines(data || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      toast.error('Failed to load medicines');
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

  const openModal = (medicine = null) => {
    if (medicine) {
      setEditingMedicine(medicine);
      setFormData({
        name: medicine.name || '',
        generic_name: medicine.generic_name || '',
        manufacturer: medicine.manufacturer || '',
        description: medicine.description || '',
        dosage: medicine.dosage || '',
        price: medicine.price || '',
        quantity: medicine.quantity || '',
        unit: medicine.unit || 'strips',
        expiry_date: medicine.expiry_date || '',
        batch_number: medicine.batch_number || '',
        requires_prescription: medicine.requires_prescription || false,
        min_stock_alert: medicine.min_stock_alert || 10,
        category_id: medicine.category_id || '',
        is_available: medicine.is_available ?? true,
      });
      setImagePreview(medicine.image_url);
    } else {
      setEditingMedicine(null);
      setFormData({
        name: '',
        generic_name: '',
        manufacturer: '',
        description: '',
        dosage: '',
        price: '',
        quantity: '',
        unit: 'strips',
        expiry_date: '',
        batch_number: '',
        requires_prescription: false,
        min_stock_alert: 10,
        category_id: '',
        is_available: true,
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMedicine(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedStore) {
      toast.error('Please select a store first');
      return;
    }

    // Validate required fields
    if (!formData.name?.trim()) {
      toast.error('Medicine name is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (formData.quantity === '' || parseInt(formData.quantity) < 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    setSaving(true);

    try {
      let imageUrl = editingMedicine?.image_url || null;

      // Upload image if selected
      if (imageFile) {
        try {
          const timestamp = Date.now();
          const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filePath = `${user.id}/${timestamp}-${safeName}`;
          imageUrl = await uploadImage('medicine-images', filePath, imageFile);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          // Continue without image if upload fails
          toast.error('Image upload failed, saving without image');
          imageUrl = editingMedicine?.image_url || null;
        }
      }

      const medicineData = {
        store_id: selectedStore,
        name: formData.name.trim(),
        generic_name: formData.generic_name?.trim() || null,
        manufacturer: formData.manufacturer?.trim() || null,
        description: formData.description?.trim() || null,
        dosage: formData.dosage?.trim() || null,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity) || 0,
        unit: formData.unit || 'units',
        expiry_date: formData.expiry_date || null,
        batch_number: formData.batch_number?.trim() || null,
        requires_prescription: formData.requires_prescription || false,
        min_stock_alert: parseInt(formData.min_stock_alert) || 10,
        category_id: formData.category_id || null,
        is_available: formData.is_available !== false,
        image_url: imageUrl,
      };

      if (editingMedicine) {
        const { error } = await supabase
          .from('medicines')
          .update(medicineData)
          .eq('id', editingMedicine.id);

        if (error) throw error;
        toast.success('Medicine updated successfully!');
      } else {
        const { error } = await supabase.from('medicines').insert(medicineData);

        if (error) throw error;
        toast.success('Medicine added successfully!');
      }

      closeModal();
      fetchMedicines();
    } catch (error) {
      console.error('Error saving medicine:', error);
      toast.error(error.message || 'Failed to save medicine');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (medicineId) => {
    // Use window.confirm for safe confirmation dialog
    const confirmed = window.confirm('Are you sure you want to delete this medicine? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    try {
      const { error } = await supabase
        .from('medicines')
        .delete()
        .eq('id', medicineId);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }
      
      toast.success('Medicine deleted successfully');
      // Update local state immediately for better UX
      setMedicines(prev => prev.filter(m => m.id !== medicineId));
    } catch (error) {
      console.error('Error deleting medicine:', error);
      toast.error(error.message || 'Failed to delete medicine');
    }
  };

  const toggleAvailability = async (medicine) => {
    try {
      const { error } = await supabase
        .from('medicines')
        .update({ is_available: !medicine.is_available })
        .eq('id', medicine.id);

      if (error) throw error;
      toast.success(
        `Medicine marked as ${!medicine.is_available ? 'available' : 'unavailable'}`
      );
      fetchMedicines();
    } catch (error) {
      console.error('Error updating medicine:', error);
      toast.error('Failed to update medicine');
    }
  };

  // Filter medicines
  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.generic_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !filterCategory || med.category_id === filterCategory;
    const matchesLowStock =
      !showLowStock || med.quantity <= med.min_stock_alert;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-12 text-center"
          >
            <Store size={64} className="mx-auto text-white/20 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Stores Found</h3>
            <p className="text-white/50 mb-6">
              You need to add a store before managing inventory
            </p>
            <a href="/retailer/stores" className="glass-button inline-block">
              Add Your First Store
            </a>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="gradient-text">Inventory</span> Management
            </h1>
            <p className="text-white/60">
              Manage your medicine inventory across stores
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="glass-button flex items-center gap-2"
            disabled={!selectedStore}
          >
            <Plus size={20} />
            <span>Add Medicine</span>
          </motion.button>
        </motion.div>

        {/* Store Selector & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Store Selector */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                Select Store
              </label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="glass-select"
              >
                <option value="">Select a store...</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.store_name} - {store.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                Search Medicine
              </label>
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name..."
                  className="glass-input pl-12"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="glass-select"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Low Stock Toggle */}
            <div className="flex items-end">
              <button
                onClick={() => setShowLowStock(!showLowStock)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-colors ${
                  showLowStock
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <AlertTriangle size={18} />
                <span className="whitespace-nowrap">Low Stock</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Medicine Stats */}
        {selectedStore && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold">{medicines.length}</p>
              <p className="text-sm text-white/50">Total Items</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-green-400">
                {medicines.filter((m) => m.is_available && m.quantity > 0).length}
              </p>
              <p className="text-sm text-white/50">In Stock</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-orange-400">
                {medicines.filter((m) => m.quantity <= m.min_stock_alert).length}
              </p>
              <p className="text-sm text-white/50">Low Stock</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-red-400">
                {medicines.filter((m) => m.quantity === 0).length}
              </p>
              <p className="text-sm text-white/50">Out of Stock</p>
            </div>
          </div>
        )}

        {/* Medicines Grid */}
        {!selectedStore ? (
          <div className="glass-card p-12 text-center">
            <Package size={64} className="mx-auto text-white/20 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Select a Store</h3>
            <p className="text-white/50">
              Choose a store from the dropdown above to manage its inventory
            </p>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Package size={64} className="mx-auto text-white/20 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {medicines.length === 0 ? 'No Medicines Yet' : 'No Results Found'}
            </h3>
            <p className="text-white/50 mb-6">
              {medicines.length === 0
                ? 'Start adding medicines to your inventory'
                : 'Try adjusting your search or filters'}
            </p>
            {medicines.length === 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openModal()}
                className="glass-button"
              >
                <Plus size={20} className="inline mr-2" />
                Add First Medicine
              </motion.button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMedicines.map((medicine, index) => (
              <motion.div
                key={medicine.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`glass-card overflow-hidden ${
                  medicine.quantity <= medicine.min_stock_alert
                    ? 'ring-2 ring-orange-500/50'
                    : ''
                }`}
              >
                {/* Medicine Image */}
                <div className="h-36 bg-gradient-to-br from-primary-500/20 to-purple-600/20 relative flex items-center justify-center">
                  {medicine.image_url ? (
                    <img
                      src={medicine.image_url}
                      alt={medicine.name}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={40} className="text-white/30" />
                    </div>
                  )}
                  
                  {/* Stock Badge */}
                  <div
                    className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                      medicine.quantity === 0
                        ? 'bg-red-500/90 text-white'
                        : medicine.quantity <= medicine.min_stock_alert
                        ? 'bg-orange-500/90 text-white'
                        : 'bg-green-500/90 text-white'
                    }`}
                  >
                    {medicine.quantity === 0
                      ? 'Out of Stock'
                      : medicine.quantity <= medicine.min_stock_alert
                      ? 'Low Stock'
                      : 'In Stock'}
                  </div>
                </div>

                {/* Medicine Details */}
                <div className="p-4">
                  <h3 className="font-semibold truncate">{medicine.name}</h3>
                  {medicine.generic_name && (
                    <p className="text-xs text-white/50 truncate">
                      {medicine.generic_name}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-green-400 font-semibold">
                      <IndianRupee size={16} />
                      {medicine.price}
                    </div>
                    <div className="text-sm text-white/70">
                      Qty: {medicine.quantity} {medicine.unit}
                    </div>
                  </div>

                  {medicine.expiry_date && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-white/50">
                      <Calendar size={12} />
                      Exp: {new Date(medicine.expiry_date).toLocaleDateString()}
                    </div>
                  )}

                  {medicine.medicine_categories && (
                    <div className="mt-2">
                      <span className="px-2 py-1 rounded-full bg-white/10 text-xs">
                        {medicine.medicine_categories.name}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleAvailability(medicine)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        medicine.is_available
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {medicine.is_available ? 'Available' : 'Unavailable'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openModal(medicine)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20"
                    >
                      <Edit size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(medicine.id)}
                      className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    >
                      <Trash2 size={16} />
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
                      {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
                    </h2>
                    <button
                      onClick={closeModal}
                      className="p-2 rounded-lg hover:bg-white/10"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Medicine Image */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Medicine Image (Single image only)
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-contain bg-black/20"
                            />
                          ) : (
                            <Upload size={24} className="text-white/30" />
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="glass-button-secondary cursor-pointer text-sm">
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                            <Upload size={16} className="inline mr-2" />
                            Upload
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Medicine Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="glass-input"
                          placeholder="Paracetamol 500mg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Generic Name
                        </label>
                        <input
                          type="text"
                          name="generic_name"
                          value={formData.generic_name}
                          onChange={handleChange}
                          className="glass-input"
                          placeholder="Acetaminophen"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Manufacturer
                        </label>
                        <input
                          type="text"
                          name="manufacturer"
                          value={formData.manufacturer}
                          onChange={handleChange}
                          className="glass-input"
                          placeholder="Sun Pharma"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Category
                        </label>
                        <select
                          name="category_id"
                          value={formData.category_id}
                          onChange={handleChange}
                          className="glass-select"
                        >
                          <option value="">Select category</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
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
                        placeholder="Brief description..."
                      />
                    </div>

                    {/* Price & Quantity */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Price (₹) *
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          required
                          min="0"
                          step="0.01"
                          className="glass-input"
                          placeholder="25.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleChange}
                          required
                          min="0"
                          className="glass-input"
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Unit
                        </label>
                        <select
                          name="unit"
                          value={formData.unit}
                          onChange={handleChange}
                          className="glass-select"
                        >
                          <option value="strips">Strips</option>
                          <option value="tablets">Tablets</option>
                          <option value="capsules">Capsules</option>
                          <option value="bottles">Bottles</option>
                          <option value="vials">Vials</option>
                          <option value="tubes">Tubes</option>
                          <option value="gels">Gels</option>
                          <option value="creams">Creams</option>
                          <option value="lotions">Lotions</option>
                          <option value="ointments">Ointments</option>
                          <option value="syrups">Syrups</option>
                          <option value="drops">Drops</option>
                          <option value="injections">Injections</option>
                          <option value="inhalers">Inhalers</option>
                          <option value="sprays">Sprays</option>
                          <option value="patches">Patches</option>
                          <option value="sachets">Sachets</option>
                          <option value="powders">Powders</option>
                          <option value="solutions">Solutions</option>
                          <option value="suspensions">Suspensions</option>
                          <option value="suppositories">Suppositories</option>
                          <option value="packs">Packs</option>
                          <option value="pieces">Pieces</option>
                          <option value="units">Units</option>
                        </select>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Dosage
                        </label>
                        <input
                          type="text"
                          name="dosage"
                          value={formData.dosage}
                          onChange={handleChange}
                          className="glass-input"
                          placeholder="500mg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="date"
                          name="expiry_date"
                          value={formData.expiry_date}
                          onChange={handleChange}
                          className="glass-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Batch Number
                        </label>
                        <input
                          type="text"
                          name="batch_number"
                          value={formData.batch_number}
                          onChange={handleChange}
                          className="glass-input"
                          placeholder="BATCH001"
                        />
                      </div>
                    </div>

                    {/* Alerts & Flags */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Low Stock Alert (Qty)
                        </label>
                        <input
                          type="number"
                          name="min_stock_alert"
                          value={formData.min_stock_alert}
                          onChange={handleChange}
                          min="0"
                          className="glass-input"
                        />
                      </div>
                      <div className="flex items-end gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="requires_prescription"
                            checked={formData.requires_prescription}
                            onChange={handleChange}
                            className="w-5 h-5 rounded"
                          />
                          <span className="text-sm">Prescription Required</span>
                        </label>
                      </div>
                    </div>

                    {/* Availability */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="is_available"
                        id="is_available"
                        checked={formData.is_available}
                        onChange={handleChange}
                        className="w-5 h-5 rounded"
                      />
                      <label htmlFor="is_available" className="text-sm">
                        Currently available for sale
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
                            <span>
                              {editingMedicine ? 'Update' : 'Add'} Medicine
                            </span>
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

export default InventoryManagement;
