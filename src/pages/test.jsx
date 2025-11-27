import React, { useState, } from 'react'; 
// Removed useEffect import as it's no longer used for synchronization

// --- Static Data and Preprocessing ---

// Placeholder image URL
const PLACEHOLDER_IMAGE = "https://placehold.co/600x600/1f2937/ffffff?text=No+Image";

// Icon for 'In Stock' (Check Circle)
const CheckCircleIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
  </svg>
);

// Icon for 'Out of Stock' (X Circle)
const XCircleIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
  </svg>
);

// Icon for Back Arrow
const ArrowLeftIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
);

// Star Icon for Prime
const StarIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.31 6.91.5-5 4.88 1.18 6.88L12 18.06l-6.18 3.21 1.18-6.88-5-4.88 6.91-.5L12 2z"/></svg>
);


// User-provided raw product data (with translated content for UI consistency)
const rawProductData = [
    {
        "_id": { "$oid": "6922bc641a947eb599a030e2-A" },
        "name": "Premium T-Shirt (HK)",
        "brand": "Knkn Brand",
        "category": "Clothing & Apparel",
        "subCategory": "Daily Wear",
        "highlightHeading": "Ultra-soft fabric and comfortable fit.",
        "variations": [
            {
                "PV_id":"6922bc641a947eb599a030e3-A",
                "color": "#4640BF", // Blue (Non-Prime Color)
                "size": "M",
                "stock": 1,
                "sku": "jbjn-0-4640BF",
                "slug": "hk-4640bf",
                "productColors": [ { "hex": "#4640BF", "isPrime": false } ],
                "images": [ 
                    // Non-prime color variant has one prime image
                    { "url": "https://placehold.co/600x600/4640BF/ffffff?text=BLUE+PRIME+FRONT", "alt": "Blue Front View", "isPrimary": true, "isPrimeImage": true }, 
                    { "url": "https://placehold.co/600x600/4640BF/ffffff?text=BLUE+BACK", "alt": "Blue Back View", "isPrimary": false, "isPrimeImage": false },
                    { "url": "https://placehold.co/600x600/4640BF/ffffff?text=BLUE+SIDE", "alt": "Blue Side View", "isPrimary": false, "isPrimeImage": false },
                ],
                "specifications": [ { "key": "Material", "value": "Polycotton" } ],
                "price": [ { "mrp": 5767, "sellingPrice": 4959.62, "discountPercent": 14, "currency": "INR" } ],
                "isActive": true, "inStock": true,
                "description": { "story": "Best for daily use", "details": "Premium Stitching", "styleNote": "Casual" },
                "reviews": [], "productRatings": 0
            },
            {
                "PV_id":"6922bc641a947eb599a030e4-A",
                "color": "#4F46E5", // Violet (Prime Color)
                "size": "L",
                "stock": 0,
                "sku": "jbjn-1-4F46E5",
                "slug": "hk-4f46e5",
                "productColors": [ { "hex": "#4F46E5", "isPrime": true } ],
                "images": [ 
                    { "url": "https://placehold.co/600x600/4F46E5/ffffff?text=PRIME+VIOLET+A", "alt": "Prime Violet Front", "isPrimary": true, "isPrimeImage": true }, // Prime Color aur Prime Image
                    { "url": "https://placehold.co/600x600/4F46E5/ffffff?text=PRIME+VIOLET+B", "alt": "Prime Violet Back", "isPrimary": false, "isPrimeImage": false }
                ],
                "specifications": [ { "key": "Material", "value": "Polyester" } ],
                "price": [ { "mrp": 576, "sellingPrice": 541.44, "discountPercent": 6, "currency": "INR" } ],
                "isActive": true, "inStock": false,
                "description": { "story": "Premium Prime Edition", "details": "High Quality", "styleNote": "Trendy" },
                "reviews": [], "productRatings": 0
            }
        ],
        "vendorName": "Global Distributors Inc.", "returnPolicyDays": 7,
    },
    {
        "_id": { "$oid": "6922bc641a947eb599a030e2-B" },
        "name": "Fashion Sweatshirt",
        "brand": "Elite Collection",
        "category": "Clothing & Apparel",
        "subCategory": "Winter Wear",
        "highlightHeading": "Warm and stylish sweatshirt.",
        "variations": [
             {
                "PV_id":"6922bc641a947eb599a030e6-A",
                "color": "#10B981", // Green (Non-Prime Color)
                "size": "XL",
                "stock": 5,
                "sku": "SWEAT-0-10B981",
                "slug": "sweatshirt-10b981",
                "productColors": [ { "hex": "#10B981", "isPrime": false } ],
                "images": [ 
                    { "url": "https://placehold.co/600x600/10B981/ffffff?text=GREEN+FRONT", "alt": "Green Sweatshirt Front", "isPrimary": false, "isPrimeImage": false },
                    { "url": "https://placehold.co/600x600/10B981/ffffff?text=GREEN+TEXTURE+PRIME", "alt": "Green Sweatshirt Texture", "isPrimary": true, "isPrimeImage": true }, // Yahaan Prime Image hai
                ],
                "specifications": [ { "key": "Warmth", "value": "High" } ],
                "price": [ { "mrp": 3500, "sellingPrice": 3000, "discountPercent": 14, "currency": "INR" } ],
                "isActive": true, "inStock": true,
                "description": { "story": "Must-have for winters", "details": "Fleece inner lining", "styleNote": "Sporty" },
                "reviews": [], "productRatings": 0
            },
            {
                "PV_id":"6922bc641a947eb599a030e7-A",
                "color": "#EF4444", // Red (Prime Color)
                "size": "XXL",
                "stock": 10,
                "sku": "SWEAT-1-EF4444",
                "slug": "sweatshirt-ef4444",
                "productColors": [ { "hex": "#EF4444", "isPrime": true } ],
                "images": [ 
                    { "url": "https://placehold.co/600x600/EF4444/ffffff?text=PRIME+RED+MAIN", "alt": "Prime Red Sweatshirt Main", "isPrimary": true, "isPrimeImage": true }, 
                    { "url": "https://placehold.co/600x600/EF4444/ffffff?text=PRIME+RED+DETAIL", "alt": "Prime Red Sweatshirt Detail", "isPrimary": false, "isPrimeImage": false },
                    { "url": "https://placehold.co/600x600/EF4444/ffffff?text=PRIME+RED+FIT", "alt": "Prime Red Sweatshirt Fit", "isPrimary": false, "isPrimeImage": false },
                    { "url": "https://placehold.co/600x600/EF4444/ffffff?text=PRIME+RED+LOGO", "alt": "Prime Red Sweatshirt Logo", "isPrimary": false, "isPrimeImage": false }
                ],
                "specifications": [ { "key": "Warmth", "value": "Highest" } ],
                "price": [ { "mrp": 4000, "sellingPrice": 3800, "discountPercent": 5, "currency": "INR" } ],
                "isActive": true, "inStock": true,
                "description": { "story": "Perfect for festivities", "details": "Anti-pilling fabric", "styleNote": "Premium" },
                "reviews": [], "productRatings": 0
            }
        ],
        "vendorName": "Trend Makers Co.", "returnPolicyDays": 10,
    }
];

