import React, { useState } from "react";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";

const AssignmentForm = ({ assignment, courses, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: assignment?.name || "",
    courseId: assignment?.courseId || "",
    dueDate: assignment?.dueDate ? format(new Date(assignment.dueDate), "yyyy-MM-dd") : "",
    priority: assignment?.priority || "medium",
    category: assignment?.category || "Assignments",
    maxGrade: assignment?.maxGrade || 100,
    description: assignment?.description || ""
  });

  const [errors, setErrors] = useState({});

  const priorityOptions = [
    { value: "low", label: "Low Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "high", label: "High Priority" }
  ];

  const categoryOptions = [
    "Assignments",
    "Exams",
    "Participation",
    "Final Project",
    "Quiz",
    "Homework",
    "Lab Report",
    "Presentation"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Assignment name is required";
    if (!formData.courseId) newErrors.courseId = "Course selection is required";
    if (!formData.dueDate) newErrors.dueDate = "Due date is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const assignmentData = {
      ...formData,
      courseId: parseInt(formData.courseId),
      dueDate: new Date(formData.dueDate).toISOString(),
      maxGrade: parseInt(formData.maxGrade),
      status: assignment?.status || "pending",
      grade: assignment?.grade || null
    };

    onSave(assignmentData);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <Card.Header>
        <h2 className="text-xl font-display font-semibold text-gray-900">
          {assignment ? "Edit Assignment" : "Add New Assignment"}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Fill in the assignment details and due date
        </p>
      </Card.Header>

      <form onSubmit={handleSubmit}>
        <Card.Content className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Assignment Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              placeholder="Research Paper on Modern Psychology"
            />
            
            <Select
              label="Course"
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              error={errors.courseId}
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.Id} value={course.Id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              error={errors.dueDate}
            />
            
            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
            
            <Input
              label="Maximum Grade"
              type="number"
              min="1"
              value={formData.maxGrade}
              onChange={(e) => setFormData({ ...formData, maxGrade: e.target.value })}
              placeholder="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="w-full min-h-[100px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Assignment description, requirements, and notes..."
            />
          </div>
        </Card.Content>

        <Card.Footer className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            <ApperIcon name="Save" className="w-4 h-4 mr-2" />
            {assignment ? "Update Assignment" : "Add Assignment"}
          </Button>
        </Card.Footer>
      </form>
    </Card>
  );
};

export default AssignmentForm;