import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiTrash2, FiMinus, FiPlus, FiHeart, FiAlertCircle, FiStar } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useCartStore } from "../../store/useStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { formatPrice } from "../../utils/helpers";
import { formatVariantLabel } from "../../utils/variant";
import useSwipeGesture from "../../../modules/UserApp/hooks/useSwipeGesture";

const DUMMY_COUPONS = [
    { code: "SAVE10", label: "10% OFF on this order" },
    { code: "FLAT200", label: "Flat 200 OFF above 1999" },
    { code: "FREESHIP", label: "Free shipping coupon" },
];

const getVariantText = (variant) => {
    const color = String(variant?.color || "").trim();
    const size = String(variant?.size || "").trim();

    if (color) return `Color: ${color}`;
    if (size) return `Size: ${size}`;
    return formatVariantLabel(variant);
};

const getSizeOptions = (size) => {
    const normalizedSize = String(size || "").trim();
    if (!normalizedSize) return ["S", "M", "L", "XL"];

    if (/^\d+$/.test(normalizedSize)) {
        const baseSize = Number(normalizedSize);
        return [baseSize - 1, baseSize, baseSize + 1, baseSize + 2]
            .filter((value) => value > 0)
            .map(String);
    }

    const commonSizes = ["XS", "S", "M", "L", "XL", "XXL"];
    return Array.from(new Set([normalizedSize, ...commonSizes]));
};

const getPriceMeta = (item) => {
    const currentPrice = Number(item?.price) || 0;
    const originalPrice = Number(item?.originalPrice) || 0;
    const hasDiscount = originalPrice > currentPrice && currentPrice > 0;

    return {
        currentPrice,
        originalPrice,
        hasDiscount,
        discountPercent: hasDiscount
            ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
            : 0,
        savings: hasDiscount ? originalPrice - currentPrice : 0,
    };
};

const getRecentlyViewedItems = (item) => (
    Array.from({ length: 3 }, (_, index) => ({
        id: `${item?.id || "item"}-${index}`,
        productId: item?.id,
        name: item?.name || "Product",
        image: item?.image,
        price: Number(item?.price) || 0,
        originalPrice: Number(item?.originalPrice) || 0,
        brandName: item?.brandName || item?.brand || "Brand",
        rating: 4.7,
        reviewCount: 47,
    }))
);

