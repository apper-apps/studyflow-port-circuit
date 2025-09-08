import React, { useState, useEffect } from "react";
import AssignmentList from "@/components/organisms/AssignmentList";
import AssignmentForm from "@/components/organisms/AssignmentForm";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import FilterButtons from "@/components/molecules/FilterButtons";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { assignmentService } from "@/services/api/assignmentService";
import { courseService } from "@/services/api/courseService";
import { toast } from "react-toastify";

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");

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
      setError("Failed to load assignments");
      console.error("Assignments error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAssignment = async (assignmentData) => {
    try {
      if (editingAssignment) {
        const updated = await assignmentService.update(editingAssignment.Id, assignmentData);
        setAssignments(assignments.map(a => a.Id === editingAssignment.Id ? updated : a));
        toast.success("Assignment updated successfully!");
      } else {
        const newAssignment = await assignmentService.create(assignmentData);
        setAssignments([...assignments, newAssignment]);
        toast.success("Assignment added successfully!");
      }
      setShowForm(false);
      setEditingAssignment(null);
    } catch (err) {
      toast.error("Failed to save assignment");
      console.error("Save assignment error:", err);
    }
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setShowForm(true);
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) {
      return;
    }
    
    try {
      await assignmentService.delete(assignmentId);
      setAssignments(assignments.filter(a => a.Id !== assignmentId));
      toast.success("Assignment deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete assignment");
      console.error("Delete assignment error:", err);
    }
  };

  const handleToggleStatus = async (assignmentId) => {
    try {
      const assignment = assignments.find(a => a.Id === assignmentId);
      const newStatus = assignment.status === "completed" ? "pending" : "completed";
      const updated = await assignmentService.update(assignmentId, { ...assignment, status: newStatus });
      setAssignments(assignments.map(a => a.Id === assignmentId ? updated : a));
      toast.success(`Assignment marked as ${newStatus}!`);
    } catch (err) {
      toast.error("Failed to update assignment status");
      console.error("Toggle status error:", err);
    }
  };

  const getFilteredAndSortedAssignments = () => {
    let filtered = assignments.filter(assignment => {
      const matchesSearch = assignment.name.toLowerCase().includes(searchTerm.toLowerCase());
      const course = courses.find(c => c.Id === assignment.courseId);
      const matchesCourse = course && course.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "overdue" && new Date(assignment.dueDate) < new Date() && assignment.status !== "completed") ||
        assignment.status === statusFilter;
      
      return (matchesSearch || matchesCourse) && matchesStatus;
    });

    // Sort assignments
    filtered.sort((a, b) => {
      switch(sortBy) {
        case "dueDate":
          return new Date(a.dueDate) - new Date(b.dueDate);
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "course":
          const courseA = courses.find(c => c.Id === a.courseId)?.name || "";
          const courseB = courses.find(c => c.Id === b.courseId)?.name || "";
          return courseA.localeCompare(courseB);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const statusFilters = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "overdue", label: "Overdue" }
  ];

  const sortOptions = [
    { value: "dueDate", label: "Due Date" },
    { value: "priority", label: "Priority" },
    { value: "course", label: "Course" }
  ];

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  if (showForm) {
    return (
      <AssignmentForm
        assignment={editingAssignment}
        courses={courses}
        onSave={handleSaveAssignment}
        onCancel={() => {
          setShowForm(false);
          setEditingAssignment(null);
        }}
      />
    );
  }

  const filteredAssignments = getFilteredAndSortedAssignments();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">
            Assignments
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage your coursework deadlines
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowForm(true)}
          className="shrink-0"
        >
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Assignment
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search assignments or courses..."
          className="flex-1 max-w-md"
        />
        
        <div className="flex flex-col sm:flex-row gap-4">
          <FilterButtons
            filters={statusFilters}
            activeFilter={statusFilter}
            onFilterChange={setStatusFilter}
          />
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Assignment List */}
      {filteredAssignments.length === 0 ? (
        assignments.length === 0 ? (
          <Empty
            title="No assignments yet"
            description="Add your first assignment to start tracking deadlines and staying organized."
            actionText="Add Your First Assignment"
            icon="FileText"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <Empty
            title="No assignments found"
            description="Try adjusting your search or filter criteria."
            icon="Search"
          />
        )
      ) : (
        <AssignmentList
          assignments={filteredAssignments}
          courses={courses}
          onEdit={handleEditAssignment}
          onDelete={handleDeleteAssignment}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Quick Stats */}
      {assignments.length > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold font-display text-primary-600">
                {assignments.length}
              </p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-success">
                {assignments.filter(a => a.status === "completed").length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-warning">
                {assignments.filter(a => a.status === "pending").length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-error">
                {assignments.filter(a => 
                  new Date(a.dueDate) < new Date() && a.status !== "completed"
                ).length}
              </p>
              <p className="text-sm text-gray-600">Overdue</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;