import React from 'react';
import { Users, BookOpen, Route, FileEdit, BarChart2, User } from 'lucide-react';

const HalamanKosong = ({ icon: Icon, judul, deskripsi }) => (
  <div className="flex h-[70vh] flex-col items-center justify-center rounded-2xl bg-white border border-slate-100 dark:bg-slate-800 dark:border-slate-700 animate-in fade-in duration-500">
    <Icon size={64} className="mb-4 text-blue-300 dark:text-blue-900" />
    <h2 className="text-2xl font-bold text-slate-700 dark:text-white">{judul}</h2>
    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md text-center">{deskripsi}</p>
  </div>
);

export const KelolaKelas = () => <HalamanKosong icon={Users} judul="Kelola Kelas" deskripsi="Buat kelas baru, atur mata pelajaran, dan hasilkan kode kelas untuk siswa di sini." />;
export const KelolaMateri = () => <HalamanKosong icon={BookOpen} judul="Kelola Materi" deskripsi="Unggah modul, video, dan model 3D interaktif (.glb, .gltf) untuk siswa Anda." />;
export const KelolaAlur = () => <HalamanKosong icon={Route} judul="Kelola Alur Pembelajaran" deskripsi="Rancang urutan belajar siswa secara bertahap (Roadmap) agar lebih terstruktur." />;
export const TugasUjian = () => <HalamanKosong icon={FileEdit} judul="Tugas & Ujian" deskripsi="Buat soal pilihan ganda, esai, atau tugas praktik beserta bobot nilainya." />;
export const ManajemenSiswa = () => <HalamanKosong icon={Users} judul="Manajemen Siswa" deskripsi="Pantau daftar peserta kelas, kehadiran, dan status aktivitas siswa." />;
export const AnalisisGuru = () => <HalamanKosong icon={BarChart2} judul="Analisis Pembelajaran" deskripsi="Lihat grafik perkembangan nilai dan capaian kompetensi seluruh kelas." />;
export const ProfilGuru = () => <HalamanKosong icon={User} judul="Profil Pengajar" deskripsi="Kelola informasi akun dan preferensi pengajar Anda." />;
