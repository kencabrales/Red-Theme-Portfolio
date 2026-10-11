import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { PlayerProvider } from "./context/PlayerContext";
import Welcome from "./components/Welcome";
import MusicModal from "./components/MusicModal";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import AdminCertificates from "./pages/AdminCertificates";
import AdminMessages from "./pages/AdminMessages";
import AdminMusic from "./pages/AdminMusic";

function ScrollHandler() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <PlayerProvider>
      <Welcome />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/admin/certificates" element={<ProtectedRoute><AdminCertificates /></ProtectedRoute>} />
        <Route path="/admin/messages" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />
        <Route path="/admin/music" element={<ProtectedRoute><AdminMusic /></ProtectedRoute>} />
      </Routes>
      <MusicModal />
    </PlayerProvider>
  );
}
