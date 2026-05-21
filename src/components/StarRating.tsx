import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
}

export default function StarRating({ rating, max = 5, size = 'sm', showValue = true }: StarRatingProps) {
  const s = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`${s} ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : i < rating ? 'fill-amber-200 text-amber-400' : 'fill-gray-100 text-gray-300'}`}
        />
      ))}
      {showValue && (
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
