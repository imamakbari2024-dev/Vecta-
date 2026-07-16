import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { BookOpen, Box, MessageSquare, BarChart, Settings, LogOut } from 'lucide-react';

export default function SidebarLayout({ role }) {
  // Menu dinamis berdasarkan peran
  const menuGuru = [
    { name: 'Dashboard', path: '/dashboard/guru', icon: <BarChart /> },
    { name: 'Kelas Saya', path: '/dashboard/guru/kelas', icon: <BookOpen /> },
    { name: 'Vecta AI', path: '/dashboard/guru/ai', icon: <MessageSquare /> },
    { name: 'Pengaturan', path: '/dashboard/guru/pengaturan', icon: <Settings /> },
  ];

  const menuSiswa = [
    { name: 'Dashboard', path: '/dashboard/siswa', icon: <BarChart /> },
    { name: 'Materi 3D', path: '/dashboard/siswa/materi', icon: <Box /> },
    { name: 'Ujian & Test', path: '/dashboard/siswa/ujian', icon: <BookOpen /> },
    { name: 'Bertanya ke AI', path: '/dashboard/siswa/ai', icon: <MessageSquare /> },
  ];

  const menus = role === 'guru' ? menuGuru : menuSiswa;

  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-100">
      {/* Sidebar Kiri */}
      <aside className="flex w-64 flex-col border-r border-slate-700 bg-slate-800 p-4">
        <h2 className="mb-8 text-2xl font-bold text-blue-400">Vecta {role === 'guru' ? 'Guru' : 'Siswa'}</h2>
        <nav className="flex-1 space-y-2">
          {menus.map((menu) => (
            <Link
              key={menu.name}
              to={menu.path}
              className="flex items-center gap-3 rounded-lg p-3 text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              {menu.icon}
              <span>{menu.name}</span>
            </Link>
          ))}
        </nav>
        <button className="flex items-center gap-3 rounded-lg p-3 text-red-400 transition hover:bg-red-500/10">
          <LogOut />
          <span>Keluar</span>
        </button>
      </aside>

      {/* Area Konten Utama (Dinamis) */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
