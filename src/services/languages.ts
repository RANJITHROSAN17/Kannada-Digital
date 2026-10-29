/**
 * Languages supported by the Voice Interpreter.
 *
 * Google Translate supports 100+ languages; this list covers the ones most
 * relevant to Kannada speakers in India. Adding a language here makes it
 * available for both recognition (Whisper/SpeechRecognition) and TTS
 * (espeak-ng / browser speechSynthesis).
 */
export interface Language {
  /** Short code for Google Translate / espeak-ng (e.g. 'kn', 'en', 'hi'). */
  code: string;
  /** BCP-47 code for browser SpeechRecognition (e.g. 'kn-IN', 'en-IN'). */
  speechCode: string;
  /** English name. */
  name: string;
  /** Native name in that language. */
  nativeName: string;
}

export const LANGUAGES: Language[] = [
  { code: 'kn', speechCode: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'en', speechCode: 'en-IN', name: 'English', nativeName: 'English' },
  { code: 'hi', speechCode: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', speechCode: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', speechCode: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', speechCode: 'mr-IN', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', speechCode: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'bn', speechCode: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'pa', speechCode: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ml', speechCode: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'sa', speechCode: 'sa-IN', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
  { code: 'or', speechCode: 'or-IN', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'as', speechCode: 'as-IN', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'ne', speechCode: 'ne-IN', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'ur', speechCode: 'ur-IN', name: 'Urdu', nativeName: 'اردو' },
  { code: 'ar', speechCode: 'ar-SA', name: 'Arabic', nativeName: 'العربية' },
  { code: 'zh', speechCode: 'zh-CN', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', speechCode: 'ja-JP', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', speechCode: 'ko-KR', name: 'Korean', nativeName: '한국어' },
  { code: 'fr', speechCode: 'fr-FR', name: 'French', nativeName: 'Français' },
  { code: 'de', speechCode: 'de-DE', name: 'German', nativeName: 'Deutsch' },
  { code: 'es', speechCode: 'es-ES', name: 'Spanish', nativeName: 'Español' },
];

/** Languages where Whisper confuses Indic scripts in transcribe mode — use --translate to English. */
const INDIC_SCRIPTS = new Set(['kn', 'hi', 'ta', 'te', 'mr', 'gu', 'bn', 'pa', 'ml', 'sa', 'or', 'as', 'ne', 'ur']);

/**
 * Whether Whisper needs --translate for this language (Indic scripts produce
 * garbled text in transcribe mode; --translate reliably produces English).
 */
export function needsWhisperTranslate(langCode: string): boolean {
  return INDIC_SCRIPTS.has(langCode);
}

/** Convert a BCP-47 speech code to Whisper's short language code. */
export function speechCodeToWhisper(speechCode: string): string {
  return speechCode.split('-')[0].toLowerCase();
}

/** Find a language by its short code. */
export function findLanguage(code: string): Language | undefined {
  return LANGUAGES.find((l) => l.code === code);
}
