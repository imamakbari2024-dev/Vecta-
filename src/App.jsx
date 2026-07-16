import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SidebarLayout from './components/SidebarLayout';
import VectaAITutor from './pages/VectaAITutor';
import SpatialView from './pages/SpatialView';
import DashboardSiswa from './pages/DashboardSiswa'; // <-- Baris impor ini sangat penting

// Komponen Placeholder untuk Dashboard Guru (Untuk Siswa sudah dihapus karena memanggil file asli di atas)
const DashboardGuru = () => <h1 className="text-3xl font-bold">Selamat Datang, Guru!</h1>;

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        {/* Rute Siswa */}
        <Route element={<SidebarLayout role="siswa" />}>
          <Route path="/dashboard/siswa" element={<DashboardSiswa />} />
          <Route path="/dashboard/siswa/ai" element={<VectaAITutor />} />
          <Route path="/dashboard/siswa/materi" element={<SpatialView />} />
        </Route>

        {/* Rute Guru */}
        <Route element={<SidebarLayout role="guru" />}>
          <Route path="/dashboard/guru" element={<DashboardGuru />} />
        </Route>
      </Routes>
    </Router>
  );
}
