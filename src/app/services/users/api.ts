import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ✅ User registration data type
export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
}

// ✅ Register a new user
export const registerUser = async (data: RegisterUserData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, data, {
      headers: { "Content-Type": "application/json" },
    });

    return { success: true, response: response.data };
  } catch (error: any) {
    console.error("Error registering user:", error);

    // If server sends a message
    if (error.response?.data?.message) {
      return { success: false, message: error.response.data.message };
    }

    return { success: false, message: "Something went wrong" };
  }
};
