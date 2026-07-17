import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Route, FileEdit, BarChart2, User, Plus, Copy, Check, MoreVertical } from 'lucide-react';

// --- IMPORT FIREBASE ---
import { db, auth } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, where, updateDoc, doc } from 'firebase/firestore'; 

// --- Komponen Placeholder untuk menu yang belum dibangun ---
const HalamanKosong = ({ icon: Icon, judul, deskripsi }) => (
  <div className="flex h-[70vh] flex-col items-center justify-center rounded-2xl bg-white border border-slate-100 dark:bg-slate-800 dark:border-slate-700 animate-in fade-in duration-500">
    <Icon size={64} className="mb-4 text-blue-300 dark:text-blue-900" />
    <h2 className="text-2xl font-bold text-slate-700 dark:text-white">{judul}</h2>
    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md text-center">{deskripsi}</p>
  </div>
);

// ==========================================
// 1. FITUR KELOLA KELAS
// ==========================================
export const KelolaKelas = () => {
  const [daftarKelas, setDaftarKelas] = useState([]);
  const [namaKelasBaru, setNamaKelasBaru] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'kelas'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const kelasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDaftarKelas(kelasData);
    });
    return () => unsubscribe(); 
  }, []);

  const generateKodeUnik = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleBuatKelas = async (e) => {
    e.preventDefault();
    if (!namaKelasBaru.trim()) return;
    setLoading(true);

    try {
      await addDoc(collection(db, 'kelas'), {
        nama: namaKelasBaru,
        kode: generateKodeUnik(),
        siswa: [],
        createdAt: serverTimestamp()
      });
      setNamaKelasBaru('');
    } catch (error) {
      console.error("Gagal menyimpan kelas:", error);
      alert("Terjadi kesalahan saat menyimpan kelas ke database.");
    } finally {
      setLoading(false);
    }
  };

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
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 p-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50">
              {loading ? "Menyimpan..." : "Generate Kode Kelas"}
            </button>
          </form>
        </div>

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
                  <button onClick={() => salinKode(kelas.kode)} className="rounded-lg p-2.5 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-colors" title="Salin Kode">
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

