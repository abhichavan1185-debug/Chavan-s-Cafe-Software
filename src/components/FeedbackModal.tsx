import React, { useState } from "react";
import { useRestaurant } from "../context/RestaurantContext";
import { Star, X, Check, Heart, ThumbsUp, MessageSquareQuote } from "lucide-react";

const QUICK_TAGS = [
  "Delicious & Authentic Food",
  "Super Fast Delivery",
  "Hot & Fresh Packaging",
  "Polite Delivery Partner",
  "Great Coffee Aroma",
  "Value for Money",
  "Clean & Hygenic",
  "Generous Portions"
];

const RATING_LABELS: Record<number, string> = {
  1: "Disappointing",
  2: "Needs Improvement",
  3: "Average Experience",
  4: "Very Good & Tasty",
  5: "Outstanding & Exceptional!"
};

export const FeedbackModal: React.FC = () => {
  const { selectedFeedbackOrder, closeFeedbackModal, submitFeedback } = useRestaurant();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([QUICK_TAGS[0], QUICK_TAGS[1]]);
  const [comment, setComment] = useState<string>("");

  if (!selectedFeedbackOrder) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFeedback({
      orderId: selectedFeedbackOrder.id,
      customerName: selectedFeedbackOrder.customerName || "Valued Customer",
      customerPhone: selectedFeedbackOrder.customerPhone || "+91 98000 00000",
      rating,
      tags: selectedTags,
      comment: comment.trim() || "Great food and prompt delivery from Shru's Cafe!"
    });
  };

  const activeStarCount = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-amber-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-800 to-amber-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <Heart className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Rate Your Experience</h3>
              <p className="text-[11px] text-amber-200">
                Order #{selectedFeedbackOrder.id} • {selectedFeedbackOrder.customerName}
              </p>
            </div>
          </div>
          <button
            onClick={closeFeedbackModal}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
          {/* Order Snapshot */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Order Items</p>
              <p className="text-xs font-semibold text-stone-800 mt-0.5 line-clamp-1">
                {selectedFeedbackOrder.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg">
              ₹{selectedFeedbackOrder.grandTotal}
            </span>
          </div>

          {/* Interactive 5-Star Rating */}
          <div className="text-center py-2 bg-amber-50/50 rounded-2xl border border-amber-200/60 p-4">
            <label className="text-xs font-bold text-stone-700 block mb-2">
              How was your experience with Shru's Cafe?
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= activeStarCount
                        ? "text-amber-500 fill-amber-500 drop-shadow-sm"
                        : "text-stone-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-amber-900 mt-2 font-serif">
              {RATING_LABELS[activeStarCount]}
            </p>
          </div>

          {/* Quick Tags */}
          <div className="space-y-1.5">
            <label className="font-bold text-stone-700 text-xs block">
              What did you like the most? (Select tags)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all flex items-center gap-1 ${
                      isSelected
                        ? "bg-amber-800 text-white border-amber-900 shadow-xs"
                        : "bg-white text-stone-600 border-stone-300 hover:bg-stone-100"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comments / Review */}
          <div className="space-y-1">
            <label className="font-bold text-stone-700 text-xs block flex items-center gap-1.5">
              <MessageSquareQuote className="w-3.5 h-3.5 text-amber-700" />
              <span>Customer Review / Detailed Feedback:</span>
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the coffee taste, food temperature, packaging quality, or service..."
              className="w-full p-2.5 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-600 focus:outline-none"
            />
          </div>

          {/* Footer Action */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeFeedbackModal}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200 transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Submit Rating & Review</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