// Function to ensure all necessary fields are present in the provided data
const preprocessProductData = (raw) => {
    return raw.map(product => {
        const newVariations = product.variations.map(variant => {
            const newImages = variant.images.map(image => ({
                ...image,
                // CRITICAL: Ensure isPrimeImage exists, default to false if not present
                isPrimeImage: image.isPrimeImage || false
            }));
            // CRITICAL: Ensure productColors structure is an array of objects
            const productColors = Array.isArray(variant.productColors) ? variant.productColors : [];
            if (productColors.length === 0 && variant.color) {
                // If productColors is empty, create a default entry based on the main color
                productColors.push({ hex: variant.color, isPrime: false });
            }

            return { ...variant, images: newImages, productColors };
        });
        return { ...product, variations: newVariations };
    });
};

const productListData = preprocessProductData(rawProductData);

// Helper function to calculate average rating (assuming reviews array is passed)
const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return Math.round((total / reviews.length) * 10) / 10;
};

/**
 * Selects the best variation to display in the product list:
 * 1. Prioritizes the first available variation that contains a Prime Color (isPrime: true).
 * 2. Falls back to the default first variation if no Prime variant exists.
 */
const getDisplayVariant = (product) => {
    const primeVariant = product.variations.find(variation => 
        // Checks if ANY color in the productColors array is marked as isPrime (robust for array length > 1, but works for 1)
        (variation.productColors || []).some(color => color.isPrime)
    );
    
    // Return the prime variant if found, otherwise return the first variant
    return primeVariant || product.variations[0];
};

