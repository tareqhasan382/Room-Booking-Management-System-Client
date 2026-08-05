import { Star, StarHalf } from "lucide-react";

const Rating = ({ value = 0, showValue = false }) => {
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.5;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: full }).map((_, i) => (
          <Star key={`f-${i}`} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
        {hasHalf && <StarHalf className="w-4 h-4 fill-amber-400 text-amber-400" />}
        {Array.from({ length: 5 - full - (hasHalf ? 1 : 0) }).map((_, i) => (
          <Star key={`e-${i}`} className="w-4 h-4 text-slate-300 dark:text-slate-600" />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default Rating;
