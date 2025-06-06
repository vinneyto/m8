import { BrowserRouter, Route, Routes } from "react-router-dom";
import CardEditorPage from "./pages/CardEditorPage";
import CardScenePage from "./pages/CardScenePage";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<CardEditorPage />} />
        <Route path="/card" element={<CardScenePage />} />
      </Routes>
    </BrowserRouter>
  );
}
