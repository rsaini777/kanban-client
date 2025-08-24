import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ✅ Task types
export interface Task {
  _id: string;
  projectName: string;
  title: string;
  description: string;
  status: "Yet To Start" | "In Progress" | "Completed";
  priority: "low" | "medium" | "high";
}

export interface CreateTaskData {
  title: string;
  description: string;
  status: Task["status"];
  priority: Task["priority"];
  projectId: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: Task["status"];
  priority?: Task["priority"];
}

// ✅ Fetch all tasks for a project
export const getAllTasks = async (projectId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tasks/${projectId}`);
    return response.data; 
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { success: false };
  }
};

// ✅ Fetch single task by ID
export const getTaskById = async (projectId: string, taskId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tasks/${projectId}/${taskId}`);
    return response.data; // { tasks: Task }
  } catch (error) {
    console.error("Error fetching task:", error);
    return { success: false };
  }
};

// ✅ Create a new task
export const createTask = async (data: CreateTaskData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/tasks`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return { success: true, response: response.data };
  } catch (error) {
    console.error("Error creating task:", error);
    return { success: false };
  }
};

// ✅ Update a task
export const updateTask = async (
  projectId: string,
  taskId: string,
  data: UpdateTaskData
) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/tasks/${projectId}/${taskId}`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return { success: true, response: response.data };
  } catch (error) {
    console.error("Error updating task:", error);
    return { success: false };
  }
};

// ✅ Delete a task
export const deleteTask = async (projectId: string, taskId: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/tasks/${projectId}/${taskId}`);
    return { success: true, response: response.data };
  } catch (error) {
    console.error("Error deleting task:", error);
    return { success: false };
  }
};
