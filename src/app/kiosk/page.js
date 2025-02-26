"use client";
import { useRouter } from "next/navigation";
import { Box, Button, Typography, IconButton } from "@mui/material";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; 
import { Shift } from "ambient-cbg";

export default function KioskSelection() {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "calc(100vh - 10px)",
        width: "100vw",
        color: "white",
        textAlign: "center",
        position: "relative",
        userSelect: "none",
      }}
    >
      <Shift />

      {/* ✅ Back Button to Return to Home */}
      <IconButton
        sx={{ position: "absolute", top: 20, left: 20, color: "white" }}
        onClick={() => router.push("/")}
      >
        <ArrowBackIcon />
      </IconButton>

      <Typography variant="h3" fontWeight="bold" gutterBottom>
        🎮 Choose Your Controller
      </Typography>
      <Typography variant="h6" color="lightgray" mb={4}>
        Select a controller to manage the timeline
      </Typography>

      <Box display="flex" flexDirection="column" gap={2} width="100%" maxWidth="400px">
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<ScreenShareIcon />}
          onClick={() => router.push("/kiosk/controller-1")}
        >
          Controller 1 (2014 - 2019)
        </Button>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          startIcon={<ScreenShareIcon />}
          onClick={() => router.push("/kiosk/controller-2")}
        >
          Controller 2 (2020 - 2025)
        </Button>
        <Button
          variant="contained"
          color="success"
          size="large"
          startIcon={<ScreenShareIcon />}
          onClick={() => router.push("/kiosk/controller-3")}
        >
          Controller 3 (2014 - 2025)
        </Button>
        <Button
          variant="contained"
          color="warning"
          size="large"
          startIcon={<ScreenShareIcon />}
          onClick={() => router.push("/kiosk/controller-4")}
        >
          Controller 4 (Programs)
        </Button>
      </Box>
    </Box>
  );
}
