import React from 'react';
import { Users, BookOpen, BarChart, Plus, Activity, ArrowRight } from 'lucide-react';

export default function DashboardGuru() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard Pengajar</h1>
          <p className="text-slate-500 dark:text-slate-400">Pantau perkembangan kelas dan kelola materi pembelajaran Anda.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-sm">
          <Plus size={18} /> Tambah Materi Baru
        </button>
      </div>

      {/* 3 Kartu Statistik Guru */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex items-center rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 transition-colors hover:border-blue-300 dark:hover:border-blue-600">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
            <Users size={28} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Siswa Aktif</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">124</p>
          </div>
        </div>

        <div className="flex items-center rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 transition-colors hover:border-green-300 dark:hover:border-green-600">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
            <BookOpen size={28} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Modul Pembelajaran</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">12</p>
          </div>
        </div>

        <div className="flex items-center rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 transition-colors hover:border-orange-300 dark:hover:border-orange-600">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400">
            <BarChart size={28} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Rata-rata Nilai Kelas</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">78.5</p>
          </div>
        </div>
      </div>

      {/* Area Konten Utama */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Aktivitas Siswa Terkini (Porsi 2 Kolom) */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Aktivitas Siswa Terkini</h3>
            <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">Lihat Semua</button>
          </div>
          
          <div className="space-y-4">
            {[
              { nama: "Budi Santoso", aksi: "Menyelesaikan Kuis Fisika Kuantum", waktu: "10 menit yang lalu" },
              { nama: "Siti Aminah", aksi: "Membuka Modul Simulasi Spatial 3D", waktu: "45 menit yang lalu" },
              { nama: "Ahmad Fauzi", aksi: "Mengirimkan Tugas Pemrograman ESP32", waktu: "2 jam yang lalu" },
              { nama: "Clara Sinaga", aksi: "Mengakses Ruang Tanya AI", waktu: "3 jam yang lalu" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                  <Activity size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{item.nama}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.aksi}</p>
                </div>
                <span className="text-xs text-slate-400 font-medium">{item.waktu}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Menu Akses Cepat (Porsi 1 Kolom) */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 transition-colors">
          <h3 className="mb-6 text-lg font-bold text-slate-800 dark:text-white">Akses Cepat</h3>
          <div className="space-y-3">
            {['Manajemen Data Siswa', 'Buat Ujian & Kuis Baru', 'Rekapitulasi Nilai', 'Pengaturan Kelas'].map((menu, idx) => (
              <button key={idx} className="w-full flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-blue-900 dark:hover:bg-blue-900/20 group">
                <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400">{menu}</span>
                <ArrowRight size={18} className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
