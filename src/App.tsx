import { useState, useEffect, useCallback, useRef } from 'react';

// Types
interface SubtitleEntry {
  id: number;
  original: string;
  translated: string;
  timestamp: Date;
}

type AppMode = 'home' | 'streaming' | 'manual' | 'guide';

type LanguageCode =
  | 'en' | 'fr' | 'de' | 'pt' | 'it' | 'ja' | 'ko' | 'zh' | 'ru' | 'ar'
  | 'nl' | 'pl' | 'tr' | 'sv' | 'da' | 'no' | 'fi' | 'el' | 'cs' | 'hu'
  | 'ro' | 'bg' | 'hr' | 'sk' | 'sl' | 'uk' | 'sr' | 'lt' | 'lv' | 'et'
  | 'hi' | 'bn' | 'ta' | 'te' | 'th' | 'vi' | 'id' | 'ms' | 'he' | 'fa'
  | 'sw' | 'ca' | 'gl' | 'eu' | 'af';

interface LanguageInfo {
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string;
  popular?: boolean;
}

const LANGUAGES: Record<LanguageCode, LanguageInfo> = {
  it: { name: 'Italiano', nativeName: 'Italiano', flag: '🇮🇹', speechCode: 'it-IT', popular: true },
  de: { name: 'Alemán', nativeName: 'Deutsch', flag: '🇩🇪', speechCode: 'de-DE', popular: true },
  ja: { name: 'Japonés', nativeName: '日本語', flag: '🇯🇵', speechCode: 'ja-JP', popular: true },
  en: { name: 'Inglés', nativeName: 'English', flag: '🇬🇧', speechCode: 'en-US', popular: true },
  fr: { name: 'Francés', nativeName: 'Français', flag: '🇫🇷', speechCode: 'fr-FR', popular: true },
  pt: { name: 'Portugués', nativeName: 'Português', flag: '🇵🇹', speechCode: 'pt-PT', popular: true },
  ko: { name: 'Coreano', nativeName: '한국어', flag: '🇰🇷', speechCode: 'ko-KR', popular: true },
  zh: { name: 'Chino', nativeName: '中文', flag: '🇨🇳', speechCode: 'zh-CN', popular: true },
  ru: { name: 'Ruso', nativeName: 'Русский', flag: '🇷🇺', speechCode: 'ru-RU', popular: true },
  ar: { name: 'Árabe', nativeName: 'العربية', flag: '🇸🇦', speechCode: 'ar-SA', popular: true },
  nl: { name: 'Holandés', nativeName: 'Nederlands', flag: '🇳🇱', speechCode: 'nl-NL' },
  pl: { name: 'Polaco', nativeName: 'Polski', flag: '🇵🇱', speechCode: 'pl-PL' },
  tr: { name: 'Turco', nativeName: 'Türkçe', flag: '🇹🇷', speechCode: 'tr-TR' },
  sv: { name: 'Sueco', nativeName: 'Svenska', flag: '🇸🇪', speechCode: 'sv-SE' },
  da: { name: 'Danés', nativeName: 'Dansk', flag: '🇩🇰', speechCode: 'da-DK' },
  no: { name: 'Noruego', nativeName: 'Norsk', flag: '🇳🇴', speechCode: 'nb-NO' },
  fi: { name: 'Finlandés', nativeName: 'Suomi', flag: '🇫🇮', speechCode: 'fi-FI' },
  el: { name: 'Griego', nativeName: 'Ελληνικά', flag: '🇬🇷', speechCode: 'el-GR' },
  cs: { name: 'Checo', nativeName: 'Čeština', flag: '🇨🇿', speechCode: 'cs-CZ' },
  hu: { name: 'Húngaro', nativeName: 'Magyar', flag: '🇭🇺', speechCode: 'hu-HU' },
  ro: { name: 'Rumano', nativeName: 'Română', flag: '🇷🇴', speechCode: 'ro-RO' },
  bg: { name: 'Búlgaro', nativeName: 'Български', flag: '🇧🇬', speechCode: 'bg-BG' },
  hr: { name: 'Croata', nativeName: 'Hrvatski', flag: '🇭🇷', speechCode: 'hr-HR' },
  sk: { name: 'Eslovaco', nativeName: 'Slovenčina', flag: '🇸🇰', speechCode: 'sk-SK' },
  sl: { name: 'Esloveno', nativeName: 'Slovenščina', flag: '🇸🇮', speechCode: 'sl-SI' },
  uk: { name: 'Ucraniano', nativeName: 'Українська', flag: '🇺🇦', speechCode: 'uk-UA' },
  sr: { name: 'Serbio', nativeName: 'Српски', flag: '🇷🇸', speechCode: 'sr-RS' },
  lt: { name: 'Lituano', nativeName: 'Lietuvių', flag: '🇱🇹', speechCode: 'lt-LT' },
  lv: { name: 'Letón', nativeName: 'Latviešu', flag: '🇱🇻', speechCode: 'lv-LV' },
  et: { name: 'Estonio', nativeName: 'Eesti', flag: '🇪🇪', speechCode: 'et-EE' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', speechCode: 'hi-IN' },
  bn: { name: 'Bengalí', nativeName: 'বাংলা', flag: '🇧🇩', speechCode: 'bn-BD' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', speechCode: 'ta-IN' },
  te: { name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', speechCode: 'te-IN' },
  th: { name: 'Tailandés', nativeName: 'ไทย', flag: '🇹🇭', speechCode: 'th-TH' },
  vi: { name: 'Vietnamita', nativeName: 'Tiếng Việt', flag: '🇻🇳', speechCode: 'vi-VN' },
  id: { name: 'Indonesio', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', speechCode: 'id-ID' },
  ms: { name: 'Malayo', nativeName: 'Bahasa Melayu', flag: '🇲🇾', speechCode: 'ms-MY' },
  he: { name: 'Hebreo', nativeName: 'עברית', flag: '🇮🇱', speechCode: 'he-IL' },
  fa: { name: 'Persa', nativeName: 'فارسی', flag: '🇮🇷', speechCode: 'fa-IR' },
  sw: { name: 'Suajili', nativeName: 'Kiswahili', flag: '🇰🇪', speechCode: 'sw-KE' },
  af: { name: 'Afrikáans', nativeName: 'Afrikaans', flag: '🇿🇦', speechCode: 'af-ZA' },
  ca: { name: 'Catalán', nativeName: 'Català', flag: '🏴', speechCode: 'ca-ES' },
  gl: { name: 'Gallego', nativeName: 'Galego', flag: '🏴', speechCode: 'gl-ES' },
  eu: { name: 'Euskera', nativeName: 'Euskara', flag: '🏴', speechCode: 'eu-ES' },
};

// Translation API
async function translateText(text: string, sourceLang: string): Promise<string> {
  if (!text.trim()) return '';
  try {
    const langPair = `${sourceLang}|es`;
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`
    );
    const data = await response.json();
    if (data.responseStatus === 200 && data.responseData) {
      return data.responseData.translatedText;
    }
    return '[Error al traducir]';
  } catch {
    return '[Error de conexión]';
  }
}

// Speech Recognition hook
function useSpeechRecognition(sourceLang: LanguageCode) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tu dispositivo no soporta reconocimiento de voz. Usa Chrome o un navegador compatible.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = LANGUAGES[sourceLang].speechCode;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript.trim());
      } else if (interimTranscript) {
        setTranscript(interimTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current) {
        try {
          recognition.start();
        } catch (e) {
          setIsListening(false);
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [sourceLang]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

  return { isListening, transcript, startListening, stopListening, setTranscript };
}

// ============ MAIN APP ============
export default function App() {
  const [mode, setMode] = useState<AppMode>('home');
  const [sourceLang, setSourceLang] = useState<LanguageCode>('en');
  const [subtitles, setSubtitles] = useState<SubtitleEntry[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [fontSize, setFontSize] = useState(28);
  const [showSettings, setShowSettings] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(85);
  const [streamingActive, setStreamingActive] = useState(false);
  const [lastTranslation, setLastTranslation] = useState<{ original: string; translated: string } | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const subtitlesEndRef = useRef<HTMLDivElement>(null);
  const translationTimeoutRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { isListening, transcript, startListening, stopListening, setTranscript } =
    useSpeechRecognition(sourceLang);

  // Audio level monitoring for streaming mode
  const startAudioMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(Math.min(100, (avg / 128) * 100));
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (err) {
      console.error('Audio monitoring error:', err);
    }
  }, []);

  const stopAudioMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Auto-scroll
  useEffect(() => {
    subtitlesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [subtitles]);

  // Translation on transcript change
  useEffect(() => {
    if (transcript && isListening) {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
      translationTimeoutRef.current = setTimeout(async () => {
        setIsTranslating(true);
        const translated = await translateText(transcript, sourceLang);

        setSubtitles(prev => {
          const lastEntry = prev[prev.length - 1];
          if (lastEntry && lastEntry.original === transcript) {
            return prev.map((s, i) =>
              i === prev.length - 1 ? { ...s, translated, original: transcript } : s
            );
          }
          return [...prev, {
            id: Date.now(),
            original: transcript,
            translated,
            timestamp: new Date(),
          }];
        });

        setLastTranslation({ original: transcript, translated });
        setIsTranslating(false);
        setTranscript('');
      }, mode === 'streaming' ? 800 : 1500);
    }

    return () => {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
    };
  }, [transcript, sourceLang, isListening, mode]);

  // Streaming mode: auto-start/stop listening
  useEffect(() => {
    if (mode === 'streaming' && streamingActive) {
      startListening();
      startAudioMonitoring();
    } else {
      stopListening();
      stopAudioMonitoring();
    }

    return () => {
      stopListening();
      stopAudioMonitoring();
    };
  }, [mode, streamingActive]);

  const handleManualTranslate = async () => {
    if (!manualInput.trim()) return;
    setIsTranslating(true);
    const translated = await translateText(manualInput, sourceLang);
    setSubtitles(prev => [...prev, {
      id: Date.now(),
      original: manualInput,
      translated,
      timestamp: new Date(),
    }]);
    setLastTranslation({ original: manualInput, translated });
    setManualInput('');
    setIsTranslating(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'streaming') {
        if (e.key === 'Escape' || e.key === 'Backspace') {
          setStreamingActive(false);
          setMode('home');
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
        case 'Backspace':
          if (showSettings || showLangPicker) {
            setShowSettings(false);
            setShowLangPicker(false);
          } else if (mode !== 'home') {
            setMode('home');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, showSettings, showLangPicker, streamingActive]);

  // PWA Install
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setShowInstallPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setShowInstallPrompt(false);
    }
  };

  // Filter languages
  const filteredLanguages = Object.entries(LANGUAGES).filter(([, info]) => {
    const search = langSearch.toLowerCase();
    return info.name.toLowerCase().includes(search) || info.nativeName.toLowerCase().includes(search);
  });
  const popularLanguages = filteredLanguages.filter(([, info]) => info.popular);
  const otherLanguages = filteredLanguages.filter(([, info]) => !info.popular);

  // Register SW
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  // ============ STREAMING OVERLAY MODE ============
  if (mode === 'streaming' && streamingActive) {
    return (
      <div
        className="h-screen w-screen flex flex-col justify-end pointer-events-none"
        style={{ background: `rgba(0, 0, 0, ${overlayOpacity / 100})` }}
      >
        {/* Top status bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 pointer-events-auto" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${streamingActive ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`}></div>
            <span className="text-xs text-white/70 font-medium">
              {streamingActive ? 'TRADUCIENDO' : 'PAUSADO'}
            </span>
            <span className="text-xs text-white/40">|</span>
            <span className="text-xs text-white/70">{LANGUAGES[sourceLang].flag} {LANGUAGES[sourceLang].name} → 🇪🇸</span>
          </div>

          {/* Audio level indicator */}
          {streamingActive && (
            <div className="flex items-center gap-2">
              <i className="fas fa-microphone text-xs text-green-400"></i>
              <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-100"
                  style={{ width: `${audioLevel}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStreamingActive(!streamingActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                streamingActive
                  ? 'bg-red-500/80 text-white hover:bg-red-600'
                  : 'bg-green-500/80 text-white hover:bg-green-600'
              }`}
            >
              {streamingActive ? '⏸ Pausar' : '▶ Iniciar'}
            </button>
            <button
              onClick={() => { setStreamingActive(false); setMode('home'); }}
              className="px-3 py-1.5 rounded-lg bg-white/10 text-white/70 text-xs font-bold hover:bg-white/20"
            >
              ✕ Salir
            </button>
          </div>
        </div>

        {/* Translation display - large overlay at bottom */}
        <div className="px-6 pb-8 pt-4">
          {/* Current translation - big and clear */}
          {lastTranslation && (
            <div className="mb-3 text-center animate-fadeIn">
              <p
                className="text-white font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-tight"
                style={{ fontSize: `${fontSize + 8}px`, textShadow: '0 0 20px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.8)' }}
              >
                {lastTranslation.translated}
              </p>
            </div>
          )}

          {/* Live transcript */}
          {transcript && streamingActive && (
            <div className="text-center mb-2">
              <p
                className="text-white/60 italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                style={{ fontSize: `${fontSize - 4}px` }}
              >
                {transcript}...
              </p>
            </div>
          )}

          {/* Translating indicator */}
          {isTranslating && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-blue-300">Traduciendo...</span>
              </div>
            </div>
          )}

          {/* Recent translations history */}
          {subtitles.length > 1 && (
            <div className="mt-4 max-h-32 overflow-y-auto scrollbar-thin space-y-1 opacity-50">
              {subtitles.slice(-5, -1).reverse().map((sub) => (
                <p key={sub.id} className="text-center text-white/50 text-sm truncate">
                  {sub.translated}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============ MAIN UI ============
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-black/40 backdrop-blur-md border-b border-blue-500/20">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setMode('home')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-black text-lg">M</span>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
              Morris Translate
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-500">Traductor para streaming y más</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowLangPicker(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <span className="text-lg">{LANGUAGES[sourceLang].flag}</span>
            <span className="text-xs sm:text-sm text-gray-300 hidden sm:inline">{LANGUAGES[sourceLang].name}</span>
            <i className="fas fa-chevron-down text-[10px] text-gray-500"></i>
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <i className="fas fa-cog text-sm text-gray-400"></i>
          </button>
        </div>
      </header>

      {/* Language Picker Modal */}
      {showLangPicker && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-blue-500/20 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-blue-300 flex items-center gap-2">
                  <i className="fas fa-globe"></i>Seleccionar Idioma de Origen
                </h2>
                <button onClick={() => setShowLangPicker(false)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center">
                  <i className="fas fa-times text-sm"></i>
                </button>
              </div>
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
                <input
                  type="text"
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  placeholder="Buscar idioma..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
              {popularLanguages.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">⭐ Populares</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {popularLanguages.map(([code, info]) => (
                      <button
                        key={code}
                        onClick={() => { setSourceLang(code as LanguageCode); setShowLangPicker(false); setLangSearch(''); }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          sourceLang === code
                            ? 'bg-blue-500/20 border border-blue-500/40 text-blue-200'
                            : 'bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300'
                        }`}
                      >
                        <span className="text-lg">{info.flag}</span>
                        <span className="truncate">{info.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {otherLanguages.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Todos los idiomas</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {otherLanguages.map(([code, info]) => (
                      <button
                        key={code}
                        onClick={() => { setSourceLang(code as LanguageCode); setShowLangPicker(false); setLangSearch(''); }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          sourceLang === code
                            ? 'bg-blue-500/20 border border-blue-500/40 text-blue-200'
                            : 'bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300'
                        }`}
                      >
                        <span className="text-lg">{info.flag}</span>
                        <span className="truncate">{info.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {filteredLanguages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-search text-3xl mb-3 opacity-50"></i>
                  <p>No se encontraron idiomas</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-blue-500/20 rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-blue-300 flex items-center gap-2">
                <i className="fas fa-cog"></i>Configuración
              </h2>
              <button onClick={() => setShowSettings(false)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center">
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <i className="fas fa-text-height mr-2 text-blue-400"></i>Tamaño de texto: {fontSize}px
              </label>
              <div className="flex gap-3">
                <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center">
                  <i className="fas fa-minus"></i>
                </button>
                <div className="flex-1 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                  <span className="text-blue-300 font-bold text-lg">{fontSize}px</span>
                </div>
                <button onClick={() => setFontSize(Math.min(56, fontSize + 2))} className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center">
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <i className="fas fa-tv mr-2 text-blue-400"></i>Opacidad del overlay streaming: {overlayOpacity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Ajusta la transparencia del fondo cuando usas el modo streaming</p>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:from-blue-400 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20"
            >
              <i className="fas fa-check mr-2"></i>Guardar
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        {mode === 'home' && (
          <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            {/* Welcome */}
            <div className="text-center mb-8 pt-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/20">
                <span className="text-white font-black text-2xl">M</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">¡Bienvenido a Morris Translate!</h2>
              <p className="text-gray-400 text-sm">Traduce subtítulos de cualquier servicio de streaming en tiempo real</p>
            </div>

            {/* Mode Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Streaming Mode - HIGHLIGHTED */}
              <button
                onClick={() => setMode('streaming')}
                className="group relative p-5 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border-2 border-red-500/30 hover:border-red-500/60 transition-all text-left focus:outline-none focus:ring-2 focus:ring-red-400 overflow-hidden"
              >
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30">
                  <span className="text-[10px] text-red-300 font-bold">RECOMENDADO</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <i className="fas fa-tv text-red-400 text-xl"></i>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Modo Streaming</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Escucha el audio de Netflix, Disney+, HBO y traduce los subtítulos al español en tiempo real
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-300">Netflix</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-300">Disney+</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-300">HBO</span>
                </div>
              </button>

              {/* Manual Mode */}
              <button
                onClick={() => setMode('manual')}
                className="group p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-blue-500/40 hover:bg-white/[0.05] transition-all text-left focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <i className="fas fa-keyboard text-blue-400 text-xl"></i>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Texto Manual</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Escribe o pega texto para traducirlo instantáneamente al español
                </p>
              </button>

              {/* Guide Mode */}
              <button
                onClick={() => setMode('guide')}
                className="group p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-green-500/40 hover:bg-white/[0.05] transition-all text-left focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <i className="fas fa-book text-green-400 text-xl"></i>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Guía de Uso</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Aprende a configurar Morris Translate para usar con tu Android TV
                </p>
              </button>
            </div>

            {/* Supported languages preview */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Idiomas soportados</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(LANGUAGES).filter(([, info]) => info.popular).map(([code, info]) => (
                  <span key={code} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
                    {info.flag} {info.name}
                  </span>
                ))}
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                  +{Object.keys(LANGUAGES).length - 10} idiomas más
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Streaming Mode Setup */}
        {mode === 'streaming' && (
          <div className="p-4 sm:p-6 max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-red-500/20">
                <i className="fas fa-tv text-white text-2xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Modo Streaming</h2>
              <p className="text-gray-400 text-sm">Traduce en tiempo real mientras ves tu contenido favorito</p>
            </div>

            {/* How it works */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border border-blue-500/20 mb-6">
              <h3 className="text-sm font-bold text-blue-300 mb-3 flex items-center gap-2">
                <i className="fas fa-info-circle"></i>¿Cómo funciona?
              </h3>
              <ol className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                  <span>Abre Netflix, Disney+, HBO Max u otra app de streaming en tu Android TV</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                  <span>Activa los <strong className="text-white">subtítulos originales</strong> en el idioma que deseas traducir</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                  <span>Presiona <strong className="text-white">"Iniciar Traducción"</strong> abajo — Morris escuchará el audio del TV</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                  <span>La traducción al español aparecerá como <strong className="text-white">overlay</strong> sobre el video</span>
                </li>
              </ol>
            </div>

            {/* Current config */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Configuración actual</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{LANGUAGES[sourceLang].flag}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{LANGUAGES[sourceLang].name}</p>
                    <p className="text-xs text-gray-500">{LANGUAGES[sourceLang].nativeName}</p>
                  </div>
                </div>
                <i className="fas fa-arrow-right text-gray-500"></i>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">Español</p>
                    <p className="text-xs text-gray-500">Español</p>
                  </div>
                  <span className="text-2xl">🇪🇸</span>
                </div>
              </div>
              <button
                onClick={() => setShowLangPicker(true)}
                className="mt-3 w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 transition-all"
              >
                <i className="fas fa-edit mr-1"></i>Cambiar idioma de origen
              </button>
            </div>

            {/* Start button */}
            <button
              onClick={() => setStreamingActive(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold text-lg hover:from-red-400 hover:to-orange-500 transition-all shadow-xl shadow-red-500/20 focus:outline-none focus:ring-4 focus:ring-red-400/50"
            >
              <i className="fas fa-play mr-2"></i>Iniciar Traducción en Vivo
            </button>

            <p className="text-center text-xs text-gray-500 mt-3">
              Se necesita acceso al micrófono para captar el audio del televisor
            </p>

            {/* Back button */}
            <button
              onClick={() => setMode('home')}
              className="mt-4 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 transition-all"
            >
              <i className="fas fa-arrow-left mr-2"></i>Volver al inicio
            </button>
          </div>
        )}

        {/* Manual Translation Mode */}
        {mode === 'manual' && (
          <div className="p-4 sm:p-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="fas fa-keyboard text-blue-400"></i>Traducción Manual
              </h2>
              <button onClick={() => setMode('home')} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300">
                <i className="fas fa-arrow-left mr-1"></i>Volver
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/10">
              <span className="text-xl">{LANGUAGES[sourceLang].flag}</span>
              <span className="text-sm text-gray-300">{LANGUAGES[sourceLang].name}</span>
              <i className="fas fa-arrow-right text-gray-500 text-xs"></i>
              <span className="text-xl">🇪🇸</span>
              <span className="text-sm text-gray-300">Español</span>
              <button onClick={() => setShowLangPicker(true)} className="ml-auto text-xs text-blue-400 hover:text-blue-300">
                <i className="fas fa-edit"></i>
              </button>
            </div>

            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualTranslate()}
                placeholder={`Escribe en ${LANGUAGES[sourceLang].name}...`}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                autoFocus
              />
              <button
                onClick={handleManualTranslate}
                disabled={isTranslating || !manualInput.trim()}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
              >
                {isTranslating ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-language mr-2"></i>Traducir</>}
              </button>
            </div>

            {/* Results */}
            <div className="space-y-3 max-h-[50vh] overflow-y-auto scrollbar-thin">
              {subtitles.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-language text-3xl mb-3 opacity-30"></i>
                  <p className="text-sm">Las traducciones aparecerán aquí</p>
                </div>
              )}
              {subtitles.map((subtitle, index) => (
                <div key={subtitle.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <p className="text-gray-500 text-sm mb-1">
                    <span className="mr-1">{LANGUAGES[sourceLang].flag}</span>{subtitle.original}
                  </p>
                  <p className="text-blue-100 font-medium">
                    <span className="mr-1">🇪🇸</span>{subtitle.translated}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-1">
                    {subtitle.timestamp.toLocaleTimeString('es-ES')} #{index + 1}
                  </p>
                </div>
              ))}
            </div>

            {subtitles.length > 0 && (
              <button
                onClick={() => setSubtitles([])}
                className="mt-4 w-full py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-sm text-red-400 transition-all"
              >
                <i className="fas fa-trash mr-2"></i>Limpiar historial
              </button>
            )}
          </div>
        )}

        {/* Guide Mode */}
        {mode === 'guide' && (
          <div className="p-4 sm:p-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <i className="fas fa-book text-green-400"></i>Guía de Uso
              </h2>
              <button onClick={() => setMode('home')} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300">
                <i className="fas fa-arrow-left mr-1"></i>Volver
              </button>
            </div>

            {/* Section 1: Install as App */}
            <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border border-blue-500/20">
              <h3 className="text-lg font-bold text-blue-300 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-sm">📱</span>
                Paso 1: Instalar como App en Android TV
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>Para usar Morris Translate como app nativa en tu Android TV 11.0:</p>
                <ol className="space-y-2 ml-4 list-decimal">
                  <li>Abre <strong className="text-white">Chrome</strong> en tu Android TV (o instala un navegador desde Play Store)</li>
                  <li>Accede a la URL de Morris Translate</li>
                  <li>Cuando aparezca el mensaje <strong className="text-white">"Instalar Morris Translate"</strong>, acepta</li>
                  <li>La app aparecerá en tu lista de aplicaciones del TV</li>
                </ol>
                <div className="mt-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-xs text-yellow-300">
                    <i className="fas fa-lightbulb mr-1"></i>
                    <strong>Tip:</strong> También puedes generar un APK usando <a href="https://www.pwabuilder.com" target="_blank" rel="noopener" className="underline text-blue-400">PWABuilder.com</a> subiendo la URL de esta app.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Streaming Setup */}
            <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-red-500/5 to-orange-500/5 border border-red-500/20">
              <h3 className="text-lg font-bold text-red-300 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center text-sm">📺</span>
                Paso 2: Usar con Netflix, Disney+, HBO, etc.
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p>Morris Translate funciona escuchando el audio de tu televisor a través del micrófono. Así se configura:</p>
                <div className="space-y-2 ml-4">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                    <span>Abre tu app de streaming (Netflix, Disney+, Prime Video, HBO Max, etc.)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                    <span>Activa los <strong className="text-white">subtítulos originales</strong> en el idioma que quieres traducir (ej: inglés, italiano, japonés)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                    <span>Abre Morris Translate y selecciona <strong className="text-white">"Modo Streaming"</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                    <span>Selecciona el idioma de los subtítulos originales</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">5</span>
                    <span>Presiona <strong className="text-white">"Iniciar Traducción"</strong> — Morris escuchará el audio y mostrará la traducción al español como overlay</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Compatible Services */}
            <div className="mb-6 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-sm">🎬</span>
                Servicios Compatibles
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['Netflix', 'Disney+', 'HBO Max', 'Prime Video', 'Apple TV+', 'Paramount+', 'Crunchyroll', 'YouTube', 'Movistar+', 'RTVE Play', 'MGM+', 'Star+'].map(service => (
                  <div key={service} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                    <i className="fas fa-check-circle text-green-400 text-xs"></i>
                    <span className="text-xs text-gray-300">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Tips */}
            <div className="mb-6 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-sm">💡</span>
                Consejos para Mejor Experiencia
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <i className="fas fa-volume-up text-blue-400 mt-1 text-xs"></i>
                  <span><strong className="text-white">Volumen adecuado:</strong> Asegúrate de que el volumen del TV sea suficiente para que el micrófono capte el audio claramente</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-microphone text-blue-400 mt-1 text-xs"></i>
                  <span><strong className="text-white">Ambiente silencioso:</strong> Reduce el ruido ambiental para mejor reconocimiento de voz</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-language text-blue-400 mt-1 text-xs"></i>
                  <span><strong className="text-white">Idioma correcto:</strong> Selecciona el idioma exacto de los subtítulos/audio original</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-text-height text-blue-400 mt-1 text-xs"></i>
                  <span><strong className="text-white">Tamaño de texto:</strong> Ajusta el tamaño en configuración para mejor lectura en TV</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-sliders-h text-blue-400 mt-1 text-xs"></i>
                  <span><strong className="text-white">Opacidad del overlay:</strong> Ajusta la transparencia del fondo para ver mejor el video</span>
                </li>
              </ul>
            </div>

            {/* Section 5: Advanced - Accessibility Service */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20">
              <h3 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-sm">⚡</span>
                Modo Avanzado: Accessibility Service
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>Para una integración más profunda con Android TV, puedes empaquetar Morris Translate como APK nativo con <strong className="text-white">Accessibility Service</strong>:</p>
                <ol className="space-y-1.5 ml-4 list-decimal text-xs">
                  <li>Usa <a href="https://www.pwabuilder.com" target="_blank" rel="noopener" className="text-blue-400 underline">PWABuilder</a> o <a href="https://github.com/nicofisch/nicofisch.github.io/blob/master/Bubblewrap.md" target="_blank" rel="noopener" className="text-blue-400 underline">Bubblewrap</a> para generar el APK</li>
                  <li>Al instalar, concede permisos de <strong className="text-white">Accesibilidad</strong> para leer subtítulos de otras apps</li>
                  <li>Concede permiso de <strong className="text-white">Dibujo sobre otras apps</strong> para mostrar el overlay</li>
                  <li>Concede permiso de <strong className="text-white">Micrófono</strong> para captar el audio</li>
                </ol>
                <div className="mt-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <p className="text-xs text-purple-300">
                    <i className="fas fa-shield-alt mr-1"></i>
                    Con Accessibility Service, Morris puede leer directamente los subtítulos de Netflix/Disney+ sin necesidad del micrófono, ofreciendo traducciones más precisas.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setMode('home')}
              className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:from-blue-400 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20"
            >
              <i className="fas fa-home mr-2"></i>Volver al Inicio
            </button>
          </div>
        )}
      </main>

      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-[#161b22] border border-blue-500/30 rounded-xl p-4 shadow-2xl max-w-sm w-full mx-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-sm">M</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white mb-1">Instalar Morris Translate</p>
              <p className="text-xs text-gray-400 mb-3">Accede rápidamente desde tu Android TV</p>
              <div className="flex gap-2">
                <button onClick={handleInstall} className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-400 transition-all">
                  Instalar
                </button>
                <button onClick={() => setShowInstallPrompt(false)} className="px-4 py-2 rounded-lg bg-white/10 text-gray-300 text-sm hover:bg-white/20 transition-all">
                  Después
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
