import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Route, FileEdit, MessageSquare, BarChart2, User, Users, LogOut, Menu, X, Sun, Moon, ChevronDown, Box } from 'lucide-react';

// IMPORT FIREBASE UNTUK LOGOUT & DATABASE
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function SidebarLayout({ role }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // STATE BARU
  const [daftarKelas, setDaftarKelas] = useState([]);
  const [selectedClass, setSelectedClass] = useState('Semua Kelas');
  const [currentUser, setCurrentUser] = useState(null); // Menyimpan data user yang login
  
  const location = useLocation();
  const navigate = useNavigate();

  // MENDETEKSI USER YANG SEDANG LOGIN
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // MENGAMBIL DATA KELAS DARI FIREBASE (Untuk Dropdown)
  useEffect(() => {
    const q = query(collection(db, 'kelas'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const kelasData = snapshot.docs.map(doc => ({
        id: doc.id,
        nama: doc.data().nama
      }));
      setDaftarKelas(kelasData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Gagal keluar:', error);
    }
  };

  const menuSiswa = [
    { name: 'Dashboard', path: '/dashboard/siswa', icon: <LayoutDashboard size={20} /> },
    { name: 'Akses Materi', path: '/dashboard/siswa/materi', icon: <BookOpen size={20} /> },
    { name: 'Visualisasi 3D', path: '/dashboard/siswa/3d', icon: <Box size={20} /> },
    { name: 'Mengikuti Alur', path: '/dashboard/siswa/alur', icon: <Route size={20} /> },
    { name: 'Ujian & Test', path: '/dashboard/siswa/ujian', icon: <FileEdit size={20} /> },
    { name: 'Bertanya ke AI', path: '/dashboard/siswa/ai', icon: <MessageSquare size={20} /> },
    { name: 'Analisis Hasil', path: '/dashboard/siswa/analisis', icon: <BarChart2 size={20} /> },
    { name: 'Profil', path: '/dashboard/siswa/profil', icon: <User size={20} /> },
  ];

  const menuGuru = [
    { name: 'Dashboard', path: '/dashboard/guru', icon: <LayoutDashboard size={20} /> },
    { name: 'Kelola Kelas', path: '/dashboard/guru/kelas', icon: <Users size={20} /> },
    { name: 'Kelola Materi', path: '/dashboard/guru/materi', icon: <BookOpen size={20} /> },
    
    // --- INI ADALAH MENU BARU YANG DITAMBAHKAN ---
    { name: 'Kelola Visualisasi 3D', path: '/dashboard/guru/3d', icon: <Box size={20} /> },
    
    { name: 'Kelola Alur', path: '/dashboard/guru/alur', icon: <Route size={20} /> },
    { name: 'Tugas & Ujian', path: '/dashboard/guru/ujian', icon: <FileEdit size={20} /> },
    { name: 'Manajemen Siswa', path: '/dashboard/guru/siswa', icon: <Users size={20} /> },
    { name: 'Analisis Belajar', path: '/dashboard/guru/analisis', icon: <BarChart2 size={20} /> },
    { name: 'Bertanya ke AI', path: '/dashboard/guru/ai', icon: <MessageSquare size={20} /> },
    { name: 'Profil', path: '/dashboard/guru/profil', icon: <User size={20} /> },
  ];

  const activeMenu = role === 'guru' ? menuGuru : menuSiswa;

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 transition-colors duration-300 dark:bg-slate-900 dark:text-slate-100">
      
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 dark:bg-slate-900 dark:border-slate-800 ${isSidebarOpen ? 'w-72 translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 ${!isSidebarOpen && 'md:w-0 md:overflow-hidden md:border-none'}`}>
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-2xl font-black text-blue-600 dark:text-blue-500 tracking-tight">Vecta<span className="text-slate-800 dark:text-white">Learning</span></h2>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-500 hover:text-slate-800 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          <p className="px-3 mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Menu Utama</p>
          {activeMenu.map((menu) => {
            const isActive = location.pathname === menu.path;
            return (
              <Link
                key={menu.name}
                to={menu.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                {menu.icon}
                <span>{menu.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10">
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-20 items-center justify-between bg-white px-6 border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white transition-colors">
              <Menu size={24} />
            </button>
            
            <div className="relative hidden md:block">
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="Semua Kelas">Semua Kelas</option>
                {daftarKelas.map((kelas) => (
                  <option key={kelas.id} value={kelas.id}>{kelas.nama}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="rounded-full p-2.5 text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-amber-400 dark:hover:bg-slate-700 transition-colors">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* BAGIAN PROFIL OTOMATIS */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
              <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm uppercase">
                {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || (role === 'guru' ? 'G' : 'S')}
              </div>
              <div className="hidden md:block text-sm">
                <p className="font-bold text-slate-800 dark:text-white capitalize">
                  {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Pengguna'}
                </p>
                <p className="text-xs text-slate-500 capitalize">{role}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet context={{ selectedClass }} />
        </div>
      </main>
    </div>
  );
}
