import { Icon } from "@/constants/icons";
import { Review } from "@/feature-modules/users/type";
import { Star } from "lucide-react";

type Role = "admin" | "barber";

const ReviewCard = ({
  review,
  role,
  onAccept,
  onReject,
}: {
  review?: Review;
  role: Role;
  onAccept?: () => void;
  onReject?: () => void;
}) => {
  return (
    <div className="bg-[#460028] text-white p-4 rounded-md max-w-full min-w-[240px] md:min-w-[300px] space-y-2 shadow-md">
      <div className="w-full items-center justify-between flex ">
        <Icon name="quote" className="text-xl" />
        {role === "admin" && <h1>{review?.barberName}</h1>}
      </div>
      <p className="text-[12px] h-[58px] line-clamp-3 font-medium leading-relaxed">
        {review?.reviewMessage} Lorem ipsum dolor sit amet, consectetur
        adipisicing elit. Totam fugit ad perferendis id tenetur?
      </p>
      <div className="flex items-center justify-between pt-2">
        <span className="text-lg">- {review?.userName}</span>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-white text-white" />
          <span className="text-sm">{review?.rating}/5</span>
        </div>
      </div>
      {role === "admin" &&
        onReject &&
        onAccept &&
        review?.status !== "accept" &&
        review?.status !== "reject" && (
          <div>
            <div className="flex text-sm items-center justify-center gap-4">
              <button
                className="text-dark-purple w-full md:hover:bg-white/85  bg-white px-4 py-2 font-semibold transition"
                onClick={() => onReject()}
              >
                Reject
              </button>
              <button
                className="text-dark-purple w-full md:hover:bg-white/85  bg-white px-4 py-2 font-semibold transition"
                onClick={() => onAccept()}
              >
                Accept
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default ReviewCard;
