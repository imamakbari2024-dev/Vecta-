import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, BarChart, Plus, Activity, ArrowRight } from 'lucide-react';

// IMPORT FIREBASE
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

export default function DashboardGuru() {
  const navigate = useNavigate();
  const [logAktivitas, setLogAktivitas] = useState([]);
  const [loadingAktivitas, setLoadingAktivitas] = useState(true);

  // STATE BARU: Untuk menyimpan statistik real-time
  const [stats, setStats] = useState({
    totalSiswa: 0,
    totalModul: 0,
    rataRataNilai: 0
  });

  // MENGAMBIL DATA STATISTIK & LOG SECARA REAL-TIME
  useEffect(() => {
    // 1. Ambil Log Aktivitas (Sama seperti sebelumnya)
    const qLog = query(collection(db, 'log_aktivitas'), orderBy('createdAt', 'desc'), limit(5));
    const unsubLog = onSnapshot(qLog, (snapshot) => {
      setLogAktivitas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingAktivitas(false);
    });

    // 2. Hitung Total Siswa (Dari jumlah array siswa di semua kelas)
    const unsubKelas = onSnapshot(collection(db, 'kelas'), (snapshot) => {
      let total = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.siswa) total += data.siswa.length;
      });
      setStats(prev => ({ ...prev, totalSiswa: total }));
    });

    // 3. Hitung Total Modul (Dari jumlah dokumen materi)
    const unsubMateri = onSnapshot(collection(db, 'materi'), (snapshot) => {
      setStats(prev => ({ ...prev, totalModul: snapshot.size }));
    });

    // 4. Hitung Rata-Rata Nilai Keseluruhan (Dari dokumen jawaban yang sudah dinilai)
    const unsubJawaban = onSnapshot(collection(db, 'jawaban_siswa'), (snapshot) => {
      let totalNilai = 0;
      let jumlahDinilai = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.nilai !== null && data.nilai !== undefined) {
          totalNilai += Number(data.nilai);
          jumlahDinilai++;
        }
      });
      const rataRata = jumlahDinilai === 0 ? 0 : (totalNilai / jumlahDinilai).toFixed(1);
      setStats(prev => ({ ...prev, rataRataNilai: rataRata }));
    });

    // Bersihkan semua listener saat berpindah halaman
    return () => { unsubLog(); unsubKelas(); unsubMateri(); unsubJawaban(); };
  }, []);

  const menuAksesCepat = [
    { nama: 'Manajemen Data Siswa', path: '/dashboard/guru/siswa' },
    { nama: 'Buat Ujian & Kuis Baru', path: '/dashboard/guru/ujian' },
    { nama: 'Rekapitulasi Nilai', path: '/dashboard/guru/analisis' },
    { nama: 'Pengaturan Kelas', path: '/dashboard/guru/kelas' }
  ];

  const formatWaktuTerkini = (timestamp) => {
    if (!timestamp) return 'Baru saja';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(); 
    const sekarang = new Date();
    const selisihMenit = Math.floor((sekarang - date) / 60000);

    if (selisihMenit < 1) return 'Baru saja';
    if (selisihMenit < 60) return `${selisihMenit} menit lalu`;
    
    const selisihJam = Math.floor(selisihMenit / 60);
    if (selisihJam < 24) return `${selisihJam} jam lalu`;
    
    const selisihHari = Math.floor(selisihJam / 24);
    return `${selisihHari} hari lalu`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard Pengajar</h1>
          <p className="text-slate-500 dark:text-slate-400">Pantau perkembangan kelas dan kelola materi pembelajaran Anda.</p>
        </div>
        <button onClick={() => navigate('/dashboard/guru/materi')} className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-sm">
          <Plus size={18} /> Tambah Materi Baru
        </button>
      </div>

      {/* KARTU STATISTIK REAL-TIME (Menggantikan angka statis) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex items-center rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 transition-colors">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"><Users size={28} /></div>
          <div className="ml-4"><p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Siswa Terdaftar</p><p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalSiswa}</p></div>
        </div>
        <div className="flex items-center rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 transition-colors">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"><BookOpen size={28} /></div>
          <div className="ml-4"><p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Materi & Modul</p><p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalModul}</p></div>
        </div>
        <div className="flex items-center rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 transition-colors">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400"><BarChart size={28} /></div>
          <div className="ml-4"><p className="text-sm font-medium text-slate-500 dark:text-slate-400">Rata-rata Nilai Kelas</p><p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.rataRataNilai}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Aktivitas Siswa Terkini</h3>
          </div>
          
          <div className="space-y-4">
            {loadingAktivitas ? (
              <div className="py-4 text-center text-sm text-slate-500">Memuat data aktivitas...</div>
            ) : logAktivitas.length === 0 ? (
               <div className="py-4 text-center text-sm text-slate-500">Belum ada aktivitas terbaru dari siswa di database.</div>
            ) : (
              logAktivitas.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                    <Activity size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">{item.namaSiswa}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.aksi}</p>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {formatWaktuTerkini(item.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 transition-colors">
          <h3 className="mb-6 text-lg font-bold text-slate-800 dark:text-white">Akses Cepat</h3>
          <div className="space-y-3">
            {menuAksesCepat.map((menu, idx) => (
              <button key={idx} onClick={() => navigate(menu.path)} className="w-full flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-blue-900 dark:hover:bg-blue-900/20 group">
                <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400">{menu.nama}</span>
                <ArrowRight size={18} className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
