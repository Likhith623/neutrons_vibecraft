import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
  Search,
  MapPin,
  Navigation,
  Phone,
  Clock,
  Filter,
  X,
  Loader2,
  AlertCircle,
  Package,
  IndianRupee,
  ExternalLink,
  Sparkles,
  Star,
  ChevronRight,
  Zap,
  Map,
  List,
  ArrowRight,
  CheckCircle,
  Heart,
} from 'lucide-react';
import useLocationStore from '../store/locationStore';
import useAuthStore from '../store/authStore';
import { searchMedicines, logSearch } from '../lib/supabase';
import toast from 'react-hot-toast';
import MedicineMap from '../components/MedicineMap';

// Particle animation component
const ParticleField = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary-400/30 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * 400,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: [null, -20, 20],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

// Animated search suggestions
const searchSuggestions = [
  'Paracetamol',
  'Insulin',
  'Aspirin',
  'Ibuprofen',
  'Amoxicillin',
  'Cetirizine',
  'Omeprazole',
  'Metformin',
];

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [radius, setRadius] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'map', 'list'
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [animatingSearch, setAnimatingSearch] = useState(false);
  const searchInputRef = useRef(null);
  const controls = useAnimation();
  const initialSearchDone = useRef(false);

  const { userLocation, getUserLocation, isLocating, locationError } = useLocationStore();
  const { user } = useAuthStore();

  // Get user location on mount
  useEffect(() => {
    if (!userLocation) {
      getUserLocation().catch(() => {
        useLocationStore.getState().setLocation(20.5937, 78.9629);
      });
    }
  }, []);

  // Handle search query from URL (from chatbot)
  useEffect(() => {
    const queryFromUrl = searchParams.get('q');
    if (queryFromUrl && !initialSearchDone.current && userLocation) {
      setSearchQuery(queryFromUrl);
      initialSearchDone.current = true;
      // Trigger search after a short delay
      setTimeout(() => {
        handleSearch(null, queryFromUrl);
      }, 500);
    }
  }, [searchParams, userLocation]);

  // Transform results to stores format for MedicineMap
  const transformedStores = results.map((result, index) => {
    // Format opening hours from time fields
    const formatTime = (timeStr) => {
      if (!timeStr) return null;
      try {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
      } catch {
        return timeStr;
      }
    };
    
    const openTime = formatTime(result.stores?.opening_time);
    const closeTime = formatTime(result.stores?.closing_time);
    const openingHours = openTime && closeTime ? `${openTime} - ${closeTime}` : '9:00 AM - 9:00 PM';
    
    return {
      id: result.stores?.id || result.id,
      name: result.stores?.store_name || 'Unknown Store',
      address: result.stores?.address || 'Address not available',
      fullAddress: [
        result.stores?.address,
        result.stores?.city,
        result.stores?.state,
        result.stores?.pincode
      ].filter(Boolean).join(', '),
      phone: result.stores?.phone || '',
      email: result.stores?.email || '',
      rating: parseFloat(result.stores?.rating) || 4.0,
      totalReviews: result.stores?.total_reviews || 0,
      isOpen: result.stores?.is_open !== false,
      openingHours,
      storeImageUrl: result.stores?.store_image_url,
      latitude: parseFloat(result.stores?.latitude) || 0,
      longitude: parseFloat(result.stores?.longitude) || 0,
      distance: result.distance_km,
      medicine: {
        name: result.name,
        genericName: result.generic_name,
        price: result.price,
        quantity: result.quantity,
        imageUrl: result.image_url,
        manufacturer: result.manufacturer,
        dosage: result.dosage,
        requiresPrescription: result.requires_prescription,
      },
      index: index + 1,
    };
  });

  const handleSearch = async (e, queryOverride = null) => {
    e?.preventDefault();
    const query = queryOverride || searchQuery;
    
    if (!query.trim()) {
      toast.error('Please enter a medicine name');
      return;
    }

    if (!userLocation) {
      toast.error('Please enable location access');
      return;
    }

    // Trigger search animation
    setAnimatingSearch(true);
    await controls.start({
      scale: [1, 0.98, 1],
      transition: { duration: 0.3 },
    });

    setLoading(true);
    setSearched(true);
    setSelectedResult(null);
    setSelectedStore(null);
    setShowSuggestions(false);

    try {
      const searchResults = await searchMedicines(
        query,
        userLocation.lat,
        userLocation.lng,
        radius
      );

      setResults(searchResults);

      if (user) {
        await logSearch(
          user.id,
          query,
          userLocation.lat,
          userLocation.lng,
          searchResults.length
        );
      }

      if (searchResults.length === 0) {
        toast('No medicines found nearby', { icon: '🔍' });
      } else {
        toast.success(`Found ${searchResults.length} pharmacies with ${query}`);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
      setAnimatingSearch(false);
    }
  };

  const handleStoreSelect = (store) => {
    setSelectedStore(store);
    const result = results.find(r => 
      (r.stores?.id === store.id) || 
      (parseFloat(r.stores?.latitude) === store.latitude && parseFloat(r.stores?.longitude) === store.longitude)
    );
    if (result) {
      setSelectedResult(result);
    }
  };

  const handleResultClick = (result) => {
    setSelectedResult(result);
    const store = transformedStores.find(s => 
      s.latitude === parseFloat(result.stores?.latitude) && 
      s.longitude === parseFloat(result.stores?.longitude)
    );
    if (store) {
      setSelectedStore(store);
    }
  };

  const openDirections = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(null, suggestion);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const pulseAnimation = {
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  return (
    <div className="min-h-screen py-6 px-4 relative overflow-hidden">
      {/* Background particles */}
      <ParticleField />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with animated gradient */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-500/20 to-purple-600/20 border border-primary-500/30 mb-4"
          >
            <Sparkles size={16} className="text-primary-400 animate-pulse" />
            <span className="text-sm font-medium text-primary-300">AI-Powered Search</span>
          </motion.div>
          
          <motion.h1 
            className="text-4xl sm:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Find{' '}
            <span className="relative inline-block">
              <span className="gradient-text">Medicines</span>
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              />
            </span>{' '}
            Near You
          </motion.h1>
          
          <motion.p 
            className="text-white/60 max-w-2xl mx-auto text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Search any medicine and discover nearby pharmacies with real-time stock availability
          </motion.p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative mb-8"
        >
          <motion.div
            animate={controls}
            className="glass-card p-6 relative overflow-hidden"
          >
            {/* Animated border gradient */}
            <motion.div
              className="absolute inset-0 rounded-2xl opacity-50"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), transparent)',
                backgroundSize: '200% 100%',
              }}
              animate={{
                backgroundPosition: ['200% 0', '-200% 0'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            <form onSubmit={handleSearch} className="relative space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input with suggestions */}
                <div className="relative flex-[3] min-w-0">
                  <motion.div
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    animate={loading ? { rotate: 360 } : {}}
                    transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: 'linear' }}
                  >
                    {loading ? (
                      <Loader2 size={20} className="text-primary-400" />
                    ) : (
                      <Search size={20} className="text-white/50" />
                    )}
                  </motion.div>
                  
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Search for medicines..."
                    className="glass-input pl-12 pr-4 text-lg h-14 w-full min-w-0"
                  />

                  {/* Search suggestions dropdown */}
                  <AnimatePresence>
                    {showSuggestions && !searched && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 glass-card p-3 z-50"
                      >
                        <p className="text-xs text-white/50 mb-2 px-2">Popular searches</p>
                        <div className="flex flex-wrap gap-2">
                          {searchSuggestions.map((suggestion, index) => (
                            <motion.button
                              key={suggestion}
                              type="button"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="px-3 py-1.5 rounded-full bg-white/10 text-sm hover:bg-primary-500/30 transition-all hover:scale-105"
                            >
                              {suggestion}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Filter Button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className={`glass-button-secondary h-14 px-6 flex items-center gap-2 justify-center ${
                    showFilters ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <Filter size={20} />
                  <span className="hidden sm:inline">Filters</span>
                </motion.button>

                {/* Search Button */}
                <motion.button
                  type="submit"
                  disabled={loading || isLocating}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-button h-14 px-8 flex items-center gap-2 justify-center min-w-[160px] relative overflow-hidden group"
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-700"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative flex items-center gap-2">
                    {loading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <Zap size={20} className="group-hover:animate-pulse" />
                        <span className="font-semibold">Search</span>
                      </>
                    )}
                  </span>
                </motion.button>
              </div>

              {/* Filters Panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-4 border-t border-white/10"
                  >
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                      <div className="flex-1 w-full">
                        <label className="flex items-center justify-between text-sm text-white/70 mb-3">
                          <span>Search Radius</span>
                          <span className="font-mono text-primary-400">{radius} km</span>
                        </label>
                        <div className="relative">
                          <input
                            type="range"
                            min="1"
                            max="50"
                            value={radius}
                            onChange={(e) => setRadius(parseInt(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, rgb(139, 92, 246) ${radius * 2}%, rgba(255,255,255,0.1) ${radius * 2}%)`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-white/40 mt-1">
                          <span>1 km</span>
                          <span>50 km</span>
                        </div>
                      </div>
                      
                      <motion.div 
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5"
                        animate={userLocation ? {} : pulseAnimation}
                      >
                        <motion.div
                          animate={userLocation ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          <MapPin 
                            size={20} 
                            className={userLocation ? 'text-green-400' : 'text-yellow-400'} 
                          />
                        </motion.div>
                        {userLocation ? (
                          <div className="text-sm">
                            <span className="text-green-400 font-medium">Location Active</span>
                            <p className="text-white/50 text-xs">
                              {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-yellow-400 text-sm">Getting location...</span>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Location Error */}
            <AnimatePresence>
              {locationError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
                >
                  <AlertCircle size={18} className="text-yellow-400 flex-shrink-0" />
                  <span className="text-yellow-400 text-sm">{locationError}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {searched && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
            >
              {/* View Toggle & Results Count */}
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <h2 className="text-xl font-semibold">
                    {results.length > 0 ? (
                      <>
                        <span className="text-primary-400">{results.length}</span> Pharmacies Found
                      </>
                    ) : (
                      'No Results'
                    )}
                  </h2>
                  {results.length > 0 && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400"
                    >
                      Real-time stock
                    </motion.span>
                  )}
                </motion.div>

                {/* View Mode Toggle */}
                {results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1 p-1 rounded-xl bg-white/5"
                  >
                    {[
                      { mode: 'split', icon: <List size={18} />, label: 'Split' },
                      { mode: 'map', icon: <Map size={18} />, label: 'Map' },
                    ].map(({ mode, icon, label }) => (
                      <motion.button
                        key={mode}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode(mode)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                          viewMode === mode
                            ? 'bg-primary-500 text-white'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {icon}
                        <span className="hidden sm:inline text-sm">{label}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>

              {results.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-12 text-center"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <AlertCircle size={64} className="mx-auto text-white/20 mb-6" />
                  </motion.div>
                  <h3 className="text-2xl font-semibold mb-3">No Medicines Found</h3>
                  <p className="text-white/60 mb-6 max-w-md mx-auto">
                    We couldn't find any pharmacies with "{searchQuery}" in stock within {radius}km. 
                    Try increasing your search radius or searching for a different medicine.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowFilters(true)}
                    className="glass-button px-6 py-3"
                  >
                    Adjust Filters
                  </motion.button>
                </motion.div>
              ) : (
                <div className={`grid gap-6 ${viewMode === 'map' ? '' : 'lg:grid-cols-2'}`}>
                  {/* Map Section */}
                  <motion.div
                    layout
                    className={`${viewMode === 'map' ? 'col-span-full' : ''} order-2 lg:order-1`}
                  >
                    <div className={`glass-card overflow-hidden ${viewMode === 'map' ? 'h-[600px]' : 'h-[550px]'}`}>
                      <MedicineMap
                        stores={transformedStores}
                        selectedMedicine={searchQuery}
                        userLocation={userLocation}
                        onStoreSelect={handleStoreSelect}
                        selectedStoreId={selectedStore?.id}
                      />
                    </div>
                  </motion.div>

                  {/* Results List */}
                  {viewMode !== 'map' && (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="order-1 lg:order-2"
                    >
                      <div className="space-y-3 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
                        {results.map((result, index) => (
                          <motion.div
                            key={result.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.01, x: 5 }}
                            onClick={() => handleResultClick(result)}
                            className={`glass-card p-4 cursor-pointer transition-all border-2 ${
                              selectedResult?.id === result.id
                                ? 'border-primary-500 bg-primary-500/10'
                                : 'border-transparent hover:border-white/20'
                            }`}
                          >
                            <div className="flex gap-4">
                              {/* Index Badge */}
                              <div className="flex flex-col items-center">
                                <motion.div
                                  whileHover={{ scale: 1.1, rotate: 10 }}
                                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-sm font-bold"
                                >
                                  {index + 1}
                                </motion.div>
                                <div className="w-0.5 h-full bg-gradient-to-b from-primary-500/50 to-transparent mt-2" />
                              </div>

                              {/* Medicine & Store Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-semibold text-lg truncate">
                                        {result.name}
                                      </h3>
                                      {result.quantity > 10 && (
                                        <motion.span
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400"
                                        >
                                          In Stock
                                        </motion.span>
                                      )}
                                    </div>
                                    {result.generic_name && (
                                      <p className="text-sm text-white/50 truncate">
                                        {result.generic_name}
                                      </p>
                                    )}
                                  </div>
                                  
                                  <motion.div 
                                    className="flex items-center gap-1 text-green-400 font-bold text-lg whitespace-nowrap"
                                    animate={{ scale: selectedResult?.id === result.id ? [1, 1.1, 1] : 1 }}
                                  >
                                    <IndianRupee size={18} />
                                    {result.price}
                                  </motion.div>
                                </div>

                                {/* Stats Row */}
                                <div className="mt-3 flex items-center gap-4 text-sm text-white/70">
                                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5">
                                    <Package size={14} className="text-primary-400" />
                                    {result.quantity} units
                                  </span>
                                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5">
                                    <Navigation size={14} className="text-blue-400" />
                                    {result.distance_km} km
                                  </span>
                                </div>

                                {/* Store Info */}
                                <div className="mt-3 pt-3 border-t border-white/10">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center">
                                      <MapPin size={16} className="text-green-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium text-primary-400 truncate">
                                        {result.stores?.store_name}
                                      </p>
                                      <p className="text-xs text-white/40 truncate">
                                        {result.stores?.address}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-4 flex items-center gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDirections(
                                        result.stores?.latitude,
                                        result.stores?.longitude
                                      );
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-purple-600 text-sm font-medium group"
                                  >
                                    <Navigation size={16} className="group-hover:animate-bounce" />
                                    Get Directions
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                  </motion.button>

                                  <motion.a
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    href={`tel:${result.stores?.phone}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-2.5 rounded-xl bg-white/10 hover:bg-green-500/20 transition-colors"
                                  >
                                    <Phone size={18} className="text-green-400" />
                                  </motion.a>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Initial State - Before Search */}
        <AnimatePresence>
          {!searched && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="text-center py-16"
            >
              <motion.div
                className="glass-card p-10 max-w-lg mx-auto relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
              >
                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 opacity-30"
                  animate={{
                    background: [
                      'radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
                      'radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
                      'radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
                    ],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                />

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500/20 to-purple-600/20 flex items-center justify-center">
                    <Search size={40} className="text-primary-400" />
                  </div>
                </motion.div>

                <h3 className="text-2xl font-semibold mb-3">Search for Medicines</h3>
                <p className="text-white/60 mb-6">
                  Enter a medicine name to find nearby pharmacies with real-time stock availability
                </p>

                {/* Feature highlights */}
                <div className="space-y-3 text-left">
                  {[
                    { icon: <MapPin size={18} />, text: 'Find nearby pharmacies' },
                    { icon: <Clock size={18} />, text: 'Real-time stock updates' },
                    { icon: <Navigation size={18} />, text: 'Get instant directions' },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
                    >
                      <div className="text-primary-400">{feature.icon}</div>
                      <span className="text-white/80">{feature.text}</span>
                      <CheckCircle size={16} className="text-green-400 ml-auto" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );
};

export default SearchPage;
