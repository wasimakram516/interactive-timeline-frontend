import "./globals.css";

export const metadata = {
  title: "Interactive Timeline",
  description: "An interactive timeline experience",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}