/**
 * Selects the best image object to display based on Prime status hierarchy, regardless of variant's prime status.
 * Priority: 1. isPrimeImage: true -> 2. isPrimary: true -> 3. images[0].
 * * @param {Array<Object>} images - The images array from the selected variation.
 * @returns {Object} The best image object.
 */
const getDisplayImage = (images) => {
    const fallbackImage = { url: PLACEHOLDER_IMAGE, alt: "Placeholder Image", isPrimeImage: false };
    if (!images || images.length === 0) return fallbackImage;

    // 1. ABSOLUTE PRIORITY: Look for the image explicitly marked as isPrimeImage: true 
    const primeImage = images.find(img => img.isPrimeImage);
    if (primeImage) return primeImage;
    
    // 2. Fallback to the standard primary image (isPrimary: true)
    const primaryImage = images.find(img => img.isPrimary);
    if (primaryImage) return primaryImage;

    // 3. Fallback to the first image in the array
    return images[0] || fallbackImage;
};

/**
 * Finds the index of the best image for a given image array, used for initialization and resetting.
 * @param {Array<Object>} images - The images array from the selected variation.
 * @returns {number} The index of the best image, or 0 if not found.
 */
const getBestImageIndex = (images) => {
    if (!images || images.length === 0) return 0;
    
    // Get the best image object
    const bestImage = getDisplayImage(images);

    // Find the index of that best image object
    const bestImageIndex = images.findIndex(img => img.url === bestImage.url);

    // Return the index, defaulting to 0 if not found (though getDisplayImage ensures a result if images is non-empty)
    return bestImageIndex !== -1 ? bestImageIndex : 0;
}


// --- Components ---

// Simple star rating display component
const StarRating = ({ rating, size = 'w-5 h-5' }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    const stars = [];
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars.push(<StarIcon key={`f${i}`} className={`${size} fill-current text-yellow-400`} />);
    }
    // Half star (Simplified to a full star for small sizes)
    if (hasHalfStar) {
        // Using a standard star icon here for simplicity in a small UI component
        stars.push(<StarIcon key="h" className={`${size} fill-current text-yellow-400`} />);
    }
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars.push(<svg key={`e${i}`} className={`${size} fill-current text-gray-300`} viewBox="0 0 24 24"><path d="M12 2l3.09 6.31 6.91.5-5 4.88 1.18 6.88L12 18.06l-6.18 3.21 1.18-6.88-5-4.88 6.91-.5L12 2zm0 4.14L9.91 9.3 6.09 9.59l2.84 2.77-.67 3.86L12 14.15l3.74 1.95-.67-3.86 2.84-2.77-3.82-.29L12 6.14z"/></svg>);
    }

    return <div className="flex items-center space-x-0.5">{stars}</div>;
};

// --- Full Product Detail Card Component (The dedicated page view) ---

