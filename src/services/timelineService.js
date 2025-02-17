import api from "./api";

// ✅ Fetch all timelines
export const getTimelines = async () => {
  try {
    const { data } = await api.get("/timelines");
    return data.data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to fetch timelines!";
  }
};

// ✅ Fetch a single timeline by ID
export const getTimelineById = async (id) => {
  try {
    const { data } = await api.get(`/timelines/${id}`);
    return data.data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to fetch timeline!";
  }
};

// ✅ Create a new timeline (Supports file uploads)
export const createTimeline = async (formData) => {
  try {
    const { data } = await api.post("/timelines", formData, {
      headers: { "Content-Type": "multipart/form-data" }, // ✅ Ensure correct headers for file upload
    });
    return data.data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to create timeline!";
  }
};

// ✅ Update a timeline (Supports file uploads)
export const updateTimeline = async (id, formData) => {
  try {
    const { data } = await api.put(`/timelines/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }, // ✅ Ensure correct headers for file upload
    });
    return data.data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to update timeline!";
  }
};

// ✅ Delete a timeline
export const deleteTimeline = async (id) => {
  try {
    const { data } = await api.delete(`/timelines/${id}`);
    return data.data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to delete timeline!";
  }
};
