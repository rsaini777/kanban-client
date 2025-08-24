import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface Project {
  _id: string;
  name: string;
  invitedUsers: string; // array of user IDs
}

export interface CreateProjectData {
  name: string;
  invitedUsers: string;
}

export interface UpdateProjectData {
  name?: string;
  invitedUsers?: string;
}

// ✅ Fetch all projects for a user
export const getProjects = async (userId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects/${userId}`);
    return response.data; 
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { success: false };
  }
};

// ✅ Fetch single project by ID
export const getProjectById = async (userId: string, projectId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects/${userId}/${projectId}`);
    return response.data; // { project: Project }
  } catch (error) {
    console.error("Error fetching project:", error);
    return { success: false };
  }
};

// ✅ Create a new project
export const createProject = async (data: CreateProjectData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/projects`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return { success: true, response: response.data };
  } catch (error) {
    console.error("Error creating project:", error);
    return { success: false };
  }
};

// ✅ Update a project
export const updateProject = async (projectId: string, data: UpdateProjectData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/projects/${projectId}`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return { success: true, response: response.data };
  } catch (error) {
    console.error("Error updating project:", error);
    return { success: false };
  }
};

// ✅ Delete a project
export const deleteProject = async (projectId: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/projects/${projectId}`);
    return { success: true, response: response.data };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { success: false };
  }
};