// ==========================================
// 2. FITUR KELOLA MATERI
// ==========================================
export const KelolaMateri = () => {
  const [daftarKelas, setDaftarKelas] = useState([]);
  const [daftarMateri, setDaftarMateri] = useState([]);
  const [loading, setLoading] = useState(false);

  const [kelasId, setKelasId] = useState('');
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [tipe, setTipe] = useState('Modul Teks/PDF');
  const [linkMateri, setLinkMateri] = useState('');

  useEffect(() => {
    const unsubKelas = onSnapshot(query(collection(db, 'kelas'), orderBy('createdAt', 'desc')), (snapshot) => {
      setDaftarKelas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

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

// ==========================================
// 3. FITUR KELOLA ALUR PEMBELAJARAN
// ==========================================
export const KelolaAlur = () => {
  const [daftarKelas, setDaftarKelas] = useState([]);
  const [kelasId, setKelasId] = useState('');
  const [alurPembelajaran, setAlurPembelajaran] = useState([]);
  const [loading, setLoading] = useState(false);

  const [judulTahap, setJudulTahap] = useState('');
  const [tipeTahap, setTipeTahap] = useState('Materi Bacaan');

  useEffect(() => {
    const unsubKelas = onSnapshot(query(collection(db, 'kelas'), orderBy('createdAt', 'desc')), (snapshot) => {
      setDaftarKelas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubKelas();
  }, []);

  useEffect(() => {
    if (!kelasId) {
      setAlurPembelajaran([]);
      return;
    }
    const q = query(collection(db, 'alur'), where('kelasId', '==', kelasId), orderBy('urutan', 'asc'));
    const unsubAlur = onSnapshot(q, (snapshot) => {
      setAlurPembelajaran(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubAlur();
  }, [kelasId]);

  const handleTambahTahap = async (e) => {
    e.preventDefault();
    if (!kelasId || !judulTahap) return alert('Pilih kelas dan isi judul tahap terlebih dahulu!');
    setLoading(true);

    try {
      await addDoc(collection(db, 'alur'), {
        kelasId: kelasId,
        judul: judulTahap,
        tipe: tipeTahap,
        urutan: alurPembelajaran.length + 1, 
        createdAt: serverTimestamp()
      });
      setJudulTahap('');
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal menyimpan tahapan alur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Kelola Alur Pembelajaran</h1>
        <p className="text-slate-500 dark:text-slate-400">Rancang urutan belajar (Roadmap) langkah demi langkah untuk siswa.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 h-fit">
          <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Plus size={20} className="text-blue-500" /> Tambah Tahapan
          </h3>
          <form onSubmit={handleTambahTahap} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Pilih Kelas</label>
              <select value={kelasId} onChange={(e) => setKelasId(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900/50 dark:text-white">
                <option value="">-- Pilih Mata Pelajaran --</option>
                {daftarKelas.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Judul Tahapan</label>
              <input type="text" value={judulTahap} onChange={(e) => setJudulTahap(e.target.value)} placeholder="Cth: Baca Bab 1: Sejarah Robotika" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900/50 dark:text-white" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Tipe Aktivitas</label>
              <select value={tipeTahap} onChange={(e) => setTipeTahap(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900/50 dark:text-white">
                <option value="Materi Bacaan">📖 Materi Bacaan (Modul/PDF)</option>
                <option value="Visualisasi 3D">🧊 Visualisasi 3D Interaktif</option>
                <option value="Kuis Evaluasi">📝 Kuis Evaluasi</option>
              </select>
            </div>

            <button type="submit" disabled={loading || !kelasId} className="w-full rounded-xl bg-blue-600 p-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Menyimpan..." : "Tambahkan ke Roadmap"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 min-h-[400px]">
            <h3 className="mb-6 text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-4">
              Peta Jalan Pembelajaran
            </h3>
            
            {!kelasId ? (
              <div className="flex h-40 flex-col items-center justify-center text-slate-400">
                <Route size={48} className="mb-3 opacity-20" />
                <p>Pilih kelas terlebih dahulu untuk melihat alur.</p>
              </div>
            ) : alurPembelajaran.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-slate-400">
                <p>Belum ada tahapan di kelas ini. Silakan buat di sebelah kiri.</p>
              </div>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent dark:before:via-slate-700">
                {alurPembelajaran.map((tahap) => (
                  <div key={tahap.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-white font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm dark:border-slate-800 z-10">
                      {tahap.urutan}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900/50 hover:border-blue-400 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{tahap.tipe}</span>
                      </div>
                      <h4 className="text-md font-bold text-slate-800 dark:text-white">{tahap.judul}</h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. FITUR TUGAS & UJIAN
// ==========================================
export const TugasUjian = () => {
  const [daftarKelas, setDaftarKelas] = useState([]);
  const [daftarTugas, setDaftarTugas] = useState([]);
  const [loading, setLoading] = useState(false);

  const [kelasId, setKelasId] = useState('');
  const [judulTugas, setJudulTugas] = useState('');
  const [tipeTugas, setTipeTugas] = useState('Pilihan Ganda');
  const [batasWaktu, setBatasWaktu] = useState('');

  useEffect(() => {
    const unsubKelas = onSnapshot(query(collection(db, 'kelas'), orderBy('createdAt', 'desc')), (snapshot) => {
      setDaftarKelas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubTugas = onSnapshot(query(collection(db, 'tugas'), orderBy('createdAt', 'desc')), (snapshot) => {
      setDaftarTugas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubKelas(); unsubTugas(); };
  }, []);

  const handleBuatTugas = async (e) => {
    e.preventDefault();
    if (!kelasId || !judulTugas || !batasWaktu) return alert('Lengkapi semua data!');
    setLoading(true);

    try {
      const kelasTerpilih = daftarKelas.find(k => k.id === kelasId);
      await addDoc(collection(db, 'tugas'), {
        kelasId,
        namaKelas: kelasTerpilih.nama,
        judul: judulTugas,
        tipe: tipeTugas,
        deadline: batasWaktu,
        status: 'Aktif',
        createdAt: serverTimestamp()
      });
      setJudulTugas(''); setBatasWaktu('');
    } catch (error) {
      alert('Gagal membuat tugas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Kelola Tugas & Ujian</h1>
        <p className="text-slate-500 dark:text-slate-400">Buat evaluasi pembelajaran untuk mengukur pemahaman siswa.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 h-fit">
          <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-white">Buat Ujian Baru</h3>
          <form onSubmit={handleBuatTugas} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Pilih Kelas</label>
              <select value={kelasId} onChange={(e) => setKelasId(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900/50 dark:text-white">
                <option value="">-- Pilih Kelas --</option>
                {daftarKelas.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Judul Evaluasi</label>
              <input type="text" value={judulTugas} onChange={(e) => setJudulTugas(e.target.value)} placeholder="Ujian Tengah Semester" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900/50 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Tipe</label>
              <select value={tipeTugas} onChange={(e) => setTipeTugas(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900/50 dark:text-white">
                <option value="Pilihan Ganda">Pilihan Ganda</option>
                <option value="Esai Panjang">Esai Panjang</option>
                <option value="Upload Proyek">Upload Proyek Praktik</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Batas Waktu (Deadline)</label>
              <input type="date" value={batasWaktu} onChange={(e) => setBatasWaktu(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900/50 dark:text-white" />
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 p-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50">
              {loading ? "Menyimpan..." : "Publikasikan"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {daftarTugas.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada tugas/ujian yang dibuat.</p>
            </div>
          ) : (
            daftarTugas.map(tugas => (
              <div key={tugas.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl bg-white p-5 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                    <FileEdit size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{tugas.judul}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{tugas.namaKelas} • {tugas.tipe}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Tenggat Waktu</p>
                  <p className="font-bold text-red-500">{tugas.deadline}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. FITUR MANAJEMEN SISWA (PENILAIAN)
// ==========================================
export const ManajemenSiswa = () => {
  const [daftarJawaban, setDaftarJawaban] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'jawaban_siswa'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setDaftarJawaban(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSimpanNilai = async (jawabanId, nilaiBaru) => {
    if (nilaiBaru === '' || nilaiBaru < 0 || nilaiBaru > 100) return alert("Masukkan nilai antara 0 - 100");
    try {
      await updateDoc(doc(db, 'jawaban_siswa', jawabanId), {
        nilai: Number(nilaiBaru)
      });
      alert("Nilai berhasil disimpan!");
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan nilai.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manajemen Siswa & Penilaian</h1>
        <p className="text-slate-500 dark:text-slate-400">Tinjau pekerjaan siswa dan berikan penilaian evaluasi secara langsung.</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 overflow-x-auto">
        {loading ? (
          <p className="text-slate-500">Memuat data pekerjaan siswa...</p>
        ) : daftarJawaban.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Belum ada siswa yang mengumpulkan tugas.</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="border-b border-slate-200 text-slate-800 dark:border-slate-700 dark:text-white">
              <tr>
                <th className="pb-4 font-bold">Nama Siswa</th>
                <th className="pb-4 font-bold">Tugas Dikerjakan</th>
                <th className="pb-4 font-bold">Jawaban/Karya</th>
                <th className="pb-4 font-bold">Nilai (0-100)</th>
                <th className="pb-4 font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {daftarJawaban.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="py-4 font-bold text-slate-700 dark:text-slate-300 capitalize">{item.namaSiswa}</td>
                  <td className="py-4">{item.judulTugas}</td>
                  <td className="py-4 max-w-[200px] truncate pr-4" title={item.jawaban}>{item.jawaban}</td>
                  <td className="py-4">
                    <input 
                      type="number" 
                      defaultValue={item.nilai || ''}
                      id={`nilai-${item.id}`}
                      className="w-20 rounded-lg border border-slate-200 bg-slate-50 p-2 text-center text-sm focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900/50"
                      placeholder="-"
                    />
                  </td>
                  <td className="py-4">
                    <button 
                      onClick={() => handleSimpanNilai(item.id, document.getElementById(`nilai-${item.id}`).value)}
                      className="rounded-lg bg-green-500 px-4 py-2 text-xs font-bold text-white hover:bg-green-600"
                    >
                      Simpan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 6. FITUR ANALISIS BELAJAR
// ==========================================
export const AnalisisGuru = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Analisis Pembelajaran</h1>
        <p className="text-slate-500 dark:text-slate-400">Pantau performa kelas melalui representasi data.</p>
      </div>

      <div className="flex h-[50vh] flex-col items-center justify-center rounded-2xl bg-white border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
        <BarChart2 size={64} className="mb-4 text-blue-300 dark:text-blue-900" />
        <h3 className="text-xl font-bold text-slate-700 dark:text-white mb-2">Integrasi Analisis AI</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md text-center">
          Fitur ini akan segera tersedia. Sistem sedang mengumpulkan data yang cukup dari interaksi siswa untuk menampilkan grafik kompetensi.
        </p>
      </div>
    </div>
  );
};

// ==========================================
// 7. FITUR PROFIL GURU
// ==========================================
export const ProfilGuru = () => {
  const user = auth.currentUser;
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Profil Pengajar</h1>
        <p className="text-slate-500 dark:text-slate-400">Informasi akun Anda di VectaLearning.</p>
      </div>

      <div className="max-w-2xl rounded-2xl bg-white p-8 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center gap-6 mb-8 border-b border-slate-100 pb-8 dark:border-slate-700">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-4xl font-black text-white uppercase shadow-lg">
            {user?.email?.charAt(0) || 'G'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white capitalize">
              {user?.displayName || user?.email?.split('@')[0] || "Pengajar Vecta"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">Akun Pengajar Utama</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-500">Email Akun</label>
            <p className="text-lg font-medium text-slate-800 dark:text-white">{user?.email}</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-500">ID Pengguna (UID Firebase)</label>
            <p className="font-mono text-sm text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 dark:bg-slate-900/50 dark:border-slate-700">
              {user?.uid}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
