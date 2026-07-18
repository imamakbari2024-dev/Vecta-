import React, { useState, useRef, useEffect } from 'react';

// --- IMPORT FIREBASE UNTUK MEMBACA DATA REAL-TIME ---
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

export default function VectaAITutor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // STATE UNTUK MENAMPUNG DATA PLATFORM (DIBACA OLEH 2 MATA AI)
  const [systemData, setSystemData] = useState({
    nama: 'Pengguna',
    role: 'Siswa',
    kelas: 'Memuat kelas...',
    nilaiTerakhir: 'Belum ada evaluasi',
    konteksMateri: 'Memuat pustaka materi...' // <--- INI ADALAH MATA KEDUA (RAG MATERI)
  });

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ==========================================
  // LOGIKA UTAMA: MEMBACA DATA DARI WEB VECTA (HYBRID RAG)
  // ==========================================
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // 1. Deteksi Peran (Role)
        const isGuru = window.location.pathname.includes('/guru');
        const userRole = isGuru ? 'Guru' : 'Siswa';
        const username = user.displayName || user.email.split('@')[0];

        setSystemData(prev => ({ ...prev, nama: username, role: userRole }));

        if (isGuru) {
          // JIKA GURU: Ambil info mata pelajaran yang diampu
          const qKelas = query(collection(db, 'kelas'), orderBy('createdAt', 'desc'));
          onSnapshot(qKelas, (snapshot) => {
            const listKelas = snapshot.docs.map(doc => doc.data().nama).join(', ');
            setSystemData(prev => ({
              ...prev,
              kelas: listKelas || 'Belum membuat kelas',
              nilaiTerakhir: 'Guru (Akses Penilaian Siswa Aktif)',
              konteksMateri: 'Anda adalah Guru. AI siap membantu Anda membuat silabus atau soal berdasarkan pengetahuan akademik umum.'
            }));
          });
        } else {
          // =========================================================
          // MATA 1 (DYNAMIC CONTEXT): Tahu identitas, kelas, dan nilai
          // =========================================================
          const qKelasSiswa = query(collection(db, 'kelas'), where('siswa', 'array-contains', user.uid));
          onSnapshot(qKelasSiswa, (snapshot) => {
            if (!snapshot.empty) {
              const listKelas = snapshot.docs.map(doc => doc.data().nama).join(', ');
              const listKelasId = snapshot.docs.map(doc => doc.id); // Ambil ID untuk Mata ke-2
              
              setSystemData(prev => ({ ...prev, kelas: listKelas || 'Belum masuk kelas' }));

              // =========================================================
              // MATA 2 (LIGHTWEIGHT RAG): Membaca pustaka materi dari Guru
              // =========================================================
              // AI mencari materi apa saja yang ada di kelas yang diikuti siswa ini
              if (listKelasId.length > 0) {
                // Ambil maksimal 10 kelas (limitasi firebase 'in')
                const qMateri = query(collection(db, 'materi'), where('kelasId', 'in', listKelasId.slice(0, 10)));
                onSnapshot(qMateri, (materiSnap) => {
                  const rangkumanMateri = materiSnap.docs.map(doc => {
                    const m = doc.data();
                    return `- [${m.tipe}] Judul: "${m.judul}". Info/Deskripsi: ${m.deskripsi || 'Materi inti kelas'}`;
                  }).join('\n');
                  
                  setSystemData(prev => ({ 
                    ...prev, 
                    konteksMateri: rangkumanMateri || 'Guru belum mengunggah materi spesifik untuk kelas ini.' 
                  }));
                });
              }
            } else {
              setSystemData(prev => ({ ...prev, kelas: 'Belum masuk kelas', konteksMateri: 'Tidak ada referensi materi.' }));
            }
          });

          // Ambil analisis nilai kuis terakhir siswa dari Firestore (Lanjutan Mata 1)
          const qNilai = query(
            collection(db, 'jawaban_siswa'),
            where('siswaId', '==', user.uid),
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
  // STRUKTUR KONTEKS AI (SYSTEM PROMPT HYBRID)
  // ==========================================
  const bangunSystemPrompt = () => {
    return `Anda adalah Vecta AI, asisten virtual dan tutor cerdas yang terintegrasi langsung di dalam platform VectaLearning. Ikuti instruksi, identitas, dan aturan di bawah ini secara ketat:

# 1. IDENTITAS & PERAN
* Nama: Vecta AI
* Peran: Asisten Pembelajaran Cerdas dan Tutor Pribadi berbasis Spatial Computing.
* Tujuan: Membimbing pengguna belajar melalui proses berpikir yang terarah (Socratic Tutor). Jangan langsung memberi kunci jawaban/jawaban instan. Berikan petunjuk kecil, pancingan logika, atau analogi.

# 2. [MATA PERTAMA] DATA PROFIL & STATUS PENGGUNA SAAT INI
Gunakan informasi ini untuk mempersonalisasi percakapan (tanpa menyebut "Menurut database"):
- Nama Pengguna: ${systemData.nama}
- Peran: ${systemData.role}
- Daftar Kelas Aktif: ${systemData.kelas}
- Catatan Progres Terakhir: ${systemData.nilaiTerakhir}

# 3. [MATA KEDUA] PUSTAKA MATERI KELAS (LIGHTWEIGHT RAG)
Untuk memastikan bimbingan Anda sinkron dengan apa yang diajarkan oleh Guru, berikut adalah daftar referensi materi, dokumen, dan objek 3D yang sudah diunggah di kelas siswa ini:
--- MULAI DAFTAR MATERI ---
${systemData.konteksMateri}
--- AKHIR DAFTAR MATERI ---

*ATURAN PENGGUNAAN MATA KEDUA:*
- Jika siswa bertanya materi pelajaran, prioritaskan untuk mengaitkan/menyebutkan materi dari daftar di atas. (Contoh: "Mengingat kamu sedang mempelajari Model 3D Anatomi Jantung, tahukah kamu bagian mana yang memompa darah ke seluruh tubuh?")
- Jika daftar materi kosong atau topik yang ditanyakan siswa tidak ada di daftar, gunakan pengetahuan akademik umum Anda yang sangat luas.

# 4. BATASAN
Tolak dengan sopan jika pengguna bertanya tentang hal di luar akademik (seperti gosip, hiburan, tebak-tebakan tidak mendidik, dll). Berbicaralah dengan ramah, profesional, dan gunakan Bahasa Indonesia yang baik.`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newUserMsg = { role: 'user', content: input };
    const updatedMessages = [...messages, newUserMsg];
    
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Panggil fungsi pembentuk prompt yang sudah memuat data "2 Mata"
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
      <div className="border-b border-slate-700 p-4 flex justify-between items-start sm:items-center flex-col sm:flex-row gap-2">
        <div>
          <h2 className="text-xl font-bold text-white">Vecta AI Tutor</h2>
          <p className="text-sm text-slate-400">Arsitektur AI Orchestration (Hybrid RAG)</p>
        </div>
        {/* Indikator Status "2 Mata" */}
        <div className="text-right flex flex-col gap-1 items-end">
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
            👁️ Mata 1: Dynamic Context Aktif
          </span>
          <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 font-medium">
            📚 Mata 2: RAG Material Sinkron
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-slate-500 space-y-2">
            <div className="h-16 w-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
              <span className="text-3xl">🤖</span>
            </div>
            <p className="text-center font-bold text-slate-300 text-lg">Halo {systemData.nama}, saya Vecta AI.</p>
            <p className="text-center text-sm max-w-md leading-relaxed">
              Saya siap mendampingi Anda belajar di kelas <span className="text-blue-400 font-semibold">{systemData.kelas}</span>. Saya juga sudah membaca referensi materi dari guru Anda. Ada yang ingin ditanyakan?
            </p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm ${
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
            <div className="max-w-[75%] rounded-2xl rounded-bl-sm border border-slate-600 bg-slate-700 p-4 text-slate-400 flex items-center gap-3">
              <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
              <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
              <span className="italic text-sm ml-2">Vecta AI sedang menganalisis materi...</span>
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
            className="flex-1 rounded-xl border border-slate-600 bg-slate-900 p-3.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all text-sm"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="rounded-xl bg-blue-600 px-6 sm:px-8 font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600"
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
}
