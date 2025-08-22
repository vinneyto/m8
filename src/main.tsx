import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "antd/dist/reset.css";
import "./index.css";
import App from "./App.tsx";
import { ConfigProvider } from "antd";

const pastelTheme = {
  token: {
    colorPrimary: "#8f5cff",
    colorBgBase: "#f3eaff",
    colorTextBase: "#4b3c6e",
    colorBorder: "#c3aaff",
    colorSuccess: "#4deeea",
    colorWarning: "#ffd166",
    colorError: "#ff5e7e",
    colorInfo: "#5ecbff",
    borderRadius: 8,
    fontFamily: "Inter, Arial, sans-serif",
  },
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider theme={pastelTheme}>
      <App />
    </ConfigProvider>
  </StrictMode>
);
