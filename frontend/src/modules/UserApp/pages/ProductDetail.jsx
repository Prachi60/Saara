import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiStar,
  FiHeart,
  FiShoppingBag,
  FiMinus,
  FiPlus,
  FiArrowLeft,
  FiShare2,
  FiCheckCircle,
  FiTrash2,
  FiChevronRight,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useCartStore, useUIStore } from "../../../shared/store/useStore";
import { useWishlistStore } from "../../../shared/store/wishlistStore";
import { useReviewsStore } from "../../../shared/store/reviewsStore";
import { useOrderStore } from "../../../shared/store/orderStore";
import { useAuthStore } from "../../../shared/store/authStore";
import {
  getProductById,
  getSimilarProducts,
  getVendorById,
  getBrandById,
} from "../data/catalogData";
import api from "../../../shared/utils/api";
import { formatPrice } from "../../../shared/utils/helpers";
import toast from "react-hot-toast";
import MobileLayout from "../components/Layout/MobileLayout";
import ImageGallery from "../../../shared/components/Product/ImageGallery";
import VariantSelector from "../../../shared/components/Product/VariantSelector";
import ReviewForm from "../../../shared/components/Product/ReviewForm";
import MobileProductCard from "../components/Mobile/MobileProductCard";
import PageTransition from "../../../shared/components/PageTransition";
import Badge from "../../../shared/components/Badge";
import ProductCard from "../../../shared/components/ProductCard";
import { getVariantSignature } from "../../../shared/utils/variant";
import AffiliateBadge from "../../Affiliate/components/AffiliateBadge";

