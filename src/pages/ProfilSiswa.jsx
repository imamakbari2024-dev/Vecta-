import React from 'react';
import { auth } from '../lib/firebase';
import { User, Mail, Fingerprint } from 'lucide-react';

export default function ProfilSiswa() {
  const user = auth.currentUser;
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Profil Pengguna</h1>
        <p className="text-slate-500 dark:text-slate-400">Kelola informasi akun dan identitas belajar Anda.</p>
      </div>

      <div className="max-w-2xl rounded-2xl bg-white p-8 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center gap-6 mb-8 border-b border-slate-100 pb-8 dark:border-slate-700">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-4xl font-black text-white uppercase shadow-lg">
            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'S'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white capitalize">
              {user?.displayName || user?.email?.split('@')[0] || "Siswa Vecta"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">Akun Siswa Aktif</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-blue-500"><Mail size={20} /></div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Terdaftar</label>
              <p className="text-md font-bold text-slate-800 dark:text-white">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-blue-500"><Fingerprint size={20} /></div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ID Unik Sistem (UID)</label>
              <p className="text-sm font-mono text-slate-600 dark:text-slate-300">{user?.uid}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
