import api from "./api";

/**
 * ✅ **Program Services**
 */
// Fetch all programs
export const getPrograms = async () => {
  try {
    const { data } = await api.get("/program");
    return data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to fetch programs!";
  }
};

// Fetch a single program by ID
export const getProgramById = async (id) => {
  try {
    const { data } = await api.get(`/program/${id}`);
    return data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to fetch program!";
  }
};

// Create a new program (No entries)
export const createProgram = async (formData) => {
  try {
    const { data } = await api.post("/program", formData);
    return data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to create program!";
  }
};

// Update a program (Title, X/Y Positions)
export const updateProgram = async (id, formData) => {
  try {
    const { data } = await api.put(`/program/${id}`, formData);
    return data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to update program!";
  }
};

// Delete a program (Removes all entries)
export const deleteProgram = async (id) => {
  try {
    const { data } = await api.delete(`/program/${id}`);
    return data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to delete program!";
  }
};

/**
 * ✅ **Program Entry Services (Under a Specific Program)**
 */
// Add a new entry under a program (Supports media & infographic uploads)
export const addEntryToProgram = async (id, formData) => {
  try {
    const { data } = await api.post(`/program/${id}/entries`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to add entry!";
  }
};

// Update an entry under a program
export const updateEntryInProgram = async (id, entryId, formData) => {
  try {
    const { data } = await api.put(`/program/${id}/entries/${entryId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to update entry!";
  }
};

// Delete an entry from a program
export const deleteEntryFromProgram = async (id, entryId) => {
  try {
    const { data } = await api.delete(`/program/${id}/entries/${entryId}`);
    return data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to delete entry!";
  }
};
