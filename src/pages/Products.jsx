import React, { useState, useMemo } from 'react';
import { createProduct } from './Api';

 
const slugify = (text) => {
    if (!text) return '';
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}


const generateUniqueId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'id-' + Date.now() + Math.random().toString(16).slice(2);
};



const VALID_STATUSES = ['Draft', 'Pending Review', 'Published', 'Archived'];


const VENDOR_LIST = [
    { id: '', name: 'Select Vendor' }, // Placeholder
    { id: 'VEN-2023-A789', name: 'Global Distributors Inc.' },
    { id: 'VEN-2024-B101', name: 'Tech Solutions LLC' },
    { id: 'VEN-2024-C202', name: 'Cosmetic Kings India' },
    { id: 'VEN-2025-D303', name: 'Fashion Forward Co.' },
];

const CATEGORY_LIST = [
    'Select Category', 'Electronics', 'Mobile Phones & Accessories', 'Clothing & Apparel',
    'Beauty, Health & Personal Care (Cosmetics)', 'Home & Kitchen', 'Books & Media',
    'Sports & Fitness', 'Automotive', 'Toys & Gaming'
];

// Function to generate the initial form structure
const getInitialFormData = (vendorOptions, categoryOptions) => ({
    name: '',
    brand: '',
    category: categoryOptions[0],
    subCategory: '',
    vendorId: vendorOptions[0].id,
    vendorName: vendorOptions[0].name,
    price: { mrp: '', sellingPrice: 0,discountPercent: '',  }, 
    
    publishStatus: 'Draft',
    sku: '',
    slug: '',
    warrantyYears: '',
    returnPolicyDays: 7, 
    
  
    images: [{ url: '', alt: '', isPrimary: true }],
    
      highlightHeading: '', 
    specifications: [{ key: '', value: '' }], 


    productColors: [
    
    ],
    
 
    variations: [{ 
        color: '',
        size: '', 
        stock: 0, 
        sku: '',
    }], 

    keywords: '',
    tags: '',
    description: { story: '', details: '', styleNote: '' }, 
});

// --- Popup Message Component ---
const PopupMessage = ({ message, isError, onClose, visible }) => {
    if (!visible) return null;

    return (
        <div className={`popup-overlay ${visible ? 'active' : ''}`}>
            <div className={`popup-box ${isError ? 'error' : 'success'}`}>
                <h4 className="popup-title">
                    {isError ? 'Submission Error' : 'Success!'}
                </h4>
                <p className="popup-content">{message}</p>
                <button onClick={onClose} className="btn btn-primary popup-close-btn">
                    Close
                </button>
            </div>
        </div>
    );
};


// --- Main React Component ---

