import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { FileEdit, CheckCircle, Clock, Send, Download, Check } from 'lucide-react';

export default function UjianTest() {
  const [kelasDiikuti, setKelasDiikuti] = useState([]);
  const [kelasIdTerpilih, setKelasIdTerpilih] = useState('');
  const [daftarTugas, setDaftarTugas] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk form pengerjaan
  const [tugasDikerjakan, setTugasDikerjakan] = useState(null);
  const [prosesKirim, setProsesKirim] = useState(false);
  
  // State Jawaban (Tergantung Tipe)
  const [jawabanEssay, setJawabanEssay] = useState('');
  const [jawabanPilgan, setJawabanPilgan] = useState({}); // Format: { 0: 'A', 1: 'C' }

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
    
    const qTugas = query(collection(db, 'tugas'), where('kelasId', '==', kelasIdTerpilih));
    const unsubTugas = onSnapshot(qTugas, (snapshot) => {
      const dataTugas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      dataTugas.sort((a, b) => {
        const waktuA = a.createdAt?.toMillis() || 0;
        const waktuB = b.createdAt?.toMillis() || 0;
        return waktuB - waktuA;
      });
      setDaftarTugas(dataTugas);
    });
    
    return () => unsubTugas();
  }, [kelasIdTerpilih]);

  // 3. Handle Pilihan Ganda (Menyimpan opsi yang diklik)
  const handlePilihGanda = (indexSoal, opsiDipilih) => {
    setJawabanPilgan(prev => ({
      ...prev,
      [indexSoal]: opsiDipilih
    }));
  };

  // 4. Kirim Jawaban & Kirim Log Aktivitas
  const handleKirimJawaban = async (e) => {
    e.preventDefault();
    setProsesKirim(true);

    let finalJawabanTeks = '';
    let finalNilai = null; // Default null untuk Essay (menunggu dinilai guru)

    // VALIDASI & FORMAT JAWABAN BERDASARKAN TIPE
    if (tugasDikerjakan.tipe === 'Essay') {
      if (!jawabanEssay.trim()) {
        setProsesKirim(false);
        return alert("Jawaban essay tidak boleh kosong!");
      }
      finalJawabanTeks = jawabanEssay;
    } 
    else if (tugasDikerjakan.tipe === 'Pilihan Ganda') {
      const totalSoal = tugasDikerjakan.daftarSoal.length;
      if (Object.keys(jawabanPilgan).length < totalSoal) {
        setProsesKirim(false);
        return alert("Harap jawab semua pertanyaan pilihan ganda sebelum mengirim!");
      }

      // Hitung Nilai Otomatis (Auto-Grading)
      let jumlahBenar = 0;
      let rekapanJawaban = [];

      tugasDikerjakan.daftarSoal.forEach((soal, index) => {
        const opsiSiswa = jawabanPilgan[index];
        if (opsiSiswa === soal.kunci) {
          jumlahBenar++;
        }
        rekapanJawaban.push(`No ${index + 1}: ${opsiSiswa}`);
      });

      finalNilai = Math.round((jumlahBenar / totalSoal) * 100);
      finalJawabanTeks = `[PG] ${rekapanJawaban.join(', ')}`; 
    }

    try {
      const namaUser = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || "Siswa";

      // A. Simpan Jawaban ke Database
      await addDoc(collection(db, 'jawaban_siswa'), {
        tugasId: tugasDikerjakan.id,
        judulTugas: tugasDikerjakan.judul,
        siswaId: auth.currentUser.uid,
        namaSiswa: namaUser,
        jawaban: finalJawabanTeks,
        nilai: finalNilai, 
        createdAt: serverTimestamp()
      });

      // B. KIRIM LOG AKTIVITAS
      await addDoc(collection(db, 'log_aktivitas'), {
        namaSiswa: namaUser,
        aksi: `Menyelesaikan evaluasi: ${tugasDikerjakan.judul}`,
        createdAt: serverTimestamp()
      });

      alert(tugasDikerjakan.tipe === 'Pilihan Ganda' 
        ? `Selesai! Nilai Anda: ${finalNilai}` 
        : "Jawaban berhasil dikirim dan menunggu penilaian guru!"
      );

      // Reset state form
      setTugasDikerjakan(null); 
      setJawabanEssay(''); 
      setJawabanPilgan({});
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

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Kolom Kiri: Daftar Tugas */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Daftar Tugas Tersedia</h3>
          
          {kelasDiikuti.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">Anda belum bergabung ke kelas mana pun.</div>
          ) : daftarTugas.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">Belum ada tugas untuk kelas ini.</div>
          ) : (
            daftarTugas.map((tugas) => (
              <div key={tugas.id} className={`flex flex-col sm:flex-row justify-between rounded-2xl p-5 shadow-sm border transition-all ${tugasDikerjakan?.id === tugas.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 bg-white dark:bg-slate-800 dark:border-slate-700'}`}>
                <div className="flex gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tugas.tipe === 'Essay' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/40'}`}>
                    <FileEdit size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{tugas.judul}</h4>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{tugas.tipe}</p>
                    <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600 dark:bg-red-900/20">
                      <Clock size={12} /> Deadline: {tugas.deadline}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setTugasDikerjakan(tugas);
                    setJawabanEssay('');
                    setJawabanPilgan({});
                  }}
                  className="mt-4 sm:mt-0 h-fit rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
                >
                  Kerjakan
                </button>
              </div>
            ))
          )}
        </div>

        {/* Kolom Kanan: Area Pengerjaan */}
        <div className="lg:col-span-7">
          {tugasDikerjakan ? (
            <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-blue-100 dark:bg-slate-800 dark:border-blue-900/50 sticky top-6 animate-in slide-in-from-right-8">
              <div className="mb-6 border-b border-slate-100 pb-4 dark:border-slate-700 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{tugasDikerjakan.judul}</h3>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">{tugasDikerjakan.tipe}</p>
                </div>
              </div>
              
              <form onSubmit={handleKirimJawaban} className="space-y-6">
                
                {/* --- RENDER JIKA TIPE ESSAY --- */}
                {tugasDikerjakan.tipe === 'Essay' && (
                  <div className="space-y-4 animate-in fade-in">
                    {tugasDikerjakan.fileSoal && (
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">Guru telah melampirkan dokumen soal untuk tugas ini.</p>
                        <a href={tugasDikerjakan.fileSoal} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
                          <Download size={16} /> Buka / Unduh Dokumen Soal
                        </a>
                      </div>
                    )}
                    
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Lembar Jawaban Anda</label>
                      <textarea 
                        value={jawabanEssay}
                        onChange={(e) => setJawabanEssay(e.target.value)}
                        rows="8"
                        placeholder="Ketik jawaban lengkap Anda di sini..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                      ></textarea>
                    </div>
                  </div>
                )}

                {/* --- RENDER JIKA TIPE PILIHAN GANDA --- */}
                {tugasDikerjakan.tipe === 'Pilihan Ganda' && (
                  <div className="space-y-8 animate-in fade-in custom-scrollbar max-h-[60vh] overflow-y-auto pr-2">
                    {tugasDikerjakan.daftarSoal?.map((soal, index) => (
                      <div key={index} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-800/50 dark:border-slate-700">
                        <p className="font-semibold text-slate-800 dark:text-white mb-4 text-sm md:text-base">
                          {index + 1}. {soal.pertanyaan}
                        </p>
                        <div className="space-y-3">
                          {['A', 'B', 'C', 'D'].map((opsi) => {
                            const isSelected = jawabanPilgan[index] === opsi;
                            const textOpsi = opsi === 'A' ? soal.a : opsi === 'B' ? soal.b : opsi === 'C' ? soal.c : soal.d;
                            
                            return (
                              <label key={opsi} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${isSelected ? 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/30' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50'}`}>
                                <input 
                                  type="radio" 
                                  name={`soal-${index}`} 
                                  value={opsi} 
                                  checked={isSelected}
                                  onChange={() => handlePilihGanda(index, opsi)}
                                  className="hidden" 
                                />
                                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                                  {isSelected && <Check size={14} />}
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                  <span className="font-bold mr-1">{opsi}.</span> {textOpsi}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button type="button" onClick={() => setTugasDikerjakan(null)} className="rounded-xl px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Batal</button>
                  <button type="submit" disabled={prosesKirim} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50">
                    {prosesKirim ? "Memproses..." : <><Send size={18} /> Kirim Pekerjaan</>}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="hidden lg:flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 text-slate-400 dark:border-slate-700 dark:bg-slate-800/30">
              <CheckCircle size={64} className="mb-4 opacity-20" />
              <p className="text-lg">Pilih tugas di samping untuk mulai mengerjakan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
