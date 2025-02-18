"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, TextField, Button, Typography, CircularProgress, IconButton, InputAdornment } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { login } from "@/services/authService";
import { Shift } from "ambient-cbg";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password, rememberMe);
      router.push("/cms"); // ✅ Redirect after successful login
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "calc(100vh - 100px)",
        width: "100vw",
        color: "white",
        textAlign: "center",
        position: "relative",
        userSelect: "none",
      }}
    >
      <Shift />
      <IconButton
        sx={{ position: "absolute", top: 20, left: 20, color: "white" }}
        onClick={() => router.push("/")}
      >
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        🔑 Admin Login
      </Typography>

      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          background: "rgba(255, 255, 255, 0.1)",
          p: 4,
          borderRadius: "8px",
          width: "320px",
          boxShadow: "0px 0px 25px rgba(0, 255, 255, 1)",
        }}
      >
        <TextField
          label="Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {error && (
          <Typography color="error" fontSize="0.875rem">
            {error}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
          disabled={loading}
          sx={{
            background: "linear-gradient(90deg, #0088ff, #00ffcc)",
            color:"#333"
          }}
        >
          <Shift />
          {loading ? "Logging in..." : "Login"}
        </Button>
      </Box>
    </Box>
  );
}
