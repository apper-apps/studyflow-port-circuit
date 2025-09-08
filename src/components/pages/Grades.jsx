import React, { useState, useEffect } from "react";
import GradeCalculator from "@/components/organisms/GradeCalculator";
import StatCard from "@/components/molecules/StatCard";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { courseService } from "@/services/api/courseService";
import { assignmentService } from "@/services/api/assignmentService";

const Grades = () => {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [coursesData, assignmentsData] = await Promise.all([
        courseService.getAll(),
        assignmentService.getAll()
      ]);
      setCourses(coursesData);
      setAssignments(assignmentsData);
    } catch (err) {
      setError("Failed to load grades data");
      console.error("Grades error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateGradeStats = () => {
    const coursesWithGrades = courses.filter(c => c.currentGrade > 0);
    
    if (coursesWithGrades.length === 0) {
      return {
        overallGPA: 0,
        averageGrade: 0,
        highestGrade: 0,
        lowestGrade: 0,
        totalCredits: courses.reduce((sum, c) => sum + c.credits, 0),
        completedAssignments: assignments.filter(a => a.status === "completed" && a.grade !== null).length
      };
    }

    const grades = coursesWithGrades.map(c => c.currentGrade);
    const totalCredits = coursesWithGrades.reduce((sum, c) => sum + c.credits, 0);
    const weightedSum = coursesWithGrades.reduce((sum, c) => sum + (c.currentGrade * c.credits), 0);
    
    return {
      overallGPA: totalCredits > 0 ? (weightedSum / totalCredits) / 25 : 0, // Convert to 4.0 scale
      averageGrade: grades.reduce((sum, g) => sum + g, 0) / grades.length,
      highestGrade: Math.max(...grades),
      lowestGrade: Math.min(...grades),
      totalCredits,
      completedAssignments: assignments.filter(a => a.status === "completed" && a.grade !== null).length
    };
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

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  if (courses.length === 0) {
    return (
      <Empty
        title="No courses to display grades"
        description="Add your courses first to start tracking grades and calculating your GPA."
        actionText="Add Your First Course"
        icon="Award"
        onAction={() => window.location.href = "/courses"}
      />
    );
  }

  const stats = calculateGradeStats();
  const coursesWithGrades = courses.filter(c => c.currentGrade > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">
            Grades & GPA
          </h1>
          <p className="text-gray-600 mt-1">
            Track your academic performance and calculate grades
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Overall GPA"
          value={stats.overallGPA.toFixed(2)}
          change={stats.overallGPA >= 3.5 ? "Excellent!" : stats.overallGPA >= 3.0 ? "Good work" : "Keep improving"}
          changeType={stats.overallGPA >= 3.5 ? "positive" : stats.overallGPA >= 3.0 ? "neutral" : "negative"}
          icon="Award"
          gradient={true}
        />
        <StatCard
          title="Average Grade"
          value={`${Math.round(stats.averageGrade)}%`}
          icon="TrendingUp"
        />
        <StatCard
          title="Total Credits"
          value={stats.totalCredits}
          icon="BookOpen"
        />
        <StatCard
          title="Completed"
          value={stats.completedAssignments}
          change="assignments graded"
          changeType="neutral"
          icon="CheckCircle"
        />
      </div>

      {/* Grade Overview */}
      {coursesWithGrades.length > 0 && (
        <Card>
          <Card.Header>
            <h2 className="text-xl font-display font-semibold text-gray-900">
              Course Grades
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Current performance by course
            </p>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {coursesWithGrades.map((course) => (
                <div
                  key={course.Id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-100 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-4 h-8 rounded-sm"
                      style={{ backgroundColor: course.color }}
                    ></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {course.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {course.code} • {course.credits} credits
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className={`text-2xl font-bold font-display ${getGradeColor(course.currentGrade)}`}>
                        {course.currentGrade}%
                      </div>
                      <Badge 
                        variant={
                          course.currentGrade >= 90 ? "success" :
                          course.currentGrade >= 80 ? "warning" :
                          course.currentGrade >= 70 ? "info" : "error"
                        }
                      >
                        {getLetterGrade(course.currentGrade)}
                      </Badge>
                    </div>
                    
                    <div className="w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          className="text-gray-200"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="url(#gradient)"
                          strokeWidth="4"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${(course.currentGrade / 100) * 175.929} 175.929`}
                          className="transition-all duration-500 ease-out"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#5b21b6" />
                            <stop offset="100%" stopColor="#7c3aed" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Grade Calculator */}
      <GradeCalculator courses={courses} assignments={assignments} />

      {/* Grade Distribution */}
      {coursesWithGrades.length > 0 && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-display font-semibold text-gray-900">
              Grade Distribution
            </h3>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {["A", "B", "C", "D", "F"].map((grade) => {
                const count = coursesWithGrades.filter(course => {
                  const g = course.currentGrade;
                  switch(grade) {
                    case "A": return g >= 90;
                    case "B": return g >= 80 && g < 90;
                    case "C": return g >= 70 && g < 80;
                    case "D": return g >= 60 && g < 70;
                    case "F": return g < 60;
                    default: return false;
                  }
                }).length;
                
                return (
                  <div key={grade} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold font-display text-gray-900">
                      {count}
                    </div>
                    <div className="text-sm text-gray-600">{grade} Grades</div>
                  </div>
                );
              })}
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

export default Grades;