import React, { useState } from "react";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const CourseForm = ({ course, onSave, onCancel }) => {
const [formData, setFormData] = useState({
    name: course?.name || "",
    code: course?.code || "",
    instructor: course?.instructor || "",
    credits: course?.credits || 3,
    semester: course?.semester || "Fall 2024",
    color: course?.color || "#5b21b6",
    details: course?.details || "",
    gradeCategories: course?.gradeCategories || [
      { name: "Assignments", weight: 40 },
      { name: "Exams", weight: 35 },
      { name: "Participation", weight: 15 },
      { name: "Final Project", weight: 10 }
    ]
  });

  const [errors, setErrors] = useState({});

  const colorOptions = [
    { value: "#5b21b6", label: "Purple", color: "#5b21b6" },
    { value: "#dc2626", label: "Red", color: "#dc2626" },
    { value: "#16a34a", label: "Green", color: "#16a34a" },
    { value: "#2563eb", label: "Blue", color: "#2563eb" },
    { value: "#ea580c", label: "Orange", color: "#ea580c" },
    { value: "#7c3aed", label: "Violet", color: "#7c3aed" },
    { value: "#0891b2", label: "Cyan", color: "#0891b2" },
    { value: "#be123c", label: "Rose", color: "#be123c" }
  ];

  const semesterOptions = [
    "Fall 2024",
    "Spring 2025",
    "Summer 2024",
    "Fall 2023",
    "Spring 2024"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Course name is required";
    if (!formData.code.trim()) newErrors.code = "Course code is required";
    if (!formData.instructor.trim()) newErrors.instructor = "Instructor is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  const handleCategoryChange = (index, field, value) => {
    const newCategories = [...formData.gradeCategories];
    newCategories[index] = { ...newCategories[index], [field]: value };
    setFormData({ ...formData, gradeCategories: newCategories });
  };

  const addCategory = () => {
    setFormData({
      ...formData,
      gradeCategories: [...formData.gradeCategories, { name: "", weight: 0 }]
    });
  };

  const removeCategory = (index) => {
    const newCategories = formData.gradeCategories.filter((_, i) => i !== index);
    setFormData({ ...formData, gradeCategories: newCategories });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <Card.Header>
        <h2 className="text-xl font-display font-semibold text-gray-900">
          {course ? "Edit Course" : "Add New Course"}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Fill in the course details and grade categories
        </p>
      </Card.Header>

      <form onSubmit={handleSubmit}>
        <Card.Content className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Course Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              placeholder="Introduction to Psychology"
            />
            <Input
              label="Course Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              error={errors.code}
              placeholder="PSY 101"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Instructor"
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              error={errors.instructor}
              placeholder="Dr. Smith"
            />
            <Input
              label="Credits"
              type="number"
              min="1"
              max="6"
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
              placeholder="3"
            />
          </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Semester"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            >
              {semesterOptions.map((semester) => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </Select>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Course Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-full h-10 rounded-lg border-2 transition-all duration-200 ${
                      formData.color === option.value
                        ? "border-gray-400 scale-110"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={{ backgroundColor: option.color }}
                    onClick={() => setFormData({ ...formData, color: option.value })}
                    title={option.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <Input
              label="Details"
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              placeholder="Additional course details, description, prerequisites..."
              multiline
              rows={4}
            />
          </div>

          {/* Grade Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Grade Categories</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addCategory}
              >
                <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            <div className="space-y-3">
              {formData.gradeCategories.map((category, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <Input
                      placeholder="Category name (e.g., Assignments)"
                      value={category.name}
                      onChange={(e) => handleCategoryChange(index, "name", e.target.value)}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      placeholder="Weight %"
                      min="0"
                      max="100"
                      value={category.weight}
                      onChange={(e) => handleCategoryChange(index, "weight", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCategory(index)}
                    className="text-error hover:bg-red-50"
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-600">
              Total weight: {formData.gradeCategories.reduce((sum, cat) => sum + (cat.weight || 0), 0)}%
            </div>
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
            {course ? "Update Course" : "Add Course"}
          </Button>
        </Card.Footer>
      </form>
    </Card>
  );
};

export default CourseForm;