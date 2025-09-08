import React, { useState, useEffect } from "react";
import StatCard from "@/components/molecules/StatCard";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { courseService } from "@/services/api/courseService";
import { assignmentService } from "@/services/api/assignmentService";
import { format, isAfter, isBefore, addDays } from "date-fns";

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
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
      setError("Failed to load dashboard data");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  const calculateStats = () => {
    const now = new Date();
    const weekFromNow = addDays(now, 7);
    
    const upcomingAssignments = assignments.filter(a => 
      a.status !== "completed" && 
      isAfter(new Date(a.dueDate), now) && 
      isBefore(new Date(a.dueDate), weekFromNow)
    );
    
    const overdueAssignments = assignments.filter(a => 
      a.status !== "completed" && 
      isBefore(new Date(a.dueDate), now)
    );
    
    const completedAssignments = assignments.filter(a => a.status === "completed");
    const totalAssignments = assignments.length;
    const completionRate = totalAssignments > 0 ? (completedAssignments.length / totalAssignments) * 100 : 0;
    
    const gradesWithValues = courses.filter(c => c.currentGrade > 0);
    const averageGPA = gradesWithValues.length > 0 
      ? gradesWithValues.reduce((sum, c) => sum + (c.currentGrade / 25), 0) / gradesWithValues.length
      : 0;

    return {
      totalCourses: courses.length,
      upcomingCount: upcomingAssignments.length,
      overdueCount: overdueAssignments.length,
      completionRate,
      averageGPA,
      upcomingAssignments: upcomingAssignments.slice(0, 5),
      recentGrades: courses.filter(c => c.currentGrade > 0).slice(0, 4)
    };
  };

  const stats = calculateStats();

  const getCourseById = (courseId) => {
    return courses.find(c => c.Id === courseId);
  };

  const getPriorityVariant = (priority) => {
    switch(priority) {
      case "high": return "high";
      case "medium": return "medium";  
      case "low": return "low";
      default: return "default";
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return "text-success";
    if (grade >= 80) return "text-warning";
    if (grade >= 70) return "text-amber-600";
    return "text-error";
  };

  if (courses.length === 0) {
    return (
      <Empty
        title="Welcome to StudyFlow!"
        description="Start by adding your first course to track assignments and grades."
        actionText="Add Your First Course"
        icon="GraduationCap"
        onAction={() => window.location.href = "/courses"}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          icon="BookOpen"
          gradient={true}
        />
        <StatCard
          title="Upcoming Deadlines"
          value={stats.upcomingCount}
          change="Next 7 days"
          changeType={stats.upcomingCount > 0 ? "neutral" : "positive"}
          icon="Clock"
        />
        <StatCard
          title="Overdue Items"
          value={stats.overdueCount}
          changeType={stats.overdueCount > 0 ? "negative" : "positive"}
          icon="AlertTriangle"
        />
        <StatCard
          title="Completion Rate"
          value={`${Math.round(stats.completionRate)}%`}
          change={stats.completionRate >= 80 ? "Great progress!" : "Keep going!"}
          changeType={stats.completionRate >= 80 ? "positive" : "neutral"}
          icon="Award"
          gradient={true}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Assignments */}
        <Card>
          <Card.Header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display font-semibold text-gray-900">
                Upcoming Assignments
              </h2>
              <p className="text-sm text-gray-600">Next 7 days</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = "/assignments"}
            >
              <ApperIcon name="Plus" className="w-4 h-4 mr-1" />
              Add Assignment
            </Button>
          </Card.Header>
          <Card.Content>
            {stats.upcomingAssignments.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="CheckCircle" className="w-12 h-12 mx-auto text-success mb-4" />
                <p className="text-gray-600">No upcoming deadlines!</p>
                <p className="text-sm text-gray-500 mt-1">You're all caught up</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.upcomingAssignments.map((assignment) => {
                  const course = getCourseById(assignment.courseId);
                  return (
                    <div
                      key={assignment.Id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        {course && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: course.color }}
                          ></div>
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm">
                            {assignment.name}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {course?.name} • Due {format(new Date(assignment.dueDate), "MMM dd")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getPriorityVariant(assignment.priority)} className="text-xs">
                          {assignment.priority}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Recent Grades */}
        <Card>
          <Card.Header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display font-semibold text-gray-900">
                Course Performance
              </h2>
              <p className="text-sm text-gray-600">Current grades overview</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = "/grades"}
            >
              View All
            </Button>
          </Card.Header>
          <Card.Content>
            {stats.recentGrades.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="BarChart3" className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No grades available</p>
                <p className="text-sm text-gray-500 mt-1">Grades will appear here once added</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentGrades.map((course) => (
                  <div
                    key={course.Id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-6 rounded-sm"
                        style={{ backgroundColor: course.color }}
                      ></div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">
                          {course.name}
                        </h3>
                        <p className="text-xs text-gray-600">{course.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getGradeColor(course.currentGrade)}`}>
                        {course.currentGrade}%
                      </p>
                      <p className="text-xs text-gray-500">Current</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-display font-semibold text-gray-900">
            Quick Actions
          </h2>
          <p className="text-sm text-gray-600">Common tasks to keep you organized</p>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="primary"
              className="justify-start h-auto p-4"
              onClick={() => window.location.href = "/courses"}
            >
              <div className="flex items-center">
                <ApperIcon name="Plus" className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Add Course</div>
                  <div className="text-xs opacity-90">New semester course</div>
                </div>
              </div>
            </Button>
            
            <Button
              variant="secondary"
              className="justify-start h-auto p-4"
              onClick={() => window.location.href = "/assignments"}
            >
              <div className="flex items-center">
                <ApperIcon name="FileText" className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Add Assignment</div>
                  <div className="text-xs opacity-75">Track new deadline</div>
                </div>
              </div>
            </Button>
            
            <Button
              variant="secondary"
              className="justify-start h-auto p-4"
              onClick={() => window.location.href = "/calendar"}
            >
              <div className="flex items-center">
                <ApperIcon name="Calendar" className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">View Calendar</div>
                  <div className="text-xs opacity-75">See all deadlines</div>
                </div>
              </div>
            </Button>
            
            <Button
              variant="accent"
              className="justify-start h-auto p-4"
              onClick={() => window.location.href = "/grades"}
            >
              <div className="flex items-center">
                <ApperIcon name="Calculator" className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Grade Calculator</div>
                  <div className="text-xs opacity-90">Calculate GPA</div>
                </div>
              </div>
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default Dashboard;