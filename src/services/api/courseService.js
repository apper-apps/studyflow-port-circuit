class CourseService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'course_c';
  }

  // Map UI field names to database field names
  mapToDatabase(data) {
    return {
      Name: data.name || data.Name,
      code_c: data.code || data.code_c,
      semester_c: data.semester || data.semester_c,
      credits_c: parseInt(data.credits || data.credits_c) || 0,
      color_c: data.color || data.color_c,
      instructor_c: data.instructor || data.instructor_c,
      current_grade_c: parseInt(data.currentGrade || data.current_grade_c) || 0,
      grade_categories_c: typeof (data.gradeCategories || data.grade_categories_c) === 'string' 
        ? data.gradeCategories || data.grade_categories_c 
        : JSON.stringify(data.gradeCategories || data.grade_categories_c || [])
    };
  }

  // Map database field names to UI field names
  mapFromDatabase(data) {
    if (!data) return data;
    
    return {
      Id: data.Id,
      name: data.Name || '',
      code: data.code_c || '',
      semester: data.semester_c || '',
      credits: data.credits_c || 0,
      color: data.color_c || '#5b21b6',
      instructor: data.instructor_c || '',
      currentGrade: data.current_grade_c || 0,
      gradeCategories: (() => {
        try {
          return typeof data.grade_categories_c === 'string' 
            ? JSON.parse(data.grade_categories_c)
            : data.grade_categories_c || [];
        } catch {
          return [];
        }
      })(),
      // Keep database field names for backward compatibility
      Name: data.Name,
      code_c: data.code_c,
      semester_c: data.semester_c,
      credits_c: data.credits_c,
      color_c: data.color_c,
      instructor_c: data.instructor_c,
      current_grade_c: data.current_grade_c,
      grade_categories_c: data.grade_categories_c
    };
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "code_c" } },
          { field: { Name: "semester_c" } },
          { field: { Name: "credits_c" } },
          { field: { Name: "color_c" } },
          { field: { Name: "instructor_c" } },
          { field: { Name: "current_grade_c" } },
          { field: { Name: "grade_categories_c" } }
        ],
        orderBy: [
          { fieldName: "Name", sorttype: "ASC" }
        ]
      };

      const response = await this.client.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return (response.data || []).map(course => this.mapFromDatabase(course));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching courses:", error?.response?.data?.message);
      } else {
        console.error("Error fetching courses:", error);
      }
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "code_c" } },
          { field: { Name: "semester_c" } },
          { field: { Name: "credits_c" } },
          { field: { Name: "color_c" } },
          { field: { Name: "instructor_c" } },
          { field: { Name: "current_grade_c" } },
          { field: { Name: "grade_categories_c" } }
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
        console.error(`Error fetching course with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error("Error fetching course:", error);
      }
      throw error;
    }
  }

  async create(courseData) {
    try {
      const mappedData = this.mapToDatabase(courseData);
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
          console.error(`Failed to create course ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`Course creation error: ${error}`);
            });
          });
        }
        
        if (successfulRecords.length > 0) {
          return this.mapFromDatabase(successfulRecords[0].data);
        }
      }

      throw new Error("Failed to create course");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating course:", error?.response?.data?.message);
      } else {
        console.error("Error creating course:", error);
      }
      throw error;
    }
  }

  async update(id, courseData) {
    try {
      const mappedData = this.mapToDatabase(courseData);
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
          console.error(`Failed to update course ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`Course update error: ${error}`);
            });
          });
        }
        
        if (successfulUpdates.length > 0) {
          return this.mapFromDatabase(successfulUpdates[0].data);
        }
      }

      throw new Error("Failed to update course");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating course:", error?.response?.data?.message);
      } else {
        console.error("Error updating course:", error);
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
          console.error(`Failed to delete course ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) console.error(`Course deletion error: ${record.message}`);
          });
        }
        
        return successfulDeletions.length > 0;
      }

      return true;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting course:", error?.response?.data?.message);
      } else {
        console.error("Error deleting course:", error);
      }
      throw error;
    }
  }
}

export const courseService = new CourseService();