import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Route, FileEdit, BarChart2, User, Plus, Copy, Check, MoreVertical } from 'lucide-react';

// --- IMPORT FIREBASE ---
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

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
  // State dibiarkan kosong di awal karena data akan ditarik dari Firebase
  const [daftarKelas, setDaftarKelas] = useState([]);
  const [namaKelasBaru, setNamaKelasBaru] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [loading, setLoading] = useState(false);

  // MENGAMBIL DATA DARI FIREBASE SECARA REAL-TIME
  useEffect(() => {
    const q = query(collection(db, 'kelas'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const kelasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDaftarKelas(kelasData);
    });
    
    // Membersihkan listener saat pindah halaman
    return () => unsubscribe(); 
  }, []);

  // Fungsi membuat kode acak 6 karakter
  const generateKodeUnik = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // MENYIMPAN KELAS BARU KE FIREBASE
  const handleBuatKelas = async (e) => {
    e.preventDefault();
    if (!namaKelasBaru.trim()) return;
    
    setLoading(true); // Mengaktifkan efek loading pada tombol

    try {
      await addDoc(collection(db, 'kelas'), {
        nama: namaKelasBaru,
        kode: generateKodeUnik(),
        siswa: [], // Dibuat array kosong, nanti diisi ID siswa yang bergabung
        createdAt: serverTimestamp() // Catat waktu pembuatan
      });
      setNamaKelasBaru(''); // Kosongkan input setelah sukses
    } catch (error) {
      console.error("Gagal menyimpan kelas:", error);
      alert("Terjadi kesalahan saat menyimpan kelas ke database.");
    } finally {
      setLoading(false); // Mematikan efek loading
    }
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
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 p-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Menyimpan ke Server..." : "Generate Kode Kelas"}
            </button>
          </form>
        </div>

        {/* Daftar Kelas Aktif (Kanan) */}
        <div className="lg:col-span-2 space-y-4">
          {daftarKelas.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada kelas yang dibuat.</p>
            </div>
          ) : (
            daftarKelas.map((kelas) => (
              <div key={kelas.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl bg-white p-5 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 transition-all hover:border-blue-300 dark:hover:border-blue-600">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                    <Users size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{kelas.nama}</h4>
                    {/* Mengambil jumlah siswa dari panjang array di Firebase */}
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {kelas.siswa ? kelas.siswa.length : 0} Siswa Terdaftar
                    </p>
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- Export Placeholder Lainnya ---
export const KelolaMateri = () => {
  const [daftarKelas, setDaftarKelas] = useState([]);
  const [daftarMateri, setDaftarMateri] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [kelasId, setKelasId] = useState('');
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [tipe, setTipe] = useState('Modul Teks/PDF');
  const [linkMateri, setLinkMateri] = useState('');

  // Mengambil data Kelas dan Materi dari Firebase
  useEffect(() => {
    // Ambil Kelas untuk Dropdown
    const unsubKelas = onSnapshot(query(collection(db, 'kelas'), orderBy('createdAt', 'desc')), (snapshot) => {
      setDaftarKelas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Ambil Daftar Materi
    const unsubMateri = onSnapshot(query(collection(db, 'materi'), orderBy('createdAt', 'desc')), (snapshot) => {
      setDaftarMateri(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubKelas(); unsubMateri(); };
  }, []);

  const handleSimpanMateri = async (e) => {
    e.preventDefault();
    if (!kelasId || !judul) return alert('Pilih kelas dan isi judul materi terlebih dahulu!');
    setLoading(true);

    try {
      const kelasTerpilih = daftarKelas.find(k => k.id === kelasId);
      
      await addDoc(collection(db, 'materi'), {
        kelasId: kelasId,
        namaKelas: kelasTerpilih.nama,
        judul: judul,
        deskripsi: deskripsi,
        tipe: tipe,
        link: linkMateri,
        createdAt: serverTimestamp()
      });

      // Reset form setelah berhasil
      setJudul(''); setDeskripsi(''); setLinkMateri('');
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal menyimpan materi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Pustaka Materi</h1>
        <p className="text-slate-500 dark:text-slate-400">Unggah dan kelola modul, video, atau visualisasi 3D untuk siswa.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* FORM TAMBAH MATERI (KIRI) */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 h-fit">
          <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Plus size={20} className="text-blue-500" /> Tambah Materi
          </h3>
          <form onSubmit={handleSimpanMateri} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Pilih Kelas</label>
              <select value={kelasId} onChange={(e) => setKelasId(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900/50 dark:text-white">
                <option value="">-- Pilih Mata Pelajaran --</option>
                {daftarKelas.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Judul Materi</label>
              <input type="text" value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Cth: Bab 1 - Pengenalan PLC" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900/50 dark:text-white" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Tipe Materi</label>
              <select value={tipe} onChange={(e) => setTipe(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900/50 dark:text-white">
                <option value="Modul Teks/PDF">Modul Teks/PDF</option>
                <option value="Video Pembelajaran">Video Pembelajaran</option>
                <option value="Model 3D (.glb)">Model 3D Interaktif</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Tautan / Link (Opsional)</label>
              <input type="text" value={linkMateri} onChange={(e) => setLinkMateri(e.target.value)} placeholder="Masukkan link GDrive / YouTube" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900/50 dark:text-white" />
            </div>

            <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 p-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50">
              {loading ? "Menyimpan..." : "Publikasikan Materi"}
            </button>
          </form>
        </div>

        {/* DAFTAR MATERI (KANAN) */}
        <div className="lg:col-span-2 space-y-4">
          {daftarMateri.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada materi yang diunggah.</p>
            </div>
          ) : (
            daftarMateri.map((materi) => (
              <div key={materi.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl bg-white p-5 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{materi.judul}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{materi.namaKelas} • {materi.tipe}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export const KelolaAlur = () => <HalamanKosong icon={Route} judul="Kelola Alur Pembelajaran" deskripsi="Sistem Roadmap untuk merancang urutan belajar siswa secara bertahap." />;
export const TugasUjian = () => <HalamanKosong icon={FileEdit} judul="Tugas & Ujian" deskripsi="Fitur pembuatan soal pilihan ganda, esai, dan tugas praktik." />;
export const ManajemenSiswa = () => <HalamanKosong icon={Users} judul="Manajemen Siswa" deskripsi="Tabel daftar peserta kelas, kehadiran, dan status aktivitas siswa." />;
export const AnalisisGuru = () => <HalamanKosong icon={BarChart2} judul="Analisis Pembelajaran" deskripsi="Grafik perkembangan nilai dan capaian kompetensi seluruh kelas." />;
export const ProfilGuru = () => <HalamanKosong icon={User} judul="Profil Pengajar" deskripsi="Kelola informasi akun dan preferensi pengajar Anda." />;
