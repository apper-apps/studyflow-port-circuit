import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { assignmentService } from "@/services/api/assignmentService";
import { courseService } from "@/services/api/courseService";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";

const Calendar = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [assignmentsData, coursesData] = await Promise.all([
        assignmentService.getAll(),
        courseService.getAll()
      ]);
      setAssignments(assignmentsData);
      setCourses(coursesData);
    } catch (err) {
      setError("Failed to load calendar data");
      console.error("Calendar error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCourseById = (courseId) => {
    return courses.find(c => c.Id === courseId);
  };

  const getAssignmentsForDate = (date) => {
    return assignments.filter(assignment => 
      isSameDay(new Date(assignment.dueDate), date)
    );
  };

  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => 
      direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const isOverdue = (assignment) => {
    return new Date(assignment.dueDate) < new Date() && assignment.status !== "completed";
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const calendarDays = getCalendarDays();
  const selectedDateAssignments = getAssignmentsForDate(selectedDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">
            Academic Calendar
          </h1>
          <p className="text-gray-600 mt-1">
            View your assignment deadlines and class schedule
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === "month" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("month")}
          >
            Month
          </Button>
          <Button 
            variant={viewMode === "week" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("week")}
          >
            Week
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <Card.Header className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-gray-900">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth("prev")}
              >
                <ApperIcon name="ChevronLeft" className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth("next")}
              >
                <ApperIcon name="ChevronRight" className="w-4 h-4" />
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
              {/* Days of week header */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((day) => {
                const dayAssignments = getAssignmentsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`bg-white min-h-[80px] p-2 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                      !isCurrentMonth ? "opacity-30" : ""
                    } ${isSelected ? "bg-primary-50 ring-2 ring-primary-500" : ""}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm font-medium ${
                        isToday ? "text-primary-600 font-bold" : "text-gray-900"
                      }`}>
                        {format(day, "d")}
                      </span>
                    </div>
                    
                    {/* Assignment indicators */}
                    <div className="space-y-1">
                      {dayAssignments.slice(0, 2).map((assignment) => {
                        const course = getCourseById(assignment.courseId);
                        return (
                          <div
                            key={assignment.Id}
                            className={`text-xs px-1 py-0.5 rounded truncate ${
                              isOverdue(assignment) 
                                ? "bg-red-100 text-red-800" 
                                : assignment.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                            title={assignment.name}
                          >
                            {assignment.name}
                          </div>
                        );
                      })}
                      {dayAssignments.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayAssignments.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card.Content>
        </Card>

        {/* Selected Date Details */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-display font-semibold text-gray-900">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </h3>
          </Card.Header>
          <Card.Content>
            {selectedDateAssignments.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="Calendar" className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No assignments due</p>
                <p className="text-sm text-gray-500 mt-1">Select another date to see assignments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateAssignments.map((assignment) => {
                  const course = getCourseById(assignment.courseId);
                  return (
                    <div
                      key={assignment.Id}
                      className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {course && (
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: course.color }}
                            ></div>
                          )}
                          <h4 className="font-medium text-gray-900 text-sm">
                            {assignment.name}
                          </h4>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(assignment.priority)}`}></div>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-2">
                        {course?.name} • {course?.code}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={
                            isOverdue(assignment) 
                              ? "error" 
                              : assignment.status === "completed"
                              ? "success"
                              : "warning"
                          }
                          className="text-xs"
                        >
                          {isOverdue(assignment) ? "Overdue" : assignment.status}
                        </Badge>
                        <Badge variant={assignment.priority} className="text-xs">
                          {assignment.priority} priority
                        </Badge>
                      </div>
                      
                      {assignment.description && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                          {assignment.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-display font-semibold text-gray-900">
            Upcoming Deadlines
          </h3>
          <p className="text-sm text-gray-600">Next 7 days</p>
        </Card.Header>
        <Card.Content>
          <div className="space-y-3">
            {assignments
              .filter(assignment => {
                const dueDate = new Date(assignment.dueDate);
                const now = new Date();
                const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                return dueDate >= now && dueDate <= weekFromNow && assignment.status !== "completed";
              })
              .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
              .slice(0, 5)
              .map((assignment) => {
                const course = getCourseById(assignment.courseId);
                return (
                  <div
                    key={assignment.Id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center space-x-3">
                      {course && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: course.color }}
                        ></div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">
                          {assignment.name}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {course?.name} • Due {format(new Date(assignment.dueDate), "MMM dd")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={assignment.priority} className="text-xs">
                        {assignment.priority}
                      </Badge>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(assignment.priority)}`}></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default Calendar;