import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { FileEdit, CheckCircle, Clock, Send } from 'lucide-react';

export default function UjianTest() {
  const [kelasDiikuti, setKelasDiikuti] = useState([]);
  const [kelasIdTerpilih, setKelasIdTerpilih] = useState('');
  const [daftarTugas, setDaftarTugas] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk form pengerjaan
  const [tugasDikerjakan, setTugasDikerjakan] = useState(null);
  const [jawaban, setJawaban] = useState('');
  const [prosesKirim, setProsesKirim] = useState(false);

  // 1. Ambil kelas yang diikuti siswa
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const qKelas = query(collection(db, 'kelas'), where('siswa', 'array-contains', user.uid));
        onSnapshot(qKelas, (snapshot) => {
          const dataKelas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setKelasDiikuti(dataKelas);
          if (dataKelas.length > 0 && !kelasIdTerpilih) {
            setKelasIdTerpilih(dataKelas[0].id);
          }
          setLoading(false);
        });
      }
    });
    return () => unsubscribeAuth();
  }, [kelasIdTerpilih]);

  // 2. Ambil tugas berdasarkan kelas yang dipilih
  useEffect(() => {
    if (!kelasIdTerpilih) return;
    
    // PERBAIKAN: Menghapus orderBy dari kueri Firebase untuk menghindari error Composite Index
    const qTugas = query(collection(db, 'tugas'), where('kelasId', '==', kelasIdTerpilih));
    
    const unsubTugas = onSnapshot(qTugas, (snapshot) => {
      const dataTugas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // PERBAIKAN: Mengurutkan data secara manual menggunakan JavaScript (tugas terbaru di atas)
      dataTugas.sort((a, b) => {
        const waktuA = a.createdAt?.toMillis() || 0;
        const waktuB = b.createdAt?.toMillis() || 0;
        return waktuB - waktuA;
      });

      setDaftarTugas(dataTugas);
    });
    
    return () => unsubTugas();
  }, [kelasIdTerpilih]);

  // 3. Kirim Jawaban & Kirim Log Aktivitas
  const handleKirimJawaban = async (e) => {
    e.preventDefault();
    if (!jawaban.trim()) return alert("Jawaban tidak boleh kosong!");
    setProsesKirim(true);

    try {
      const namaUser = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || "Siswa";

      // A. Simpan Jawaban ke Database
      await addDoc(collection(db, 'jawaban_siswa'), {
        tugasId: tugasDikerjakan.id,
        judulTugas: tugasDikerjakan.judul,
        siswaId: auth.currentUser.uid,
        namaSiswa: namaUser,
        jawaban: jawaban,
        nilai: null, // Nilai masih kosong, menunggu guru
        createdAt: serverTimestamp()
      });

      // B. KIRIM LOG AKTIVITAS KE DASHBOARD GURU
      await addDoc(collection(db, 'log_aktivitas'), {
        namaSiswa: namaUser,
        aksi: `Menyelesaikan tugas: ${tugasDikerjakan.judul}`,
        createdAt: serverTimestamp()
      });

      alert("Jawaban berhasil dikirim!");
      setTugasDikerjakan(null); // Tutup form
      setJawaban(''); // Kosongkan form
    } catch (error) {
      console.error(error);
      alert("Gagal mengirim jawaban.");
    } finally {
      setProsesKirim(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Memuat data ujian...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Ujian & Tugas</h1>
          <p className="text-slate-500 dark:text-slate-400">Kerjakan tugas dan evaluasi dari pengajar Anda.</p>
        </div>
        
        {kelasDiikuti.length > 0 && (
          <select 
            value={kelasIdTerpilih} 
            onChange={(e) => setKelasIdTerpilih(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {kelasDiikuti.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kolom Kiri: Daftar Tugas */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Daftar Tugas Tersedia</h3>
          
          {kelasDiikuti.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">Anda belum bergabung ke kelas mana pun.</div>
          ) : daftarTugas.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">Belum ada tugas untuk kelas ini.</div>
          ) : (
            daftarTugas.map((tugas) => (
              <div key={tugas.id} className="flex flex-col sm:flex-row justify-between rounded-2xl bg-white p-5 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                    <FileEdit size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{tugas.judul}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{tugas.tipe}</p>
                    <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600 dark:bg-red-900/20">
                      <Clock size={12} /> Deadline: {tugas.deadline}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setTugasDikerjakan(tugas)}
                  className="mt-4 sm:mt-0 h-fit rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition-colors dark:bg-slate-700 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white"
                >
                  Kerjakan
                </button>
              </div>
            ))
          )}
        </div>

        {/* Kolom Kanan: Area Pengerjaan */}
        <div>
          {tugasDikerjakan ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-blue-100 dark:bg-slate-800 dark:border-blue-900/50 sticky top-6 animate-in slide-in-from-right-8">
              <div className="mb-6 border-b border-slate-100 pb-4 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{tugasDikerjakan.judul}</h3>
                <p className="text-sm text-slate-500">{tugasDikerjakan.tipe}</p>
              </div>
              
              <form onSubmit={handleKirimJawaban} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Lembar Jawaban</label>
                  <textarea 
                    value={jawaban}
                    onChange={(e) => setJawaban(e.target.value)}
                    rows="6"
                    placeholder="Ketik jawaban Anda di sini atau paste link tugas..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                    required
                  ></textarea>
                </div>
                
                <div className="flex gap-3">
                  <button type="button" onClick={() => setTugasDikerjakan(null)} className="rounded-xl px-4 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">Batal</button>
                  <button type="submit" disabled={prosesKirim} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50">
                    {prosesKirim ? "Mengirim..." : <><Send size={18} /> Kirim Jawaban</>}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="hidden lg:flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 text-slate-400 dark:border-slate-700 dark:bg-slate-800/30">
              <CheckCircle size={48} className="mb-4 opacity-20" />
              <p>Pilih tugas di samping untuk mulai mengerjakan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
