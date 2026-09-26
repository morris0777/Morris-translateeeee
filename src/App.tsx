import { useState, useEffect, useCallback, useRef } from 'react';

// Types
interface SubtitleEntry {
  id: number;
  original: string;
  translated: string;
  timestamp: Date;
}

// Comprehensive language list - 40+ languages
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
  // Popular languages (highlighted)
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

  // European languages
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

  // Asian languages
  hi: { name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', speechCode: 'hi-IN' },
  bn: { name: 'Bengalí', nativeName: 'বাংলা', flag: '🇧🇩', speechCode: 'bn-BD' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', speechCode: 'ta-IN' },
  te: { name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', speechCode: 'te-IN' },
  th: { name: 'Tailandés', nativeName: 'ไทย', flag: '🇹🇭', speechCode: 'th-TH' },
  vi: { name: 'Vietnamita', nativeName: 'Tiếng Việt', flag: '🇻🇳', speechCode: 'vi-VN' },
  id: { name: 'Indonesio', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', speechCode: 'id-ID' },
  ms: { name: 'Malayo', nativeName: 'Bahasa Melayu', flag: '🇲🇾', speechCode: 'ms-MY' },

  // Middle Eastern & African
  he: { name: 'Hebreo', nativeName: 'עברית', flag: '🇮🇱', speechCode: 'he-IL' },
  fa: { name: 'Persa', nativeName: 'فارسی', flag: '🇮🇷', speechCode: 'fa-IR' },
  sw: { name: 'Suajili', nativeName: 'Kiswahili', flag: '🇰🇪', speechCode: 'sw-KE' },
  af: { name: 'Afrikáans', nativeName: 'Afrikaans', flag: '🇿🇦', speechCode: 'af-ZA' },

  // Regional languages
  ca: { name: 'Catalán', nativeName: 'Català', flag: '🏴', speechCode: 'ca-ES' },
  gl: { name: 'Gallego', nativeName: 'Galego', flag: '🏴', speechCode: 'gl-ES' },
  eu: { name: 'Euskera', nativeName: 'Euskara', flag: '🏴', speechCode: 'eu-ES' },
};

// Translation API using MyMemory (free)
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

// Main App Component
export default function App() {
  const [sourceLang, setSourceLang] = useState<LanguageCode>('en');
  const [subtitles, setSubtitles] = useState<SubtitleEntry[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  const [showSettings, setShowSettings] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [manualInput, setManualInput] = useState('');
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const subtitlesEndRef = useRef<HTMLDivElement>(null);
  const translationTimeoutRef = useRef<any>(null);

  const { isListening, transcript, startListening, stopListening, setTranscript } =
    useSpeechRecognition(sourceLang);

  // Auto-scroll to bottom
  useEffect(() => {
    subtitlesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [subtitles]);

  // Handle translation when transcript changes
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

        setIsTranslating(false);
        setTranscript('');
      }, 1500);
    }

    return () => {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
    };
  }, [transcript, sourceLang, isListening]);

  // Handle manual text input translation
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

    setManualInput('');
    setIsTranslating(false);
  };

  // Keyboard navigation for TV
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(subtitles.length - 1, prev + 1));
          break;
        case 'Enter':
        case ' ':
          if (inputMode === 'voice') {
            e.preventDefault();
            if (isListening) {
              stopListening();
            } else {
              startListening();
            }
          }
          break;
        case 'Escape':
        case 'Backspace':
          if (showSettings || showLangPicker) {
            setShowSettings(false);
            setShowLangPicker(false);
          } else if (isListening) {
            stopListening();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening, showSettings, showLangPicker, inputMode, subtitles.length, startListening, stopListening]);

  // PWA Install prompt
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

  const clearSubtitles = () => {
    setSubtitles([]);
    setFocusedIndex(0);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Filter languages by search
  const filteredLanguages = Object.entries(LANGUAGES).filter(([, info]) => {
    const search = langSearch.toLowerCase();
    return info.name.toLowerCase().includes(search) ||
      info.nativeName.toLowerCase().includes(search);
  });

  const popularLanguages = filteredLanguages.filter(([, info]) => info.popular);
  const otherLanguages = filteredLanguages.filter(([, info]) => !info.popular);

  // Register Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-black/40 backdrop-blur-md border-b border-blue-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-black text-lg">M</span>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
              Morris Translate
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-500">Traducción de subtítulos en tiempo real</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language badge */}
          <button
            onClick={() => setShowLangPicker(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <span className="text-lg">{LANGUAGES[sourceLang].flag}</span>
            <span className="text-xs sm:text-sm text-gray-300 hidden sm:inline">{LANGUAGES[sourceLang].name}</span>
            <i className="fas fa-chevron-down text-[10px] text-gray-500"></i>
          </button>

          {/* Status indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
            <div className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' : 'bg-gray-600'}`}></div>
            <span className="text-xs text-gray-400 hidden sm:inline">
              {isListening ? 'Escuchando' : 'Inactivo'}
            </span>
          </div>

          {/* Settings button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Configuración"
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
                  <i className="fas fa-globe"></i>
                  Seleccionar Idioma
                </h2>
                <button
                  onClick={() => setShowLangPicker(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
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
              {/* Popular languages */}
              {popularLanguages.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">⭐ Populares</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {popularLanguages.map(([code, info]) => (
                      <button
                        key={code}
                        onClick={() => { setSourceLang(code as LanguageCode); setShowLangPicker(false); setLangSearch(''); }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${
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

              {/* Other languages */}
              {otherLanguages.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Todos los idiomas</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {otherLanguages.map(([code, info]) => (
                      <button
                        key={code}
                        onClick={() => { setSourceLang(code as LanguageCode); setShowLangPicker(false); setLangSearch(''); }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${
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
          <div className="bg-[#161b22] border border-blue-500/20 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-blue-300 flex items-center gap-2">
                <i className="fas fa-cog"></i>
                Configuración
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>

            {/* Font Size */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <i className="fas fa-text-height mr-2 text-blue-400"></i>Tamaño de texto: {fontSize}px
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                  className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <i className="fas fa-minus"></i>
                </button>
                <div className="flex-1 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                  <span className="text-blue-300 font-bold text-lg">{fontSize}px</span>
                </div>
                <button
                  onClick={() => setFontSize(Math.min(52, fontSize + 2))}
                  className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>

            {/* Input Mode */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <i className="fas fa-keyboard mr-2 text-blue-400"></i>Modo de entrada
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setInputMode('voice')}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    inputMode === 'voice'
                      ? 'bg-blue-500/20 border border-blue-500/40 text-blue-200'
                      : 'bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <i className="fas fa-microphone mr-2"></i>Voz
                </button>
                <button
                  onClick={() => setInputMode('text')}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    inputMode === 'text'
                      ? 'bg-blue-500/20 border border-blue-500/40 text-blue-200'
                      : 'bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <i className="fas fa-keyboard mr-2"></i>Texto
                </button>
              </div>
            </div>

            {/* Keyboard shortcuts info */}
            <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Atajos (Control Remoto)</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-white/10 rounded text-gray-300">↑↓ Navegar</span>
                <span className="px-2 py-1 bg-white/10 rounded text-gray-300">Enter/Espacio: Micrófono</span>
                <span className="px-2 py-1 bg-white/10 rounded text-gray-300">Esc: Cerrar</span>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:from-blue-400 hover:to-indigo-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg shadow-blue-500/20"
            >
              <i className="fas fa-check mr-2"></i>Guardar y Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Subtitles Display */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-3 scrollbar-thin">
          {subtitles.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
                <i className="fas fa-language text-4xl text-blue-400/50"></i>
              </div>
              <p className="text-xl font-bold text-gray-300 mb-2">Morris Translate</p>
              <p className="text-sm text-center max-w-md text-gray-500 mb-6">
                {inputMode === 'voice'
                  ? 'Presiona el micrófono o Enter/Espacio para comenzar a escuchar y traducir al español'
                  : 'Escribe el texto que deseas traducir en el campo de abajo'}
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <span className="px-3 py-1.5 bg-white/5 rounded-full text-xs border border-white/10">🇮🇹 Italiano</span>
                <span className="px-3 py-1.5 bg-white/5 rounded-full text-xs border border-white/10">🇩🇪 Alemán</span>
                <span className="px-3 py-1.5 bg-white/5 rounded-full text-xs border border-white/10">🇯🇵 Japonés</span>
                <span className="px-3 py-1.5 bg-white/5 rounded-full text-xs border border-white/10">🇬🇧 Inglés</span>
                <span className="px-3 py-1.5 bg-white/5 rounded-full text-xs border border-white/10">🇫🇷 Francés</span>
                <span className="px-3 py-1.5 bg-white/5 rounded-full text-xs border border-white/10">+40 más</span>
              </div>
            </div>
          )}

          {subtitles.map((subtitle, index) => (
            <div
              key={subtitle.id}
              className={`p-4 rounded-xl border transition-all ${
                index === focusedIndex
                  ? 'bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/5'
                  : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mt-0.5">
                  <span className="text-xs text-blue-300 font-bold">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-500 mb-1.5 leading-relaxed" style={{ fontSize: `${fontSize - 4}px` }}>
                    <span className="text-[10px] mr-1 opacity-60">{LANGUAGES[sourceLang].flag}</span>
                    {subtitle.original}
                  </p>
                  <p className="text-blue-100 font-medium leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
                    <span className="text-[10px] mr-1">🇪🇸</span>
                    {subtitle.translated}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-2">
                    {subtitle.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Live transcript indicator */}
          {transcript && isListening && (
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
              <div className="flex items-center gap-2 mb-1.5">
                <i className="fas fa-microphone text-green-400 text-xs"></i>
                <span className="text-xs text-green-400 font-medium">Escuchando...</span>
                <div className="flex gap-0.5 ml-auto">
                  <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-5 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
              <p className="text-gray-300" style={{ fontSize: `${fontSize - 4}px` }}>
                {transcript}
              </p>
            </div>
          )}

          <div ref={subtitlesEndRef} />
        </div>

        {/* Bottom Controls */}
        <div className="bg-black/50 backdrop-blur-md border-t border-white/10 px-4 py-3">
          {inputMode === 'voice' ? (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={clearSubtitles}
                className="w-11 h-11 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Limpiar subtítulos"
              >
                <i className="fas fa-trash text-red-400 text-sm"></i>
              </button>

              <button
                onClick={toggleListening}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-xl focus:outline-none focus:ring-4 ${
                  isListening
                    ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/30 focus:ring-red-400/50'
                    : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30 focus:ring-blue-400/50'
                }`}
                aria-label={isListening ? 'Detener escucha' : 'Iniciar escucha'}
              >
                <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'} text-white text-xl`}></i>
              </button>

              <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                <span className="text-base">{LANGUAGES[sourceLang].flag}</span>
                <i className="fas fa-arrow-right text-[10px] text-gray-500"></i>
                <span className="text-base">🇪🇸</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 max-w-3xl mx-auto">
              <button
                onClick={clearSubtitles}
                className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center transition-all flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Limpiar subtítulos"
              >
                <i className="fas fa-trash text-red-400 text-xs"></i>
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualTranslate()}
                  placeholder={`Escribe en ${LANGUAGES[sourceLang].name} para traducir...`}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  style={{ fontSize: `${fontSize - 4}px` }}
                />
              </div>

              <button
                onClick={handleManualTranslate}
                disabled={isTranslating || !manualInput.trim()}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:from-blue-400 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg shadow-blue-500/20"
              >
                {isTranslating ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <>
                    <i className="fas fa-language mr-2"></i>Traducir
                  </>
                )}
              </button>
            </div>
          )}
        </div>
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
              <p className="text-xs text-gray-400 mb-3">Accede rápidamente desde tu pantalla de inicio de Android TV</p>
              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Instalar
                </button>
                <button
                  onClick={() => setShowInstallPrompt(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-gray-300 text-sm hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
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