const CreateProduct = () => {
    
    const VENDOR_OPTIONS = useMemo(() => VENDOR_LIST, []);
    const CATEGORY_OPTIONS = useMemo(() => CATEGORY_LIST, []);
    
     const initialData = useMemo(() => getInitialFormData(VENDOR_OPTIONS, CATEGORY_OPTIONS), [VENDOR_OPTIONS, CATEGORY_OPTIONS]);

    // Form State
    const [formData, setFormData] = useState(initialData);
    const [loading, setLoading] = useState(false);
    
    // Popup State
    const [popup, setPopup] = useState({ 
        visible: false, 
        message: '', 
        isError: false 
    });

    // Function to prepare the data structure for the API call
    const prepareProductData = (data) => {
        // Data structure cleanup and preparation
        const preparedData = {
            ...data,
            keywords: data.keywords.split(',').map(k => k.trim()).filter(k => k),
            tags: data.tags.split(',').map(t => t.trim()).filter(t => t),
            price: {
                mrp: parseFloat(data.price.mrp) || 0,
                sellingPrice: parseFloat(data.price.sellingPrice) || 0,
                      discountPercent: parseFloat(data.price.discountPercent) || 0,
            },
      
            warrantyYears: parseInt(data.warrantyYears) || 0,
            returnPolicyDays: parseInt(data.returnPolicyDays) || 0,
            
            specifications: data.specifications.filter(s => s.key || s.value),

            variations: data.variations
                .filter(v => v.sku)
                .map(v => {
                     const selectedColor = data.productColors.find(c => c.id === v.color);
                    return {
                        ...v,
                        color: selectedColor?.hex || v.color, 
                        
                       
                      
                    };
                }), 
            
            productColors: data.productColors.map(({ id, ...rest }) => rest)
        };
        return preparedData;
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            
    
            if (name === 'name') {
                newState.slug = slugify(value);
            }
            
            return newState;
        });
    };
    
   
    const handleVendorChange = (e) => {
        const vendorId = e.target.value;
        const selectedVendor = VENDOR_OPTIONS.find(v => v.id === vendorId);

        setFormData(prev => ({
            ...prev,
            vendorId: vendorId,
            vendorName: selectedVendor ? selectedVendor.name : '',
        }));
    };

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
   
        const numericValue = value === '' ? '' : (parseFloat(value) || 0); 
        
        setFormData(prev => {
            let mrp = prev.price.mrp;
            let sellingPrice = prev.price.sellingPrice;
            let discountPercent = prev.price.discountPercent;
            
            if (name === 'mrp') {
                mrp = numericValue;
            } else if (name === 'discountPercent') {
              
                discountPercent = numericValue === '' ? '' : Math.min(100, Math.max(0, numericValue));
            }
            
           
            const safeMrp = parseFloat(mrp || 0) || 0;
            const safeDiscount = parseFloat(discountPercent || 0) || 0;

            if (safeMrp > 0) {
                sellingPrice = safeMrp * (1 - (safeDiscount / 100));
            } else {
                sellingPrice = 0;
            }

            return {
                ...prev,
                price: {
                    mrp: mrp,
                    sellingPrice: parseFloat(sellingPrice.toFixed(2)) ,
                    discountPercent: discountPercent 
                },
                
            };
        });
    };

    const handleDescriptionChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            description: {
                ...prev.description,
                [name]: value
            }
        }));
    };

    // --- Specification Handlers ---
    
    const handleSpecChange = (specIndex, e) => {
        const { name, value } = e.target;
        const newSpecs = [...formData.specifications];

        newSpecs[specIndex] = {
            ...newSpecs[specIndex],
            [name]: value
        };
        
        setFormData(prev => ({ ...prev, specifications: newSpecs }));
    };

    const addSpecField = () => {
        setFormData(prev => ({
            ...prev,
            specifications: [
                ...prev.specifications,
                { key: '', value: '' }
            ]
        }));
    };
    
    const removeSpecField = (specIndex) => {
        setFormData(prev => {
            let newSpecs = prev.specifications.filter((_, i) => i !== specIndex);
            
            if (newSpecs.length === 0) {
                 newSpecs = [{ key: '', value: '' }];
            }
            
            return { ...prev, specifications: newSpecs };
        });
    };
    
   
    const handleColorChange = (index, key, value) => {
        setFormData(prev => ({
            ...prev,
            productColors: prev.productColors.map((color, i) => {
                if (i === index) {
                
                    const updatedColor = { ...color, [key]: value };
                    
                 
                    if (key === 'isPrime' && value === true) {
                        return { ...updatedColor, isPrime: true };
                    }
                  
                    if (key === 'hex') {
                        return { ...updatedColor, hex: value.toUpperCase() };
                    }
                    return updatedColor;
                } else if (key === 'isPrime' && value === true) {
                   return { ...color, isPrime: false };
                }
                return color;
            })
        }));
    };

    const addProductColor = () => {
        setFormData(prev => {
            const hasPrime = prev.productColors.some(c => c.isPrime);
            const newColor = { 
                id: generateUniqueId(), 
                hex: '#FFFFFF', // Default new color is white
                isPrime: !hasPrime,
                
            };

            const updatedColors = !hasPrime 
                ? prev.productColors.map(c => ({ ...c, isPrime: false })) 
                : prev.productColors;

            return {
                ...prev,
                productColors: [...updatedColors, newColor]
            };
        });
    };

    const removeProductColor = (idToRemove) => {
        setFormData(prev => {
            const newColors = prev.productColors.filter(color => color.id !== idToRemove);
            
            if (newColors.length > 0 && !newColors.some(c => c.isPrime)) {
                newColors[0] = { ...newColors[0], isPrime: true };
            }

            if (newColors.length === 0) {
                 return { ...prev, productColors: [{ id: generateUniqueId(), hex: '#007bff', isPrime: true, }] };
            }
            
            return { 
                ...prev, 
                productColors: newColors,
                variations: prev.variations.filter(v => v.color !== idToRemove),
            };
        });
    };
    

    const handleImageChange = (index, e) => {
        const { name, value } = e.target;
        const newImages = [...formData.images];
        newImages[index] = {
            ...newImages[index],
            [name]: value
        };
        setFormData(prev => ({ ...prev, images: newImages }));
    };
    
    const handlePrimaryImageChange = (index) => {
        setFormData(prev => {
            const newImages = prev.images.map((img, i) => ({
                ...img,
                isPrimary: i === index
            }));
            return { ...prev, images: newImages };
        });
    };

    const addImageField = () => {
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, { url: '', alt: '', isPrimary: false }] 
        }));
    };

    const removeImageField = (indexToRemove) => {
        setFormData(prev => {
            let newImages = prev.images.filter((_, index) => index !== indexToRemove);

            if (newImages.length === 0) {
                return { ...prev, images: [{ url: '', alt: '', isPrimary: true }] };
            }

            if (!newImages.some(img => img.isPrimary)) {
                newImages[0] = { ...newImages[0], isPrimary: true };
            }

            return { ...prev, images: newImages };
        });
    };



    const handleVariationChange = (index, e) => {
        const { name, value } = e.target;
        const newVariations = [...formData.variations];
        
         const finalValue = name === 'stock' ? (parseInt(value) || 0) : value;

        newVariations[index] = {
            ...newVariations[index],
            [name]: finalValue
        };
        setFormData(prev => ({ ...prev, variations: newVariations }));
    };

    const addVariationField = () => {
        setFormData(prev => ({
            ...prev,
            variations: [...prev.variations, { color: '', size: '', stock: 0, sku: '' }]
        }));
    };

    const removeVariationField = (indexToRemove) => {
        setFormData(prev => {
            const newVariations = prev.variations.filter((_, index) => index !== indexToRemove);
            
            if (newVariations.length === 0) {
                 return { ...prev, variations: [{ color: '', size: '', stock: 0, sku: '' }] };
            }
            
            return { ...prev, variations: newVariations };
        });
    };



    const closePopup = () => {
        setPopup({ visible: false, message: '', isError: false });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        closePopup(); 

        
  
        if (!formData.name || !formData.vendorId || formData.category === CATEGORY_OPTIONS[0]) {
             setPopup({ visible: true, message: 'Error: Please fill in all required fields (Product Name, Vendor, Category).', isError: true });
             setLoading(false);
             return;
        }

        const mrp = parseFloat(formData.price.mrp || 0);
        const sellingPrice = formData.price.sellingPrice;
        
        if (mrp <= 0 || sellingPrice <= 0) {
            setPopup({ visible: true, message: 'Error: MRP and Selling Price must be greater than zero.', isError: true });
            setLoading(false);
            return;
        }
        
        // Custom validation for colors
        if (formData.productColors.length === 0 || !formData.productColors.some(c => c.isPrime)) {
            setPopup({ visible: true, message: 'Error: You must define at least one color and designate one as the Prime Color.', isError: true });
            setLoading(false);
            return;
        }

        // Custom validation for variations
        const hasInvalidVariations = formData.variations.some(v => v.sku && (!v.color || !v.size));
        if (hasInvalidVariations) {
            setPopup({ visible: true, message: 'Error: Variations with an SKU must have a selected Color and Size.', isError: true });
            setLoading(false);
            return;
        }


        // Data preparation
        const productDataForAPI = prepareProductData(formData);

        try {
            // Simulate API call
            const response = await createProduct(productDataForAPI);
            
            // 1. Show success message in popup
            setPopup({ visible: true, message: response.message, isError: false });
            
            // 2. Clear the form after successful submission
            setFormData(initialData); 

        } catch (error) {
            const errorMsg = error.message || 'Product submission failed due to an unexpected error.';
            console.error("Submission Error:", error);
            setPopup({ visible: true, message: `Error: ${errorMsg}`, isError: true });
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                    
                    /* Global Styles & Variables */
                    :root {
                        --primary-blue: #007bff; /* E-commerce Primary Blue */
                        --primary-dark: #0f1111; /* Amazon/Dark text */
                        --secondary-green: #388e3c; /* Success/Go Green */
                        --warning-red: #d32f2f; /* Error */
                        --background-light: #f5f7fa; /* Light background for dashboard */
                        --card-bg: #ffffff;
                        --border-color: #e0e0e0;
                        --shadow-light: rgba(0, 0, 0, 0.08);
                        --light-grey: #f0f0f0;
                        --dark-grey: #666;
                    }

                    * {
                        box-sizing: border-box;
                    }

                    body {
                        font-family: 'Inter', sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: var(--background-light);
                    }

                    /* Dashboard Layout */
                    .dashboard-container {
                        max-width: 1200px;
                        margin: 40px auto;
                        padding: 20px;
                        background-color: var(--background-light);
                    }

                    .dashboard-header {
                        padding: 15px 0;
                        margin-bottom: 20px;
                        border-bottom: 2px solid var(--primary-blue);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .dashboard-header h2 {
                        margin: 0;
                        color: var(--primary-dark);
                        font-weight: 700;
                    }
                    
                    .dashboard-header span {
                        font-size: 0.8em;
                        color: #666;
                        padding: 5px 10px;
                        background: var(--light-grey);
                        border-radius: 4px;
                    }

                    /* Popup Styling */
                    .popup-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: rgba(0, 0, 0, 0.5);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 1000;
                        opacity: 0;
                        visibility: hidden;
                        transition: opacity 0.3s, visibility 0.3s;
                    }

                    .popup-overlay.active {
                        opacity: 1;
                        visibility: visible;
                    }

                    .popup-box {
                        background-color: var(--card-bg);
                        padding: 30px;
                        border-radius: 8px;
                        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
                        max-width: 400px;
                        width: 90%;
                        text-align: center;
                        transform: scale(0.9);
                        transition: transform 0.3s ease-out;
                    }
                    
                    .popup-overlay.active .popup-box {
                        transform: scale(1);
                    }

                    .popup-box.success {
                        border-top: 5px solid var(--secondary-green);
                    }

                    .popup-box.error {
                        border-top: 5px solid var(--warning-red);
                    }
                    
                    .popup-title {
                        margin-top: 0;
                        font-size: 1.5em;
                        font-weight: 700;
                    }

                    .popup-box.success .popup-title {
                        color: var(--secondary-green);
                    }
                    
                    .popup-box.error .popup-title {
                        color: var(--warning-red);
                    }

                    .popup-content {
                        margin-bottom: 20px;
                        font-size: 1em;
                        color: #333;
                    }

                    .popup-close-btn {
                        width: 100%;
                    }

                    /* Form and Card Styling (rest remains the same) */
                    .product-form {
                        display: flex;
                        flex-direction: column;
                        gap: 20px;
                    }

                    .card-section {
                        background-color: var(--card-bg);
                        padding: 25px;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px var(--shadow-light);
                        border: 1px solid var(--border-color);
                    }

                    .card-section h3 {
                        margin-top: 0;
                        margin-bottom: 20px;
                        padding-bottom: 10px;
                        border-bottom: 1px solid var(--border-color);
                        color: var(--primary-blue);
                        font-weight: 600;
                    }

                    /* Grid Layout for responsive columns */
                    .two-column {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }

                    @media (min-width: 768px) {
                        .two-column {
                            grid-template-columns: repeat(2, 1fr);
                        }
                    }

                    /* Form Elements */
                    .form-group {
                        margin-bottom: 15px;
                        position: relative;
                    }
                    
                    .form-group.radio-container {
                        margin-top: 10px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }

                    .form-group label {
                        display: block;
                        margin-bottom: 5px;
                        font-weight: 600;
                        color: var(--primary-dark);
                    }
                    
                    .form-group.required label::after {
                        content: ' *';
                        color: var(--warning-red);
                        font-weight: bold;
                    }

                    input[type="text"],
                    input[type="number"],
                    input[type="url"],
                    textarea,
                    select {
                        width: 100%;
                        padding: 10px 12px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        font-size: 16px;
                        transition: border-color 0.3s, box-shadow 0.3s;
                        color: #000;
                    }
                    
                    select, 
                    option {
                        color: #000 !important;
                        background-color: #fff;
                    }
                    
                    /* Custom color option styling */
                    .color-option {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 5px;
                        background-color: #fff;
                        color: #000;
                        border-radius: 4px;
                    }
                    
                    .color-swatch {
                        width: 15px;
                        height: 15px;
                        border: 1px solid #000;
                        border-radius: 50%;
                        flex-shrink: 0;
                    }


                    /* Special styling for color input (Color Picker) */
                    .color-input-container {
                        display: flex; 
                        align-items: center; 
                        gap: 10px;
                        flex-wrap: nowrap;
                    }

                    .color-input-container input[type="color"] {
                        padding: 0; 
                        height: 40px;
                        width: 50px; /* fixed size for picker */
                        flex-shrink: 0;
                        cursor: pointer;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        -webkit-appearance: none; 
                        -moz-appearance: none;
                        appearance: none;
                        background-color: transparent; /* Allows border to show */
                    }
                    .color-input-container input[type="color"]::-webkit-color-swatch-wrapper {
                        padding: 0;
                    }
                    .color-input-container input[type="color"]::-webkit-color-swatch {
                        border: none;
                        border-radius: 4px;
                    }
                    .color-input-container input[type="color"]::-moz-color-swatch {
                        border: none;
                        border-radius: 4px;
                    }
                    .color-input-container input[type="text"] {
                        flex-grow: 1; /* Allows text input to fill space */
                        font-family: monospace;
                        text-transform: uppercase;
                    }


                    input[type="radio"] {
                        width: 16px;
                        height: 16px;
                        cursor: pointer;
                        accent-color: var(--primary-blue);
                    }
                    
                    input[type="checkbox"] {
                        width: 18px;
                        height: 18px;
                        cursor: pointer;
                        accent-color: var(--secondary-green);
                        border-radius: 3px;
                    }


                    input:focus,
                    textarea:focus,
                    select:focus,
                    input[type="color"]:focus {
                        border-color: var(--primary-blue);
                        outline: none;
                        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
                    }
                    
                    /* Styling for read-only input */
                    input[readOnly] {
                        background-color: #f7f7f7;
                        cursor: not-allowed;
                        color: #000;
                        font-weight: 600;
                    }


                    textarea {
                        min-height: 100px;
                        resize: vertical;
                    }

                    /* Helper Text/Warnings */
                    .price-warning {
                        color: var(--warning-red);
                        font-size: 0.85em;
                        margin-top: 5px;
                        font-weight: 600;
                    }
                    
                    .help-text {
                        font-size: 0.8em;
                        color: #666;
                        margin-top: 5px;
                    }
                    
                    /* Color Row Styling */
                    .color-row {
                        display: grid;
                        grid-template-columns: 50px 1fr 120px 30px; /* Picker | Name/Hex/Label | Checkbox | Remove Btn */
                        gap: 10px;
                        margin-bottom: 10px;
                        align-items: center;
                        padding: 8px;
                        border: 1px solid var(--border-color);
                        border-radius: 4px;
                        transition: border-color 0.2s;
                    }
                    
                    .color-row.is-prime {
                        border-color: var(--secondary-green);
                        background-color: #e6ffe6;
                    }
                    
                    .prime-label {
                        font-weight: 600;
                        color: var(--secondary-green);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 5px;
                        font-size: 0.85em;
                    }
                    
                    /* Image and Variation Groups (remains similar) */
                    .item-group {
                        padding: 15px;
                        border: 1px dashed var(--border-color);
                        border-radius: 4px;
                        margin-bottom: 15px;
                        background-color: #fcfcfc;
                        position: relative;
                    }
                    
                    .item-group h4 {
                        margin-top: 0;
                        color: var(--primary-blue);
                        font-size: 1.1em;
                        border-bottom: 1px dotted var(--border-color);
                        padding-bottom: 5px;
                        margin-bottom: 10px;
                        display: flex;
                        align-items: center;
                    }

                    .primary-tag {
                        color: var(--secondary-green);
                        font-weight: 700;
                        margin-left: 10px;
                    }
                    
                    .remove-btn {
                        background: var(--warning-red);
                        color: white;
                        border: none;
                        border-radius: 50%;
                        width: 24px;
                        height: 24px;
                        font-size: 14px;
                        line-height: 1;
                        cursor: pointer;
                        opacity: 0.7;
                        transition: opacity 0.2s;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    
                    .remove-btn.absolute {
                         position: absolute;
                         top: 10px;
                         right: 10px;
                    }
                    
                    .remove-btn:hover {
                        opacity: 1;
                        box-shadow: 0 0 5px rgba(211, 47, 47, 0.5);
                    }


                    /* Grid Layout for variations */
                    .variation-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 10px;
                        margin-bottom: 20px;
                    }
                    
                    /* Specifications Group Styling */
                    .specifications-group {
                        /* This is the card section wrapper now */
                    }
                    
                    .spec-row {
                        display: grid;
                        grid-template-columns: 1fr 1fr auto; /* Key | Value | Remove Btn */
                        gap: 10px;
                        margin-bottom: 10px;
                        align-items: end;
                    }
                    
                    .spec-row label {
                        font-weight: 400; /* Lighter weight for clarity in the repeating group */
                    }
                    
                    .spec-row input {
                        padding: 8px;
                    }


                    /* Buttons */
                    .btn {
                        padding: 10px 20px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: background-color 0.2s, transform 0.1s;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                    }
                    
                    .btn-small {
                        padding: 6px 12px;
                        font-size: 0.85em;
                    }

                    .btn-primary {
                        background-color: var(--primary-blue);
                        color: white;
                        box-shadow: 0 2px 4px rgba(0, 123, 255, 0.4);
                    }
                    
                    .btn-primary:hover {
                        background-color: #0056b3;
                    }
                    
                    .btn-primary:active {
                        transform: scale(0.99);
                    }

                    .btn-secondary {
                        background-color: #f0f0f0;
                        color: var(--primary-dark);
                        border: 1px solid #ccc;
                    }
                    
                    .btn-secondary:hover {
                        background-color: #e0e0e0;
                    }

                    .button-group {
                        display: flex;
                        gap: 10px;
                        margin-top: 15px;
                        flex-wrap: wrap;
                    }
                    
                    .submit-container {
                        text-align: right;
                        padding-top: 20px;
                        border-top: 1px solid var(--border-color);
                    }

                    /* Loading Spinner (Pure CSS) */
                    .spinner {
                        border: 4px solid rgba(255, 255, 255, 0.3);
                        border-top: 4px solid white;
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        animation: spin 1s linear infinite;
                    }
                    
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
            
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <h2>📦 Create New Product</h2>
                    <span className="user-id-display">Data Management Console</span>
                </header>
                
                <form onSubmit={handleSubmit} className="product-form">
                    
                    {/* --- Section 1: Basic Information --- */}
                    <div className="card-section">
                        <h3>1. Basic Product Info</h3>
                        <div className="form-group required">
                            <label htmlFor="name">Product Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Slim-Fit Cotton T-Shirt"
                                required
                            />
                            <p className="help-text">Slug is auto-generated for the URL: 
                                <span style={{fontWeight: 600, color: '#333'}}> {formData.slug || 'slug-will-appear-here'}</span>
                            </p>
                        </div>

                        <div className="two-column">
                            <div className="form-group">
                                <label htmlFor="brand">Brand</label>
                                <input type="text" id="brand" name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g., Nike, Puma" />
                            </div>
                            
                            {/* Vendor Name (Dropdown) and Vendor ID (Read-Only) */}
                            <div>
                                <div className="form-group required">
                                    <label htmlFor="vendorId">Vendor Name</label>
                                    <select 
                                        id="vendorId" 
                                        name="vendorId" 
                                        value={formData.vendorId} 
                                        onChange={handleVendorChange} 
                                        required
                                    >
                                        {VENDOR_OPTIONS.map((vendor) => (
                                            <option 
                                                key={vendor.id || 'placeholder'} 
                                                value={vendor.id} 
                                                disabled={vendor.id === ''}
                                            >
                                                {vendor.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group" style={{marginBottom: 0}}>
                                    <label htmlFor="vendorIdDisplay">Vendor ID (Read Only)</label>
                                    <input 
                                        type="text" 
                                        id="vendorIdDisplay" 
                                        value={formData.vendorId || 'Not Selected'} 
                                        readOnly 
                                        placeholder="VEN-XXX-XXX"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="two-column">
                            {/* Category Dropdown */}
                            <div className="form-group required">
                                <label htmlFor="category">Category</label>
                                <select 
                                    id="category" 
                                    name="category" 
                                    value={formData.category} 
                                    onChange={handleChange}
                                    required
                                >
                                    {CATEGORY_OPTIONS.map((cat, index) => (
                                        <option 
                                            key={index} 
                                            value={cat} 
                                            disabled={index === 0 && cat === 'Select Category'}
                                        >
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="subCategory">Sub Category</label>
                                <input type="text" id="subCategory" name="subCategory" value={formData.subCategory} onChange={handleChange} placeholder="e.g., Laptops, T-Shirts" />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="sku">SKU (Stock Keeping Unit)</label>
                            <input type="text" id="sku" name="sku" value={formData.sku} onChange={handleChange} placeholder="Optional, will be checked for uniqueness" />
                        </div>
                    </div>

                 
                    <div className="card-section two-column">
                        <div>
                            <h3>2. Pricing (Discount-Driven)</h3>
                            
                            <div className="form-group required">
                                <label htmlFor="mrp">MRP (Max Retail Price - ₹)</label>
                                <input
                                    type="number"
                                    id="mrp"
                                    name="mrp"
                                    value={formData.price.mrp}
                                    onChange={handlePriceChange}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                           
                            <div className="form-group">
                                <label htmlFor="discountPercent">Discount (%)</label>
                                <input
                                    type="number"
                                    id="discountPercent"
                                    name="discountPercent"
                                    value={formData.price.discountPercent}
                                    onChange={handlePriceChange} 
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    placeholder="Enter discount rate (0-100)"
                                />
                                <p className="help-text">This value determines the Selling Price.</p>
                            </div>

                           
                            <div className="form-group">
                                <label htmlFor="sellingPrice">Selling Price (Calculated - ₹)</label>
                                <input
                                    type="text"
                                    id="sellingPrice"
                                    name="sellingPrice"
                                    value={parseFloat(formData.price.sellingPrice).toFixed(2)} // Display calculated value
                                    readOnly // Now read-only
                                    style={{
                                        color: formData.price.discountPercent > 0 ? 'var(--secondary-green)' : '#000',
                                        fontWeight: '600'
                                    }}
                                />
                                <p className="help-text">Selling Price = MRP - (MRP * Discount%).</p>
                            </div>
                        </div>
                        <div>
                            <h3>3. Publishing Status</h3>
                            <div className="form-group required">
                                <label htmlFor="publishStatus">Status</label>
                                <select
                                    id="publishStatus"
                                    name="publishStatus"
                                    value={formData.publishStatus}
                                    onChange={handleChange}
                                    required
                                >
                                    {VALID_STATUSES.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="warrantyYears">Warranty (Years)</label>
                                <input type="number" id="warrantyYears" name="warrantyYears" value={formData.warrantyYears} onChange={handleChange} min="0" placeholder="0" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="returnPolicyDays">Return Policy (Days)</label>
                                <input type="number" id="returnPolicyDays" name="returnPolicyDays" value={formData.returnPolicyDays} onChange={handleChange} min="0" placeholder="7" />
                            </div>
                        </div>
                    </div>
                    
                   
                    <div className="card-section specifications-group">
                        <h3>4. Product Specifications & Colors</h3>
                  
                         <div className="form-group">
                            <label htmlFor="highlightHeading">Highlight Heading (Used for banner/top feature)</label>
                            <input
                                type="text"
                                id="highlightHeading"
                                name="highlightHeading"
                                value={formData.highlightHeading}
                                onChange={handleChange}
                                placeholder="e.g., Ultra-Comfort, Quick Dry Technology"
                            />
                            <p className="help-text">A short, punchy phrase used to highlight a key feature.</p>
                        </div>
                        
                        <hr style={{margin: '25px 0', borderStyle: 'dotted'}}/>
                        
                       
                        <h4 style={{border: 'none', color: 'var(--primary-dark)'}}>Available Product Colors (Designate one as Prime)</h4>
                        
                        {formData.productColors.map((color, index) => (
                            <div 
                                key={color.id} 
                                className={`color-row ${color.isPrime ? 'is-prime' : ''}`}
                            >
                                
                                <input 
                                    type="color" 
                                    value={color.hex} 
                                    onChange={(e) => handleColorChange(index, 'hex', e.target.value)} 
                                />
                                
                           
                                <div className="form-group" style={{marginBottom: 0}}>
                                    
                                    <p className="help-text" style={{marginTop: 5, color: color.isPrime ? 'var(--secondary-green)' : 'var(--dark-grey)'}}>
                                        HEX: {color.hex.toUpperCase()} {color.isPrime ? ' | ✓ PRIME DISPLAY' : ''}
                                    </p>
                                </div>
                                
                              
                                <div className="prime-label">
                                    <input
                                        type="checkbox"
                                        id={`prime-${color.id}`}
                                        name={`isPrime-${color.id}`}
                                        checked={color.isPrime}
                                        onChange={(e) => handleColorChange(index, 'isPrime', e.target.checked)}
                                    />
                                    <label htmlFor={`prime-${color.id}`} style={{color: 'var(--primary-dark)', fontWeight: 600, fontSize: '1em', marginBottom: 0}}>
                                        Prime
                                    </label>
                                </div>
                                
                                <button 
                                    type="button" 
                                    className="remove-btn" 
                                    onClick={() => removeProductColor(color.id)}
                                >
                                    &times;
                                </button>
                            </div>
                        ))}

                        <div className="button-group">
                            <button type="button" onClick={addProductColor} className="btn btn-secondary btn-small">
                                + Add Another Color
                            </button>
                        </div>
                        
                        <hr style={{margin: '25px 0', borderStyle: 'dotted'}}/>

                
                        <h4 style={{border: 'none', color: 'var(--primary-dark)'}}>Technical Specifications</h4>
                        {formData.specifications.map((spec, index) => (
                            <div key={index} className="spec-row">
                                <div className="form-group" style={{marginBottom: 0}}>
                                    <label htmlFor={`specKey${index}`}>Key</label>
                                    <input
                                        type="text"
                                        id={`specKey${index}`}
                                        name="key"
                                        value={spec.key}
                                        onChange={(e) => handleSpecChange(index, e)}
                                        placeholder="e.g., Material"
                                    />
                                </div>
                                <div className="form-group" style={{marginBottom: 0}}>
                                    <label htmlFor={`specValue${index}`}>Value</label>
                                    <input
                                        type="text"
                                        id={`specValue${index}`}
                                        name="value"
                                        value={spec.value}
                                        onChange={(e) => handleSpecChange(index, e)}
                                        placeholder="e.g., 100% Organic Cotton"
                                    />
                                </div>
                                {formData.specifications.length > 1 && (
                                    <button 
                                        type="button" 
                                        className="remove-btn" 
                                        style={{position: 'static', transform: 'none', margin: 'auto 0 5px 0'}} 
                                        onClick={() => removeSpecField(index)}
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>
                        ))}
                        <div className="button-group">
                            <button type="button" onClick={addSpecField} className="btn btn-secondary btn-small">
                                + Add Specification
                            </button>
                        </div>
                    </div>

                    {/* --- Section 5: Product Images (Same as before) --- */}
                    <div className="card-section">
                        <h3>5. Product Images</h3>
                        {formData.images.map((img, index) => (
                            <div key={index} className="item-group">
                                <h4>
                                    Image {index + 1}
                                    {img.isPrimary && <span className="primary-tag">(Primary)</span>}
                                </h4>
                                
                                <button type="button" className="remove-btn absolute" onClick={() => removeImageField(index)}>&times;</button>
                                
                                <div className="two-column">
                                    <div className="form-group">
                                        <label htmlFor={`imageUrl${index}`}>Image URL</label>
                                        <input
                                            type="url"
                                            id={`imageUrl${index}`}
                                            name="url"
                                            value={img.url}
                                            onChange={(e) => handleImageChange(index, e)}
                                            placeholder="https://image-cdn.com/product-image.jpg"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor={`imageAlt${index}`}>Alt Text (SEO)</label>
                                        <input
                                            type="text"
                                            id={`imageAlt${index}`}
                                            name="alt"
                                            value={img.alt}
                                            onChange={(e) => handleImageChange(index, e)}
                                            placeholder="A concise description for accessibility"
                                        />
                                    </div>
                                </div>

                                <div className="form-group radio-container">
                                    <input
                                        type="radio"
                                        id={`isPrimary${index}`}
                                        name={`isPrimaryGroup`}
                                        checked={img.isPrimary}
                                        onChange={() => handlePrimaryImageChange(index)}
                                    />
                                    <label htmlFor={`isPrimary${index}`} style={{marginBottom: 0, fontWeight: 400, color: '#333'}}>Set as Primary Image</label>
                                </div>
                                
                            </div>
                        ))}
                        <button type="button" onClick={addImageField} className="btn btn-secondary">
                            + Add Image Field
                        </button>
                    </div>

                    {/* --- Section 6: Product Variations (UPDATED) --- */}
                    <div className="card-section">
                        <h3>6. Product Variations (Size & Color combinations)</h3>
                        <p className="help-text" style={{marginBottom: '20px'}}>
                            Define each unique combination of color and size that has its own stock and unique SKU.
                            The Color options are pulled from Section 4.
                        </p>
                        
                        {formData.variations.map((v, index) => (
                            <div key={index} className="item-group">
                                <h4>Variation {index + 1}</h4>
                                <div className="variation-grid">
                                  
                                    <div className="form-group required">
                                        <label htmlFor={`vColor${index}`}>Color/Style</label>
                                        <select
                                            id={`vColor${index}`}
                                            name="color"
                                            value={v.color}
                                            onChange={(e) => handleVariationChange(index, e)}
                                            required
                                        >
                                            <option value="" disabled>Select a Color</option>
                                            {formData.productColors.map((colorOption) => (
                                                <option 
                                                    key={colorOption.id} 
                                                    value={colorOption.id}
                                             
                                                >
                                                    ({colorOption.hex.toUpperCase()})
                                                </option>
                                            ))}
                                        </select>
                                        <p className="help-text">References colors from Section 4.</p>
                                    </div>
                                    
                                    <div className="form-group required">
                                        <label htmlFor={`vSize${index}`}>Size</label>
                                        <input
                                            type="text"
                                            id={`vSize${index}`}
                                            name="size"
                                            value={v.size}
                                            onChange={(e) => handleVariationChange(index, e)}
                                            placeholder="e.g., L, XL, or 50ml"
                                            required
                                        />
                                    </div>
                                    
                                
                                    <div className="form-group required">
                                        <label htmlFor={`vSku${index}`}>SKU (Unique)</label>
                                        <input
                                            type="text"
                                            id={`vSku${index}`}
                                            name="sku"
                                            value={v.sku}
                                            onChange={(e) => handleVariationChange(index, e)}
                                            placeholder="Required for API submission"
                                            required
                                        />
                                    </div>
                                    
                                    {/* --- Stock Level (Same as before) --- */}
                                    <div className="form-group">
                                        <label htmlFor={`vStock${index}`}>Stock Level</label>
                                        <input
                                            type="number"
                                            id={`vStock${index}`}
                                            name="stock"
                                            value={v.stock}
                                            onChange={(e) => handleVariationChange(index, e)}
                                            min="0"
                                        />
                                    </div>
                                </div>
                                
                                <button type="button" className="remove-btn absolute" onClick={() => removeVariationField(index)}>&times;</button>
                            </div>
                        ))}
                        <button type="button" onClick={addVariationField} className="btn btn-secondary">
                            + Add Variation
                        </button>
                    </div>

                    {/* --- Section 7: Description & Metadata (Same as before) --- */}
                    <div className="card-section">
                        <h3>7. Description & Meta</h3>
                        
                        <div className="two-column">
                            <div className="form-group">
                                <label htmlFor="keywords">SEO Keywords (Comma separated)</label>
                                <input
                                    type="text"
                                    id="keywords"
                                    name="keywords"
                                    value={formData.keywords}
                                    onChange={handleChange}
                                    placeholder="shoes, running, gym, sports"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="tags">Internal Tags (Comma separated)</label>
                                <input
                                    type="text"
                                    id="tags"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="summer-collection, clearance, best-seller"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="story">Product Story/Marketing Copy</label>
                            <textarea
                                id="story"
                                name="story"
                                value={formData.description.story}
                                onChange={handleDescriptionChange}
                                placeholder="A compelling, narrative description highlighting benefits and emotion."
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="details">Technical Details / Bullet Points</label>
                            <textarea
                                id="details"
                                name="details"
                                value={formData.description.details}
                                onChange={handleDescriptionChange}
                                placeholder="Detailed list of features, materials, and care instructions."
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="styleNote">Styling Note / Usage Tip</label>
                            <textarea
                                id="styleNote"
                                name="styleNote"
                                value={formData.description.styleNote}
                                onChange={handleDescriptionChange}
                                placeholder="How to wear it, or best practices for usage."
                            />
                        </div>
                    </div>
                    
                    {/* --- Submit Button --- */}
                    <div className="submit-container">
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={loading}
                        >
                            {loading ? <div className="spinner"></div> : 'Create Product'}
                        </button>
                    </div>

                </form>
                
                {/* Popup Message Component */}
                <PopupMessage 
                    message={popup.message} 
                    isError={popup.isError} 
                    onClose={closePopup} 
                    visible={popup.visible} 
                />
            </div>
        </>
    );
};

export default CreateProduct;