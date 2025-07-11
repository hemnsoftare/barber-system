import { Icon } from "@/constants/icons";
import { Star } from "lucide-react";

const ReviewCard = () => {
  return (
    <div className="bg-[#460028] text-white p-6 rounded-md w-[350px]  space-y-4 shadow-md">
      <Icon name="quote" className="text-xl" />
      <p className="text-sm font-medium leading-relaxed">
        Best haircut I’ve ever had! The attention to detail is unmatched. Highly
        recommend!
      </p>
      <div className="flex items-center justify-between pt-2">
        <span className="text-sm">- John Doe</span>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-white text-white" />
          <span className="text-sm">5/5</span>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
