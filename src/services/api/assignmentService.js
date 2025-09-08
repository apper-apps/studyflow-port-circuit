class AssignmentService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'assignment_c';
  }

  // Map UI field names to database field names
  mapToDatabase(data) {
    const mapped = {
      Name: data.name || data.Name,
      course_id_c: parseInt(data.courseId || data.course_id_c) || null,
      status_c: data.status || data.status_c || 'pending',
      priority_c: data.priority || data.priority_c || 'medium',
      category_c: data.category || data.category_c,
      description_c: data.description || data.description_c
    };

    // Handle date field
    if (data.dueDate || data.due_date_c) {
      const dueDate = data.dueDate || data.due_date_c;
      mapped.due_date_c = typeof dueDate === 'string' ? dueDate : dueDate.toISOString();
    }

    // Handle numeric fields
    if (data.grade !== undefined || data.grade_c !== undefined) {
      mapped.grade_c = data.grade !== null ? parseInt(data.grade || data.grade_c) || null : null;
    }
    
    if (data.maxGrade !== undefined || data.max_grade_c !== undefined) {
      mapped.max_grade_c = parseInt(data.maxGrade || data.max_grade_c) || 100;
    }

    return mapped;
  }

  // Map database field names to UI field names
  mapFromDatabase(data) {
    if (!data) return data;
    
    return {
      Id: data.Id,
      name: data.Name || '',
      courseId: data.course_id_c?.Id || data.course_id_c || null,
      dueDate: data.due_date_c || '',
      status: data.status_c || 'pending',
      priority: data.priority_c || 'medium',
      grade: data.grade_c || null,
      maxGrade: data.max_grade_c || 100,
      category: data.category_c || '',
      description: data.description_c || '',
      // Keep database field names for backward compatibility
      Name: data.Name,
      course_id_c: data.course_id_c,
      due_date_c: data.due_date_c,
      status_c: data.status_c,
      priority_c: data.priority_c,
      grade_c: data.grade_c,
      max_grade_c: data.max_grade_c,
      category_c: data.category_c,
      description_c: data.description_c
    };
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "course_id_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "priority_c" } },
          { field: { Name: "grade_c" } },
          { field: { Name: "max_grade_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "description_c" } }
        ],
        orderBy: [
          { fieldName: "due_date_c", sorttype: "ASC" }
        ]
      };

      const response = await this.client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return (response.data || []).map(assignment => this.mapFromDatabase(assignment));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching assignments:", error?.response?.data?.message);
      } else {
        console.error("Error fetching assignments:", error);
      }
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "course_id_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "priority_c" } },
          { field: { Name: "grade_c" } },
          { field: { Name: "max_grade_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "description_c" } }
        ]
      };

      const response = await this.client.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return this.mapFromDatabase(response.data);
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching assignment with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error("Error fetching assignment:", error);
      }
      throw error;
    }
  }

  async create(assignmentData) {
    try {
      const mappedData = this.mapToDatabase(assignmentData);
      const params = {
        records: [mappedData]
      };

      const response = await this.client.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create assignment ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`Assignment creation error: ${error}`);
            });
          });
        }
        
        if (successfulRecords.length > 0) {
          return this.mapFromDatabase(successfulRecords[0].data);
        }
      }

      throw new Error("Failed to create assignment");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating assignment:", error?.response?.data?.message);
      } else {
        console.error("Error creating assignment:", error);
      }
      throw error;
    }
  }

  async update(id, assignmentData) {
    try {
      const mappedData = this.mapToDatabase(assignmentData);
      mappedData.Id = parseInt(id);
      
      const params = {
        records: [mappedData]
      };

      const response = await this.client.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update assignment ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`Assignment update error: ${error}`);
            });
          });
        }
        
        if (successfulUpdates.length > 0) {
          return this.mapFromDatabase(successfulUpdates[0].data);
        }
      }

      throw new Error("Failed to update assignment");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating assignment:", error?.response?.data?.message);
      } else {
        console.error("Error updating assignment:", error);
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.client.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete assignment ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) console.error(`Assignment deletion error: ${record.message}`);
          });
        }
        
        return successfulDeletions.length > 0;
      }

      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting assignment:", error?.response?.data?.message);
      } else {
        console.error("Error deleting assignment:", error);
      }
      throw error;
    }
  }
}

export const assignmentService = new AssignmentService();