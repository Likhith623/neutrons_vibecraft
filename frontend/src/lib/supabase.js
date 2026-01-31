import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export const signUp = async (email, password, fullName, role, phone) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
          phone: phone,
        },
      },
    });

    if (error) throw error;
    
    // Create profile in profiles table
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          role: role,
          phone: phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      
      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }
    
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signIn = async (email, password, expectedRole = null) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Provide clearer error messages
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials.');
      }
      throw error;
    }
    
    // If expectedRole is provided, verify user role
    if (expectedRole && data.user) {
      // First check user metadata
      let userRole = data.user.user_metadata?.role;
      
      // If not in metadata, check profiles table
      if (!userRole) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        if (!profileError && profile?.role) {
          userRole = profile.role;
        }
      }
      
      // If we found a role and it doesn't match
      if (userRole && userRole !== expectedRole) {
        // Sign out the user since role doesn't match
        await supabase.auth.signOut();
        throw new Error(`This account is registered as a ${userRole}. Please select "${userRole}" to login.`);
      }
    }
    
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Send password reset email
export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset:', error);
    throw error;
  }
};

// Update password (for use after reset link click)
export const updatePassword = async (newPassword) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) throw error;
    return { user: data.user };
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
};

// Medicine search functions - searches medicines table directly
export const searchMedicines = async (searchTerm, lat = null, lng = null, radius = 50) => {
  try {
    // Build the query to search medicines with store info
    let query = supabase
      .from('medicines')
      .select(`
        id,
        name,
        generic_name,
        manufacturer,
        description,
        dosage,
        price,
        quantity,
        unit,
        expiry_date,
        requires_prescription,
        image_url,
        is_available,
        stores (
          id,
          owner_id,
          store_name,
          description,
          address,
          city,
          state,
          pincode,
          latitude,
          longitude,
          phone,
          email,
          is_open,
          opening_time,
          closing_time,
          rating,
          total_reviews,
          store_image_url
        )
      `)
      .eq('is_available', true)
      .gt('quantity', 0);

    // Apply search filter
    if (searchTerm && searchTerm.trim()) {
      query = query.or(`name.ilike.%${searchTerm}%,generic_name.ilike.%${searchTerm}%,manufacturer.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    let results = data || [];

    // Calculate distances if user location is provided
    if (lat && lng && results.length > 0) {
      results = results.map(item => {
        if (item.stores?.latitude && item.stores?.longitude) {
          const distance = calculateDistance(
            lat,
            lng,
            parseFloat(item.stores.latitude),
            parseFloat(item.stores.longitude)
          );
          return {
            ...item,
            distance_km: distance,
            stores: {
              ...item.stores,
              distance: distance
            }
          };
        }
        return { ...item, distance_km: 9999 };
      });

      // Filter by radius
      results = results.filter(item => item.distance_km <= radius);

      // Sort by distance
      results.sort((a, b) => (a.distance_km || 9999) - (b.distance_km || 9999));
    }

    return results;
  } catch (error) {
    console.error('Error searching medicines:', error);
    throw error;
  }
};

export const logSearch = async (userId, searchTerm, lat = null, lng = null, resultsCount = 0) => {
  try {
    if (!userId) {
      console.log('No user ID provided, skipping search log');
      return { data: null, error: null };
    }
    
    const { data, error } = await supabase
      .from('search_history')
      .insert([
        {
          user_id: userId,
          search_query: searchTerm,
          user_latitude: lat,
          user_longitude: lng,
          results_count: resultsCount,
        },
      ])
      .select();

    if (error) {
      console.error('Log search error:', error);
      return { data: null, error };
    }
    
    console.log('Search logged successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error logging search:', error);
    return { data: null, error };
  }
};

// Image upload function
export const uploadImage = async (file, bucket = 'avatars') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { data: { path: filePath, publicUrl }, error: null };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { data: null, error };
  }
};

// Get categories function
export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('medicines')
      .select('category')
      .not('category', 'is', null);

    if (error) throw error;

    // Extract unique categories
    const uniqueCategories = [...new Set(data.map(item => item.category))];
    return { data: uniqueCategories, error: null };
  } catch (error) {
    console.error('Error getting categories:', error);
    return { data: null, error };
  }
};

// Favorite Medicines functions
export const getFavoriteMedicines = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('favorite_medicines')
      .select(`
        *,
        medicines (
          id,
          name,
          generic_name,
          manufacturer,
          price,
          image_url,
          stores (
            id,
            store_name,
            city
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error getting favorite medicines:', error);
    return { data: [], error };
  }
};

export const addFavoriteMedicine = async (userId, medicineId, medicineName = 'Unknown Medicine') => {
  try {
    const { data, error } = await supabase
      .from('favorite_medicines')
      .insert([
        {
          user_id: userId,
          medicine_id: medicineId,
          medicine_name: medicineName,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error adding favorite medicine:', error);
    return { data: null, error };
  }
};

export const removeFavoriteMedicine = async (userId, medicineId) => {
  try {
    const { error } = await supabase
      .from('favorite_medicines')
      .delete()
      .eq('user_id', userId)
      .eq('medicine_id', medicineId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error removing favorite medicine:', error);
    return { error };
  }
};

export const isMedicineFavorite = async (userId, medicineId) => {
  try {
    const { data, error } = await supabase
      .from('favorite_medicines')
      .select('id')
      .eq('user_id', userId)
      .eq('medicine_id', medicineId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    return false;
  }
};

// Medicine Alerts functions
export const createMedicineAlert = async (userId, medicineName, latitude = null, longitude = null) => {
  try {
    const { data, error } = await supabase
      .from('medicine_alerts')
      .insert([
        {
          user_id: userId,
          medicine_name: medicineName,
          latitude,
          longitude,
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating medicine alert:', error);
    return { data: null, error };
  }
};

export const getMedicineAlerts = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('medicine_alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error getting medicine alerts:', error);
    return { data: [], error };
  }
};

export const deleteMedicineAlert = async (alertId) => {
  try {
    const { error } = await supabase
      .from('medicine_alerts')
      .delete()
      .eq('id', alertId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting medicine alert:', error);
    return { error };
  }
};

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};
