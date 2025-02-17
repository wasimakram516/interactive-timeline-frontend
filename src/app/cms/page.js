"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getTimelines,
  createTimeline,
  updateTimeline,
  deleteTimeline,
} from "../../services/timelineService";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadIcon from "@mui/icons-material/UploadFile";
import ImageIcon from "@mui/icons-material/Image";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import ConfirmationDialog from "../components/ConfirmationDialog";

export default function CMSPage() {
  const router = useRouter();
  const [timelines, setTimelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [timelineToDelete, setTimelineToDelete] = useState(null);

  const [formData, setFormData] = useState({
    year: "",
    description: "",
    media: [],
  });

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) return router.push("/login");

    const fetchTimelines = async () => {
      setLoading(true);
      try {
        const data = await getTimelines();
        setTimelines(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setTimelines([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTimelines();
  }, []);

  // ✅ Trigger confirmation dialog before deleting
  const confirmDelete = (id) => {
    setTimelineToDelete(id);
    setConfirmationOpen(true);
  };

  // ✅ Perform deletion after confirmation
  const handleDelete = async () => {
    if (!timelineToDelete) return;
    await deleteTimeline(timelineToDelete);
    setTimelines((prev) => prev.filter((t) => t._id !== timelineToDelete));
    setTimelineToDelete(null);
    setConfirmationOpen(false);
  };

  const handleOpenDialog = (timeline = null) => {
    if (timeline) {
      setEditingTimeline(timeline);
      setFormData({
        year: timeline.year,
        description: timeline.description?.join("\n") || "",
        media: [],
      });
      setSelectedFiles([]);
    } else {
      setEditingTimeline(null);
      setFormData({ year: "", description: "", media: [] });
      setSelectedFiles([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTimeline(null);
    setSelectedFiles([]);
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
  
    if (files.length > 5) {
      alert("You can only upload up to 5 files.");
      return;
    }
  
    setFormData({ ...formData, media: files });
    setSelectedFiles(files.map((file) => file.name));
  };
  

  const handleSubmit = async () => {
    try {
      const formattedData = new FormData();
      formattedData.append("year", formData.year);
      formData.description
        .split("\n")
        .forEach((line) => formattedData.append("description[]", line.trim()));

      Array.from(formData.media).forEach((file) => formattedData.append("files", file));

      if (editingTimeline) {
        await updateTimeline(editingTimeline._id, formattedData);
      } else {
        await createTimeline(formattedData);
      }

      setOpenDialog(false);
      setEditingTimeline(null);
      
      // ✅ Fetch updated timeline data after submitting
      setLoading(true);
      const updatedTimelines = await getTimelines();
      setTimelines(Array.isArray(updatedTimelines) ? updatedTimelines : []);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Box
      sx={{
        p: 4,
        overflowX: "clip", // ✅ Ensures no horizontal scrolling
        width: "100%",
        maxWidth: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start", // ✅ Centers all content properly
      }}
    >
      <Typography variant="h4" fontWeight="bold" mb={2}>
        📝 Manage Timelines
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleOpenDialog()}
        sx={{ mb: 2 }}
      >
        Add Timeline
      </Button>

      {loading ? (
        <CircularProgress />
      ) : (
        <Box sx={{ width: "100%", maxWidth: "800px", display: "flex", flexDirection: "column", gap: 2 }}>
          {timelines.map((timeline) => (
            <Box
              key={timeline._id}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                border: "1px solid #ddd",
                p: 2,
                borderRadius: "8px",
                width: "100%",
                margin: "auto", // ✅ Ensures correct centering
                overflow: "hidden",
              }}
            >
              <Box>
                <Typography fontWeight="bold">📅 {timeline.year}</Typography>
                <Typography>{timeline.description?.join(", ")}</Typography>

                {/* ✅ Show Existing Media (if any) */}
                {Array.isArray(timeline.media) && timeline.media.length > 0 && (
                  <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                    {timeline.media.map((media, index) => (
                      <Chip
                        key={index}
                        icon={media.type === "image" ? <ImageIcon /> : <VideoLibraryIcon />}
                        label={`Media ${index + 1}`}
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                )}
              </Box>

              <Box>
                <IconButton color="primary" onClick={() => handleOpenDialog(timeline)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => confirmDelete(timeline._id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      )}

       {/* Add/Edit Dialog */}
       <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
        <DialogTitle>{editingTimeline ? "Edit Timeline" : "Add Timeline"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
          <TextField
            label="Year"
            type="number"
            fullWidth
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            required
            sx={{mt:2}}
          />
          <TextField
            label="Description (Enter each point on a new line)"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <Button variant="outlined" component="label" startIcon={<FileUploadIcon />}>
            Upload Media (Max 5)
            <input type="file" hidden multiple accept="image/*,video/*" onChange={handleFileChange} />
          </Button>

          {/* ✅ Show Selected Files Before Uploading */}
          {selectedFiles.length > 0 && (
            <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
              {selectedFiles.map((file, index) => (
                <Chip key={index} label={file} variant="outlined" color="secondary" />
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingTimeline ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Confirmation Dialog for Delete */}
      <ConfirmationDialog
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this timeline?"
        confirmButtonText="Delete"
      />
    </Box>
  );
}
