import "./globals.css";
import ThemeRegistry from "@/app/styles/themeRegistry";

export const metadata = {
  title: "Interactive Timeline",
  description: "An interactive timeline experience",
};

export default function RootLayout({ children }) {
  // Hello World
  return (
    <html lang="en"> 
      <body>
      <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}