const FullProductDetailCard = ({ product, onBackClick }) => {
    // Determine the index of the Prime variant to pre-select it when opening the detail view
    const primeVariantIndex = product.variations.findIndex(variation => 
        (variation.productColors || []).some(color => color.isPrime)
    );
    // Initial variant selection: Prioritize Prime Color, else default to first variant
    const initialVariantIndex = primeVariantIndex !== -1 ? primeVariantIndex : 0;
    
    // State 1: Which color/variant is selected
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(initialVariantIndex);

    // State 2: Which image in the current variant's array is displayed
    // Initial state calculation: Find the best image index for the initially selected variant
    const initialImages = product.variations[initialVariantIndex].images;
    const [currentImageIndex, setCurrentImageIndex] = useState(getBestImageIndex(initialImages));

    // Derived Value: Get the currently selected variant
    const selectedVariant = product.variations[selectedVariantIndex];

    const {
        inStock,
        stock,
        images, // Images of the selected variant
        description,
        price,
        specifications,
        productRatings,
        reviews 
    } = selectedVariant;

    const currentPrice = price[0];

    // Get the actual image being displayed
    const currentImage = images[currentImageIndex];
    
    const imageUrl = currentImage?.url && currentImage.url.length > 5 ? currentImage.url : PLACEHOLDER_IMAGE;
    const imageAlt = currentImage?.alt || product.name;

    const stockText = inStock ? `In Stock (${stock} unit${stock !== 1 ? 's' : ''})` : 'Out of Stock';

    /**
     * Handles variant selection (color change) and synchronizes image index reset.
     * This batches both state updates to prevent cascading renders.
     */
    const handleVariantClick = (index) => {
        if (index === selectedVariantIndex) return; // Prevent unnecessary clicks

        // 1. Get the target variant's data
        const targetVariant = product.variations[index];

        // 2. Calculate the *new* initial image index (Prime Image priority)
        const newBestImageIndex = getBestImageIndex(targetVariant.images);

        // 3. Batch the state updates: Change variant, and reset image index
        setSelectedVariantIndex(index);
        setCurrentImageIndex(newBestImageIndex); 
    };


    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans antialiased">
            <div className="max-w-6xl mx-auto">
                
                <div className="flex items-center mb-6">
                    <button
                        onClick={onBackClick}
                        className="flex items-center text-indigo-600 hover:text-indigo-800 transition duration-150 p-2 rounded-lg hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <ArrowLeftIcon className="w-5 h-5 mr-1"/>
                        <span className="font-semibold text-lg">Back to Catalog</span>
                    </button>
                    <h1 className="text-3xl font-extrabold text-gray-900 ml-4 hidden sm:block">{product.name}</h1>
                </div>


                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden p-6 lg:p-10">
                    <div className="lg:flex">

                        {/* Left Column: Product Image Section (Gallery) */}
                        <div className="lg:w-1/2 p-2 bg-gray-50 flex flex-col rounded-xl">
                            {/* Main Image */}
                            <div className="relative w-full aspect-square overflow-hidden rounded-xl shadow-xl flex-shrink-0">
                                <img
                                    src={imageUrl}
                                    alt={imageAlt}
                                    className="w-full h-full object-cover transition duration-300 ease-in-out"
                                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }}
                                />
                                <div className="absolute top-3 right-3 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
                                    {currentPrice.discountPercent}% OFF
                                </div>
                                
                                {/* Prime Image Tag (Clear Identification) */}
                                {currentImage?.isPrimeImage && (
                                     <span className="absolute top-3 left-3 px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full shadow-md">
                                        PRIME VIEW
                                     </span>
                                )}

                                {/* Image Number (Counter) */}
                                {images.length > 0 && (
                                    <span className="absolute bottom-3 left-3 bg-black bg-opacity-50 text-white text-sm font-medium px-3 py-1 rounded-full shadow-md">
                                        Image {currentImageIndex + 1} of {images.length}
                                    </span>
                                )}

                            </div>

                            {/* Image Thumbnails (Numbered) */}
                            {images.length > 0 && (
                                <div className="flex space-x-2 mt-4 overflow-x-auto justify-center p-1">
                                    {images.map((img, index) => {
                                        const thumbUrl = img.url.length > 5 ? img.url : PLACEHOLDER_IMAGE;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                aria-label={`View image ${index + 1}`}
                                                className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 relative transition-all duration-200 ${
                                                    index === currentImageIndex ? 'border-indigo-600 ring-2 ring-indigo-300 shadow-md' : 'border-gray-300 hover:border-indigo-400 opacity-80'
                                                }`}
                                            >
                                                <img
                                                    src={thumbUrl}
                                                    alt={`Thumbnail ${index + 1}: ${img.alt || product.name}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }}
                                                />
                                                {/* Image Number Label */}
                                                <span className="absolute bottom-0 left-0 bg-indigo-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-tr-lg">
                                                    {index + 1}
                                                </span>
                                                {/* Prime Star on Thumbnail if applicable */}
                                                {img.isPrimeImage && (
                                                    <span className="absolute top-0 right-0 text-yellow-400 leading-none p-0.5">
                                                        <StarIcon className="w-4 h-4 fill-current"/>
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        {/* End Product Image Section */}

                        {/* Right Column: Product Details Section */}
                        <div className="lg:w-1/2 lg:pl-10 mt-6 lg:mt-0 space-y-6">

                            {/* Header & Title (Mobile/Small Screen Only) */}
                            <div className="sm:hidden">
                                <h2 className="text-3xl font-extrabold text-gray-900">{product.name}</h2>
                            </div>
                            
                            {/* Brand and Category */}
                            <p className="text-lg text-gray-500">
                                Brand: <span className="font-medium text-gray-700">{product.brand}</span> | 
                                Category: <span className="font-medium text-gray-700">{product.subCategory}</span>
                            </p>
                            
                            {/* Rating and Reviews Summary */}
                            {reviews.length > 0 && (
                                <div className="flex items-center space-x-3">
                                    <StarRating rating={productRatings} />
                                    <span className="text-gray-600 text-sm font-medium">
                                        {productRatings.toFixed(1)} / 5.0 
                                        {` (${reviews.length} review${reviews.length !== 1 ? 's' : ''})`}
                                    </span>
                                </div>
                            )}
                            {reviews.length === 0 && (
                                <p className="text-sm text-gray-500">No reviews yet.</p>
                            )}

                            {/* Price Block */}
                            <div className="flex items-center space-x-4 border-b pb-4">
                                <span className="text-4xl font-extrabold text-gray-900">
                                    {currentPrice.currency}{new Intl.NumberFormat('en-IN').format(currentPrice.sellingPrice)}
                                </span>
                                {currentPrice.discountPercent > 0 && (
                                    <span className="text-xl text-gray-400 line-through">
                                        {currentPrice.currency}{new Intl.NumberFormat('en-IN').format(currentPrice.mrp)}
                                    </span>
                                )}
                                {/* Prime Status on Variant Level */}
                                {(selectedVariant.productColors || []).some(c => c.isPrime) && (
                                     <span className="inline-block px-2 py-0.5 bg-yellow-500 text-sm font-bold text-white rounded-full shadow-md ml-2 leading-none">
                                        PRIME
                                     </span>
                                )}
                            </div>

                            {/* Stock Status */}
                            <div className={`flex items-center space-x-2 text-lg font-medium ${inStock ? 'text-green-600' : 'text-red-600'}`}>
                                {inStock ? (
                                    <CheckCircleIcon className="w-6 h-6 fill-current"/>
                                ) : (
                                    <XCircleIcon className="w-6 h-6 fill-current"/>
                                )}
                                <span>{stockText}</span>
                                {selectedVariant.size && <span className="text-gray-500 ml-4">| Size: {selectedVariant.size}</span>}
                            </div>

                            {/* Variation Selector (Colors) */}
                            <div className="space-y-3 pt-2">
                                <h3 className="text-lg font-semibold text-gray-900">Select Color</h3>
                                <div className="flex space-x-4">
                                    {product.variations.map((variant, index) => {
                                        const isActive = index === selectedVariantIndex;
                                        // Check if this specific variant color is prime
                                        const isPrimeVariant = (variant.productColors || []).some(c => c.isPrime); 

                                        const buttonStyle = {
                                            backgroundColor: variant.color,
                                            borderWidth: '2px',
                                            borderColor: 'transparent',
                                            boxShadow: 'none',
                                            transition: 'all 0.2s',

                                            ...(isActive && {
                                                borderColor: 'white',
                                                boxShadow: `0 0 0 4px rgba(99, 102, 241, 0.75), 0 0 0 2px ${variant.color}`,
                                                transform: 'scale(1.1)',
                                            }),
                                            ...(!isActive && isPrimeVariant && {
                                                borderWidth: '2px',
                                                borderColor: '#FBBF24',
                                            }),
                                        };

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleVariantClick(index)}
                                                aria-label={`Select color ${variant.color}`}
                                                title={isPrimeVariant ? "Prime Color" : variant.color}
                                                className={`w-10 h-10 rounded-full relative transition-all duration-200 focus:outline-none focus:ring-4 ${isActive ? 'ring-indigo-500 ring-opacity-75 scale-110' : 'hover:scale-105 hover:ring-indigo-300'}`}
                                                style={buttonStyle}
                                            >
                                                {/* Star for Prime Color */}
                                                {isPrimeVariant && !isActive && <span className="absolute -top-1 -right-1 text-base text-yellow-500">⭐</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Description Details & Specifications */}
                            <div className="pt-4 border-t border-gray-100 space-y-6">
                                
                                {/* Full Description Section */}
                                <div className='space-y-3'>
                                    <h3 className="text-xl font-bold text-gray-900">Product Overview</h3>
                                    <p className="text-lg font-semibold text-indigo-700 italic border-b pb-3">
                                        {product.highlightHeading || description.story}
                                    </p>
                                    <p className="text-gray-600">{description.details}</p>
                                    <p className="text-sm text-gray-500 border-t pt-2">
                                        **Style Note:** {description.styleNote}
                                    </p>
                                </div>


                                {/* Dynamic Specifications List */}
                                {specifications && specifications.length > 0 && (
                                    <div className="space-y-2 p-4 bg-indigo-50 rounded-xl">
                                        <p className="text-base font-bold text-indigo-700">Key Specifications</p>
                                        <ul className="space-y-1 text-sm text-gray-600">
                                            {specifications.map((spec, index) => (
                                                <li key={index} className="text-sm flex justify-between border-b border-indigo-100 last:border-b-0 py-1">
                                                    <span className="font-medium text-gray-700 capitalize">{spec.key}:</span>
                                                    <span className="font-semibold text-gray-900">{spec.value}</span>
                                                </li>
                                            ))}
                                            <li className="text-sm flex justify-between border-b border-indigo-100 last:border-b-0 py-1">
                                                <span className="font-medium text-gray-700">Provider:</span>
                                                <span className="font-semibold text-gray-900">{product.vendorName}</span>
                                            </li>
                                            <li className="text-sm flex justify-between border-b border-indigo-100 last:border-b-0 py-1">
                                                <span className="font-medium text-gray-700">Return Policy:</span>
                                                <span className="font-semibold text-gray-900">{product.returnPolicyDays} Days</span>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Action Button */}
                            <div className='pt-2'>
                                <button
                                    disabled={!inStock}
                                    className={`w-full py-4 rounded-xl text-white font-bold text-xl transition duration-300 ${inStock
                                        ? 'bg-indigo-600 hover:bg-indigo-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5'
                                        : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {inStock ? 'Add to Cart' : 'Currently Out of Stock'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* --- Customer Reviews Section (Full Width) --- */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
                            Customer Reviews ({reviews.length})
                        </h2>
                        {/* Note: ReviewList component is omitted for brevity but would go here */}
                         <div className="text-center p-6 bg-gray-50 rounded-xl text-gray-500 italic">
                            Review listing feature would appear here.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Product List Item Component (Clickable Row) ---

const ProductListItem = ({ product, onSelectProduct }) => {
  // 1. Select the Prime Variation (or default first)
  const displayVariant = getDisplayVariant(product);
  
  // 2. Check if this Variation is Prime (Color isPrime)
  const isVariantPrime = (displayVariant.productColors || []).some(color => color.isPrime);

  // 3. Select the best (PrimeImage/Primary) Image for this Variant using the updated logic
  const displayImage = getDisplayImage(displayVariant.images);

  // 4. Calculate the index/number of the displayed image for the Catalog view
  // Find the index of the image that was selected by getDisplayImage
  const displayImageIndex = displayVariant.images.findIndex(img => img.url === displayImage.url);
  const imageNumber = displayImageIndex !== -1 ? displayImageIndex + 1 : 1;

  // 5. Extract other data
  const currentPrice = displayVariant.price[0];
  const averageRating = calculateAverageRating(displayVariant.reviews);

  const imageUrl = displayImage.url.length > 5 ? displayImage.url : PLACEHOLDER_IMAGE;
  const imageAlt = displayImage.alt || product.name;

  return (
    <div
      className="w-full bg-white rounded-xl shadow-lg border border-gray-200 mb-4 overflow-hidden transition-all duration-300 hover:shadow-xl hover:ring-2 hover:ring-indigo-300 cursor-pointer"
      onClick={() => onSelectProduct(product)}
    >

      <div className="flex p-4 items-center justify-between">

        {/* Left: Image, Name, Brand, Rating */}
        <div className="flex items-center space-x-4 flex-grow min-w-0">
          <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100 shadow-sm relative">
            <img
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }}
            />
            {/* Catalog Image Number */}
            <span className="absolute bottom-0 left-0 bg-indigo-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-tr-lg">
                {imageNumber}
            </span>

            {/* Catalog Prime Star Status */}
            {displayImage.isPrimeImage && (
                 <span className="absolute top-0 right-0 text-yellow-500 bg-white rounded-bl-lg leading-none p-0.5">
                    <StarIcon className="w-4 h-4 fill-current text-yellow-400" />
                 </span>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{product.name}</h2>
            <p className="text-sm text-gray-500">{product.brand} | {product.subCategory}</p>
            {displayVariant.reviews.length > 0 && (
                <div className='mt-1'>
                    <StarRating rating={averageRating} size="w-4 h-4" />
                </div>
            )}
            {/* Show Prime info if variant is prime */}
            {isVariantPrime && (
                 <p className="text-xs font-semibold text-yellow-600 mt-0.5">Prime Edition</p>
            )}
          </div>
        </div>

        {/* Right: Price, Discount, Arrow */}
        <div className="flex items-center space-x-6 flex-shrink-0">
            <div className="text-right">
                <span className="text-2xl font-extrabold text-indigo-600">
                    {currentPrice.currency}{new Intl.NumberFormat('en-IN').format(currentPrice.sellingPrice)}
                </span>
                <div className="text-sm text-gray-500 mt-0.5">
                    <span className="line-through mr-1">{currentPrice.currency}{new Intl.NumberFormat('en-IN').format(currentPrice.mrp)}</span>
                    <span className="text-red-500 font-bold">({currentPrice.discountPercent}% OFF)</span>
                </div>
            </div>

            <ArrowLeftIcon className="w-5 h-5 rotate-180 text-gray-400" />
        </div>
      </div>
    </div>
  );
};


// --- Main Application Component ---

const Test = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleSelectProduct = (product) => {

    setSelectedProduct(product);
    
  };

  const handleBackToList = () => {
    setSelectedProduct(null);
  };

  if (selectedProduct) {
    return (
        <FullProductDetailCard 
            product={selectedProduct} 
            onBackClick={handleBackToList} 
        />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans antialiased">
      <header className="max-w-4xl mx-auto mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Product Catalog (Custom Data)</h1>
        <p className="text-gray-600 mt-1">Listing based on Prime Variation priority.</p>
      </header>

      {/* Product List Container */}
      <div className="max-w-4xl mx-auto">
        {productListData.map((product) => (
          <ProductListItem
            key={product._id.$oid}
            product={product}
            onSelectProduct={handleSelectProduct}
          />
        ))}

        {productListData.length === 0 && (
             <div className="text-center p-10 bg-white rounded-xl shadow-md text-gray-500">
                No products found in the catalog.
             </div>
        )}
      </div>
    </div>
  );
};

export default Test;