const SwipeableCartItem = ({ item, index }) => {
    const navigate = useNavigate();
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [isDeleted, setIsDeleted] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const [selectedSize, setSelectedSize] = useState(String(item?.variant?.size || "XL"));
    const [showCoupons, setShowCoupons] = useState(false);
    const [showConvenienceInfo, setShowConvenienceInfo] = useState(false);
    const deletedItemRef = useRef(null);

    const { removeItem, updateQuantity } = useCartStore();
    const { addItem: addToWishlist } = useWishlistStore();

    // Only animate on mount
    useEffect(() => {
        setHasAnimated(true);
    }, []);

    const getProductStock = () => Number(item?.stockQuantity);

    const isMaxQuantity = (quantity) => {
        const availableStock = Number(item?.stockQuantity);
        return Number.isFinite(availableStock) ? quantity >= availableStock : false;
    };

    const isLowStock = () => String(item?.stock || "") === "low_stock";
    const quantityOptions = Array.from(
        { length: Math.max(1, Math.min(Number(item?.stockQuantity) || item.quantity || 1, 10)) },
        (_, optionIndex) => optionIndex + 1
    );
    const sizeOptions = getSizeOptions(selectedSize);
    const { currentPrice, originalPrice, hasDiscount, discountPercent, savings } = getPriceMeta(item);
    const recentlyViewedItems = getRecentlyViewedItems(item);

    const handleQuantityChange = (id, currentQuantity, change, variant) => {
        const newQuantity = currentQuantity + change;
        const availableStock = Number(item?.stockQuantity);

        if (newQuantity <= 0) {
            removeItem(id, variant);
            return;
        }

        if (Number.isFinite(availableStock) && newQuantity > availableStock) {
            toast.error(`Only ${availableStock} items available in stock`);
            return;
        }

        updateQuantity(id, newQuantity, variant);
    };

    const handleSaveForLater = (item) => {
        const addedToWishlist = addToWishlist({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
        });
        if (!addedToWishlist) return;
        removeItem(item.id, item.variant);
        toast.success("Saved for later!");
    };

    const handleSwipeRight = () => {
        setIsDeleted(true);
        deletedItemRef.current = { ...item };
        removeItem(item.id, item.variant);
        toast.success("Item removed", {
            duration: 3000,
            action: {
                label: "Undo",
                onClick: () => {
                    if (deletedItemRef.current) {
                        const { addItem: addToCart } = useCartStore.getState();
                        addToCart(deletedItemRef.current);
                        setIsDeleted(false);
                        deletedItemRef.current = null;
                    }
                },
            },
        });
    };

    const swipeHandlers = useSwipeGesture({
        onSwipeRight: handleSwipeRight,
        threshold: 100,
    });

    // Update offset based on swipe state
    useEffect(() => {
        if (swipeHandlers.swipeState.isSwiping) {
            setSwipeOffset(Math.max(0, swipeHandlers.swipeState.offset));
        } else if (!swipeHandlers.swipeState.isSwiping && swipeOffset < 100) {
            setSwipeOffset(0);
        }
    }, [swipeHandlers.swipeState.isSwiping, swipeHandlers.swipeState.offset]);

    if (isDeleted) return null;

    return (
        <motion.div
            initial={hasAnimated ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, x: swipeOffset }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
            }}
            style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}
            className="relative"
            onTouchStart={swipeHandlers.onTouchStart}
            onTouchMove={swipeHandlers.onTouchMove}
            onTouchEnd={swipeHandlers.onTouchEnd}>
            <div className="bg-white rounded-[22px] relative border border-gray-200 overflow-hidden">
                {/* Delete Background */}
                {swipeOffset > 0 && (
                    <div className="absolute inset-0 bg-red-500 rounded-2xl flex items-center justify-end pr-4">
                        <FiTrash2 className="text-white text-xl" />
                    </div>
                )}
                <div className="flex gap-4 p-4 relative z-10">
                    {/* Product Image */}
                    <div className="w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-200 relative z-10">
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0 relative z-10">
                        <h3 className="font-semibold text-slate-700 text-[13px] leading-5 mb-1 uppercase line-clamp-2">
                            {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="relative">
                                <select
                                    value={selectedSize}
                                    onChange={(e) => setSelectedSize(e.target.value)}
                                    className="appearance-none pl-2.5 pr-5 py-1 bg-gray-100 rounded-md text-[11px] text-gray-500 focus:outline-none"
                                >
                                    {sizeOptions.map((sizeOption) => (
                                        <option key={sizeOption} value={sizeOption}>
                                            {`Size ${sizeOption}`}
                                        </option>
                                    ))}
                                </select>
                                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">▼</span>
                            </div>
                            <div className="relative">
                                <select
                                    value={item.quantity}
                                    onChange={(e) => {
                                        const nextQuantity = Number(e.target.value);
                                        const change = nextQuantity - item.quantity;
                                        if (change !== 0) {
                                            handleQuantityChange(item.id, item.quantity, change, item.variant);
                                        }
                                    }}
                                    className="appearance-none pl-2.5 pr-5 py-1 bg-gray-100 rounded-md text-[11px] text-gray-500 focus:outline-none"
                                >
                                    {quantityOptions.map((qtyOption) => (
                                        <option key={qtyOption} value={qtyOption}>
                                            {`Qty ${qtyOption}`}
                                        </option>
                                    ))}
                                </select>
                                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">▼</span>
                            </div>
                        </div>
                        <div className="mb-1.5">
                            <div className="flex items-center gap-1.5 leading-none">
                                <span className="text-[13px] font-bold text-slate-800">
                                    {formatPrice(currentPrice)}
                                </span>
                                {hasDiscount && (
                                    <>
                                        <span className="text-[11px] text-gray-400 line-through">
                                            {formatPrice(originalPrice)}
                                        </span>
                                        <span className="text-[11px] text-gray-500">
                                            ({discountPercent}%)
                                        </span>
                                    </>
                                )}
                            </div>
                            {hasDiscount && (
                                <p className="mt-1 text-[12px] font-semibold text-emerald-500">
                                    You save {formatPrice(savings)}
                                </p>
                            )}
                        </div>
                        {/* Stock Warning */}
                        {isLowStock() && (
                            <div className="flex items-center gap-1 text-xs text-orange-600 mb-2">
                                <FiAlertCircle className="text-xs" />
                                <span>Only {getProductStock()} left!</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="border-t border-gray-200 px-4 py-3 flex justify-end relative z-10">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeItem(item.id, item.variant);
                        }}
                        className="text-[12px] font-semibold text-sky-600 hover:text-sky-700 transition-colors"
                    >
                        Remove
                    </button>
                </div>
            </div>
            <p className="mt-3 text-center text-[11px] font-normal text-gray-300">
                Assured Quality | 100% Handpicked | Easy Exchange
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 px-1">
                <div className="flex items-center gap-3">
                    <svg
                        className="text-gray-500 w-[18px] h-[18px]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <circle cx="12" cy="12" r="3.2" />
                        <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.9 1.9 0 1 1-2.7 2.7l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1.9 1.9 0 1 1-3.8 0v-.2a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a1.9 1.9 0 1 1-2.7-2.7l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a1.9 1.9 0 1 1 0-3.8h.2a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1a1 1 0 0 0 1.1.2h.1a1 1 0 0 0 .6-.9V4a1.9 1.9 0 1 1 3.8 0v.2a1 1 0 0 0 .6.9h.1a1 1 0 0 0 1.1-.2l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1 1 0 0 0-.2 1.1v.1a1 1 0 0 0 .9.6H20a1.9 1.9 0 1 1 0 3.8h-.2a1 1 0 0 0-.9.6Z" />
                    </svg>
                    <span className="text-[14px] font-normal text-gray-800">Apply coupon</span>
                </div>
                <button
                    type="button"
                    onClick={() => setShowCoupons((prev) => !prev)}
                    className="text-[14px] font-medium text-sky-500"
                >
                    Select
                </button>
            </div>
            {showCoupons && (
                <div className="mt-3 space-y-2 px-1">
                    {DUMMY_COUPONS.map((coupon) => (
                        <button
                            key={coupon.code}
                            type="button"
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-left"
                        >
                            <p className="text-[12px] font-semibold text-gray-800">{coupon.code}</p>
                            <p className="text-[11px] text-gray-500">{coupon.label}</p>
                        </button>
                    ))}
                </div>
            )}
            <div className="mt-4 rounded-[20px] bg-white border border-gray-200 overflow-hidden">
                <div className="h-5 bg-[#f4f7fb] relative">
                    <div className="absolute inset-x-0 top-full -translate-y-1/2 flex justify-between px-2">
                        {Array.from({ length: 14 }).map((_, punchIndex) => (
                            <span
                                key={punchIndex}
                                className="block h-2.5 w-2.5 rounded-full bg-[#eef3f8]"
                            />
                        ))}
                    </div>
                </div>
                <div className="px-4 pt-7 pb-4">
                    <h3 className="text-[16px] font-semibold text-gray-900 mb-4">Order Details</h3>
                    <div className="space-y-3 text-[13px]">
                        <div className="flex items-center justify-between text-gray-700">
                            <span>Bag Total</span>
                            <span>{formatPrice(originalPrice || currentPrice)}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-700">
                            <span>Bag Savings</span>
                            <span className="text-emerald-500">-{formatPrice(savings)}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-700">
                            <span>Coupon savings</span>
                            <button type="button" className="text-sky-500 font-medium">Apply coupon</button>
                        </div>
                        <div className="flex items-center justify-between text-gray-700">
                            <div className="flex items-center gap-2">
                                <span>Convenience Fee</span>
                                <button
                                    type="button"
                                    onClick={() => setShowConvenienceInfo((prev) => !prev)}
                                    className="text-sky-500 font-medium"
                                >
                                    What's this?
                                </button>
                            </div>
                            <span />
                        </div>
                        {showConvenienceInfo && (
                            <div className="rounded-xl bg-sky-50 border border-sky-100 px-3 py-2 text-[12px] text-gray-600">
                                Convenience fee helps cover platform handling and service support for your order.
                            </div>
                        )}
                        <div className="flex items-center justify-between text-gray-400 pl-3">
                            <span>Delivery Fee</span>
                            <span>{formatPrice(99)}</span>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[15px] font-semibold text-gray-900">
                        <span>Amount Payable</span>
                        <span>{formatPrice(currentPrice)}</span>
                    </div>
                </div>
            </div>
            <div className="mt-4 rounded-[20px] bg-white border border-gray-200 px-4 py-3">
                <h3 className="text-[15px] font-semibold text-gray-900">Return/Refund policy</h3>
                <p className="mt-2 text-[12px] leading-5 text-gray-700">
                    In case of return, we ensure quick refunds. Full amount will be
                    refunded excluding Convenience Fee
                </p>
                <button
                    type="button"
                    onClick={() => navigate("/policy/return")}
                    className="mt-2 text-[13px] font-semibold text-sky-500"
                >
                    Read policy
                </button>
            </div>
            <div className="mt-4">
                <h3 className="px-1 text-[15px] font-semibold text-gray-900">Shop From Recently Viewed</h3>
                <div className="mt-3 -mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {recentlyViewedItems.map((recentItem) => {
                        const recentDiscount = recentItem.originalPrice > recentItem.price && recentItem.price > 0
                            ? Math.round(((recentItem.originalPrice - recentItem.price) / recentItem.originalPrice) * 100)
                            : 0;

                        return (
                            <div
                                key={recentItem.id}
                                onClick={() => recentItem.productId && navigate(`/product/${recentItem.productId}`)}
                                className="w-[140px] shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-white text-left shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
                            >
                                <div className="relative h-[118px] bg-white px-1 pb-1 pt-1">
                                    <span className="absolute right-2 top-2 rounded-full bg-white/90 p-1 shadow-sm">
                                        <FiHeart className="text-[12px] text-gray-500" />
                                    </span>
                                    <img
                                        src={recentItem.image}
                                        alt={recentItem.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="px-2.5 pb-2 pt-1">
                                    <span className="inline-block text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
                                        BESTSELLER
                                    </span>
                                    <p className="mt-1 text-[11px] font-semibold text-slate-700 line-clamp-1">
                                        {recentItem.brandName}
                                    </p>
                                    <p className="mt-0.5 min-h-[28px] text-[11px] leading-4 text-gray-500 line-clamp-2">
                                        {recentItem.name}
                                    </p>
                                    <div className="mt-1 flex items-center gap-1 text-[11px] leading-none">
                                        <span className="text-[12px] font-bold text-slate-900">{formatPrice(recentItem.price)}</span>
                                        {recentDiscount > 0 && (
                                            <>
                                                <span className="text-[10px] font-medium text-gray-400 line-through">
                                                    {formatPrice(recentItem.originalPrice)}
                                                </span>
                                                <span className="text-[10px] font-bold text-emerald-600">{recentDiscount}% Off</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="mt-0.5 flex items-center gap-1">
                                        <div className="flex items-center gap-0.5 text-gray-500">
                                            {Array.from({ length: 5 }).map((_, starIndex) => (
                                                <FiStar
                                                    key={starIndex}
                                                    className={`text-[9px] ${starIndex < 4 ? "fill-current" : ""}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-semibold text-gray-500">({recentItem.reviewCount})</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="mt-2 rounded-sm bg-[#dff8ef] px-3 py-2 text-center text-[13px] font-semibold text-gray-800">
                <span aria-hidden="true" className="mr-1">🎊</span>
                Cheers! You saved {formatPrice(3403)}
            </div>
        </motion.div>
    );
};

export default SwipeableCartItem;