const FlipkartCompactCard = ({ product }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/product/${product.id}`)}
      className="min-w-[140px] w-[140px] bg-white rounded-xl border border-gray-100 overflow-hidden shrink-0 active:scale-95 transition-transform"
    >
      <div className="relative h-[140px] bg-gray-50 flex items-center justify-center">
        <button className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm z-10">
          <FiHeart className="text-xs text-gray-400" />
        </button>
        <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
      </div>
      
      <div className="p-2 space-y-1">
        <div className="inline-block bg-blue-50 text-blue-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
          BESTSELLER
        </div>
        <div>
          <div className="text-[10px] font-bold text-gray-400 uppercase leading-none">{product.brandName || "Brand"}</div>
          <div className="text-[11px] font-bold text-gray-800 line-clamp-1 leading-tight">{product.name}</div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs font-black text-gray-900">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <>
              <span className="text-[9px] text-gray-400 line-through font-medium">{formatPrice(product.originalPrice)}</span>
              <span className="text-[9px] text-green-600 font-bold">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% Off
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 pt-0.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <FiStar 
                key={i} 
                className={`text-[9px] ${i < Math.floor(product.rating || 4.5) ? 'text-gray-500 fill-gray-500' : 'text-gray-200'}`} 
              />
            ))}
          </div>
          <span className="text-[9px] text-gray-400 font-bold">({product.reviewCount || "47"})</span>
        </div>
      </div>
    </div>
  );
};

const resolveVariantPrice = (product, selectedVariant) => {
  const basePrice = Number(product?.price) || 0;
  if (!selectedVariant || !product?.variants?.prices) return basePrice;

  const entries =
    product.variants.prices instanceof Map
      ? Array.from(product.variants.prices.entries())
      : Object.entries(product.variants.prices || {});
  const dynamicKey = getVariantSignature(selectedVariant || {});
  if (dynamicKey) {
    const direct = entries.find(([key]) => String(key).trim() === dynamicKey);
    if (direct) {
      const parsed = Number(direct[1]);
      if (Number.isFinite(parsed) && parsed >= 0) return parsed;
    }
    const normalized = entries.find(
      ([key]) => String(key).trim().toLowerCase() === dynamicKey.toLowerCase()
    );
    if (normalized) {
      const parsed = Number(normalized[1]);
      if (Number.isFinite(parsed) && parsed >= 0) return parsed;
    }
  }

  const size = String(selectedVariant.size || "").trim().toLowerCase();
  const color = String(selectedVariant.color || "").trim().toLowerCase();

  const candidates = [
    `${size}|${color}`,
    `${size}-${color}`,
    `${size}_${color}`,
    `${size}:${color}`,
    size && !color ? size : null,
    color && !size ? color : null,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const exact = entries.find(([key]) => String(key).trim() === candidate);
    if (exact) {
      const parsed = Number(exact[1]);
      if (Number.isFinite(parsed) && parsed >= 0) return parsed;
    }
    const normalized = entries.find(
      ([key]) => String(key).trim().toLowerCase() === candidate
    );
    if (normalized) {
      const parsed = Number(normalized[1]);
      if (Number.isFinite(parsed) && parsed >= 0) return parsed;
    }
  }

  return basePrice;
};

const isMongoId = (value) => /^[a-fA-F0-9]{24}$/.test(String(value || ""));
const normalizeProduct = (raw) => {
  if (!raw) return null;

  const vendorObj =
    raw?.vendor && typeof raw.vendor === "object"
      ? raw.vendor
      : raw?.vendorId && typeof raw.vendorId === "object"
        ? raw.vendorId
        : null;
  const brandObj =
    raw?.brand && typeof raw.brand === "object"
      ? raw.brand
      : raw?.brandId && typeof raw.brandId === "object"
        ? raw.brandId
        : null;
  const categoryObj =
    raw?.category && typeof raw.category === "object"
      ? raw.category
      : raw?.categoryId && typeof raw.categoryId === "object"
        ? raw.categoryId
        : null;

  const id = String(raw?.id || raw?._id || "").trim();
  if (!id) return null;

  const vendorId = String(vendorObj?._id || vendorObj?.id || raw?.vendorId || "").trim();
  const brandId = String(brandObj?._id || brandObj?.id || raw?.brandId || "").trim();
  const categoryId = String(categoryObj?._id || categoryObj?.id || raw?.categoryId || "").trim();
  const image = raw?.image || raw?.images?.[0] || "";
  const images = Array.isArray(raw?.images) ? raw.images.filter(Boolean) : image ? [image] : [];

  return {
    ...raw,
    id,
    _id: id,
    vendorId,
    brandId,
    categoryId,
    image,
    images,
    price: Number(raw?.price) || 0,
    originalPrice:
      raw?.originalPrice !== undefined && raw?.originalPrice !== null
        ? Number(raw.originalPrice)
        : undefined,
    rating: Number(raw?.rating) || 0,
    reviewCount: Number(raw?.reviewCount) || 0,
    stockQuantity: Number(raw?.stockQuantity) || 0,
    vendorName: raw?.vendorName || vendorObj?.storeName || vendorObj?.name || "",
    brandName: raw?.brandName || brandObj?.name || "",
    categoryName: raw?.categoryName || categoryObj?.name || "",
    vendor: vendorObj
      ? {
        ...vendorObj,
        id: String(vendorObj?.id || vendorObj?._id || vendorId),
      }
      : null,
    brand: brandObj
      ? {
        ...brandObj,
        id: String(brandObj?.id || brandObj?._id || brandId),
      }
      : null,
    stock:
      raw?.stock ||
      (Number(raw?.stockQuantity) > 0 ? "in_stock" : "out_of_stock"),
    description: String(raw?.description || "").trim(),
  };
};

const MobileProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const localFallbackProduct = useMemo(() => normalizeProduct(getProductById(id)), [id]);
  const [product, setProduct] = useState(localFallbackProduct);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeTab, setActiveTab] = useState("Description");
  const [isExpanded, setIsExpanded] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const { items, addItem, removeItem } = useCartStore();
  const triggerCartAnimation = useUIStore(
    (state) => state.triggerCartAnimation
  );
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();
  const { fetchReviews, sortReviews, addReview } = useReviewsStore();
  const { getAllOrders } = useOrderStore();
  const { user, isAuthenticated } = useAuthStore();
  const vendor = useMemo(() => {
    if (!product) return null;
    if (product.vendor?.id) return product.vendor;
    return getVendorById(product.vendorId);
  }, [product]);
  const brand = useMemo(() => {
    if (!product) return null;
    if (product.brand?.id) return product.brand;
    return getBrandById(product.brandId);
  }, [product]);

  const isFavorite = product ? isInWishlist(product.id) : false;
  const selectedVariantSignature = getVariantSignature(selectedVariant || {});
  const isInCart = product
    ? items.some(
      (item) =>
        String(item.id) === String(product.id) &&
        getVariantSignature(item.variant || {}) === selectedVariantSignature
    )
    : false;
  const productReviews = product ? sortReviews(product.id, "newest") : [];

  useEffect(() => {
    let active = true;
    setIsLoadingProduct(true);

    const loadProductDetail = async () => {
      try {
        const [detailRes, similarRes] = await Promise.allSettled([
          api.get(`/products/${id}`),
          api.get(`/similar/${id}`),
        ]);

        const detailPayload =
          detailRes.status === "fulfilled"
            ? detailRes.value?.data ?? detailRes.value
            : null;
        const resolvedProduct = normalizeProduct(detailPayload) || localFallbackProduct;

        const similarPayload =
          similarRes.status === "fulfilled"
            ? similarRes.value?.data ?? similarRes.value
            : null;
        const resolvedSimilar = Array.isArray(similarPayload)
          ? similarPayload
            .map(normalizeProduct)
            .filter(
              (item) => item?.id && String(item.id) !== String(resolvedProduct?.id || "")
            )
            .slice(0, 5)
          : [];

        if (!active) return;

        setProduct(resolvedProduct);
        if (resolvedSimilar.length > 0) {
          setSimilarProducts(resolvedSimilar);
        } else if (resolvedProduct?.id) {
          setSimilarProducts(getSimilarProducts(resolvedProduct.id, 5));
        } else {
          setSimilarProducts([]);
        }
      } catch {
        if (!active) return;
        setProduct(localFallbackProduct);
        setSimilarProducts(
          localFallbackProduct?.id ? getSimilarProducts(localFallbackProduct.id, 5) : []
        );
      } finally {
        if (active) setIsLoadingProduct(false);
      }
    };

    loadProductDetail();
    return () => {
      active = false;
    };
  }, [id, localFallbackProduct]);

  useEffect(() => {
    if (product?.variants?.defaultSelection && typeof product.variants.defaultSelection === "object") {
      setSelectedVariant(product.variants.defaultSelection);
      return;
    }
    if (product?.variants?.defaultVariant) {
      setSelectedVariant(product.variants.defaultVariant);
      return;
    }
    setSelectedVariant({});
  }, [product]);

  useEffect(() => {
    setIsExpanded(false);
  }, [activeTab]);

  useEffect(() => {
    if (product?.id) {
      fetchReviews(product.id, { sort: "newest", limit: 50 });
    }
  }, [product?.id, fetchReviews]);

  if (!product) {
    return (
      <PageTransition>
        <MobileLayout showBottomNav={false} showCartBar={false}>
          <div className="flex items-center justify-center min-h-[60vh] px-4">
            <div className="text-center">
              {isLoadingProduct ? (
                <h2 className="text-xl font-bold text-gray-800 mb-4">Loading product...</h2>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Product Not Found
                  </h2>
                  <button
                    onClick={() => navigate("/home")}
                    className="gradient-green text-white px-6 py-3 rounded-xl font-semibold">
                    Go Back Home
                  </button>
                </>
              )}
            </div>
          </div>
        </MobileLayout>
      </PageTransition>
    );
  }

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock === "out_of_stock") {
      toast.error("Product is out of stock");
      return;
    }
    const attributeAxes = Array.isArray(product?.variants?.attributes)
      ? product.variants.attributes.filter((attr) => Array.isArray(attr?.values) && attr.values.length > 0)
      : [];
    const hasDynamicAxes = attributeAxes.length > 0;
    const hasSizeVariants = Array.isArray(product?.variants?.sizes) && product.variants.sizes.length > 0;
    const hasColorVariants = Array.isArray(product?.variants?.colors) && product.variants.colors.length > 0;
    const isMissingDynamicAxis = hasDynamicAxes
      ? attributeAxes.some((attr) => !String(selectedVariant?.[attr.name] || selectedVariant?.[String(attr.name || "").toLowerCase().replace(/\s+/g, "_")] || "").trim())
      : false;
    const selectedSize = String(selectedVariant?.size || "").trim();
    const selectedColor = String(selectedVariant?.color || "").trim();
    if (isMissingDynamicAxis || ((hasSizeVariants && !selectedSize) || (hasColorVariants && !selectedColor))) {
      toast.error("Please select required variant options");
      return;
    }

    const finalPrice = resolveVariantPrice(product, selectedVariant);
    const variantKey = getVariantSignature(selectedVariant || {});
    const variantStockValue = Number(
      product?.variants?.stockMap?.[variantKey] ??
      product?.variants?.stockMap?.get?.(variantKey)
    );
    const effectiveStock = Number.isFinite(variantStockValue)
      ? variantStockValue
      : Number(product.stockQuantity || 0);
    if (effectiveStock <= 0) {
      toast.error("Selected variant is out of stock");
      return;
    }
    if (quantity > effectiveStock) {
      toast.error(`Only ${effectiveStock} item(s) available for selected variant`);
      return;
    }

    const addedToCart = addItem({
      id: product.id,
      name: product.name,
      price: finalPrice,
      originalPrice: product.originalPrice,
      image: product.image,
      quantity: quantity,
      variant: selectedVariant,
      stockQuantity: effectiveStock,
      vendorId: product.vendorId,
      vendorName: vendor?.storeName || vendor?.name || product.vendorName,
    });
    if (!addedToCart) return;
    triggerCartAnimation();
    toast.success("Added to cart!");
  };

  const handleRemoveFromCart = () => {
    if (!product) return;
    removeItem(product.id, selectedVariant || {});
    toast.success("Removed from cart!");
  };

  const handleBuyNow = () => {
    if (!product) return;
    handleAddToCart();
    navigate("/cart");
  };

  const handleFavorite = () => {
    if (!product) return;
    if (isFavorite) {
      removeFromWishlist(product.id);
      toast.success("Removed from wishlist");
    } else {
      const addedToWishlist = addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
      if (addedToWishlist) {
        toast.success("Added to wishlist");
      }
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    const variantKey = getVariantSignature(selectedVariant || {});
    const variantStockValue = Number(
      product?.variants?.stockMap?.[variantKey] ??
      product?.variants?.stockMap?.get?.(variantKey)
    );
    const maxStock = Number.isFinite(variantStockValue)
      ? Math.max(0, variantStockValue)
      : Number(product?.stockQuantity || 0);
    if (newQuantity >= 1 && newQuantity <= (maxStock || 10)) {
      setQuantity(newQuantity);
    }
  };

  const productImages = useMemo(() => {
    if (!product) return [];
    const selectedVariantKey = getVariantSignature(selectedVariant || {});
    const variantImage = String(
      product?.variants?.imageMap?.[selectedVariantKey] ||
      product?.variants?.imageMap?.get?.(selectedVariantKey) ||
      ""
    ).trim();
    const images =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images.filter(Boolean)
        : product.image
          ? [product.image]
          : [];
    if (variantImage) {
      return [variantImage, ...images.filter((img) => img !== variantImage)];
    }
    return images;
  }, [product, selectedVariant]);

  const currentPrice = useMemo(() => {
    return resolveVariantPrice(product, selectedVariant);
  }, [product, selectedVariant]);

  const selectedAvailableStock = useMemo(() => {
    const variantKey = getVariantSignature(selectedVariant || {});
    const variantStockValue = Number(
      product?.variants?.stockMap?.[variantKey] ??
      product?.variants?.stockMap?.get?.(variantKey)
    );
    if (Number.isFinite(variantStockValue)) {
      return Math.max(0, variantStockValue);
    }
    return Number(product?.stockQuantity || 0);
  }, [product, selectedVariant]);

  const productFaqs = useMemo(() => {
    if (!Array.isArray(product?.faqs)) return [];
    return product.faqs
      .map((faq) => ({
        question: String(faq?.question || "").trim(),
        answer: String(faq?.answer || "").trim(),
      }))
      .filter((faq) => faq.question && faq.answer);
  }, [product?.faqs]);

  const eligibleDeliveredOrderId = useMemo(() => {
    if (!isAuthenticated || !user?.id || !isMongoId(product?.id)) return null;
    const userOrders = getAllOrders(user.id) || [];
    const eligibleOrder = userOrders.find((order) => {
      if (String(order?.status || "").toLowerCase() !== "delivered") return false;
      const items = Array.isArray(order?.items) ? order.items : [];
      return items.some(
        (item) => String(item?.productId || item?.id || "") === String(product.id)
      );
    });
    return eligibleOrder?._id || null;
  }, [isAuthenticated, user?.id, product?.id, getAllOrders]);

  const handleSubmitReview = async (reviewData) => {
    if (!eligibleDeliveredOrderId) {
      toast.error("You can review only after this product is delivered");
      return false;
    }

    const ok = await addReview(product.id, {
      ...reviewData,
      orderId: eligibleDeliveredOrderId,
    });
    if (!ok) {
      toast.error("Unable to submit review");
      return false;
    }

    await fetchReviews(product.id, { sort: "newest", limit: 50 });
    return true;
  };

  const productFeatures = useMemo(() => {
    if (Array.isArray(product?.features) && product.features.length > 0) return product.features;
    // Professional fallback features to satisfy UI requirements
    return [
      { id: 1, label: "Premium Build", desc: "Expertly crafted using high-grade, durable materials." },
      { id: 2, label: "Modern Design", desc: "Sleek and minimalist aesthetic that suits any style." },
      { id: 3, label: "Quality Tested", desc: "Undergoes rigorous inspection for maximum reliability." },
      { id: 4, label: "Skin Friendly", desc: "Hypoallergenic components designed for daily comfort." }
    ];
  }, [product]);

  return (
    <>
      <PageTransition>
        <MobileLayout showBottomNav={false} showCartBar={false} showHeader={false}>
          <div className="w-full min-h-screen bg-gray-50 flex flex-col pb-24">
            {/* Mobile Overlay Header */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4 lg:hidden pointer-events-none">
              <button
                onClick={() => navigate(-1)}
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg pointer-events-auto"
              >
                <FiArrowLeft className="text-2xl text-gray-500" />
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: product.name,
                        text: `Check out ${product.name}`,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copied to clipboard");
                    }
                  }}
                  className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg pointer-events-auto"
                >
                  <FiShare2 className="text-2xl text-gray-500" />
                </button>
                <button
                  onClick={handleFavorite}
                  className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg pointer-events-auto"
                >
                  <FiHeart className={`text-2xl ${isFavorite ? "text-red-500 fill-current" : "text-gray-500"}`} />
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:max-w-7xl lg:mx-auto lg:gap-8 lg:p-8">
              {/* Image Section */}
              <div className="w-full lg:w-1/2 relative bg-white">
                <div className="relative w-full aspect-[4/3] lg:rounded-3xl lg:shadow-xl lg:border lg:border-gray-100 overflow-hidden">
                  <ImageGallery 
                    images={productImages} 
                    productName={product.name} 
                    externalIndex={galleryIndex}
                    onIndexChange={setGalleryIndex}
                  />
                  
                  {/* Similar Button Overlay (Mobile Only) */}
                  <div className="absolute bottom-4 right-4 lg:hidden">
                    <button className="w-14 h-14 bg-white rounded-full shadow-lg flex flex-col items-center justify-center border border-gray-50 p-2">
                      <svg className="w-5 h-5 text-slate-700 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="8" width="12" height="12" rx="2"></rect>
                        <path d="M8 3h11a2 2 0 0 1 2 2v11"></path>
                      </svg>
                      <span className="text-[9px] font-black text-slate-700 uppercase tracking-tight">Similar</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                {/* Angle Gallery (Product Views) */}
                {productImages.length > 1 && (
                  <div className="bg-white px-4 py-3 border-b border-gray-100">
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {productImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setGalleryIndex(idx)}
                          className={`relative min-w-[70px] w-[70px] aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 shrink-0 ${
                            galleryIndex === idx ? "border-emerald-500 shadow-md scale-95" : "border-gray-100 bg-gray-50"
                          }`}
                        >
                          <img src={img} className="w-full h-full object-cover" alt={`Angle ${idx + 1}`} />
                          {galleryIndex === idx && (
                            <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seller Bar */}
                <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 lg:bg-transparent lg:border-none">
                  <Link to={vendor ? `/seller/${vendor.id}` : "#"} className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 text-sm font-medium">Seller</span>
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    </div>
                    <span className="text-base font-bold text-gray-900 leading-tight mt-0.5">{vendor?.storeName || vendor?.name || "ecom storess"}</span>
                  </Link>
                  <button className="p-2 text-gray-800">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      <line x1="8" y1="9" x2="16" y2="9"></line>
                      <line x1="8" y1="13" x2="14" y2="13"></line>
                    </svg>
                  </button>
                </div>

                <div className="bg-white px-4 py-4 space-y-4 lg:bg-transparent">
                  <div>
                    <h1 className="text-base font-bold text-slate-900 uppercase mb-0.5 leading-tight">
                      {product.name}
                    </h1>
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="flex text-gray-400">
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} className={`text-xs ${i < Math.floor(product.rating || 0) ? 'fill-current text-gray-500' : ''}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">({product.reviewCount || 0})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-base font-bold text-teal-800 tracking-tight">
                      {formatPrice(currentPrice)}
                    </div>
                    {product.originalPrice && product.originalPrice > currentPrice && (
                      <>
                        <div className="text-xs text-gray-400 line-through font-medium">
                          {formatPrice(product.originalPrice)}
                        </div>
                        <div className="text-xs font-bold text-red-500">
                          {Math.round(
                            ((product.originalPrice - currentPrice) /
                              product.originalPrice) *
                            100
                          )}%
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-sm text-gray-500 font-medium">Brand:</span>
                    <span className="text-sm font-bold text-gray-900 leading-none">
                      {brand?.name || product.brandName || "Gucci"}
                    </span>
                  </div>

                  {/* Variants */}
                  {product.variants && (
                    <div className="pt-2">
                      <VariantSelector
                        variants={product.variants}
                        onVariantChange={setSelectedVariant}
                        currentPrice={product.price}
                      />
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm font-medium text-slate-700">Quantity:</div>
                    <div className="flex-1 flex items-center justify-between ml-6">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          className="w-8 h-8 border border-gray-100 rounded-full flex items-center justify-center text-gray-400 text-base shadow-sm"
                        >
                          <FiMinus />
                        </button>
                        <span className="text-lg font-bold text-slate-800">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          className="w-8 h-8 border border-gray-100 rounded-full flex items-center justify-center text-gray-800 text-base shadow-sm"
                        >
                          <FiPlus />
                        </button>
                      </div>
                      <span className="text-gray-400 text-[11px] text-right leading-tight max-w-[72px]">({selectedAvailableStock} available)</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Section */}
                <div className="mt-4 bg-white px-4 py-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full border border-green-500 flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">Delivery by Wed, 26 Apr</div>
                        <div className="text-xs text-gray-400 font-medium">638504 <span className="text-gray-300">(Anthiyour)</span></div>
                      </div>
                    </div>
                    <button className="px-4 py-2 border border-gray-100 rounded-lg text-sm text-pink-500 font-bold shadow-sm">Change</button>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <FiShoppingBag className="text-slate-600" />
                      </div>
                      <span>Free delivery above ₹499</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                      </div>
                      <span>COD on orders above ₹499</span>
                    </div>
                  </div>
                </div>

                {/* Product Details Section */}
                <div className="mt-4 bg-white border-t border-gray-50">
                  <div className="px-4 py-4">
                    <h3 className="text-lg font-bold text-slate-800">Product Details</h3>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex items-center border-b border-gray-100 px-4">
                    {["Description", "Ingredients", "How to use"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 text-sm transition-all duration-200 ${activeTab === tab
                            ? "text-pink-500 font-bold border-b-2 border-pink-500"
                            : "text-slate-500 font-medium"
                          }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="px-6 py-6 min-h-[160px]">
                    {activeTab === "Description" && (
                      <div className="space-y-4">
                        <p className="text-xs text-teal-900 font-medium leading-relaxed">
                          {product.description || "40+ years experience. Fugiat culpa deserunt labore ut occaecat eu velit cupidatat et aliqua officia."}
                        </p>

                        <motion.div
                          initial={false}
                          animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
                          className="overflow-hidden space-y-6"
                        >
                          {/* Expanded Images */}
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            {productImages.slice(1, 5).map((img, idx) => (
                              <div key={idx} className="aspect-square rounded-xl bg-gray-50 overflow-hidden border border-gray-100">
                                <img src={img} alt={`Feature ${idx}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>

                          {/* Features List */}
                          <div className="space-y-4 border-t border-gray-50 pt-6">
                            <h4 className="text-sm font-bold text-slate-800 tracking-wider">Features & Highlights</h4>
                            <div className="grid grid-cols-1 gap-4">
                              {productFeatures.map((feature) => (
                                <div key={feature.id} className="flex gap-3">
                                  <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-1.5 shrink-0" />
                                  <div>
                                    <div className="text-[11px] font-semibold text-slate-900">{feature.label}</div>
                                    <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">{feature.desc}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {activeTab === "Ingredients" && (
                      <div className="space-y-4">
                        <p className="text-xs text-teal-900 font-medium leading-relaxed">
                          {product.ingredients || "High-quality raw materials, Premium finishes, Reinforced stitching, and sustainable components tailored for longevity."}
                        </p>
                        <motion.div
                          initial={false}
                          animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
                          className="overflow-hidden space-y-4"
                        >
                          <div className="pt-4 border-t border-gray-50">
                            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest mb-3">Core Components</h4>
                            <div className="grid grid-cols-2 gap-3">
                              {["Pure Organic Cotton", "Recycled Fibers", "Hypoallergenic Dye", "Sustainable Wood"].map((ing, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                  <span className="text-[10px] text-slate-600 font-medium">{ing}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {activeTab === "How to use" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          {(Array.isArray(product.howToUse) ? product.howToUse : (product.howToUse?.split?.("\n") || [
                            "1. Carefully unbox the product from its protective cover.",
                            "2. Inspect the item for any specific care instructions.",
                            "3. Follow the recommended maintenance routine."
                          ])).map((step, idx) => (
                            <p key={idx} className="text-xs text-teal-900 font-medium leading-relaxed">
                              {step}
                            </p>
                          ))}
                        </div>
                        <motion.div
                          initial={false}
                          animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
                          className="overflow-hidden space-y-4"
                        >
                          <div className="pt-4 border-t border-gray-50">
                            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest mb-3">Pro Tips & Care</h4>
                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                              <p className="text-[10px] text-slate-600 font-medium leading-relaxed italic">
                                "To maintain peak condition, avoid direct exposure to extreme heat and clean regularly with a soft, damp cloth."
                              </p>
                              <div className="flex items-center gap-2 text-pink-500 font-bold text-[9px]">
                                <FiCheckCircle /> VERIFIED QUALITY
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    )}

                    <div className="flex items-center justify-center mt-4">
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1 text-pink-500 font-bold text-sm"
                      >
                        {isExpanded ? "Read Less" : "Read More"}
                        {isExpanded ? <FiMinus className="text-xs" /> : <FiPlus className="text-xs" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Ratings & Reviews Section */}
                <div className="mt-4 bg-white">
                  <div className="px-4 py-6 border-b border-gray-50">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-slate-800">Ratings & Reviews</h3>
                      <button className="px-6 py-2 border border-gray-100 rounded-lg text-sm text-pink-500 font-bold shadow-sm">Rate</button>
                    </div>

                    <div className="flex items-end gap-4 mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-slate-800 font-mono">{product.rating || "4.3"}</span>
                        <span className="text-xl text-gray-400 font-medium">/5</span>
                      </div>
                      <div className="pb-1">
                        <div className="text-sm font-bold text-slate-800">Overall Rating</div>
                        <div className="text-xs text-gray-400 font-medium">{product.reviewCount || "889"} ratings</div>
                      </div>
                    </div>

                    {/* Review Images */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="min-w-[80px] h-20 rounded-lg bg-gray-100 overflow-hidden shrink-0 shadow-sm border border-gray-50">
                          <img src={`https://picsum.photos/200/200?random=${i}`} alt="Review" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Individual Review */}
                  <div className="px-4 py-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 font-bold border border-pink-100">A</div>
                        <div>
                          <div className="text-sm font-bold text-slate-800 leading-tight">Ankita</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-3.5 h-3.5 rounded-full bg-pink-500 flex items-center justify-center shadow-sm">
                              <svg className="w-2 h-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Verified Buyer</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 font-medium">08/06/2022</span>
                    </div>

                    <div className="flex items-center gap-4 py-3 border-y border-gray-50">
                      <button className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                        <FiStar className="text-gray-400" /> 279 Reviews
                      </button>
                      <div className="w-px h-3 bg-gray-200" />
                      <button className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                        <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        283 Photos
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="px-2 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded flex items-center gap-0.5">
                            5 <FiStar className="fill-current text-[8px]" />
                          </div>
                          <span className="text-xs font-bold text-slate-800">"2.light"</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                          I was very confused for shade 2 or 2.5 but decided to go for shade 2 light. I am fair and it blended well. It gives you a little sheen but 4k was too much as the same job is done by mac strope However i do not wear any foundation or cream anymore Just this and little blush is good to go if u have a clear skin tone.
                        </p>
                      </div>

                      {/* Review Specific Images */}
                      <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
                        {[6, 7, 8].map((i) => (
                          <div key={i} className="min-w-[70px] h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-50">
                            <img src={`https://picsum.photos/100/100?random=${i}`} alt="User Uploaded" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Policy Links Section */}
                <div className="mt-4 bg-white border-y border-gray-50">
                  {[
                    { title: "Seller Policy", path: "/policy/seller" },
                    { title: "Return Policy", path: "/policy/return" },
                    { title: "Support Policy", path: "/policy/support" }
                  ].map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.path}
                      className={`flex items-center justify-between px-6 py-5 ${idx !== 0 ? 'border-t border-gray-50' : ''}`}
                    >
                      <span className="text-sm font-bold text-[#024d3e] tracking-tight">{item.title}</span>
                      <FiChevronRight className="text-gray-400 text-lg" />
                    </Link>
                  ))}
                </div>

                {/* Similar To Section */}
                <div className="mt-4 bg-white border-y border-gray-50 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-white overflow-hidden border-2 border-purple-100 shadow-sm p-0.5 shrink-0">
                      <img src={product.image} className="w-full h-full object-cover rounded-md" alt="Similar" />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-sm font-bold text-slate-800 leading-tight tracking-tight">Similar To</h4>
                      <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                        {product.brandName || "Brand"}: {product.name}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/similar-explore/${product.id}?title=Similar Products`)}
                    className="text-sm font-bold text-pink-500 active:scale-95 transition-transform shrink-0"
                  >
                    View All
                  </button>
                </div>

                <div className="bg-white px-4 pb-6 overflow-x-auto flex gap-3 scrollbar-hide">
                  {similarProducts.map((p) => (
                    <FlipkartCompactCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Customers Also Viewed Section */}
                <div className="mt-2 bg-white border-y border-gray-50 px-6 py-4 flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-800 leading-tight tracking-tight">Customers Also Viewed</h4>
                  <button 
                    onClick={() => navigate(`/similar-explore/${product.id}?title=Customers Also Viewed`)}
                    className="text-sm font-bold text-pink-500 active:scale-95 transition-transform shrink-0"
                  >
                    View All
                  </button>
                </div>

                <div className="bg-white px-4 pb-6 overflow-x-auto flex gap-3 scrollbar-hide">
                  {similarProducts.slice().reverse().map((p) => (
                    <FlipkartCompactCard key={p.id} product={p} />
                  ))}
                </div>

              </div>
            </div>
          </div>
        </MobileLayout>
      </PageTransition>

      {/* Fixed Action Bar (Flipkart Style) - Outside PageTransition to avoid transform conflicts */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-2 z-[9999] shadow-[0_-8px_20px_rgba(0,0,0,0.12)]">
        <div className="flex items-center gap-2 w-full max-w-7xl mx-auto px-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === "out_of_stock"}
            className={`flex-1 h-12 rounded-lg font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95 ${product.stock === "out_of_stock"
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#024d3e] text-white shadow-sm"
              }`}
          >
            {isInCart ? "Go to Cart" : "Add to Cart"}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.stock === "out_of_stock"}
            className={`flex-1 h-12 rounded-lg font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${product.stock === "out_of_stock"
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-[#ff5a5f] text-white"
              }`}
          >
            Buy Now
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileProductDetail;
