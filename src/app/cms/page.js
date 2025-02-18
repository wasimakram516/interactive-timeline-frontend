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
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} from "../../services/programService";
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
  Tabs,
  Tab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmationDialog from "../components/ConfirmationDialog";

export default function CMSPage() {
  const router = useRouter();
  const [timelines, setTimelines] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isEditingProgram, setIsEditingProgram] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // ✅ Tab Index (0 = Timeline, 1 = Program)

  const [formData, setFormData] = useState({
    year: "",
    title: "",
    xPosition: "",
    yPosition: "",
    description: "",
    media: { type: "", file: null }, // ✅ Store as object { type, file }
    infographic: { file: null }, // ✅ Store as object { file }
  });
  
  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) return router.push("/login");

    const fetchData = async () => {
      setLoading(true);
      try {
        const timelineData = await getTimelines();
        setTimelines(Array.isArray(timelineData) ? timelineData : []);

        const programData = await getPrograms();
        setPrograms(Array.isArray(programData) ? programData : []);
      } catch (error) {
        console.error(error);
        setTimelines([]);
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const confirmDelete = (id, isProgram = false) => {
    setItemToDelete({ id, isProgram });
    setConfirmationOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    if (itemToDelete.isProgram) {
      await deleteProgram(itemToDelete.id);
      setPrograms((prev) => prev.filter((p) => p._id !== itemToDelete.id));
    } else {
      await deleteTimeline(itemToDelete.id);
      setTimelines((prev) => prev.filter((t) => t._id !== itemToDelete.id));
    }

    setItemToDelete(null);
    setConfirmationOpen(false);
  };

  const handleOpenDialog = (item = null, isProgram = false) => {
    setIsEditingProgram(isProgram);
  
    if (item) {
      setEditingItem(item);
      setFormData({
        year: item.year || "",
        title: item.title || "",
        xPosition: item.xPosition || "",
        yPosition: item.yPosition || "",
        description: item.description?.join("\n") || "",
        media: item.media
          ? { type: item.media.type, file: null } // ✅ Preserve type but reset file
          : { type: "", file: null },
        infographic: item.infographic
          ? { file: null } // ✅ Reset file but keep structure
          : { file: null },
      });
      setSelectedFiles([]);
    } else {
      setEditingItem(null);
      setFormData({
        year: "",
        title: "",
        xPosition: "",
        yPosition: "",
        description: "",
        media: { type: "", file: null },
        infographic: { file: null },
      });
      setSelectedFiles([]);
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setSelectedFiles([]);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileType = file.type.startsWith("image") ? "image" : "video";
  
    setFormData((prev) => ({
      ...prev,
      media: { type: fileType, file: file }, 
    }));
  };
  
  const handleInfographicChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    setFormData((prev) => ({
      ...prev,
      infographic: { file: file }, 
    }));
  };
  
  const handleSubmit = async () => {
    try {
      const formattedData = new FormData();
  
      // ✅ Append Year or Title
      if (isEditingProgram) {
        formattedData.append("title", formData.title);
      } else {
        formattedData.append("year", formData.year);
      }
  
      formattedData.append("xPosition", formData.xPosition);
      formattedData.append("yPosition", formData.yPosition);
  
      // ✅ Append Description as an Array
      formData.description
        .split("\n")
        .forEach((line) => formattedData.append("description[]", line.trim()));
  
      // ✅ Handle Media (Single File as { type, url })
      if (formData.media?.file) {
        formattedData.append("media", formData.media.file);
      }
  
      // ✅ Handle Infographic (Single File as { url })
      if (formData.infographic?.file) {
        formattedData.append("infographic", formData.infographic.file);
      }
  
      // ✅ Perform API Call for Timelines or Programs
      if (editingItem) {
        if (isEditingProgram) {
          await updateProgram(editingItem._id, formattedData);
        } else {
          await updateTimeline(editingItem._id, formattedData);
        }
      } else {
        if (isEditingProgram) {
          await createProgram(formattedData);
        } else {
          await createTimeline(formattedData);
        }
      }
  
      // ✅ Close Dialog & Refresh Data
      setOpenDialog(false);
      setEditingItem(null);
  
      setLoading(true);
      const timelineData = await getTimelines();
      setTimelines(Array.isArray(timelineData) ? timelineData : []);
      const programData = await getPrograms();
      setPrograms(Array.isArray(programData) ? programData : []);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error:", error);
    }
  };
  
  return (
    <Box
      sx={{
        p: 4,
        width: "100%",
        maxWidth: "95vw",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h4" fontWeight="bold" mb={2}>
        📝 Manage Content
      </Typography>

      {/* ✅ Tabs for Switching Between Timelines & Programs */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Timelines" />
        <Tab label="Programs" />
      </Tabs>

      {/* ✅ Button - Fixed Width & Centered */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog(null, activeTab === 1)}
          sx={{
            maxWidth: "250px", // ✅ Limit button width
            width: "100%",
          }}
        >
          {activeTab === 1 ? "Add Program" : "Add Timeline"}
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <Box>
          {(activeTab === 0 ? timelines : programs).map((item) => (
            <Box
              key={item._id}
              sx={{
                border: "1px solid #ddd",
                p: 2,
                borderRadius: "8px",
                mb: 2,
              }}
            >
              <Typography fontWeight="bold">
                {activeTab === 1 ? "📜" : "📅"}{" "}
                {activeTab === 1 ? item.title : item.year}
              </Typography>
              <Typography>{item.description?.join(", ")}</Typography>
              <Box>
                <IconButton
                  color="primary"
                  onClick={() => handleOpenDialog(item, activeTab === 1)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => confirmDelete(item._id, activeTab === 1)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      )}

     {/* ✅ Dialog (Form) for Adding/Editing Timelines & Programs */}
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

  <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
    {/* ✅ Year Field (Only for Timelines) */}
    {!isEditingProgram && (
      <TextField
        label="Year"
        type="number"
        fullWidth
        value={formData.year}
        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
        required
        sx={{ mt: 2 }}
      />
    )}

    {/* ✅ Title Field (Only for Programs) */}
    {isEditingProgram && (
      <TextField
        label="Title"
        fullWidth
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />
    )}

    {/* ✅ Description Field (For Both) */}
    <TextField
      label="Description (Enter each point on a new line)"
      fullWidth
      multiline
      rows={4}
      value={formData.description}
      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      required
    />

    {/* ✅ X & Y Position Fields (For Both) */}
    <TextField
      label="X Position (% width it would occupy horizontally)"
      type="number"
      fullWidth
      value={formData.xPosition}
      onChange={(e) => setFormData({ ...formData, xPosition: e.target.value })}
      required
    />
    <TextField
      label="Y Position (%)"
      type="number"
      fullWidth
      value={formData.yPosition}
      onChange={(e) => setFormData({ ...formData, yPosition: e.target.value })}
      required
    />

    {/* ✅ Media Upload (Image/Video) */}
    <TextField
      type="file"
      fullWidth
      InputLabelProps={{ shrink: true }}
      inputProps={{ accept: "image/*,video/*" }}
      onChange={handleFileChange}
      label="Upload Media (Image/Video)"
    />
    {formData.media && <Typography variant="caption">Selected: {formData.media.name}</Typography>}

    {/* ✅ Infographic Upload (Optional) */}
    <TextField
      type="file"
      fullWidth
      InputLabelProps={{ shrink: true }}
      inputProps={{ accept: "image/*" }}
      onChange={handleInfographicChange}
      label="Upload Infographic (Optional)"
    />
    {formData.infographic && <Typography variant="caption">Selected: {formData.infographic.name}</Typography>}
  </DialogContent>

  <DialogActions>
    <Button onClick={handleCloseDialog}>Cancel</Button>
    <Button variant="contained" onClick={handleSubmit}>Submit</Button> {/* ✅ Fixed: Submit button now works */}
  </DialogActions>
</Dialog>


      {/* ✅ Confirmation Dialog for Delete */}
      <ConfirmationDialog
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={handleDelete}
        title={`Confirm Deletion`}
        message={`Are you sure you want to delete this ${
          itemToDelete?.isProgram ? "program" : "timeline"
        }?`}
        confirmButtonText="Delete"
      />
    </Box>
  );
}
