import api from "./api";

// ✅ Fetch all programs
export const getPrograms = async () => {
  try {
    const { data } = await api.get("/programs");
    return data.data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to fetch programs!";
  }
};

// ✅ Fetch a single program by ID
export const getProgramById = async (id) => {
  try {
    const { data } = await api.get(`/programs/${id}`);
    return data.data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to fetch program!";
  }
};

// ✅ Create a new program (Supports media & infographic uploads)
export const createProgram = async (formData) => {
  try {
    const { data } = await api.post("/programs", formData, {
      headers: { "Content-Type": "multipart/form-data" }, // ✅ Ensure correct headers for file upload
    });
    return data.data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to create program!";
  }
};

// ✅ Update a program (Supports media & infographic uploads)
export const updateProgram = async (id, formData) => {
  try {
    const { data } = await api.put(`/programs/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }, // ✅ Ensure correct headers for file upload
    });
    return data.data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to update program!";
  }
};

// ✅ Delete a program
export const deleteProgram = async (id) => {
  try {
    const { data } = await api.delete(`/programs/${id}`);
    return data.data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to delete program!";
  }
};
