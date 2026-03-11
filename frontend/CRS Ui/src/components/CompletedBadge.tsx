import { CheckCircle2 } from "lucide-react";
import { isCompleted } from "@/lib/completedCourses";

interface CompletedBadgeProps {
  courseId: number;
}

/**
 * Renders a small green "Completed" tick badge if the course has been marked
 * as completed by the user (stored in localStorage). Shows nothing otherwise.
 */
const CompletedBadge = ({ courseId }: CompletedBadgeProps) => {
  if (!isCompleted(courseId)) return null;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium"
      title="You completed this course"
    >
      <CheckCircle2 size={11} className="fill-emerald-500 text-white" />
      Done
    </span>
  );
};

export default CompletedBadge;
