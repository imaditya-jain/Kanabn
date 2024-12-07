
// import { ReduxProvider } from "../provider";
import { InterFont } from "../components";
import "../styles/globals.css";

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    // <ReduxProvider>
    <html lang="en" className={`${InterFont.variable}`}>
      <body className={`antialiased`}>
        {children}
      </body>
    </html>
    // </ReduxProvider>
  );
}
