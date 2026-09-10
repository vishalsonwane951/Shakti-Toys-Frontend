import { FiStar } from 'react-icons/fi';

export default function RatingStars({ rating, size = 16, showCount = false, count = 0 }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(star => (
        <FiStar key={star} size={size}
          className={star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
      ))}
      {showCount && <span className="text-sm text-gray-500 ml-1">({count})</span>}
    </div>
  );
}