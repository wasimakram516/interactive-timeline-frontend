"use client";
import { useRouter } from "next/navigation";
import { Button, Box, Typography, IconButton } from "@mui/material";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import TvIcon from "@mui/icons-material/Tv";
import LoginIcon from "@mui/icons-material/Login"; // Import login icon

export default function Home() {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        bgcolor: "#1e3c72",
        color: "white",
        textAlign: "center",
        position: "relative", // Ensure positioning for login button
      }}
    >
      {/* ✅ Login Button at Top Right */}
      <IconButton
        sx={{ position: "absolute", top: 20, right: 20, color: "white" }}
        onClick={() => router.push("/login")}
      >
        <LoginIcon />
      </IconButton>

      <Typography variant="h3" fontWeight="bold" gutterBottom>
        🎬 Interactive Timeline
      </Typography>
      <Typography variant="h6" color="lightgray" mb={4}>
        Choose your mode to begin
      </Typography>

      <Box display="flex" gap={3} flexWrap="wrap">
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<ScreenShareIcon />}
          onClick={() => router.push("/kiosk")}
        >
          Controller
        </Button>

        <Button
          variant="contained"
          color="secondary"
          size="large"
          startIcon={<TvIcon />}
          onClick={() => router.push("/big-screen")}
        >
          Big Screen
        </Button>
      </Box>
    </Box>
  );
}
