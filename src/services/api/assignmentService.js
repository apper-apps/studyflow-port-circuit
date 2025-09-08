import assignmentsData from "@/services/mockData/assignments.json";

class AssignmentService {
  constructor() {
    this.assignments = [...assignmentsData];
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.assignments];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const assignment = this.assignments.find(a => a.Id === parseInt(id));
    if (!assignment) throw new Error("Assignment not found");
    return { ...assignment };
  }

  async create(assignmentData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const maxId = Math.max(...this.assignments.map(a => a.Id), 0);
    const newAssignment = {
      Id: maxId + 1,
      ...assignmentData,
      grade: null
    };
    
    this.assignments.push(newAssignment);
    return { ...newAssignment };
  }

  async update(id, assignmentData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.assignments.findIndex(a => a.Id === parseInt(id));
    if (index === -1) throw new Error("Assignment not found");
    
    this.assignments[index] = { ...this.assignments[index], ...assignmentData };
    return { ...this.assignments[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.assignments.findIndex(a => a.Id === parseInt(id));
    if (index === -1) throw new Error("Assignment not found");
    
    this.assignments.splice(index, 1);
    return true;
  }
}

export const assignmentService = new AssignmentService();