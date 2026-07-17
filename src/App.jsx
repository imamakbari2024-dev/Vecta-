import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SidebarLayout from './components/SidebarLayout';
import DashboardSiswa from './pages/DashboardSiswa';
import AksesMateri from './pages/AksesMateri';
import SpatialView from './pages/SpatialView';
import VectaAITutor from './pages/VectaAITutor';
import MengikutiAlur from './pages/MengikutiAlur';
import UjianTest from './pages/UjianTest'; 
import AnalisisHasil from './pages/AnalisisHasil';
import ProfilSiswa from './pages/ProfilSiswa';

// Import komponen Guru
import DashboardGuru from './pages/DashboardGuru';
// Pastikan KelolaVisualisasi3D ikut terpanggil di sini
import { KelolaKelas, KelolaMateri, KelolaVisualisasi3D, KelolaAlur, TugasUjian, ManajemenSiswa, AnalisisGuru, ProfilGuru } from './pages/HalamanGuru';

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
          <Route path="/dashboard/siswa/profil" element={<ProfilSiswa />} />
        </Route>

        {/* Rute Guru Lengkap */}
        <Route element={<SidebarLayout role="guru" />}>
          <Route path="/dashboard/guru" element={<DashboardGuru />} />
          <Route path="/dashboard/guru/kelas" element={<KelolaKelas />} />
          <Route path="/dashboard/guru/materi" element={<KelolaMateri />} />
          
          {/* RUTE BARU: Ini adalah jalan menuju Kelola Visualisasi 3D */}
          <Route path="/dashboard/guru/3d" element={<KelolaVisualisasi3D />} />
          
          <Route path="/dashboard/guru/alur" element={<KelolaAlur />} />
          <Route path="/dashboard/guru/ujian" element={<TugasUjian />} />
          <Route path="/dashboard/guru/siswa" element={<ManajemenSiswa />} />
          <Route path="/dashboard/guru/analisis" element={<AnalisisGuru />} />
          <Route path="/dashboard/guru/ai" element={<VectaAITutor />} />
          <Route path="/dashboard/guru/profil" element={<ProfilGuru />} />
        </Route>
      </Routes>
    </Router>
  );
}
