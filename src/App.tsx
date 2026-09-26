import { useState, useEffect, useCallback, useRef } from 'react';

// Types
interface SubtitleEntry {
  id: number;
  original: string;
  translated: string;
  timestamp: Date;
}

type Language = 'en' | 'fr' | 'de' | 'pt' | 'it' | 'ja' | 'ko' | 'zh' | 'ru' | 'ar';

const LANGUAGES: Record<Language, string> = {
  en: 'Inglés',
  fr: 'Francés',
  de: 'Alemán',
  pt: 'Portugués',
  it: 'Italiano',
  ja: 'Japonés',
  ko: 'Coreano',
  zh: 'Chino',
  ru: 'Ruso',
  ar: 'Árabe',
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
    return `[Error traduciendo]`;
  } catch {
    return `[Error de conexión]`;
  }
}

// Speech Recognition hook
function useSpeechRecognition(sourceLang: Language) {
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
    recognition.lang = sourceLang === 'zh' ? 'zh-CN' : sourceLang === 'ja' ? 'ja-JP' : sourceLang === 'ko' ? 'ko-KR' : sourceLang === 'ar' ? 'ar-SA' : sourceLang === 'ru' ? 'ru-RU' : `${sourceLang}-${sourceLang.toUpperCase()}`;
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
  const [sourceLang, setSourceLang] = useState<Language>('en');
  const [subtitles, setSubtitles] = useState<SubtitleEntry[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  const [showSettings, setShowSettings] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [manualInput, setManualInput] = useState('');
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
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
          if (showSettings) {
            setShowSettings(false);
          } else if (isListening) {
            stopListening();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening, showSettings, inputMode, subtitles.length, startListening, stopListening]);

  // PWA Install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
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

  // Register Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-black/30 backdrop-blur-sm border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <i className="fas fa-language text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-cyan-300">SubTranslate TV</h1>
            <p className="text-xs text-gray-400">Traducción de subtítulos en tiempo real</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
            <span className="text-sm text-gray-300">
              {isListening ? 'Escuchando...' : 'Inactivo'}
            </span>
          </div>

          {/* Settings button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400"
            aria-label="Configuración"
          >
            <i className="fas fa-cog text-lg"></i>
          </button>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center">
          <div className="bg-[#1a1a2e] border border-cyan-500/30 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-cyan-300 mb-6 flex items-center gap-3">
              <i className="fas fa-cog"></i>
              Configuración
            </h2>

            {/* Language Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <i className="fas fa-globe mr-2"></i>Idioma de origen
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.entries(LANGUAGES) as [Language, string][]).map(([code, name]) => (
                  <button
                    key={code}
                    onClick={() => setSourceLang(code)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                      sourceLang === code
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                        : 'bg-white/10 hover:bg-white/20 text-gray-300'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <i className="fas fa-text-height mr-2"></i>Tamaño de texto: {fontSize}px
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setFontSize(Math.max(16, fontSize - 2))}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <i className="fas fa-minus"></i>
                </button>
                <div className="flex-1 bg-white/5 rounded-lg flex items-center justify-center">
                  <span className="text-cyan-300 font-bold">{fontSize}px</span>
                </div>
                <button
                  onClick={() => setFontSize(Math.min(48, fontSize + 2))}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>

            {/* Input Mode */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <i className="fas fa-keyboard mr-2"></i>Modo de entrada
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setInputMode('voice')}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                    inputMode === 'voice'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-gray-300'
                  }`}
                >
                  <i className="fas fa-microphone mr-2"></i>Voz
                </button>
                <button
                  onClick={() => setInputMode('text')}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                    inputMode === 'text'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-gray-300'
                  }`}
                >
                  <i className="fas fa-keyboard mr-2"></i>Texto
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:from-cyan-400 hover:to-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <i className="fas fa-check mr-2"></i>Guardar y Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Subtitles Display */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
          {subtitles.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <i className="fas fa-language text-6xl mb-4 text-cyan-500/30"></i>
              <p className="text-xl font-medium mb-2">No hay subtítulos aún</p>
              <p className="text-sm text-center max-w-md">
                {inputMode === 'voice' 
                  ? 'Presiona el botón del micrófono o la tecla Enter/Espacio para comenzar a escuchar y traducir'
                  : 'Escribe el texto que deseas traducir en el campo de abajo'}
              </p>
              <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs text-gray-500 mb-2">Atajos de teclado (control remoto):</p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="px-2 py-1 bg-white/10 rounded">↑↓ Navegar</span>
                  <span className="px-2 py-1 bg-white/10 rounded">Enter/Espacio: Activar micrófono</span>
                  <span className="px-2 py-1 bg-white/10 rounded">Esc: Detener</span>
                </div>
              </div>
            </div>
          )}

          {subtitles.map((subtitle, index) => (
            <div
              key={subtitle.id}
              className={`p-4 rounded-xl border transition-all ${
                index === focusedIndex
                  ? 'bg-cyan-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'bg-white/5 border-white/10 hover:bg-white/8'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mt-1">
                  <span className="text-xs text-blue-300 font-bold">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-400 mb-1" style={{ fontSize: `${fontSize - 4}px` }}>
                    <i className="fas fa-quote-left text-[10px] mr-1 opacity-50"></i>
                    {subtitle.original}
                  </p>
                  <p className="text-cyan-200 font-medium" style={{ fontSize: `${fontSize}px` }}>
                    <i className="fas fa-language text-xs mr-1 text-cyan-400"></i>
                    {subtitle.translated}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-1">
                    {subtitle.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Live transcript indicator */}
          {transcript && isListening && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 animate-pulse">
              <div className="flex items-center gap-2 mb-1">
                <i className="fas fa-microphone text-green-400"></i>
                <span className="text-xs text-green-400">Escuchando...</span>
              </div>
              <p className="text-gray-300" style={{ fontSize: `${fontSize - 4}px` }}>
                {transcript}
              </p>
            </div>
          )}

          <div ref={subtitlesEndRef} />
        </div>

        {/* Bottom Controls */}
        <div className="bg-black/40 backdrop-blur-sm border-t border-cyan-500/20 px-4 py-3">
          {inputMode === 'voice' ? (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={clearSubtitles}
                className="w-12 h-12 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Limpiar subtítulos"
              >
                <i className="fas fa-trash text-red-400"></i>
              </button>

              <button
                onClick={toggleListening}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg focus:outline-none focus:ring-4 ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/40 focus:ring-red-400 animate-pulse'
                    : 'bg-gradient-to-br from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 shadow-cyan-500/40 focus:ring-cyan-400'
                }`}
                aria-label={isListening ? 'Detener escucha' : 'Iniciar escucha'}
              >
                <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'} text-white text-2xl`}></i>
              </button>

              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                <i className="fas fa-globe text-cyan-400 text-sm"></i>
                <span className="text-sm text-gray-300">{LANGUAGES[sourceLang]} → Español</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 max-w-3xl mx-auto">
              <button
                onClick={clearSubtitles}
                className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-all flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Limpiar subtítulos"
              >
                <i className="fas fa-trash text-red-400 text-sm"></i>
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualTranslate()}
                  placeholder="Escribe el texto a traducir..."
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  style={{ fontSize: `${fontSize - 4}px` }}
                />
              </div>

              <button
                onClick={handleManualTranslate}
                disabled={isTranslating || !manualInput.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                {isTranslating ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <>
                    <i className="fas fa-language mr-2"></i>Traducir
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg flex-shrink-0">
                <span className="text-xs text-gray-300">{LANGUAGES[sourceLang]} → ES</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-[#1a1a2e] border border-cyan-500/40 rounded-xl p-4 shadow-2xl max-w-sm w-full mx-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0">
              <i className="fas fa-download text-white"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white mb-1">Instalar SubTranslate TV</p>
              <p className="text-xs text-gray-400 mb-3">Accede rápidamente desde tu pantalla de inicio</p>
              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-400 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
