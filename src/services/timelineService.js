import api from "./api";

/**
 * ✅ **Timeline Year Services**
 */
// Fetch all timelines
export const getTimelines = async () => {
  try {
    const { data } = await api.get("/timeline");
    return data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to fetch timelines!";
  }
};

// Fetch a single timeline by ID
export const getTimelineById = async (id) => {
  try {
    const { data } = await api.get(`/timeline/${id}`);
    return data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to fetch timeline!";
  }
};

// Create a new timeline (Year)
export const createTimeline = async (formData) => {
  try {
    const { data } = await api.post("/timeline", formData);
    return data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to create timeline!";
  }
};

// Update a timeline (Year)
export const updateTimelineYear = async (id, formData) => {
  try {
    const { data } = await api.put(`/timeline/${id}`, formData);
    return data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to update timeline!";
  }
};

// Delete a timeline (Year)
export const deleteTimeline = async (id) => {
  try {
    const { data } = await api.delete(`/timeline/${id}`);
    return data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to delete timeline!";
  }
};

/**
 * ✅ **Timeline Entry Services (Under a Specific Year)**
 */
// Add a new entry under a timeline year (Supports media & infographic uploads)
export const addEntryToTimeline = async (id, formData) => {
  try {
    const { data } = await api.post(`/timeline/${id}/entries`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to add entry!";
  }
};

// Update an entry under a timeline year
export const updateEntryInTimeline = async (id, entryId, formData) => {
  try {
    const { data } = await api.put(`/timeline/${id}/entries/${entryId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to update entry!";
  }
};

// Delete an entry from a timeline year
export const deleteEntryFromTimeline = async (id, entryId) => {
  try {
    const { data } = await api.delete(`/timeline/${id}/entries/${entryId}`);
    return data;
  } catch (error) {
    throw error?.response?.data?.message || "Failed to delete entry!";
  }
};
