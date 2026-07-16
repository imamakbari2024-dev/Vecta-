import React from 'react';
import { Route, FileEdit, BarChart2, User } from 'lucide-react';

export const MengikutiAlur = () => (
  <div className="flex h-[70vh] flex-col items-center justify-center rounded-2xl bg-white border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
    <Route size={64} className="mb-4 text-blue-300 dark:text-blue-900" />
    <h2 className="text-2xl font-bold text-slate-700 dark:text-white">Alur Pembelajaran</h2>
    <p className="text-slate-500 dark:text-slate-400">Fitur penelusuran roadmap belajar sedang dalam tahap pengembangan.</p>
  </div>
);

export const UjianTest = () => (
  <div className="flex h-[70vh] flex-col items-center justify-center rounded-2xl bg-white border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
    <FileEdit size={64} className="mb-4 text-blue-300 dark:text-blue-900" />
    <h2 className="text-2xl font-bold text-slate-700 dark:text-white">Ujian & Evaluasi</h2>
    <p className="text-slate-500 dark:text-slate-400">Bank soal dan evaluasi kompetensi belum tersedia untuk kelas ini.</p>
  </div>
);

export const AnalisisHasil = () => (
  <div className="flex h-[70vh] flex-col items-center justify-center rounded-2xl bg-white border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
    <BarChart2 size={64} className="mb-4 text-blue-300 dark:text-blue-900" />
    <h2 className="text-2xl font-bold text-slate-700 dark:text-white">Analisis Hasil Belajar</h2>
    <p className="text-slate-500 dark:text-slate-400">Dasbor analitik nilai siswa akan segera hadir.</p>
  </div>
);

export const Profil = () => (
  <div className="flex h-[70vh] flex-col items-center justify-center rounded-2xl bg-white border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
    <User size={64} className="mb-4 text-blue-300 dark:text-blue-900" />
    <h2 className="text-2xl font-bold text-slate-700 dark:text-white">Profil Pengguna</h2>
    <p className="text-slate-500 dark:text-slate-400">Pengaturan akun dan preferensi sedang dikonfigurasi.</p>
  </div>
);
