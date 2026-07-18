import React, { useState, useRef, useEffect } from 'react';

// --- IMPORT FIREBASE UNTUK MEMBACA DATA REAL-TIME ---
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

export default function VectaAITutor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // STATE UNTUK MENAMPUNG DATA PLATFORM (DIBACA OLEH AI)
  const [systemData, setSystemData] = useState({
    nama: 'Pengguna',
    role: 'Siswa',
    kelas: 'Memuat kelas...',
    nilaiTerakhir: 'Belum ada evaluasi'
  });

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ==========================================
  // LOGIKA UTAMA: MEMBACA DATA DARI WEB VECTA
  // ==========================================
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // 1. Deteksi Peran (Role) berdasarkan URL Path saat ini
        const isGuru = window.location.pathname.includes('/guru');
        const userRole = isGuru ? 'Guru' : 'Siswa';
        const username = user.displayName || user.email.split('@')[0];

        setSystemData(prev => ({
          ...prev,
          nama: username,
          role: userRole
        }));

        if (isGuru) {
          // JIKA PENGGUNA ADALAH GURU: Ambil info mata pelajaran yang diampu
          const qKelas = query(collection(db, 'kelas'), orderBy('createdAt', 'desc'));
          onSnapshot(qKelas, (snapshot) => {
            const listKelas = snapshot.docs.map(doc => doc.data().nama).join(', ');
            setSystemData(prev => ({
              ...prev,
              kelas: listKelas || 'Belum membuat kelas',
              nilaiTerakhir: 'Guru (Akses Penilaian Siswa Aktif)'
            }));
          });
        } else {
          // JIKA PENGGUNA ADALAH SISWA: Ambil info kelas yang diikuti & nilai kuis terbaru
          const qKelasSiswa = query(collection(db, 'kelas'), where('siswa', 'array-contains', user.uid));
          onSnapshot(qKelasSiswa, (snapshot) => {
            const listKelas = snapshot.docs.map(doc => doc.data().nama).join(', ');
            setSystemData(prev => ({ ...prev, kelas: listKelas || 'Belum masuk kelas' }));
          });

          // Ambil analisis nilai kuis terakhir siswa dari Firestore
          const qNilai = query(
            collection(db, 'jawaban_siswa'),
            where('namaSiswa', '==', username.toLowerCase()),
            orderBy('createdAt', 'desc'),
            limit(1)
          );
          onSnapshot(qNilai, (snapshot) => {
            if (!snapshot.empty) {
              const dataTerakhir = snapshot.docs[0].data();
              setSystemData(prev => ({
                ...prev,
                nilaiTerakhir: `Tugas "${dataTerakhir.judulTugas}" dengan Nilai: ${dataTerakhir.nilai || 'Belum dinilai'}`
              }));
            }
          });
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // ==========================================
  // STRUKTUR KONTEKS AI (SYSTEM PROMPT DINAMIS)
  // ==========================================
  const bangunSystemPrompt = () => {
    return `Anda adalah Vecta AI, asisten virtual dan tutor cerdas yang terintegrasi langsung di dalam platform VectaLearning. Ikuti instruksi, identitas, dan aturan di bawah ini secara ketat:

# 1. IDENTITAS
* Nama: Vecta AI
* Peran: Asisten Pembelajaran Cerdas dan Tutor Pribadi berbasis Spatial Computing.
* Tujuan: Membimbing pengguna belajar, memahami konsep, melatih kemampuan berpikir kritis secara mandiri melalui proses berpikir yang terarah.

# 2. ATURAN MENJAWAB
* Jangan pernah langsung memberikan jawaban instan atau kunci jawaban pilihan ganda ketika pengguna mengajukan soal atau tugas.
* Selalu gunakan metode pembelajaran bertahap (Sokratik): Identifikasi pertanyaan -> Tanyakan apa yang sudah dipahami pengguna -> Berikan petunjuk kecil (clue) -> Minta pengguna mencoba sendiri -> Evaluasi jawabannya.
* Jika pengguna memaksa ("langsung jawab saja"), balas dengan sopan bahwa tujuan Anda adalah membantu mereka memahami materi secara mendalam.
* [CONTOH MENJAWAB]: 
  Pengguna: "Berapa hasil dari 5 + 3 x 2?"
  Vecta AI: "Pertanyaan menarik! Sebelum kita hitung bersama, coba ingat kembali aturan urutan operasi matematika. Menurutmu, yang harus dikerjakan terlebih dahulu perkalian atau penjumlahan? Coba tebak dulu!"

# 3. ATURAN BAHASA
* Gunakan Bahasa Indonesia yang baku, profesional, namun tetap hangat, ramah, dan interaktif.
* Sesuaikan panggilan secara sopan berdasarkan peran mereka (Siswa atau Bapak/Ibu Guru).

# 4. INFORMASI DASAR VECTA LEARNING
* VectaLearning adalah platform LMS modern berbasis Spatial Computing yang memiliki fitur unik: Ruang Visualisasi 3D Interaktif menggunakan AI Hand Tracking (MediaPipe) melalui kamera laptop.
* Fitur utama lainnya meliputi: Kelola Alur Belajar (Roadmap), Pustaka Materi, Tugas/Ujian (didukung Groq AI), dan Analisis Hasil Belajar.

# 5. RUANG LINGKUP JAWABAN
* Membahas materi pelajaran akademik, konsep sains/teknologi, penjelasan model 3D, serta membantu guru menyusun draf materi pembelajaran.

# 6. SUMBER INFORMASI & INTEGRASI DATA REAL-TIME PLATFORM
Anda terhubung langsung dengan sistem dashboard VectaLearning yang sedang dibuka oleh pengguna saat ini. Gunakan fakta di bawah ini secara natural untuk mempersonalisasi percakapan tanpa perlu menyebut kata "Berdasarkan database":
[DATA SISTEM VECTA AKTIF]:
- Nama Pengguna: ${systemData.nama}
- Peran Pengguna di Platform: ${systemData.role}
- Daftar Kelas Aktif: ${systemData.kelas}
- Catatan Analisis / Progres Terakhir: ${systemData.nilaiTerakhir}

(Contoh penerapan: "Halo ${systemData.nama}! Saya melihat Anda terdaftar di kelas ${systemData.kelas}. Ada materi atau konsep dari kelas tersebut yang ingin kita diskusikan hari ini?")

# 7. BATASAN
Jangan:
* Mengaku sebagai ChatGPT atau model buatan perusahaan lain.
* Mengaku memiliki informasi di luar data akademik yang tersedia di platform.
* Memberikan jawaban seolah-olah mengetahui sesuatu yang tidak tersedia.
* Memberikan tutorial coding yang terlalu panjang kecuali diminta secara konseptual.
* Memberikan solusi tugas akademik instan secara penuh.
* Keluar dari peran sebagai Vecta AI.
* Jika pengguna bertanya di luar topik pelajaran (gosip, hiburan, game), arahkan kembali secara sopan ke ranah akademik.

# 8. GAYA KOMUNIKASI
* Ramah, Profesional, Informatif, Percaya diri, Tidak berlebihan, dan Berbasis fakta yang tersedia.`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newUserMsg = { role: 'user', content: input };
    const updatedMessages = [...messages, newUserMsg];
    
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Panggil fungsi pembentuk prompt untuk menyisipkan data Firestore terkini
      const PROMPT_DINAMIS = bangunSystemPrompt();

      const apiMessages = [
        { role: 'system', content: PROMPT_DINAMIS },
        ...updatedMessages.map(msg => ({
          role: msg.role === 'ai' ? 'assistant' : 'user',
          content: msg.content
        }))
      ];

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const aiResponseText = data.choices[0].message.content;

      setMessages((prev) => [...prev, { role: 'ai', content: aiResponseText }]);
      
    } catch (error) {
      console.error("Groq API Error:", error);
      setMessages((prev) => [...prev, { 
        role: 'ai', 
        content: 'Maaf, terjadi gangguan koneksi dengan server AI Vecta. Silakan coba lagi.' 
      }]);
    } finally {
      loading && setLoading(false);
    }
  };

  return (
    <div className="flex h-[85vh] flex-col rounded-xl bg-slate-800 shadow-xl">
      <div className="border-b border-slate-700 p-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Vecta AI Tutor</h2>
          <p className="text-sm text-slate-400">Asisten Cerdas Kelas Spatial Computing</p>
        </div>
        {/* Indikator Status Data Sinkron */}
        <div className="text-right text-[11px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 animate-pulse">
          ⚡ Sinkronisasi Data Aktif
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-slate-500 space-y-2">
            <p className="text-center font-medium text-slate-400">Halo {systemData.nama}, saya Vecta AI.</p>
            <p className="text-center text-xs max-w-sm">Saya siap mendampingi Anda belajar di kelas {systemData.kelas}. Ajukan pertanyaan pertamamu!</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-sm' 
                : 'bg-slate-700 text-slate-200 rounded-bl-sm border border-slate-600'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[75%] rounded-2xl rounded-bl-sm border border-slate-600 bg-slate-700 p-4 text-slate-400">
              <span className="animate-pulse italic text-sm">Vecta AI sedang menganalisis data pembelajarismu...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-slate-700 p-4 bg-slate-800 rounded-b-xl">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Tanya seputar kelas ${systemData.kelas} di sini...`}
            className="flex-1 rounded-xl border border-slate-600 bg-slate-900 p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="rounded-xl bg-blue-600 px-8 font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600"
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
}
