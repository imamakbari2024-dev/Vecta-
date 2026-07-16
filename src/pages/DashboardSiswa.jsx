import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { BookOpen, Award, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';

export default function DashboardSiswa() {
  // Mengambil state kelas terpilih dari Topbar (SidebarLayout)
  const { selectedClass } = useOutletContext();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 3 Kartu Statistik */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex items-center rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 transition-colors">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
            <BookOpen size={28} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Kelas Diikuti</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">4</p>
          </div>
        </div>

        <div className="flex items-center rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 transition-colors">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400">
            <Award size={28} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Nilai Rata-rata</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">85.5</p>
          </div>
        </div>

        <div className="flex items-center rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 transition-colors">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
            <CheckCircle size={28} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Langkah Selesai</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">24</p>
          </div>
        </div>
      </div>

      {/* Panel Progres Pembelajaran */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 transition-colors">
        <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-white">Progres Pembelajaran Bab</h3>
        
        {selectedClass === 'Semua Kelas' ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <AlertCircle className="mb-2 text-slate-400" size={40} />
            <p className="text-slate-600 dark:text-slate-300 font-medium">Belum ada kelas spesifik yang dipilih.</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Pilih kelas di navigasi atas untuk melihat progres.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm font-medium">
                <span className="text-slate-700 dark:text-slate-200">Materi: {selectedClass}</span>
                <span className="text-blue-600 dark:text-blue-400">65%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div className="h-full rounded-full bg-blue-600 transition-all duration-1000" style={{ width: '65%' }}></div>
              </div>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
              Lanjutkan Belajar <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Daftar Kelas */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 transition-colors">
        <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-white">Kelas yang Diikuti</h3>
        <div className="space-y-3">
          {['Fisika Kuantum Dasar', 'Matematika Diskrit', 'Pengantar Mekatronika'].map((kelas, index) => (
            <div key={index} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-200 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-blue-900">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                  <BookOpen size={20} />
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-200">{kelas}</span>
              </div>
              <span className="text-sm font-medium text-slate-400">Aktif</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
