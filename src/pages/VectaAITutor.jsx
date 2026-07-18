import React, { useState, useRef, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

export default function VectaAITutor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const [systemData, setSystemData] = useState({
    nama: 'Pengguna',
    role: 'Siswa',
    kelas: 'Memuat kelas...',
    nilaiTerakhir: 'Belum ada evaluasi',
    konteksMateri: 'Memuat pustaka materi...'
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const isGuru = window.location.pathname.includes('/guru');
        const userRole = isGuru ? 'Guru' : 'Siswa';
        const username = user.displayName || user.email.split('@')[0];

        setSystemData(prev => ({ ...prev, nama: username, role: userRole }));

        if (isGuru) {
          const qKelas = query(collection(db, 'kelas'), orderBy('createdAt', 'desc'));
          onSnapshot(qKelas, (snapshot) => {
            const listKelas = snapshot.docs.map(doc => doc.data().nama).join(', ');
            setSystemData(prev => ({
              ...prev,
              kelas: listKelas || 'Belum membuat kelas',
              nilaiTerakhir: 'Guru (Akses Penilaian Siswa Aktif)',
              konteksMateri: 'Anda adalah Guru. AI siap membantu Anda membuat silabus atau soal.'
            }));
          });
        } else {
          // MATA 1: Tahu kelas siswa
          const qKelasSiswa = query(collection(db, 'kelas'), where('siswa', 'array-contains', user.uid));
          onSnapshot(qKelasSiswa, (snapshot) => {
            if (!snapshot.empty) {
              const listKelas = snapshot.docs.map(doc => doc.data().nama).join(', ');
              const listKelasId = snapshot.docs.map(doc => doc.id); 
              
              setSystemData(prev => ({ ...prev, kelas: listKelas || 'Belum masuk kelas' }));

              // MATA 2: Tahu materi guru
              if (listKelasId.length > 0) {
                const qMateri = query(collection(db, 'materi'), where('kelasId', 'in', listKelasId.slice(0, 10)));
                onSnapshot(qMateri, (materiSnap) => {
                  const rangkumanMateri = materiSnap.docs.map(doc => {
                    const m = doc.data();
                    return `- [${m.tipe}] Judul: "${m.judul}". Info: ${m.deskripsi || 'Materi inti'}`;
                  }).join('\n');
                  
                  setSystemData(prev => ({ 
                    ...prev, 
                    konteksMateri: rangkumanMateri || 'Belum ada materi spesifik dari guru.' 
                  }));
                });
              }
            } else {
              setSystemData(prev => ({ ...prev, kelas: 'Belum masuk kelas', konteksMateri: 'Tidak ada referensi materi.' }));
            }
          });

          // Mengambil nilai terakhir siswa
          const qNilai = query(collection(db, 'jawaban_siswa'), where('siswaId', '==', user.uid));
          onSnapshot(qNilai, (snapshot) => {
            if (!snapshot.empty) {
              const dataUrut = snapshot.docs.sort((a, b) => {
                const waktuA = a.data().createdAt?.toMillis() || 0;
                const waktuB = b.data().createdAt?.toMillis() || 0;
                return waktuB - waktuA;
              });
              
              const dataTerakhir = dataUrut[0].data();
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
  // PERUBAHAN UTAMA: PROMPT SOKRATIK KETAT
  // ==========================================
  const bangunSystemPrompt = () => {
    return `Anda adalah Vecta AI, asisten virtual dan tutor cerdas yang terintegrasi di dalam platform VectaLearning. 

# 1. IDENTITAS & ATURAN MUTLAK (SANGAT PENTING!)
* Nama: Vecta AI
* Peran: Tutor Sokratik (Socratic Tutor) yang membimbing pemikiran kritis siswa.
* ATURAN NO. 1: Anda DILARANG KERAS memberikan jawaban akhir, hasil perhitungan, atau definisi instan atas pertanyaan siswa dalam kondisi apa pun.
* Tugas Anda BUKAN menjawab soal, melainkan MEMBIMBING siswa menemukan jawabannya sendiri secara mandiri.
* Gunakan pertanyaan pemantik, petunjuk bertahap (scaffolding), atau analogi sederhana untuk merangsang logika siswa.
* CONTOH SIKAP WAJIB DIIKUTI:
  - Jika siswa bertanya: "1 tambah 1 berapa?"
  - DILARANG menjawab: "Jawabannya 2." atau "1 + 1 = 2."
  - WAJIB menjawab seperti: "Coba bayangkan kamu punya satu buah apel, lalu temanmu memberikan satu apel lagi kepadamu. Kira-kira, sekarang ada berapa total apel di tanganmu?"

# 2. DATA PENGGUNA SAAT INI
- Nama Pengguna: ${systemData.nama}
- Peran: ${systemData.role}
- Daftar Kelas Aktif: ${systemData.kelas}
- Catatan Progres Terakhir: ${systemData.nilaiTerakhir}

# 3. PUSTAKA MATERI KELAS & PENGETAHUAN UMUM
Berikut adalah materi dari guru di kelas siswa ini:
${systemData.konteksMateri}

*ATURAN PENGGUNAAN MATERI:*
- Jika pertanyaan terkait materi di atas, arahkan siswa untuk mengingat kembali konsep yang ada di materi tersebut dengan memberikan petunjuk.
- Jika materi kosong ATAU siswa menanyakan hal umum di luar materi (seperti matematika dasar, sains dasar, dll), Anda TETAP WAJIB menggunakan metode Sokratik. Jangan pernah menyuapkan jawaban langsung meskipun itu pertanyaan yang sangat mudah.

# 4. GAYA BAHASA & BATASAN
- Bersikaplah sangat sopan, hangat, sabar, dan suportif layaknya guru idaman. 
- Berikan pujian jika siswa mencoba menjawab atau berani mengemukakan pendapatnya.
- Gunakan Bahasa Indonesia yang santai namun mendidik.
- Tolak secara halus pertanyaan yang tidak pantas, tidak edukatif, atau berbahaya, lalu arahkan fokus siswa kembali ke pembelajaran.`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newUserMsg = { role: 'user', content: input };
    const updatedMessages = [...messages, newUserMsg];
    
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
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

      if (!response.ok) {
        throw new Error(`Koneksi ditolak (Status: ${response.status}). Pastikan VITE_GROQ_API_KEY valid dan server sudah di-restart.`);
      }

      const data = await response.json();
      const aiResponseText = data.choices[0].message.content;

      setMessages((prev) => [...prev, { role: 'ai', content: aiResponseText }]);
      
    } catch (error) {
      console.error("Groq API Error:", error);
      setMessages((prev) => [...prev, { 
        role: 'ai', 
        content: `Maaf, terjadi gangguan teknis. Info Error: ${error.message}` 
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
              Saya siap mendampingi Anda belajar di kelas <span className="text-blue-400 font-semibold">{systemData.kelas}</span>. Mari kita berdiskusi dan temukan jawaban bersama-sama. Ada yang ingin ditanyakan?
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
              <span className="italic text-sm ml-2">Vecta AI sedang menganalisis...</span>
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
            placeholder={`Tanya seputar materi kelas atau ilmu umum di sini...`}
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
