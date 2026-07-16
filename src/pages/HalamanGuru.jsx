import React, { useState } from 'react';
import { Users, BookOpen, Route, FileEdit, BarChart2, User, Plus, Copy, Check, MoreVertical } from 'lucide-react';

// --- Komponen Placeholder untuk menu yang belum dibangun ---
const HalamanKosong = ({ icon: Icon, judul, deskripsi }) => (
  <div className="flex h-[70vh] flex-col items-center justify-center rounded-2xl bg-white border border-slate-100 dark:bg-slate-800 dark:border-slate-700 animate-in fade-in duration-500">
    <Icon size={64} className="mb-4 text-blue-300 dark:text-blue-900" />
    <h2 className="text-2xl font-bold text-slate-700 dark:text-white">{judul}</h2>
    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md text-center">{deskripsi}</p>
  </div>
);

// --- FITUR UTAMA: KELOLA KELAS & GENERATE KODE ---
export const KelolaKelas = () => {
  // State untuk menyimpan daftar kelas (Simulasi Database)
  const [daftarKelas, setDaftarKelas] = useState([
    { id: 1, nama: "Sistem Kontrol Mekatronika", kode: "MEK-7X2A", siswa: 32 },
    { id: 2, nama: "Pemrograman Mikrokontroler (ESP32)", kode: "ESP-9B4Q", siswa: 28 }
  ]);
  
  const [namaKelasBaru, setNamaKelasBaru] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  // Fungsi membuat kode acak 6 karakter
  const generateKodeUnik = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Fungsi menyimpan kelas baru
  const handleBuatKelas = (e) => {
    e.preventDefault();
    if (!namaKelasBaru.trim()) return;

    const kelasBaru = {
      id: Date.now(),
      nama: namaKelasBaru,
      kode: generateKodeUnik(),
      siswa: 0 // Kelas baru mulai dengan 0 siswa
    };

    setDaftarKelas([kelasBaru, ...daftarKelas]);
    setNamaKelasBaru(''); // Kosongkan input
  };

  // Fungsi menyalin kode ke clipboard
  const salinKode = (kode) => {
    navigator.clipboard.writeText(kode);
    setCopiedCode(kode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manajemen Kelas</h1>
        <p className="text-slate-500 dark:text-slate-400">Buat kelas baru dan bagikan kode akses unik kepada siswa Anda.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form Buat Kelas Baru (Kiri) */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 h-fit">
          <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Plus size={20} className="text-blue-500" /> Buat Kelas Baru
          </h3>
          <form onSubmit={handleBuatKelas} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Nama Mata Pelajaran</label>
              <input 
                type="text" 
                value={namaKelasBaru}
                onChange={(e) => setNamaKelasBaru(e.target.value)}
                placeholder="Contoh: Fisika Kuantum Dasar"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
              />
            </div>
            <button 
              type="submit"
              className="w-full rounded-xl bg-blue-600 p-3 font-bold text-white transition hover:bg-blue-700"
            >
              Generate Kode Kelas
            </button>
          </form>
        </div>

        {/* Daftar Kelas Aktif (Kanan) */}
        <div className="lg:col-span-2 space-y-4">
          {daftarKelas.map((kelas) => (
            <div key={kelas.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl bg-white p-5 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 transition-all hover:border-blue-300 dark:hover:border-blue-600">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                  <Users size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">{kelas.nama}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{kelas.siswa} Siswa Terdaftar</p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="px-3 text-center">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Kode Akses</p>
                  <p className="font-mono font-bold text-slate-800 dark:text-blue-400 tracking-widest">{kelas.kode}</p>
                </div>
                <button 
                  onClick={() => salinKode(kelas.kode)}
                  className="rounded-lg p-2.5 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
                  title="Salin Kode"
                >
                  {copiedCode === kelas.kode ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Export Placeholder Lainnya ---
export const KelolaMateri = () => <HalamanKosong icon={BookOpen} judul="Kelola Materi" deskripsi="Fitur unggah modul, video, dan model 3D interaktif (.glb, .gltf) sedang dikonfigurasi." />;
export const KelolaAlur = () => <HalamanKosong icon={Route} judul="Kelola Alur Pembelajaran" deskripsi="Sistem Roadmap untuk merancang urutan belajar siswa secara bertahap." />;
export const TugasUjian = () => <HalamanKosong icon={FileEdit} judul="Tugas & Ujian" deskripsi="Fitur pembuatan soal pilihan ganda, esai, dan tugas praktik." />;
export const ManajemenSiswa = () => <HalamanKosong icon={Users} judul="Manajemen Siswa" deskripsi="Tabel daftar peserta kelas, kehadiran, dan status aktivitas siswa." />;
export const AnalisisGuru = () => <HalamanKosong icon={BarChart2} judul="Analisis Pembelajaran" deskripsi="Grafik perkembangan nilai dan capaian kompetensi seluruh kelas." />;
export const ProfilGuru = () => <HalamanKosong icon={User} judul="Profil Pengajar" deskripsi="Kelola informasi akun dan preferensi pengajar Anda." />;
