import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const GradeCalculator = ({ courses, assignments }) => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [categoryGrades, setCategoryGrades] = useState({});
  const [calculatedGrade, setCalculatedGrade] = useState(null);

  useEffect(() => {
    if (selectedCourse) {
      calculateGrade();
    }
  }, [categoryGrades, selectedCourse]);

  const calculateGrade = () => {
    if (!selectedCourse || !selectedCourse.gradeCategories) return;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    selectedCourse.gradeCategories.forEach(category => {
      const grades = categoryGrades[category.name] || [];
      if (grades.length > 0) {
        const average = grades.reduce((sum, grade) => sum + parseFloat(grade || 0), 0) / grades.length;
        totalWeightedScore += average * (category.weight / 100);
        totalWeight += category.weight;
      }
    });

    if (totalWeight > 0) {
      const finalGrade = (totalWeightedScore / totalWeight) * 100;
      setCalculatedGrade(finalGrade);
    }
  };

  const addGrade = (categoryName) => {
    const newGrades = [...(categoryGrades[categoryName] || []), ""];
    setCategoryGrades({
      ...categoryGrades,
      [categoryName]: newGrades
    });
  };

  const updateGrade = (categoryName, index, value) => {
    const newGrades = [...(categoryGrades[categoryName] || [])];
    newGrades[index] = value;
    setCategoryGrades({
      ...categoryGrades,
      [categoryName]: newGrades
    });
  };

  const removeGrade = (categoryName, index) => {
    const newGrades = (categoryGrades[categoryName] || []).filter((_, i) => i !== index);
    setCategoryGrades({
      ...categoryGrades,
      [categoryName]: newGrades
    });
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return "text-success";
    if (grade >= 80) return "text-warning";
    if (grade >= 70) return "text-amber-600";
    return "text-error";
  };

  const getLetterGrade = (grade) => {
    if (grade >= 97) return "A+";
    if (grade >= 93) return "A";
    if (grade >= 90) return "A-";
    if (grade >= 87) return "B+";
    if (grade >= 83) return "B";
    if (grade >= 80) return "B-";
    if (grade >= 77) return "C+";
    if (grade >= 73) return "C";
    if (grade >= 70) return "C-";
    if (grade >= 67) return "D+";
    if (grade >= 60) return "D";
    return "F";
  };

  return (
    <div className="space-y-6">
      {/* Course Selection */}
      <Card>
        <Card.Header>
          <h2 className="text-xl font-display font-semibold text-gray-900">
            Grade Calculator
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Calculate your current grade for any course
          </p>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.Id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedCourse?.Id === course.Id
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => {
                  setSelectedCourse(course);
                  setCategoryGrades({});
                  setCalculatedGrade(null);
                }}
              >
                <div className="flex items-center mb-2">
                  <div
                    className="w-3 h-6 rounded-sm mr-3"
                    style={{ backgroundColor: course.color }}
                  ></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{course.name}</h3>
                    <p className="text-sm text-gray-600">{course.code}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* Grade Input */}
      {selectedCourse && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedCourse.name} - Grade Categories
            </h3>
          </Card.Header>
          <Card.Content className="space-y-6">
            {selectedCourse.gradeCategories?.map((category) => (
              <div key={category.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    <Badge variant="info">{category.weight}%</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addGrade(category.name)}
                  >
                    <ApperIcon name="Plus" className="w-4 h-4 mr-1" />
                    Add Grade
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(categoryGrades[category.name] || []).map((grade, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={grade}
                        onChange={(e) => updateGrade(category.name, index, e.target.value)}
                        placeholder="Grade (0-100)"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGrade(category.name, index)}
                        className="text-error hover:bg-red-50"
                      >
                        <ApperIcon name="X" className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Grade Result */}
      {calculatedGrade !== null && (
        <Card>
          <Card.Content className="p-8 text-center">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Current Grade</h3>
              <div className="space-y-2">
                <div className={`text-4xl font-bold font-display ${getGradeColor(calculatedGrade)}`}>
                  {calculatedGrade.toFixed(1)}%
                </div>
                <div className={`text-2xl font-semibold ${getGradeColor(calculatedGrade)}`}>
                  {getLetterGrade(calculatedGrade)}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Based on weighted category averages
              </p>
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

export default GradeCalculator;