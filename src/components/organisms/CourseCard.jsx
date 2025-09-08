import React from "react";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ProgressRing from "@/components/molecules/ProgressRing";
import ApperIcon from "@/components/ApperIcon";

const CourseCard = ({ course, onClick }) => {
  const getGradeColor = (grade) => {
    if (grade >= 90) return "text-success";
    if (grade >= 80) return "text-warning";
    if (grade >= 70) return "text-amber-600";
    return "text-error";
  };

  const getProgressPercentage = () => {
    // Calculate progress based on completed assignments (mock calculation)
    return Math.min(100, (course.currentGrade || 0) + 10);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
      onClick={() => onClick(course)}
    >
      <Card.Content className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <div 
                className="w-3 h-6 rounded-sm mr-3"
                style={{ backgroundColor: course.color }}
              ></div>
              <div>
                <h3 className="font-display font-semibold text-lg text-gray-900">
                  {course.name}
                </h3>
                <p className="text-sm text-gray-600">{course.code}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <ApperIcon name="User" className="w-4 h-4 mr-1" />
              {course.instructor}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <ApperIcon name="BookOpen" className="w-4 h-4 mr-1" />
                {course.credits} credits
              </div>
              <Badge variant="info">{course.semester}</Badge>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <ProgressRing 
              progress={getProgressPercentage()} 
              size={50}
              strokeWidth={4}
            />
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500">Current Grade</p>
              <p className={`text-sm font-semibold ${getGradeColor(course.currentGrade)}`}>
                {course.currentGrade ? `${course.currentGrade}%` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-600">
            <ApperIcon name="Clock" className="w-4 h-4 mr-1" />
            3 assignments due
          </div>
          <ApperIcon name="ChevronRight" className="w-4 h-4 text-gray-400" />
        </div>
      </Card.Content>
    </Card>
  );
};

export default CourseCard;