import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { addFavorite, removeFavorite, isFavorite } from "@/lib/favorites";
import { useUser } from "@/context/UserContext";
import { userService } from "@/services/userService";

interface FavoriteHeartProps {
  courseId: number;
  courseTitle?: string;
  coursePlatform?: string;
}

const FavoriteHeart = ({ courseId, courseTitle, coursePlatform }: FavoriteHeartProps) => {
  const [favorited, setFavorited] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    setFavorited(isFavorite(courseId));
  }, [courseId]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (favorited) {
      removeFavorite(courseId);
      if (user?.uid && courseTitle && coursePlatform) {
        try {
          await userService.removeCourseFromProfile(user.uid, {
            name: courseTitle,
            platform: coursePlatform,
          });
        } catch (err) {
          console.warn("Could not remove course from Firestore:", err);
        }
      }
    } else {
      addFavorite(courseId);
      if (user?.uid && courseTitle && coursePlatform) {
        try {
          await userService.addCourseToProfile(user.uid, {
            name: courseTitle,
            platform: coursePlatform,
          });
        } catch (err) {
          console.warn("Could not save course to Firestore:", err);
        }
      }
    }

    setFavorited(!favorited);
  };

  return (
    <button
      onClick={toggleFavorite}
      className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 ease-in-out hover:scale-110"
      style={{
        background: favorited
          ? "rgba(167, 22, 167, 0.1)"
          : "rgba(156, 163, 175, 0.1)",
      }}
    >
      <Heart
        className="h-4 w-4 transition-all duration-200 ease-in-out"
        style={
          favorited
            ? {
              fill: "url(#heart-gradient)",
              stroke: "url(#heart-gradient)",
              transform: "scale(1.1)",
            }
            : {
              fill: "none",
              stroke: "#9CA3AF",
            }
        }
      />
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="heart-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A716A7" />
            <stop offset="100%" stopColor="#7B61FF" />
          </linearGradient>
        </defs>
      </svg>
    </button>
  );
};

export default FavoriteHeart;