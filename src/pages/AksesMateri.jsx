import React from 'react';
import { BookOpen, ChevronRight, FileText } from 'lucide-react';

export default function AksesMateri() {
  const mataPelajaran = [
    { nama: 'Sistem Kontrol Mekatronika', bab: 8, progres: 45 },
    { nama: 'Pemrograman Mikrokontroler (ESP32)', bab: 12, progres: 10 },
    { nama: 'Otomasi Industri & PLC', bab: 10, progres: 80 },
    { nama: 'Fisika Terapan Dasar', bab: 6, progres: 100 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Pustaka Materi</h1>
        <p className="text-slate-500 dark:text-slate-400">Pilih mata pelajaran untuk mulai membaca modul dan literatur.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mataPelajaran.map((mapel, idx) => (
          <div key={idx} className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                <BookOpen size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{mapel.nama}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <FileText size={14} /> {mapel.bab} Bab Materi
              </p>
            </div>
            
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs font-medium">
                <span className="text-slate-500 dark:text-slate-400">Progres</span>
                <span className="text-blue-600 dark:text-blue-400">{mapel.progres}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden mb-4">
                <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${mapel.progres}%` }}></div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-50 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-700">
                Buka Modul <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
