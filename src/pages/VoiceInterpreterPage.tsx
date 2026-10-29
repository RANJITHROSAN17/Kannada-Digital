/**
 * ಸ್ವರ ಸಂಕ್ಷೇಪಣೆ — Voice Interpreter.
 *
 * Speak in any language, hear it back in the language you pick. The user
 * chooses a source language (or Auto-detect) and a target language; the app
 * recognises speech, translates it through the keyless Google endpoint, and
 * speaks the translation in the target language.
 *
 * Web mode: browser SpeechRecognition + browser TTS (needs internet for
 * translation). Desktop mode: Whisper recognition (offline) + espeak-ng TTS
 * (offline) + Google translation (needs internet).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeftRight, Languages, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Card, SectionHeading } from '../components/ui';
import { LANGUAGES } from '../services/languages';
import { translateText } from '../services/translation';
import { speakInLanguage as speakInLanguageFn, stopSpeaking, listenOnce, detectCapabilities, type ListenErrorCode } from '../services/speech';
import { isDesktop } from '../services/desktop';
import { Link } from 'react-router-dom';

type Phase = 'idle' | 'listening' | 'translating' | 'done';

interface HistoryItem {
  id: number;
  source: string;
  sourceLang: string;
  target: string;
  targetLang: string;
  engine: string;
}

let historyId = 0;

export function VoiceInterpreterPage() {
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('kn');
  const [phase, setPhase] = useState<Phase>('idle');
  const [recognized, setRecognized] = useState('');
  const [translated, setTranslated] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [engine, setEngine] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [caps] = useState(() => detectCapabilities());
  const handleRef = useRef<{ stop: () => void } | null>(null);
  const historyRef = useRef<HistoryItem[]>([]);
  historyRef.current = history;

  const desktop = isDesktop();

  useEffect(() => {
    return () => {
      handleRef.current?.stop();
      stopSpeaking();
    };
  }, []);

  const speakTranslation = useCallback(
    (text: string, lang: string) => {
      if (!text.trim()) return;
      setSpeaking(true);
      stopSpeaking();
      speakInLanguageFn(text, lang, {
        onEnd: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    },
    [],
  );

  const handleListen = useCallback(async () => {
    if (phase === 'listening') {
      handleRef.current?.stop();
      return;
    }

    setError(null);
    setRecognized('');
    setTranslated('');
    setEngine('');
    setPhase('listening');

    const listenLang = sourceLang === 'auto' ? 'kn-IN' : sourceLang;

    const handle = listenOnce({
      lang: listenLang,
      onStart: () => {
        setPhase('listening');
      },
      onFinal: async (text: string) => {
        setRecognized(text);
        setPhase('translating');
        try {
          const result = await translateText(text, sourceLang, targetLang);
          setTranslated(result.text);
          setEngine(result.engine);
          setPhase('done');

          // Add to history
          const item: HistoryItem = {
            id: ++historyId,
            source: text,
            sourceLang: sourceLang === 'auto' ? 'Auto' : sourceLang,
            target: result.text,
            targetLang,
            engine: result.engine,
          };
          setHistory((prev) => [item, ...prev].slice(0, 20));

          // Speak the translation
          speakTranslation(result.text, targetLang);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Translation failed.');
          setPhase('idle');
        }
      },
      onError: (_code: ListenErrorCode, message: string) => {
        setError(message);
        setPhase('idle');
      },
      onEnd: () => {
        setPhase((prev) => (prev === 'listening' ? 'idle' : prev));
      },
    });

    handleRef.current = handle;
  }, [phase, sourceLang, targetLang, speakTranslation]);

  const handleSpeakAgain = useCallback(() => {
    if (translated) {
      speakTranslation(translated, targetLang);
    }
  }, [translated, targetLang, speakTranslation]);

  const sourceLanguages = [{ code: 'auto', name: 'Auto-detect', nativeName: 'ಸ್ವಯಂ-ಗುರುತಿಸುವಿಕೆ', speechCode: 'kn-IN' }, ...LANGUAGES];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <SectionHeading
        level="h1"
        eyebrow="Voice interpreter · ಸ್ವರ ಸಂಕ್ಷೇಪಣೆ"
        title="Speak any language, hear it in yours"
        description="Pick what you speak and what you want to hear. Tap the mic, talk naturally — the app translates and speaks it back in the target language. No typing, no copy-paste."
        action={
          <Link to="/bridge" className="btn-ghost !py-2">
            <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            Live bridge
          </Link>
        }
      />

      {/* Language selectors */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-ink-400">
            What you speak
          </label>
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            {sourceLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </Card>

        <Card className="p-4">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-ink-400">
            What you hear
          </label>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </Card>
      </div>

      {/* Mic button */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleListen}
          disabled={!caps.recognitionSupported}
          className={`group relative flex h-24 w-24 items-center justify-center rounded-full shadow-lg transition ${
            phase === 'listening'
              ? 'bg-red-500 animate-pulse shadow-red-200'
              : 'bg-brand-500 hover:bg-brand-600 shadow-brand-200'
          } disabled:cursor-not-allowed disabled:opacity-40`}
          aria-label={phase === 'listening' ? 'Stop listening' : 'Start speaking'}
        >
          <Mic className="h-10 w-10 text-white" aria-hidden="true" />
          {!caps.recognitionSupported && (
            <MicOff className="absolute h-8 w-8 text-white/60" aria-hidden="true" />
          )}
        </button>
        <p className="text-sm font-medium text-ink-500">
          {phase === 'listening' ? 'Listening… tap to stop' : 'Tap and speak'}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Result display */}
      {phase !== 'idle' && (recognized || translated) && (
        <div className="mt-6 space-y-4">
          {recognized && (
            <Card className="p-4">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-ink-400">
                You said ({sourceLang === 'auto' ? 'auto' : sourceLang})
              </p>
              <p className="text-lg leading-relaxed text-ink-800">{recognized}</p>
            </Card>
          )}
          {translated && (
            <Card className="border-brand-200 bg-brand-50/50 p-4">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wide text-brand-600">
                  Translation ({targetLang})
                </p>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-ink-400">
                    {engine}
                  </span>
                  <button
                    type="button"
                    onClick={handleSpeakAgain}
                    disabled={speaking}
                    className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-bold text-brand-600 hover:bg-brand-100 disabled:opacity-50"
                  >
                    {speaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                    {speaking ? 'Speaking' : 'Listen'}
                  </button>
                </div>
              </div>
              <p className="text-xl leading-relaxed font-medium text-ink-900" lang={targetLang}>
                {translated}
              </p>
            </Card>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-600">
            <Languages className="h-4 w-4" aria-hidden="true" />
            Recent phrases
          </h2>
          <div className="space-y-2">
            {history.map((item) => (
              <Card key={item.id} className="p-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">
                      {item.sourceLang} → {item.targetLang} · {item.engine}
                    </p>
                    <p className="text-sm text-ink-600">{item.source}</p>
                    <p className="text-sm font-medium text-ink-900" lang={item.targetLang}>
                      {item.target}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Capability notes */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Card className="p-4">
          <p className="text-[12px] leading-relaxed text-ink-400">
            {desktop ? (
              <>Desktop mode: speech recognition runs offline via Whisper. Translation needs the internet (Google free endpoint, no API key). Kannada speech is spoken by espeak-ng.</>
            ) : (
              <>Your browser's speech recognition powers the mic. Translation uses Google's free endpoint (no API key) with MyMemory as fallback. Speech output uses the browser's voice engine.</>
            )}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[12px] leading-relaxed text-ink-400">
            Auto-detect uses Google's language detection — it works best with a clear sentence. If the
            language is ambiguous, pick it explicitly. Translation quality is machine-level; verify
            important phrases with a native speaker.
          </p>
        </Card>
      </div>
    </div>
  );
}
