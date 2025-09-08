import React from "react";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";

const AssignmentList = ({ assignments, courses, onEdit, onDelete, onToggleStatus }) => {
  const getCourseById = (courseId) => {
    return courses.find(c => c.Id === courseId);
  };

  const getStatusVariant = (status) => {
    switch(status) {
      case "completed": return "success";
      case "overdue": return "error";
      case "pending": return "warning";
      default: return "default";
    }
  };

  const getPriorityVariant = (priority) => {
    switch(priority) {
      case "high": return "high";
      case "medium": return "medium";
      case "low": return "low";
      default: return "default";
    }
  };

  const isOverdue = (assignment) => {
    return new Date(assignment.dueDate) < new Date() && assignment.status !== "completed";
  };

  if (assignments.length === 0) {
    return (
      <Card>
        <Card.Content className="p-8 text-center">
          <ApperIcon name="FileText" className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments</h3>
          <p className="text-gray-600">Add your first assignment to get started.</p>
        </Card.Content>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => {
        const course = getCourseById(assignment.courseId);
        const overdueStatus = isOverdue(assignment);
        
        return (
          <Card key={assignment.Id} className="hover:shadow-md transition-all duration-200">
            <Card.Content className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {course && (
                      <div 
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: course.color }}
                      ></div>
                    )}
                    <h3 className="font-semibold text-lg text-gray-900">
                      {assignment.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-sm text-gray-600">
                      {course ? course.name : "Unknown Course"}
                    </span>
                    <Badge variant={getPriorityVariant(assignment.priority)}>
                      {assignment.priority} priority
                    </Badge>
                    <Badge variant={getStatusVariant(overdueStatus ? "overdue" : assignment.status)}>
                      {overdueStatus ? "overdue" : assignment.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <ApperIcon name="Calendar" className="w-4 h-4 mr-1" />
                      Due: {format(new Date(assignment.dueDate), "MMM dd, yyyy")}
                    </div>
                    {assignment.grade !== null && (
                      <div className="flex items-center">
                        <ApperIcon name="Award" className="w-4 h-4 mr-1" />
                        {assignment.grade}/{assignment.maxGrade}
                      </div>
                    )}
                  </div>

                  {assignment.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {assignment.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleStatus(assignment.Id)}
                    className="text-success hover:bg-green-50"
                  >
                    <ApperIcon 
                      name={assignment.status === "completed" ? "CheckSquare" : "Square"} 
                      className="w-4 h-4" 
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(assignment)}
                  >
                    <ApperIcon name="Edit" className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(assignment.Id)}
                    className="text-error hover:bg-red-50"
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card.Content>
          </Card>
        );
      })}
    </div>
  );
};

export default AssignmentList;