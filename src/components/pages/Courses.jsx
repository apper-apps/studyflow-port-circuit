import React, { useState, useEffect } from "react";
import CourseCard from "@/components/organisms/CourseCard";
import CourseForm from "@/components/organisms/CourseForm";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import FilterButtons from "@/components/molecules/FilterButtons";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { courseService } from "@/services/api/courseService";
import { toast } from "react-toastify";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("all");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await courseService.getAll();
      setCourses(data);
    } catch (err) {
      setError("Failed to load courses");
      console.error("Courses error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCourse = async (courseData) => {
    try {
      if (editingCourse) {
        const updatedCourse = await courseService.update(editingCourse.Id, courseData);
        setCourses(courses.map(c => c.Id === editingCourse.Id ? updatedCourse : c));
        toast.success("Course updated successfully!");
      } else {
        const newCourse = await courseService.create(courseData);
        setCourses([...courses, newCourse]);
        toast.success("Course added successfully!");
      }
      setShowForm(false);
      setEditingCourse(null);
    } catch (err) {
      toast.error("Failed to save course");
      console.error("Save course error:", err);
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }
    
    try {
      await courseService.delete(courseId);
      setCourses(courses.filter(c => c.Id !== courseId));
      toast.success("Course deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete course");
      console.error("Delete course error:", err);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = selectedSemester === "all" || course.semester === selectedSemester;
    return matchesSearch && matchesSemester;
  });

  const uniqueSemesters = [...new Set(courses.map(c => c.semester))];
  const semesterFilters = [
    { value: "all", label: "All Semesters" },
    ...uniqueSemesters.map(semester => ({ value: semester, label: semester }))
  ];

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadCourses} />;

  if (showForm) {
    return (
      <CourseForm
        course={editingCourse}
        onSave={handleSaveCourse}
        onCancel={() => {
          setShowForm(false);
          setEditingCourse(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">
            My Courses
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your academic courses and track progress
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowForm(true)}
          className="shrink-0"
        >
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search courses..."
          className="flex-1 max-w-md"
        />
        <FilterButtons
          filters={semesterFilters}
          activeFilter={selectedSemester}
          onFilterChange={setSelectedSemester}
        />
      </div>

      {/* Course List */}
      {filteredCourses.length === 0 ? (
        courses.length === 0 ? (
          <Empty
            title="No courses yet"
            description="Add your first course to start tracking your academic progress."
            actionText="Add Your First Course"
            icon="BookOpen"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <Empty
            title="No courses found"
            description="Try adjusting your search or filter criteria."
            icon="Search"
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.Id} className="relative group">
              <CourseCard
                course={course}
                onClick={handleEditCourse}
              />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCourse(course);
                    }}
                    className="bg-white shadow-sm"
                  >
                    <ApperIcon name="Edit" className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCourse(course.Id);
                    }}
                    className="bg-white shadow-sm text-error hover:bg-red-50"
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {courses.length > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold font-display text-primary-600">
                {courses.length}
              </p>
              <p className="text-sm text-gray-600">Total Courses</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-primary-600">
                {courses.reduce((sum, c) => sum + c.credits, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Credits</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-primary-600">
                {uniqueSemesters.length}
              </p>
              <p className="text-sm text-gray-600">Semesters</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;