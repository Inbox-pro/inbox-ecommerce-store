import React, { useState, useEffect } from 'react';
import { Product, ProductReview } from '../types';
import { RatingStars } from '../components/common/RatingStars';
import { ProductCard } from '../components/product/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { productService } from '../services/productService';
import {
  ShoppingCart,
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ChevronRight,
  MapPin,
  Star,
  ThumbsUp,
  Award,
} from 'lucide-react';

interface ProductDetailsProps {
  productId: string;
  allProducts: Product[];
  onSelectProduct: (id: string) => void;
  onQuickView: (product: Product) => void;
  onNavigate: (tab: string, param?: string) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  productId,
  allProducts,
  onSelectProduct,
  onQuickView,
  onNavigate,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  // Pincode delivery check simulation
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  // New review form
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);

  // Fetch product and its dynamic reviews
  useEffect(() => {
    productService.getProductById(productId).then((found) => {
      if (found) {
        setProduct(found);
        setSelectedImageIndex(0);
        setQuantity(1);
        if (found.colors && found.colors.length > 0) setSelectedColor(found.colors[0]);
        if (found.sizes && found.sizes.length > 0) setSelectedSize(found.sizes[0]);
      }
    });
    productService.getReviewsForProduct(productId).then((revs) => {
      setReviews(revs);
    });
  }, [productId]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product not found</h2>
        <button
          onClick={() => onNavigate('products')}
          className="mt-4 px-6 py-2.5 bg-[#E84A27] text-white rounded-xl text-xs font-bold"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    showToast(`Added ${quantity}x "${product.name}" to cart!`, { type: 'success' });
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    onNavigate('checkout');
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim() || pincode.length < 5) {
      setPincodeStatus('Please enter a valid 5-6 digit postal code.');
      return;
    }
    // Simulate express availability
    setPincodeStatus('Available! Standard Delivery by tomorrow, 6:00 PM with BlueDart Express.');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    await productService.addReview(product.id, {
      userName: newReviewAuthor.trim(),
      rating: newReviewRating,
      title: 'Customer Review',
      comment: newReviewComment.trim(),
    });

    const updated = await productService.getProductById(product.id);
    if (updated) setProduct(updated);

    const updatedReviews = await productService.getReviewsForProduct(product.id);
    setReviews(updatedReviews);

    showToast('Review submitted successfully! Thank you.', { type: 'success' });
    setNewReviewAuthor('');
    setNewReviewComment('');
    setShowReviewForm(false);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!', { type: 'info' });
    }
  };

  // Related products from same category
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6 flex-wrap">
        <button onClick={() => onNavigate('home')} className="hover:text-slate-700">Home</button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => onNavigate('products', product.category)} className="hover:text-slate-700">
          {product.category}
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-800 line-clamp-1">{product.name}</span>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs">
        {/* Left Column: Image Gallery (Cols 1-6) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Main Large Showcase Image */}
          <div className="relative aspect-square w-full rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden group">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {product.discount > 0 && (
                <span className="px-3 py-1 rounded-full bg-[#E84A27] text-white text-xs font-black uppercase shadow-md">
                  {product.discount}% OFF
                </span>
              )}
              {product.isBestSeller && (
                <span className="px-3 py-1 rounded-full bg-slate-900 text-amber-300 text-xs font-bold uppercase shadow-sm">
                  ★ Best Seller
                </span>
              )}
            </div>

            {/* Wishlist and Share Floating Buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-2.5 rounded-full backdrop-blur-md shadow-md transition-all ${
                  inWishlist
                    ? 'bg-rose-500 text-white'
                    : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white'
                }`}
                title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white/90 text-slate-600 hover:text-slate-900 hover:bg-white backdrop-blur-md shadow-md transition-all"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-[#E84A27] shadow-sm ring-2 ring-orange-100'
                      : 'border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information & Buy Actions (Cols 7-12) */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            {/* Brand & Stock Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                {product.brand}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                  product.stock > 0
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              {product.name}
            </h1>

            {/* Ratings & Reviews summary */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span className="text-xs font-black text-amber-900">{product.rating}</span>
              </div>
              <span className="text-xs text-slate-500">
                ({product.reviewCount} customer reviews)
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine
              </span>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-base text-slate-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Save ${(product.originalPrice - product.price).toFixed(2)} ({product.discount}%)
                  </span>
                </>
              )}
            </div>

            {/* Short Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Variant Selectors: Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-800 block mb-2">
                  Select Color: <span className="text-orange-600 font-medium">{selectedColor}</span>
                </label>
                <div className="flex items-center gap-2">
                  {product.colors.map((c: string) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        selectedColor === c
                          ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Variant Selectors: Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-800 block mb-2">
                  Select Size: <span className="text-orange-600 font-medium">{selectedSize}</span>
                </label>
                <div className="flex items-center gap-2">
                  {product.sizes.map((s: string) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-10 h-10 text-xs font-bold rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                        selectedSize === s
                          ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Quantity Counter */}
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1 shrink-0 justify-between sm:justify-start">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-white shadow-xs text-slate-700 hover:bg-slate-100 disabled:opacity-40 font-bold text-sm cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-xs text-slate-900">
                  {quantity}
                </span>
                <button
                  disabled={quantity >= product.stock}
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-8 h-8 rounded-lg bg-white shadow-xs text-slate-700 hover:bg-slate-100 disabled:opacity-40 font-bold text-sm cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                disabled={product.stock <= 0}
                onClick={handleAddToCart}
                className="flex-1 py-3 px-5 rounded-xl bg-[#E84A27] hover:bg-[#d63f1f] text-white font-extrabold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              {/* Buy Now */}
              <button
                disabled={product.stock <= 0}
                onClick={handleBuyNow}
                className="py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Buy Now</span>
              </button>
            </div>

            {/* Pincode / Delivery Estimator */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                Delivery Availability Check
              </label>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter postal pincode (e.g. 110001)"
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-orange-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Check
                </button>
              </form>
              {pincodeStatus && (
                <p className="text-[11px] font-semibold text-emerald-700 mt-2 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  {pincodeStatus}
                </p>
              )}
            </div>

            {/* Guarantees row */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
              <div className="flex flex-col items-center">
                <Truck className="w-4 h-4 text-orange-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-700">Free Shipping</span>
                <span className="text-[9px] text-slate-400">On all orders &gt; $50</span>
              </div>
              <div className="flex flex-col items-center">
                <RotateCcw className="w-4 h-4 text-orange-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-700">30-Day Returns</span>
                <span className="text-[9px] text-slate-400">Instant full refund</span>
              </div>
              <div className="flex flex-col items-center">
                <Award className="w-4 h-4 text-orange-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-700">1-Yr Warranty</span>
                <span className="text-[9px] text-slate-400">Brand supported</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Description, Specifications, Reviews */}
      <div className="mt-10 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        {/* Tab Headers */}
        <div className="flex items-center gap-6 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab('desc')}
            className={`text-xs font-bold pb-2 transition-colors relative cursor-pointer ${
              activeTab === 'desc'
                ? 'text-[#E84A27]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Product Overview
            {activeTab === 'desc' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E84A27]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`text-xs font-bold pb-2 transition-colors relative cursor-pointer ${
              activeTab === 'specs'
                ? 'text-[#E84A27]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Specifications
            {activeTab === 'specs' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E84A27]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`text-xs font-bold pb-2 transition-colors relative cursor-pointer ${
              activeTab === 'reviews'
                ? 'text-[#E84A27]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Customer Reviews ({reviews.length})
            {activeTab === 'reviews' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E84A27]" />
            )}
          </button>
        </div>

        {/* Tab Body */}
        <div className="pt-6 text-xs sm:text-sm text-slate-700">
          {activeTab === 'desc' && (
            <div className="flex flex-col gap-4 max-w-3xl leading-relaxed">
              <p>{product.description}</p>
              <p>
                Engineered with highest standards by <strong>{product.brand}</strong>, this unit
                undergoes rigorous automated quality assurance tests before dispatch.
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <Award className="w-5 h-5 text-orange-600 shrink-0" />
                <span className="text-xs text-slate-600">
                  Includes full manufacturer box accessories, original warranty paperwork, and quick-start user guide.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-2xl">
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {Object.entries(product.specifications).map(([key, val], idx) => (
                    <div
                      key={key}
                      className={`grid grid-cols-2 p-3 text-xs ${
                        idx % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'
                      }`}
                    >
                      <span className="font-bold text-slate-700">{key}</span>
                      <span className="text-slate-600">{String(val)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No extra specifications listed for this product.</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="flex flex-col gap-6">
              {/* Review summary & Add Review toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Average Rating: {product.rating} / 5.0
                  </h3>
                  <p className="text-xs text-slate-400">
                    Based on {reviews.length} verified reviews
                  </p>
                </div>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                </button>
              </div>

              {/* Add Review Form */}
              {showReviewForm && (
                <form
                  onSubmit={handleSubmitReview}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3"
                >
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Submit Your Review
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-600 block mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={newReviewAuthor}
                        onChange={(e) => setNewReviewAuthor(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 block mb-1">Rating (1 to 5)</label>
                      <select
                        value={newReviewRating}
                        onChange={(e) => setNewReviewRating(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-orange-500 cursor-pointer"
                      >
                        <option value={5}>5 Stars - Excellent</option>
                        <option value={4}>4 Stars - Good</option>
                        <option value={3}>3 Stars - Average</option>
                        <option value={2}>2 Stars - Poor</option>
                        <option value={1}>1 Star - Terrible</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Your Feedback</label>
                    <textarea
                      rows={3}
                      required
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      placeholder="Share your experience with this item..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-fit px-5 py-2 rounded-xl bg-[#E84A27] text-white text-xs font-bold shadow-xs hover:bg-[#d43f1f] cursor-pointer"
                  >
                    Post Review
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="flex flex-col gap-4">
                {reviews.length > 0 ? (
                  reviews.map((rev: ProductReview) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{rev.userName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {rev.date}
                          </span>
                        </div>
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'fill-current' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">
                    No reviews yet. Be the first to share your thoughts!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Carousel / Grid */}
      {relatedProducts.length > 0 && (
        <div className="mt-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Explore More In {product.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                Related Recommendations
              </h2>
            </div>
            <button
              onClick={() => onNavigate('products', product.category)}
              className="text-xs font-bold text-orange-600 hover:text-orange-700"
            >
              View More →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelectProduct={onSelectProduct}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
