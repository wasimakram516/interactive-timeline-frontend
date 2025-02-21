"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  getTimelines,
  createTimeline,
  updateTimelineYear,
  deleteTimeline,
  addEntryToTimeline,
  updateEntryInTimeline,
  deleteEntryFromTimeline,
} from "../../services/timelineService";
import {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  addEntryToProgram,
  updateEntryInProgram,
  deleteEntryFromProgram,
} from "../../services/programService";
import {
  Box,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Input,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { motion } from "framer-motion";
import ConfirmationDialog from "../components/ConfirmationDialog";
import * as yup from "yup";

const MotionDiv = motion.div;

// Dynamic validation schema for timeline/program form
const getItemSchema = (isProgram) => {
  return yup.object().shape({
    [isProgram ? "title" : "year"]: isProgram
      ? yup.string().required("Title is required")
      : yup.number().required("Year is required"),
    xPosition: yup.number().required("X Position is required"),
    yPosition: yup.number().required("Y Position is required"),
  });
};

// Validation schema for entry form
// ✅ Updated validation schema
const entrySchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup
    .string()
    .required("Description is required")
    .test(
      "non-empty-lines",
      "Description must have at least one non-empty line",
      (value) => {
        // Split into lines and check if any line is non-empty
        return value.split("\n").some((line) => line.trim().length > 0);
      }
    ),
  xPosition: yup.number().required("X Position is required"),
  yPosition: yup.number().required("Y Position is required"),
});

