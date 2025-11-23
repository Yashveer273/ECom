import React, { useState, useMemo } from 'react';
import { createProduct } from './Api';

// --- Utility Functions ---

const slugify = (text) => {
    if (!text) return '';
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}


// Converts a comma-separated string into an array of strings
const parseStringArray = (str) => {
    if (!str) return [];
    return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
};

// --- Constants ---

const VALID_STATUSES = ['Draft', 'Pending Review', 'Published', 'Archived'];

const VENDOR_LIST = [
    { id: '', name: 'Select Vendor' }, 
    { id: 'VEN-2023-A789', name: 'Global Distributors Inc.' },
    { id: 'VEN-2024-B101', name: 'Tech Solutions LLC' },
    { id: 'VEN-2024-C202', name: 'Cosmetic Kings India' },
    { id: 'VEN-2025-D303', name: 'Fashion Forward Co.' },
];

const CATEGORY_LIST = [
    'Select Category', 'Electronics', 'Mobile Phones & Accessories', 'Clothing & Apparel',
    'Beauty, Health & Personal Care (Cosmetics)', 'Home & Kitchen', 'Books & Media'
];

// --- Popup Component ---

const PopupMessage = ({ message, isError, onClose, visible }) => {
    if (!visible) return null;

    const popupClass = isError 
        ? "bg-red-500 text-white" 
        : "bg-green-500 text-white";

    return (
        <div className="fixed top-4 right-4 z-50 transition-opacity duration-300 shadow-xl rounded-lg overflow-hidden">
            <div className={`p-4 flex items-center justify-between ${popupClass}`}>
                <p className="font-semibold text-sm mr-4">{message}</p>
                <button 
                    onClick={onClose} 
                    className="ml-4 text-white hover:text-opacity-80 transition"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};


// A reusable input component for price/number fields
const PriceInput = ({ label, name, value, isReadOnly, suffix, onChange }) => {
        
    const displayValue = isReadOnly 
        ? (Number(value) || 0).toFixed(2) 
        : value;

    return (
        <div className="form-group">
            <label htmlFor={name}>{label}</label>
            <div className="relative">
                <input
                    id={name}
                    name={name}
                    // Type text to allow for live decimal input without losing focus
                    type="text" 
                    pattern="[0-9]*[.]?[0-9]*" 
                    inputMode="decimal"
                    value={displayValue} 
                    onChange={onChange}
                    readOnly={isReadOnly}
                    className={isReadOnly ? 'bg-gray-100 cursor-default' : ''}
                    placeholder="0"
                />
                {suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium pointer-events-none">
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
};

// Component for stylish Selling Price display
const SellingPriceDisplay = ({ price, currency }) => {
    const formattedPrice = (Number(price) || 0).toFixed(2);

    return (
        <div className="form-group">
            <label>Final Selling Price</label>
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg shadow-inner flex items-center justify-center h-full min-h-[42px]">
                <h3 className="text-2xl font-extrabold text-green-700 tracking-tight">
                    <span className="text-lg font-semibold mr-1">{currency}</span>
                    {formattedPrice}
                </h3>
            </div>
        </div>
    );
};


// --- Main Component ---

const CreateProduct = () => {
    const [loading, setLoading] = useState(false);
    const [popup, setPopup] = useState({ message: '', isError: false, visible: false });
    // State to track the index of the image being edited (null for adding new)
    const [editingImageIndex, setEditingImageIndex] = useState(null); 
    
    // --- Initial Variation State Structure ---
    // Defined once outside to use as a fallback and initializer
    const getInitialVariationData = () => ({
        // Core Variation Data
        stock: '', 
        inStock: false,
        price: { // Single price object, will be wrapped in an array for schema upon submission
            mrp: '', 
            sellingPrice: 0,
            discountPercent: '', 
            currency: 'INR',
        },
        images: [], 
        specifications: [], 
        
        // Description/Details/Policy (pulled from DetailSectionSchema)
        story: '', 
        details: '', 
        styleNote: '',
        // highlightHeading has been moved to top-level product state
        warrantyYears: '', 
        returnPolicyDays: '', 

        // TEMP fields for UI
        tempImageUrl: '',
        tempImageAlt: '',
        tempImageIsPrimary: false,
        tempSpecKey: '', 
        tempSpecValue: '', 
    });
    
    // Initial state aligned with the complex MongoDB schema
    const initialFormData = useMemo(() => ({
        name: '',
        sku: '',
        slug: '',
        category: CATEGORY_LIST[0],
        subCategory: '',
        vendorId: VENDOR_LIST[0].id,
        vendorName: VENDOR_LIST[0].name,
        publishStatus: VALID_STATUSES[0],
        brand: '', 
        highlightHeading: '', // <-- highlightHeading is now top-level
        
        seoKeywordsInput: '', 
        internalTagsInput: '', 

        // Variation Management
        productColors: [], // [{ hex: string, isPrime: boolean }]
        variationData: {}, // { 'HEX_CODE': VariationObject }

        // TEMP fields for adding a new color/variation
        newColorHex: '#4f46e5',
        newColorIsPrime: false,
    }), []);
    
    const [formData, setFormData] = useState(initialFormData);
    const [currentVariationHex, setCurrentVariationHex] = useState(null);
    

    // Set default current variation when colors change
    React.useEffect(() => {
        // If there is no selection, but colors exist, select the primary one or the first one
        if (!currentVariationHex && formData.productColors.length > 0) {
            setCurrentVariationHex(formData.productColors.find(c => c.isPrime)?.hex || formData.productColors[0].hex);
        } else if (formData.productColors.length === 0) {
            // If all colors are removed, ensure currentVariationHex is null
            setCurrentVariationHex(null);
        }
        // If the currently selected hex is removed, move selection to the next valid color
        if (currentVariationHex && !formData.productColors.some(c => c.hex === currentVariationHex)) {
             setCurrentVariationHex(formData.productColors.find(c => c.isPrime)?.hex || formData.productColors[0]?.hex || null);
        }
    }, [formData.productColors, currentVariationHex]);
    

    const showPopup = (message, isError = false) => {
        setPopup({ message, isError, visible: true });
        setTimeout(() => closePopup(), 5000);
    };

    const closePopup = () => {
        setPopup(prev => ({ ...prev, visible: false }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'name') {
            setFormData(prev => ({ ...prev, name: value, slug: slugify(value) }));
            return;
        }

        if (name === 'vendorId') {
            const selectedVendor = VENDOR_LIST.find(v => v.id === value);
             setFormData(prev => ({
                ...prev,
                vendorId: value,
                vendorName: selectedVendor ? selectedVendor.name : '',
            }));
            return;
        }
        
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- Variation Handlers ---
    
    const handleNewColorChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleAddColor = () => {
        const hex = formData.newColorHex.toUpperCase();
        if (!hex || formData.productColors.some(c => c.hex === hex)) {
            showPopup("Color already exists or is invalid.", true);
            return;
        }

        const newColor = { hex, isPrime: formData.newColorIsPrime };

        setFormData(prev => {
            // Unset previous primary if a new one is set
            const updatedColors = newColor.isPrime 
                ? prev.productColors.map(c => ({ ...c, isPrime: false })) 
                : prev.productColors;
                
            const finalColors = [...updatedColors, newColor];
            
            return {
                ...prev,
                productColors: finalColors,
                variationData: {
                    ...prev.variationData,
                    [hex]: getInitialVariationData()
                },
                newColorHex: '#4f46e5',
                newColorIsPrime: false,
            };
        });
        setCurrentVariationHex(hex);
    };

    const handleRemoveColor = (hexToRemove) => {
        setFormData(prev => {
            const newColors = prev.productColors.filter(c => c.hex !== hexToRemove);
            const newVariations = { ...prev.variationData };
            delete newVariations[hexToRemove];
            
            return {
                ...prev,
                productColors: newColors,
                variationData: newVariations
            };
        });
        // The useEffect hook handles setting the new currentVariationHex after removal
    };

    // Enforces single primary color on edit/selection
    const handleSetPrimaryColor = (hexToSet) => {
        setFormData(prev => ({
            ...prev,
            productColors: prev.productColors.map(color => ({
                ...color,
                isPrime: color.hex === hexToSet, // Only set true for the target hex
            }))
        }));
        showPopup(`${hexToSet} set as the Primary Color.`, false);
    };
    
    const handleVariationChange = (e) => {
        const { name, value, type, checked } = e.target;
        const currentVariationData = formData.variationData[currentVariationHex];
        
        // --- GUARD CLAUSE: Prevent error if no variation is selected or defined ---
        if (!currentVariationData) {
            console.error("Attempted to change variation data but no current variation is selected or defined.");
            return;
        }
        // --- END GUARD CLAUSE ---
        
        // --- Handle Price updates (maintains string state for input focus) ---
        if (['mrp', 'discountPercent', 'currency'].includes(name)) {
            
            let inputValue = value; 
            
            if (name !== 'currency') {
                // Allows only digits and one decimal point
                inputValue = inputValue.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
            }

            let newMrp = name === 'mrp' ? inputValue : currentVariationData.price.mrp;
            let newDiscountPercent = name === 'discountPercent' ? inputValue : currentVariationData.price.discountPercent;
            let newCurrency = name === 'currency' ? inputValue : currentVariationData.price.currency;
            
            // Convert to number for calculation, defaulting to 0 if empty or invalid
            const calcMrp = Number(newMrp) || 0;
            const rawDiscount = Number(newDiscountPercent) || 0;
            
            // Cap discount at 100% for calculation
            const calcDiscount = Math.min(100, Math.max(0, rawDiscount));
            
            // Calculate Selling Price
            const discountAmount = calcMrp * (calcDiscount / 100);
            const newSellingPrice = Math.max(0, calcMrp - discountAmount);
            
            setFormData(prev => ({
                ...prev,
                variationData: {
                    ...prev.variationData,
                    [currentVariationHex]: {
                        ...prev.variationData[currentVariationHex],
                        price: {
                            // Store raw string value for input control
                            mrp: newMrp, 
                            discountPercent: newDiscountPercent,
                            // Store calculated value as a number (it's readOnly)
                            sellingPrice: newSellingPrice, 
                            currency: newCurrency,
                        }
                    }
                }
            }));
            return;
            
        } 
        
        // --- Handle all other updates ---
        
        // FIX: Correctly handle boolean values from checkboxes
        const updateValue = (type === 'checkbox') ? checked : value;
            
        setFormData(prev => ({
            ...prev,
            variationData: {
                ...prev.variationData,
                [currentVariationHex]: {
                    ...prev.variationData[currentVariationHex],
                    [name]: updateValue, 
                    
                    // Auto update inStock based on stock
                    inStock: name === 'stock' ? (Number(value) > 0) : prev.variationData[currentVariationHex].inStock,
                }
            }
        }));
    };
    
    // --- Specification Handlers (Unchanged) ---
    
    const handleAddSpecification = () => {
        const variation = formData.variationData[currentVariationHex];
        if (!variation.tempSpecKey || !variation.tempSpecValue) {
            showPopup("Both Key and Value must be entered for the specification.", true);
            return;
        }
        
        const newSpec = {
            key: variation.tempSpecKey.trim(),
            value: variation.tempSpecValue.trim(),
        };
        
        setFormData(prev => ({
            ...prev,
            variationData: {
                ...prev.variationData,
                [currentVariationHex]: {
                    ...prev.variationData[currentVariationHex],
                    specifications: [...prev.variationData[currentVariationHex].specifications, newSpec],
                    tempSpecKey: '',
                    tempSpecValue: '',
                }
            }
        }));
    };

    const handleRemoveSpecification = (index) => {
        setFormData(prev => ({
            ...prev,
            variationData: {
                ...prev.variationData,
                [currentVariationHex]: {
                    specifications: prev.variationData[currentVariationHex].specifications.filter((_, i) => i !== index),
                }
            }
        }));
    };
    
    // --- Image Handlers (Updated for Edit/Save/Delete) ---

    // 1. Start Edit Mode
    const handleStartEditImage = (index) => {
        const variation = formData.variationData[currentVariationHex];
        const imageToEdit = variation.images[index];
        
        // Populate the temporary fields with the image data using the existing change handler
        handleVariationChange({ target: { name: 'tempImageUrl', value: imageToEdit.url } });
        handleVariationChange({ target: { name: 'tempImageAlt', value: imageToEdit.alt } });
        // Pass the boolean value directly for checkbox state
        setFormData(prev => ({
            ...prev,
            variationData: {
                ...prev.variationData,
                [currentVariationHex]: {
                    ...prev.variationData[currentVariationHex],
                    tempImageIsPrimary: imageToEdit.isPrimary,
                }
            }
        }));
        
        setEditingImageIndex(index);
        showPopup(`Editing image at index ${index}. Click 'Update Image' to save changes.`, false);
    };

    // 2. Cancel Edit Mode
    const handleCancelEdit = () => {
        setEditingImageIndex(null);
        // Clear temp fields explicitly
        setFormData(prev => ({
            ...prev,
            variationData: {
                ...prev.variationData,
                [currentVariationHex]: {
                    ...prev.variationData[currentVariationHex],
                    tempImageUrl: '',
                    tempImageAlt: '',
                    tempImageIsPrimary: false,
                }
            }
        }));
    };
    
    // 3. Save Image (Add or Update)
    const handleSaveImage = () => {
        const variation = formData.variationData[currentVariationHex];
        const { tempImageUrl, tempImageAlt, tempImageIsPrimary } = variation;

        if (!tempImageUrl) {
            showPopup("Image URL is required.", true);
            return;
        }

        const imageToSave = {
            url: tempImageUrl,
            alt: tempImageAlt || formData.name + ' ' + currentVariationHex,
            isPrimary: tempImageIsPrimary,
        };
        
        setFormData(prev => {
            const currentImages = prev.variationData[currentVariationHex].images;
            let imagesArray = [...currentImages];
            
            // --- Primary Status Management ---
            // If the image being saved is primary, ensure all others in the array are not primary.
            if (imageToSave.isPrimary) {
                imagesArray = imagesArray.map(img => ({ ...img, isPrimary: false }));
            }

            // --- Add or Update ---
            if (editingImageIndex !== null) {
                // UPDATE: Insert the imageToSave at the existing index
                imagesArray.splice(editingImageIndex, 1, imageToSave);
            } else {
                // ADD: Push the new image
                imagesArray.push(imageToSave);
            }
            
            return {
                ...prev,
                variationData: {
                    ...prev.variationData,
                    [currentVariationHex]: {
                        ...prev.variationData[currentVariationHex],
                        images: imagesArray,
                    }
                }
            };
        });

        // Final cleanup
        handleCancelEdit(); // Clears temp fields and resets editingImageIndex
        showPopup(editingImageIndex !== null ? "Image updated successfully!" : "Image added successfully!", false);
    };

    // 4. Remove Image (Corrected for immutability and error handling)
    const handleRemoveImage = (index) => {
        // Guard clause to ensure a variation is selected
        if (!currentVariationHex) {
            showPopup("No color variation selected to remove an image from.", true);
            return;
        }
        
        setFormData(prev => {
            // 1. Get the specific variation data
            const currentVariation = prev.variationData[currentVariationHex];
            
            // 2. Create the new images array by filtering (immutability)
            const newImages = currentVariation.images.filter((_, i) => i !== index);
            
            // 3. Update the state immutably
            return {
                ...prev,
                variationData: {
                    ...prev.variationData,
                    [currentVariationHex]: {
                        ...currentVariation, // Copy existing variation data
                        images: newImages, // Set the new image array
                    }
                }
            };
        });

        // Clear edit mode if the deleted image was the one being edited
        if (editingImageIndex === index) {
            handleCancelEdit();
        }
        showPopup("Image successfully removed.", false);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.category || formData.category === CATEGORY_LIST[0] || !formData.vendorId) {
            showPopup("Please fill in Product Name, Category, and Vendor.", true);
            return;
        }

        if (formData.productColors.length === 0) {
            showPopup("Please add at least one color variation.", true);
            return;
        }
        
        // Final check for a primary color (top-level product primary color)
        const primaryColorCheck = formData.productColors.find(c => c.isPrime);
        if (!primaryColorCheck) {
             showPopup("ERROR: You must set exactly one color variation as the Primary Color before submitting.", true);
            return; 
        }

        // --- NEW VALIDATION: Check for at least one Primary image per variation ---
        for (const colorItem of formData.productColors) {
            const hex = colorItem.hex;
            const variationDetails = formData.variationData[hex];
            
            // This implicitly checks if images exist and if one is primary
            const hasPrimaryImage = variationDetails.images.some(img => img.isPrimary);

            if (!hasPrimaryImage) {
                // If there are no images, show a specific error
                if (variationDetails.images.length === 0) {
                    showPopup(`ERROR: Color variation ${hex} must have at least one image added.`, true);
                    setLoading(false);
                    return;
                }
                // If there are images but none is primary, show this error
                showPopup(`ERROR: Color variation ${hex} must have at least one image set as 'Primary' to represent the variant.`, true);
                setLoading(false);
                return;
            }
        }
        // --- END NEW VALIDATION ---
        
        setLoading(true);
        
        try {
            const keywords = parseStringArray(formData.seoKeywordsInput);
            const tags = parseStringArray(formData.internalTagsInput);
            
            // Build the variations array from variationData map
            const variations = formData.productColors.map((colorItem, index) => {
                const variationDetails = formData.variationData[colorItem.hex];

                // Determine the base SKU for slug generation
                const baseSku = formData.sku || 'product';
                
                // Construct the full SKU
                const fullSku = `${baseSku}-${index}-${colorItem.hex.substring(1).toUpperCase()}`;
                
                // The display name for the variation will be based on the product name + color
                const variationName = `${formData.name} - ${colorItem.hex}`;
                
                // Construct the Price object that conforms to PriceSchema
                const priceObject = {
                    mrp: Number(variationDetails.price.mrp) || 0,
                    sellingPrice: variationDetails.price.sellingPrice,
                    discountPercent: Number(variationDetails.price.discountPercent) || 0,
                    currency: variationDetails.price.currency,
                };
                
                // Construct the final variation object
                return {
                    color: colorItem.hex,
                    size: "", // Hardcoded empty string as size input is not present in UI
                    stock: Number(variationDetails.stock) || 0,
                    sku: fullSku,
                    // ✅ Schema Compliance: Generate slug from variation details (slug is on VariationSchema)
                    slug: slugify(variationName), 
                    
                    productColors: [colorItem], // Array
                    images: variationDetails.images, // Array
                    specifications: variationDetails.specifications, // Array
                    
                    // ✅ SCHEMA COMPLIANCE FIX: Wrap the single price object in an array (price is [PriceSchema])
                    price: [priceObject], 
                    
                    isActive: true,
                    inStock: (Number(variationDetails.stock) || 0) > 0,
                    description: {
                        story: variationDetails.story,
                        details: variationDetails.details,
                        styleNote: variationDetails.styleNote,
                    },
                };
            });
            
            // Find the primary color variation to use for top-level product fields
            const primaryColor = primaryColorCheck;
            // IMPORTANT: Get the variation data for the primary color. Use a fallback if it's somehow missing.
            const primaryVariation = formData.variationData[primaryColor.hex] || getInitialVariationData();

            // NOTE: The warranty and return policy fields are on the root ProductSchema, but
            // they are currently edited per-variation in the UI. For submission, we take the value 
            // from the currently selected primary variation.
            const productData = {
                // ✅ Basic Information
                name: formData.name,
                brand: formData.brand, 
                category: formData.category,
                subCategory: formData.subCategory,
                
                highlightHeading: formData.highlightHeading, // <-- Now using top-level formData
                // Using values from the Primary Variation for these root fields
                warrantyYears: Number(primaryVariation.warrantyYears) || 0,
                returnPolicyDays: Number(primaryVariation.returnPolicyDays) || 7,
                
                variations: variations, // Array of VariationSchema

                vendorId: formData.vendorId,
                vendorName: formData.vendorName,
                // NOTE: Schema expects ObjectId, generateUniqueId returns a string (Mocking)
                addedBy: "ram" ,
                
                publishStatus: formData.publishStatus,
                
                // ✅ SEO & Metadata
                keywords: keywords, // Array
                tags: tags, // Array

                // Mock/Default data for required root fields
                vendorRating: 0,
                isSponsored: false,
                searchBoostScore: 0,
                totalSales: 0,
                suggestedProducts: [],
                isFeatured: false,
                isPopular: false,
                isTrending: false,
                avgRating: 0,
                totalRatings: 0,
                reviews: [], // Array
            };

          
          await  createProduct(productData);
             
            showPopup("Product data successfully generated and logged to the console!", false);
            
        } catch (error) {
            console.error("Error generating product data:", error);
            showPopup(`Failed to generate product data: ${error.message}`, true);
        } finally {
            setLoading(false);
        }
    };


    // --- Render Helpers ---
    
    // Get the current variation data, using a fallback to prevent "cannot read properties of undefined"
    const currentVariation = formData.variationData[currentVariationHex] || getInitialVariationData();
    // Use optional chaining for safer access, though getInitialVariationData handles null price object
    const currentPrice = currentVariation.price || getInitialVariationData().price; 

    const isCurrentVariationPrimary = formData.productColors.find(c => c.hex === currentVariationHex)?.isPrime || false;

    
    return (
        <>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
                    
                    body { font-family: 'Inter', sans-serif; background-color: #f7f7f9; }
                    .container { 
                        max-width: 1200px; 
                        margin: 20px auto; 
                        padding: 30px; 
                        background-color: white; 
                        border-radius: 12px; 
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    }
                    h1 { 
                        font-size: 1.75rem; 
                        font-weight: 700; 
                        color: #1f2937; 
                        margin-bottom: 20px; 
                        border-bottom: 2px solid #e5e7eb; 
                        padding-bottom: 10px;
                    }
                    .section-heading {
                        font-size: 1.25rem;
                        font-weight: 600;
                        color: #4338ca;
                        margin-top: 25px;
                        margin-bottom: 15px;
                        padding-left: 10px;
                        border-left: 4px solid #4338ca;
                    }
                    .form-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 20px;
                    }
                    .form-group {
                        display: flex;
                        flex-direction: column;
                    }
                    label {
                        font-weight: 500;
                        margin-bottom: 6px;
                        color: #374151;
                        font-size: 0.9rem;
                    }
                    input, select, textarea {
                        padding: 10px 12px;
                        border: 1px solid #d1d5db;
                        border-radius: 8px;
                        font-size: 1rem;
                        transition: border-color 0.2s, box-shadow 0.2s;
                        background-color: #f9fafb;
                    }
                    input:focus, select:focus, textarea:focus {
                        border-color: #4f46e5;
                        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
                        outline: none;
                        background-color: white;
                    }
                    textarea {
                        resize: vertical;
                        min-height: 80px;
                    }
                    .full-width {
                        grid-column: 1 / -1;
                    }
                    .submit-container {
                        margin-top: 30px;
                        text-align: right;
                    }
                    .btn-primary {
                        background-color: #4f46e5;
                        color: white;
                        padding: 12px 30px;
                        border-radius: 8px;
                        font-weight: 600;
                        transition: background-color 0.2s, box-shadow 0.2s;
                        cursor: pointer;
                        border: none;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }
                    .btn-primary:hover {
                        background-color: #4338ca;
                        box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
                    }
                    .btn-primary:disabled {
                        background-color: #a5b4fc;
                        cursor: not-allowed;
                        box-shadow: none;
                    }
                    .spinner {
                        border: 4px solid rgba(255, 255, 255, 0.3);
                        border-top: 4px solid #fff;
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: transform: rotate(360deg); }
                    }
                    .variation-tab {
                        cursor: pointer;
                        padding: 8px 15px;
                        border-radius: 6px;
                        margin-right: 8px;
                        transition: background-color 0.2s;
                        border: 1px solid #e5e7eb;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .variation-tab.active {
                        background-color: #4f46e5;
                        color: white;
                        border-color: #4f46e5;
                    }
                    .color-swatch {
                        width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        border: 1px solid rgba(0,0,0,0.1);
                    }
                    .image-preview-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                        gap: 10px;
                        margin-top: 15px;
                    }
                    .image-item {
                        cursor: pointer;
                        transition: transform 0.2s, box-shadow 0.2s;
                    }
                    .image-item.editing {
                        box-shadow: 0 0 0 4px #4f46e5;
                    }
                    .image-item:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }
                    .spec-tag {
                        background-color: #eef2ff;
                        color: #4338ca;
                        border: 1px solid #c7d2fe;
                        padding: 6px 10px;
                        border-radius: 6px;
                        font-size: 0.85rem;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        font-weight: 500;
                    }
                    /* Responsive adjustments */
                    @media (max-width: 768px) {
                        .container {
                            padding: 15px;
                        }
                        .form-grid {
                            grid-template-columns: 1fr;
                        }
                    }
                `}
            </style>
            
            <div className="container">
                <h1>Create New Product with Variations</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Define the core product first. Details like Price, Stock, Specs, and Description are configured for each color variation.
                </p>

                <form onSubmit={handleSubmit}>
                    
                    {/* --- Basic Information (Top Level) --- */}
                    <div className="section-heading">Basic Information</div>
                    <div className="form-grid">
                        
                        <div className="form-group">
                            <label htmlFor="name">Product Name *</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="E.g., V-Neck T-Shirt"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="brand">Brand</label>
                            <input
                                id="brand"
                                name="brand"
                                type="text"
                                value={formData.brand}
                                onChange={handleInputChange}
                                placeholder="E.g., TrendCo"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="highlightHeading">Highlight Heading</label>
                            <input
                                id="highlightHeading"
                                name="highlightHeading"
                                type="text"
                                value={formData.highlightHeading}
                                onChange={handleInputChange}
                                placeholder="E.g., Key Features"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="sku">Base SKU</label>
                            <input
                                id="sku"
                                name="sku"
                                type="text"
                                value={formData.sku}
                                onChange={handleInputChange}
                                placeholder="E.g., VNT-001"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="category">Category *</label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                            >
                                {CATEGORY_LIST.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="subCategory">Sub-Category</label>
                            <input
                                id="subCategory"
                                name="subCategory"
                                type="text"
                                value={formData.subCategory}
                                onChange={handleInputChange}
                                placeholder="E.g., T-Shirts"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="vendorId">Vendor *</label>
                            <select
                                id="vendorId"
                                name="vendorId"
                                value={formData.vendorId}
                                onChange={handleInputChange}
                                required
                            >
                                {VENDOR_LIST.map(vendor => (
                                    <option key={vendor.id} value={vendor.id}>
                                        {vendor.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="publishStatus">Publish Status</label>
                            <select
                                id="publishStatus"
                                name="publishStatus"
                                value={formData.publishStatus}
                                onChange={handleInputChange}
                            >
                                {VALID_STATUSES.map(status => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* --- Variation Management: Colors --- */}
                    <div className="section-heading">Color Variations ({formData.productColors.length} added)</div>
                    
                    <div className="flex flex-wrap items-center mb-4 gap-2">
                        {formData.productColors.map(color => (
                            <div 
                                key={color.hex}
                                className={`variation-tab ${currentVariationHex === color.hex ? 'active' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                onClick={() => setCurrentVariationHex(color.hex)}
                            >
                                <div className="color-swatch" style={{backgroundColor: color.hex}}></div>
                                <span>{color.hex} {color.isPrime && '(Primary)'}</span>
                                <button 
                                    type="button" 
                                    onClick={(e) => { e.stopPropagation(); handleRemoveColor(color.hex); }} 
                                    className="ml-2 text-xs font-bold opacity-70 hover:opacity-100"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="form-grid items-end gap-4 border p-4 rounded-lg bg-gray-50 mb-6">
                        <div className="form-group">
                            <label htmlFor="newColorHex">Add New Color (Hex Code)</label>
                            <input
                                id="newColorHex"
                                name="newColorHex"
                                type="color"
                                value={formData.newColorHex}
                                onChange={handleNewColorChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="flex items-center space-x-2 mt-4">
                                <input
                                    type="checkbox"
                                    name="newColorIsPrime"
                                    checked={formData.newColorIsPrime}
                                    onChange={handleNewColorChange}
                                />
                                <span>Set as Primary Color?</span>
                            </label>
                        </div>
                        <div>
                             <button type="button" onClick={handleAddColor} className="btn-primary w-full h-[42px] mt-4">
                                Add Color
                            </button>
                        </div>
                    </div>
                    
                    {/* --- Variation Details Editor --- */}
                    {currentVariationHex && (
                        <div className="border p-6 rounded-lg shadow-md bg-white">
                            <h3 className="text-xl font-semibold mb-4 text-indigo-600 flex items-center justify-between">
                                <span>
                                    Details for Color: 
                                    <span style={{ color: currentVariationHex, marginLeft: '8px' }}>{currentVariationHex}</span>
                                </span>
                                {/* Button to set this color as the ONLY primary color (The Edit Option) */}
                                {!isCurrentVariationPrimary && (
                                    <button
                                        type="button"
                                        onClick={() => handleSetPrimaryColor(currentVariationHex)}
                                        className="text-sm font-medium bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full hover:bg-yellow-200 transition"
                                    >
                                        Make this the Primary Color
                                    </button>
                                )}
                                {isCurrentVariationPrimary && (
                                    <span className="text-sm font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full">
                                        Current Primary
                                    </span>
                                )}
                            </h3>
                            
                            {/* Variation Price & Stock */}
                            <div className="section-heading mt-0">Price & Stock</div>
                            <div className="form-grid">
                                
                                <PriceInput 
                                    label={`MRP (${currentPrice.currency})`} 
                                    name="mrp" 
                                    value={currentPrice.mrp} 
                                    onChange={handleVariationChange}
                                />
                                <PriceInput 
                                    label="Discount (%)" 
                                    name="discountPercent" 
                                    value={currentPrice.discountPercent} 
                                    onChange={handleVariationChange}
                                    suffix="%"
                                />
                                
                                {/* Selling Price is now displayed in a stylish h3 */}
                                <SellingPriceDisplay 
                                    price={currentPrice.sellingPrice}
                                    currency={currentPrice.currency}
                                />
                                
                                <div className="form-group">
                                    <label htmlFor="stock">Stock Quantity</label>
                                    <input
                                        id="stock"
                                        name="stock"
                                        type="number"
                                        min="0"
                                        value={currentVariation.stock}
                                        onChange={handleVariationChange}
                                        placeholder="10"
                                    />
                                </div>
                            </div>

                            {/* Variation Descriptions and Policies */}
                            <div className="section-heading">Description & Policies</div>
                            <div className="form-grid full-width">
                                
                                <div className="form-group">
                                    <label htmlFor="details">Short Description / Details (Schema: details)</label>
                                    <textarea
                                        id="details"
                                        name="details"
                                        value={currentVariation.details}
                                        onChange={handleVariationChange}
                                        placeholder="A concise summary of the product's main benefit."
                                        maxLength="200"
                                    />
                                </div>
                                
                                <div className="form-group full-width">
                                    <label htmlFor="story">Long Description / Story (Schema: story)</label>
                                    <textarea
                                        id="story"
                                        name="story"
                                        value={currentVariation.story}
                                        onChange={handleVariationChange}
                                        placeholder="Full details, specifications, features, and marketing copy."
                                        rows="4"
                                    />
                                </div>
                                
                                {/* highlightHeading REMOVED from here and MOVED to top-level Basic Information */}

                                <div className="form-group">
                                    <label htmlFor="styleNote">Styling Note / Usage Tip</label>
                                    <textarea
                                        id="styleNote"
                                        name="styleNote"
                                        value={currentVariation.styleNote}
                                        onChange={handleVariationChange}
                                        placeholder="Best practices for usage or styling."
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="warrantyYears">Warranty (Years)</label>
                                    <input
                                        id="warrantyYears"
                                        name="warrantyYears"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={currentVariation.warrantyYears}
                                        onChange={handleVariationChange}
                                        placeholder="E.g., 2"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="returnPolicyDays">Return Policy (Days)</label>
                                    <input
                                        id="returnPolicyDays"
                                        name="returnPolicyDays"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={currentVariation.returnPolicyDays}
                                        onChange={handleVariationChange}
                                        placeholder="E.g., 30"
                                    />
                                </div>
                            </div>
                            
                            {/* Variation Specifications */}
                            <div className="section-heading">Specifications ({currentVariation.specifications.length} added)</div>
                            <div className="form-grid items-end gap-4 border p-4 rounded-lg bg-gray-50 mb-4">
                                <div className="form-group">
                                    <label htmlFor="tempSpecKey">Specification Key</label>
                                    <input
                                        id="tempSpecKey"
                                        name="tempSpecKey"
                                        type="text"
                                        value={currentVariation.tempSpecKey || ''}
                                        onChange={handleVariationChange}
                                        placeholder="E.g., Weight"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="tempSpecValue">Specification Value</label>
                                    <input
                                        id="tempSpecValue"
                                        name="tempSpecValue"
                                        type="text"
                                        value={currentVariation.tempSpecValue || ''}
                                        onChange={handleVariationChange}
                                        placeholder="E.g., 200g"
                                    />
                                </div>
                                <div className="form-group">
                                    <button type="button" onClick={handleAddSpecification} className="btn-primary w-full h-[42px] mt-4">
                                        Add Spec
                                    </button>
                                </div>
                            </div>
                            
                            <div className="form-grid">
                                {currentVariation.specifications.map((spec, index) => (
                                    <div key={index} className="spec-tag">
                                        <span>
                                            <span className="font-bold text-gray-700">{spec.key}</span>: {spec.value}
                                        </span>
                                        <button 
                                            type="button"
                                            onClick={() => handleRemoveSpecification(index)}
                                            className="ml-2 text-red-600 hover:text-red-800 transition text-sm"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>


                            {/* Variation Images */}
                            <div className="section-heading">Images ({currentVariation.images.length} added)</div>
                            
                            {/* Image Add/Edit Section */}
                            <div className="form-grid items-end gap-4 border p-4 rounded-lg bg-gray-50 mb-4">
                                <div className="form-group">
                                    <label htmlFor="tempImageUrl">Image URL</label>
                                    <input
                                        id="tempImageUrl"
                                        name="tempImageUrl"
                                        type="url"
                                        value={currentVariation.tempImageUrl}
                                        onChange={handleVariationChange}
                                        placeholder="https://placehold.co/600x400"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="tempImageAlt">Alt Text</label>
                                    <input
                                        id="tempImageAlt"
                                        name="tempImageAlt"
                                        type="text"
                                        value={currentVariation.tempImageAlt}
                                        onChange={handleVariationChange}
                                        placeholder="Image of {currentVariationHex} T-shirt"
                                    />
                                </div>
                                <div className="form-group flex justify-center items-center">
                                    <label className="flex items-center space-x-2 mt-4">
                                        <input
                                            type="checkbox"
                                            name="tempImageIsPrimary"
                                            checked={currentVariation.tempImageIsPrimary}
                                            onChange={handleVariationChange}
                                        />
                                        <span>Set as Primary?</span>
                                    </label>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button type="button" onClick={handleSaveImage} className="btn-primary w-full h-[42px]">
                                        {editingImageIndex !== null ? 'Update Image' : 'Add Image'}
                                    </button>
                                    {editingImageIndex !== null && (
                                        <button type="button" onClick={handleCancelEdit} className="text-sm text-gray-500 hover:text-gray-700">
                                            Cancel Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Image Preview Grid (Now Clickable) */}
                            <div className="image-preview-grid">
                                {currentVariation.images.map((img, index) => (
                                    <div 
                                        key={index} 
                                        className={`relative border rounded-lg overflow-hidden shadow-sm image-item ${editingImageIndex === index ? 'editing' : ''}`}
                                        onClick={() => handleStartEditImage(index)} // Click to start editing
                                    >
                                        <img 
                                            src={img.url} 
                                            alt={img.alt} 
                                            className="w-full h-24 object-cover pointer-events-none" // Prevent image click from overriding div click
                                            onError={(e) => e.target.src = `https://placehold.co/100x100/f0f0f0/666666?text=Invalid URL`}
                                        />
                                        {img.isPrimary && (
                                            <span className="absolute top-1 left-1 bg-indigo-500 text-white text-xs px-1 rounded">Primary</span>
                                        )}
                                        <button 
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleRemoveImage(index); }} // Stop propagation to prevent editing when deleting
                                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs hover:bg-red-700 transition flex items-center justify-center font-bold"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* --- SEO & Metadata (Top Level) --- */}
                    <div className="section-heading">SEO & Metadata (Product Level)</div>
                    <div className="form-grid full-width">
                        
                        <div className="form-group">
                            <label htmlFor="seoKeywordsInput">SEO Keywords (Comma-separated)</label>
                            <textarea
                                id="seoKeywordsInput"
                                name="seoKeywordsInput"
                                value={formData.seoKeywordsInput}
                                onChange={handleInputChange}
                                placeholder="e.g., v-neck t-shirt, comfortable shirt, cotton wear"
                                rows="2"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="internalTagsInput">Internal Tags (Comma-separated)</label>
                            <textarea
                                id="internalTagsInput"
                                name="internalTagsInput"
                                value={formData.internalTagsInput}
                                onChange={handleInputChange}
                                placeholder="e.g., summer-collection, best-seller, clearance"
                                rows="2"
                            />
                        </div>
                    </div>
                    
                    {/* --- Submit Button --- */}
                    <div className="submit-container">
                        <button 
                            type="submit" 
                            className="btn-primary" 
                            disabled={loading || formData.productColors.length === 0}
                        >
                            {loading ? <div className="spinner"></div> : 'Submit'}
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