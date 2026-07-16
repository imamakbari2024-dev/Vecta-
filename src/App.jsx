import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SidebarLayout from './components/SidebarLayout';
import DashboardSiswa from './pages/DashboardSiswa';
import AksesMateri from './pages/AksesMateri';
import SpatialView from './pages/SpatialView';
import VectaAITutor from './pages/VectaAITutor';
// Import file placeholder baru untuk menu yang kosong
import { MengikutiAlur, UjianTest, AnalisisHasil, Profil } from './pages/HalamanKosong';

const DashboardGuru = () => <h1 className="text-3xl font-bold">Selamat Datang, Guru!</h1>;

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        {/* Rute Siswa Lengkap */}
        <Route element={<SidebarLayout role="siswa" />}>
          <Route path="/dashboard/siswa" element={<DashboardSiswa />} />
          <Route path="/dashboard/siswa/materi" element={<AksesMateri />} />
          <Route path="/dashboard/siswa/3d" element={<SpatialView />} />
          <Route path="/dashboard/siswa/alur" element={<MengikutiAlur />} />
          <Route path="/dashboard/siswa/ujian" element={<UjianTest />} />
          <Route path="/dashboard/siswa/ai" element={<VectaAITutor />} />
          <Route path="/dashboard/siswa/analisis" element={<AnalisisHasil />} />
          <Route path="/dashboard/siswa/profil" element={<Profil />} />
        </Route>

        {/* Rute Guru */}
        <Route element={<SidebarLayout role="guru" />}>
          <Route path="/dashboard/guru" element={<DashboardGuru />} />
        </Route>
      </Routes>
    </Router>
  );
}