export default function CMSPage() {
  const router = useRouter();
  const [timelines, setTimelines] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEntryDialog, setOpenEntryDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [isEditingProgram, setIsEditingProgram] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [entryErrors, setEntryErrors] = useState({});

  const [formData, setFormData] = useState({
    year: "",
    title: "",
    xPosition: "",
    yPosition: "",
  });
  const [entryForm, setEntryForm] = useState({
    title: "",
    description: "",
    xPosition: "",
    yPosition: "",
    media: [],
    mediaXPositions: [],
    mediaYPositions: [],
    infographics: [],
    infographicXPositions: [],
    infographicYPositions: [],
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch data on mount
  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) return router.push("/login");

    const fetchData = async () => {
      setLoading(true);
      try {
        const [timelinesResponse, programsResponse] = await Promise.all([
          getTimelines(),
          getPrograms(),
        ]);

        // ✅ Ensure `timelines` and `programs` are always arrays before setting state
        setTimelines(
          Array.isArray(timelinesResponse?.data) ? timelinesResponse.data : []
        );
        setPrograms(
          Array.isArray(programsResponse?.data) ? programsResponse.data : []
        );
      } catch (error) {
        console.error("❌ Fetch Error:", error);
        setSnackbar({
          open: true,
          message: error?.response?.data?.message || "Failed to fetch data",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Open dialog for adding/editing timeline/program
  const handleOpenDialog = (item = null, isProgram = false) => {
    setIsEditingProgram(isProgram);
    setEditingItem(item);
    setFormData({
      year: item?.year || "", // For timelines
      title: item?.title || "", // For programs
      xPosition: item?.xPosition || "",
      yPosition: item?.yPosition || "",
    });
    setOpenDialog(true);
  };

  // Close dialog and reset form
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setFormData({ title: "", xPosition: "", yPosition: "" });
  };

  // Handle form submission for timeline/program
  const handleSubmit = async () => {
    try {
      setFormErrors({}); // Clear previous errors
      const schema = getItemSchema(isEditingProgram);
  
      // ✅ Validate locally before making the request
      await schema.validate(formData, { abortEarly: false });
  
      let response;
      if (editingItem) {
        response = isEditingProgram
          ? await updateProgram(editingItem._id, formData)
          : await updateTimelineYear(editingItem._id, formData);
      } else {
        response = isEditingProgram
          ? await createProgram(formData)
          : await createTimeline(formData);
      }
  
      setSnackbar({
        open: true,
        message: response.message || "Operation successful",
        severity: response.success ? "success" : "error",
      });
  
      handleCloseDialog();
  
      // ✅ Fetch latest data immediately
      const [updatedTimelines, updatedPrograms] = await Promise.all([
        getTimelines(),
        getPrograms(),
      ]);
      setTimelines(updatedTimelines?.data || []);
      setPrograms(updatedPrograms?.data || []);
    } catch (error) {
      if (error.inner) {
        // ✅ Show field-specific validation errors
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setFormErrors(newErrors);
      } else {
        setSnackbar({
          open: true,
          message: error?.response?.data?.message || "Failed to process request",
          severity: "error",
        });
      }
    }
  };
  const handleOpenEntryDialog = (parentId, entry = null) => {
    const parentItem =
      activeTab === 0
        ? timelines.find((t) => t._id === parentId)
        : programs.find((p) => p._id === parentId);

    if (entry && !parentItem?.entries.some((e) => e._id === entry._id)) {
      console.error("❌ Entry does not exist in the latest state.");
      setSnackbar({
        open: true,
        message: "Entry not found. It may have been deleted.",
        severity: "error",
      });
      return;
    }

    setSelectedParentId(parentId);
    setEditingEntry(entry);

    let formattedDescription = "";
  if (entry?.description) {
    if (Array.isArray(entry.description)) {
      // If description is stored as a proper array
      formattedDescription = entry.description.join("\n");
    }
  }

    setEntryForm(
      entry
        ? {
            ...entry,
            description: formattedDescription, // Use the formatted description
            media: entry.media || [], // ✅ Ensure media is always an array
            mediaXPositions: entry.media.map((m) => m.xPosition || 50), // ✅ Extract X Positions
            mediaYPositions: entry.media.map((m) => m.yPosition || 50), // ✅ Extract Y Positions
            infographics: entry.infographics || [], // ✅ Ensure infographics is always an array
            infographicXPositions: entry.infographics.map(
              (i) => i.xPosition || 50
            ),
            infographicYPositions: entry.infographics.map(
              (i) => i.yPosition || 50
            ),
          }
        : {
            title: "",
            description: "",
            xPosition: "",
            yPosition: "",
            media: [],
            mediaXPositions: [],
            mediaYPositions: [],
            infographics: [],
            infographicXPositions: [],
            infographicYPositions: [],
          }
    );

    setOpenEntryDialog(true);
  };
  // Handle delete confirmation (Updated to use entryId)
  const confirmDelete = (id, isProgram = false, entryId = null) => {
    if (entryId) {
      setEntryToDelete({ id, entryId });
    } else {
      setItemToDelete({ id, isProgram });
    }
    setConfirmationOpen(true);
  };

  // Handle delete action (Updated to use entryId)
  const handleDelete = async () => {
    if (!itemToDelete && !entryToDelete) return;

    setActionLoading(true);
    try {
      let result = null;

      if (entryToDelete) {
        if (activeTab === 0) {
          result = await deleteEntryFromTimeline(
            entryToDelete.id,
            entryToDelete.entryId
          );
          setTimelines((prev) =>
            prev.map((timeline) =>
              timeline._id === entryToDelete.id
                ? {
                    ...timeline,
                    entries: timeline.entries.filter(
                      (entry) => entry._id !== entryToDelete.entryId
                    ),
                  }
                : timeline
            )
          );
        } else {
          result = await deleteEntryFromProgram(
            entryToDelete.id,
            entryToDelete.entryId
          );
          setPrograms((prev) =>
            prev.map((program) =>
              program._id === entryToDelete.id
                ? {
                    ...program,
                    entries: program.entries.filter(
                      (entry) => entry._id !== entryToDelete.entryId
                    ),
                  }
                : program
            )
          );
        }
      } else if (itemToDelete) {
        if (itemToDelete.isProgram) {
          result = await deleteProgram(itemToDelete.id);
          setPrograms((prev) => prev.filter((p) => p._id !== itemToDelete.id));
        } else {
          result = await deleteTimeline(itemToDelete.id);
          setTimelines((prev) => prev.filter((t) => t._id !== itemToDelete.id));
        }
      }

      setSnackbar({
        open: true,
        message: result?.message || "Item deleted successfully",
        severity: result?.success ? "success" : "error",
      });

      // ✅ Force re-render by explicitly setting new arrays
      setTimelines((prev) => [...prev]);
      setPrograms((prev) => [...prev]);
    } catch (error) {
      console.error("❌ Error Deleting:", error);
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to delete item!",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
      setItemToDelete(null);
      setEntryToDelete(null);
      setConfirmationOpen(false);
    }
  };

  // Handle entry form submission
  const handleEntrySubmit = async () => {
  try {
    setEntryErrors({}); // Clear previous errors

    // ✅ Validate locally before making the request
    await entrySchema.validate(entryForm, { abortEarly: false });

    const formData = new FormData();
    formData.append("title", entryForm.title);

    // ✅ Handle description formatting
    const formattedDescription = entryForm.description
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    formData.append("description", JSON.stringify(formattedDescription));
    formData.append("xPosition", entryForm.xPosition);
    formData.append("yPosition", entryForm.yPosition);

    // ✅ Append media files and positions properly
    entryForm.media.forEach((file, index) => {
      formData.append("media", file);
      formData.append("mediaXPositions[]", entryForm.mediaXPositions[index]);
      formData.append("mediaYPositions[]", entryForm.mediaYPositions[index]);
    });

    // ✅ Append infographics and positions properly
    entryForm.infographics.forEach((file, index) => {
      formData.append("infographic", file);
      formData.append(
        "infographicXPositions[]",
        entryForm.infographicXPositions[index]
      );
      formData.append(
        "infographicYPositions[]",
        entryForm.infographicYPositions[index]
      );
    });

    let response;
    if (editingEntry) {
      response =
        activeTab === 0
          ? await updateEntryInTimeline(selectedParentId, editingEntry._id, formData)
          : await updateEntryInProgram(selectedParentId, editingEntry._id, formData);
    } else {
      response =
        activeTab === 0
          ? await addEntryToTimeline(selectedParentId, formData)
          : await addEntryToProgram(selectedParentId, formData);
    }

    setSnackbar({
      open: true,
      message: response.message || "Entry saved successfully",
      severity: response.success ? "success" : "error",
    });

    setOpenEntryDialog(false);

    // ✅ Fetch latest data immediately
    const [updatedTimelines, updatedPrograms] = await Promise.all([
      getTimelines(),
      getPrograms(),
    ]);
    setTimelines(updatedTimelines?.data || []);
    setPrograms(updatedPrograms?.data || []);
  } catch (error) {
    if (error.inner) {
      // ✅ Show field-specific validation errors
      const newErrors = {};
      error.inner.forEach((err) => {
        newErrors[err.path] = err.message;
      });
      setEntryErrors(newErrors);
    } else {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || "Failed to save entry",
        severity: "error",
      });
    }
  }
};
  return (
    <Box sx={{ p: 4, maxWidth: "90vw" }}>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        📝 Manage Content
      </Typography>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Timelines" />
        <Tab label="Programs" />
      </Tabs>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleOpenDialog(null, activeTab === 1)}
        sx={{
          background: "#007bff",
          color: "white",
          "&:hover": { background: "#0056b3" },
        }}
      >
        {activeTab === 1 ? "Add Program" : "Add Timeline"}
      </Button>
      {loading ? (
        <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
      ) : (
        <Box sx={{ maxWidth: { xs: "100%", sm: "60%" }, mx: "auto", mt: 4 }}>
          {(activeTab === 0 ? timelines : programs).length === 0 ? (
            <Typography sx={{ mt: 3, textAlign: "center", color: "gray" }}>
              {activeTab === 1 ? "No programs found." : "No timelines found."}
            </Typography>
          ) : (
            (Array.isArray(activeTab === 0 ? timelines : programs)
              ? activeTab === 0
                ? timelines
                : programs
              : []
            ).map((item) => (
              <MotionDiv
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Accordion
                  sx={{
                    mt: 2,
                    backgroundColor: "white",
                    borderRadius: "8px",
                    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
                    "&:hover": { backgroundColor: "#f8f9fa" },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight="bold">
                      {activeTab === 1 ? item.title : item.year}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography>X Position: {item.xPosition}</Typography>
                        <Typography>Y Position: {item.yPosition}</Typography>
                      </Box>
                      <Box>
                        <IconButton
                          color="primary"
                          onClick={() =>
                            handleOpenDialog(item, activeTab === 1)
                          }
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() =>
                            confirmDelete(item._id, activeTab === 1)
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenEntryDialog(item._id)}
                      sx={{ my: 2 }}
                    >
                      Add Entries
                    </Button>

                    {Array.isArray(item.entries) && item.entries.length > 0 ? (
                      item.entries.map((entry) => (
                        <Accordion
                          key={entry._id}
                          sx={{ mt: 2, backgroundColor: "white" }}
                        >
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight="bold">
                              {entry.title}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography>
                              X Position: {entry.xPosition || "N/A"}
                            </Typography>
                            <Typography>
                              Y Position: {entry.yPosition || "N/A"}
                            </Typography>
                            <IconButton
                              color="primary"
                              onClick={() =>
                                handleOpenEntryDialog(item._id, entry)
                              }
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() =>
                                confirmDelete(
                                  item._id,
                                  activeTab === 1,
                                  entry._id
                                )
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </AccordionDetails>
                        </Accordion>
                      ))
                    ) : (
                      <Typography sx={{ color: "gray", mt: 2 }}>
                        No entries available.
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              </MotionDiv>
            ))
          )}
        </Box>
      )}
      {/* Dialog for Adding/Editing Timeline or Program */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
        <DialogTitle>
          {editingItem
            ? isEditingProgram
              ? "Edit Program"
              : "Edit Timeline"
            : isEditingProgram
            ? "Add Program"
            : "Add Timeline"}
        </DialogTitle>
        <DialogContent>
          {/* Year Field (Only for Timelines) */}
          {!isEditingProgram && (
            <TextField
              label="Year"
              type="number"
              fullWidth
              value={formData.year || ""}
              onChange={(e) =>
                setFormData({ ...formData, year: e.target.value })
              }
              required

  error={Boolean(formErrors.year)}
  helperText={formErrors.year}
              sx={{ mt: 2 }}
            />
          )}

          {/* Title Field (Only for Programs) */}
          {isEditingProgram && (
            <TextField
              label="Title"
              fullWidth
              value={formData.title || ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              error={Boolean(formErrors.title)}
  helperText={formErrors.title}
              sx={{ mt: 2 }}
            />
          )}

          {/* X & Y Position Fields */}
          <TextField
            label="X Position (%)"
            type="number"
            fullWidth
            value={formData.xPosition || ""}
            onChange={(e) =>
              setFormData({ ...formData, xPosition: e.target.value })
            }
            required
            error={Boolean(formErrors.xPosition)}
  helperText={formErrors.xPosition}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Y Position (%)"
            type="number"
            fullWidth
            value={formData.yPosition || ""}
            onChange={(e) =>
              setFormData({ ...formData, yPosition: e.target.value })
            }
            required
            error={Boolean(formErrors.yPosition)}
  helperText={formErrors.yPosition}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Entry Dialog */}
      <Dialog
        open={openEntryDialog}
        onClose={() => setOpenEntryDialog(false)}
        fullWidth
      >
        <DialogTitle>{editingEntry ? "Edit Entry" : "Add Entry"}</DialogTitle>
        <DialogContent>
          {/* Title */}
          <TextField
            label="Title"
            fullWidth
            value={entryForm.title || ""}
            onChange={(e) =>
              setEntryForm({ ...entryForm, title: e.target.value })
            }
            required
            error={Boolean(entryErrors.title)}
  helperText={entryErrors.title}
            sx={{ mt: 2 }}
          />

          {/* Description */}
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={entryForm.description || ""}
            onChange={(e) =>
              setEntryForm({ ...entryForm, description: e.target.value })
            }
            required
            error={Boolean(entryErrors.description)}
  helperText={entryErrors.description}
            sx={{ mt: 2 }}
          />
          {/* X and Y Position for Entry */}
          <TextField
            label="X Position (%)"
            fullWidth
            type="number"
            value={entryForm.xPosition || ""}
            onChange={(e) =>
              setEntryForm({ ...entryForm, xPosition: e.target.value })
            }
            required
            error={Boolean(entryErrors.xPosition)}
  helperText={entryErrors.xPosition}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Y Position (%)"
            fullWidth
            type="number"
            value={entryForm.yPosition || ""}
            onChange={(e) =>
              setEntryForm({ ...entryForm, yPosition: e.target.value })
            }
            required
            error={Boolean(entryErrors.yPosition)}
  helperText={entryErrors.yPosition}
            sx={{ mt: 2 }}
          />

          {/* Media Files Upload */}
          <Typography variant="subtitle2" sx={{mt:2}}>
                Upload Media (Image/Video max 5)
              </Typography>
          <Input
            type="file"
            inputProps={{ multiple: true }}
            onChange={(e) => {
              const files = Array.from(e.target.files);
              setEntryForm((prev) => ({
                ...prev,
                media: files,
                mediaXPositions: new Array(files.length).fill(50), // Default to center
                mediaYPositions: new Array(files.length).fill(50), // Default to center
              }));
            }}
          />

          {/* Media File Position Inputs */}
          {entryForm.media.map((file, index) => (
            <Box key={index} sx={{ mt: 2 }}>
              <Typography variant="subtitle2">
                Media File {index + 1}: {file.name}
              </Typography>
              <TextField
                label="X Position (%)"
                fullWidth
                type="number"
                value={entryForm.mediaXPositions[index]}
                onChange={(e) => {
                  const newXPositions = [...entryForm.mediaXPositions];
                  newXPositions[index] = e.target.value;
                  setEntryForm((prev) => ({
                    ...prev,
                    mediaXPositions: newXPositions,
                  }));
                }}
                sx={{ mt: 1 }}
              />
              <TextField
                label="Y Position (%)"
                fullWidth
                type="number"
                value={entryForm.mediaYPositions[index]}
                onChange={(e) => {
                  const newYPositions = [...entryForm.mediaYPositions];
                  newYPositions[index] = e.target.value;
                  setEntryForm((prev) => ({
                    ...prev,
                    mediaYPositions: newYPositions,
                  }));
                }}
                sx={{ mt: 1 }}
              />
            </Box>
          ))}

          {/* Infographics Upload */}
          <Typography variant="subtitle2" sx={{mt:2}}>
                Upload Infographics (Image max 5)
              </Typography>
          <Input
            type="file"
            inputProps={{ multiple: true }}
            onChange={(e) => {
              const files = Array.from(e.target.files);
              setEntryForm((prev) => ({
                ...prev,
                infographics: files,
                infographicXPositions: new Array(files.length).fill(50), // Default to center
                infographicYPositions: new Array(files.length).fill(50), // Default to center
              }));
            }}
          />

          {/* Infographic Position Inputs */}
          {entryForm.infographics.map((file, index) => (
            <Box key={index} sx={{ mt: 2 }}>
              <Typography variant="subtitle2">
                Infographic {index + 1}: {file.name}
              </Typography>
              <TextField
                label="X Position (%)"
                fullWidth
                type="number"
                value={entryForm.infographicXPositions[index]}
                onChange={(e) => {
                  const newXPositions = [...entryForm.infographicXPositions];
                  newXPositions[index] = e.target.value;
                  setEntryForm((prev) => ({
                    ...prev,
                    infographicXPositions: newXPositions,
                  }));
                }}
                sx={{ mt: 1 }}
              />
              <TextField
                label="Y Position (%)"
                fullWidth
                type="number"
                value={entryForm.infographicYPositions[index]}
                onChange={(e) => {
                  const newYPositions = [...entryForm.infographicYPositions];
                  newYPositions[index] = e.target.value;
                  setEntryForm((prev) => ({
                    ...prev,
                    infographicYPositions: newYPositions,
                  }));
                }}
                sx={{ mt: 1 }}
              />
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEntryDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEntrySubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message={
          entryToDelete
            ? "Are you sure you want to delete this entry?"
            : `Are you sure you want to delete this ${
                itemToDelete?.isProgram ? "program" : "timeline"
              }?`
        }
        confirmButtonText="Delete"
      />
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
