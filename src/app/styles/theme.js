import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    h1: {
      fontSize: "2.5rem",
      fontWeight: "bold",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: "bold",
    },
    h3: {
      fontSize: "1.75rem",
    },
    h4: {
      fontSize: "1.5rem",
    },
    h5: {
      fontSize: "1.3rem",
    },
    h6: {
      fontSize: "1.25rem",
    },
    body1: {
      fontSize: "1.175rem",
    },
    body2: {
      fontSize: "0.8rem",
    },
    subtitle1: {
      fontSize: "0.7rem",
      fontWeight: "600",
    },
    subtitle2: {
      fontSize: "0.5rem",
      fontWeight: "500",
    },
  },
});

export default theme;
