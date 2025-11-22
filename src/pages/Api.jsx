import axios from 'axios';

// ------------------------------------------------------------------
// ⚠️ IMPORTANT: Set your Base URL
// Replace with the actual URL of your backend API
// ------------------------------------------------------------------
const BASE_URL = 'http://localhost:5000'; // Assuming your product routes are mounted at /api/products

// Utility function to get the base configuration for API calls
const getConfig = (isAdmin = false) => {
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            // Example for Admin: 
            // Replace with proper JWT authentication token in a production app.
            ...(isAdmin && { role: 'admin' }), // Used by the provided adminMiddleware example
        },
    };
    return config;
};

// ==========================================
// 🚀 PUBLIC API CALLS
// ==========================================


export const getProducts = async (params = {}) => {
    try {
        const response = await axios.get(BASE_URL, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
};


export const getProductBySlug = async (slug) => {
    try {
        const response = await axios.get(`${BASE_URL}/${slug}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching product with slug ${slug}:`, error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
};

// ==========================================
// 🔒 ADMIN API CALLS (Requires 'admin' role)
// ==========================================


export const createProduct = async (productData) => {
    console.log(JSON.stringify(productData) );
    try {
        const response = await axios.post(
            `${BASE_URL}/api/products`, 
            productData, 
            getConfig(true) // Pass true for isAdmin
        );
        return response.data;
    } catch (error) {
        console.error('Error creating product:', error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
};

export const updateProduct = async (productId, updateData) => {
    try {
        const response = await axios.put(
            `${BASE_URL}/${productId}`, 
            updateData, 
            getConfig(true)
        );
        return response.data;
    } catch (error) {
        console.error(`Error updating product ${productId}:`, error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
};


export const updateProductStatus = async (productId, publishStatus) => {
    try {
        const response = await axios.patch(
            `${BASE_URL}/status/${productId}`, 
            { publishStatus }, 
            getConfig(true)
        );
        return response.data;
    } catch (error) {
        console.error(`Error updating product status ${productId}:`, error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
};

/**
 * Deletes a product by ID (Admin only).
 * @param {string} productId - The ID of the product to delete.
 * @returns {Promise<object>} The API response data.
 */
export const deleteProduct = async (productId) => {
    try {
        const response = await axios.delete(
            `${BASE_URL}/${productId}`, 
            getConfig(true)
        );
        return response.data;
    } catch (error) {
        console.error(`Error deleting product ${productId}:`, error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
};