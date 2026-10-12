export type VoiceGender = "female" | "male";

interface TtsEngine {
  speak: (text: string) => void;
  stop: () => void;
  speaking: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setVoice: (v: SpeechSynthesisVoice) => void;
  rate: number;
  setRate: (r: number) => void;
  pitch: number;
  setPitch: (p: number) => void;
}

export const AVAILABLE_VOICES: Array<{
  name: string;
  gender: VoiceGender;
  lang: string;
}> = [
  { name: "Google हिन्दी", gender: "female", lang: "hi-IN" },
  { name: "Google UK English Female", gender: "female", lang: "en-GB" },
  { name: "Google US English", gender: "female", lang: "en-US" },
  { name: "Google Deutsch", gender: "female", lang: "de-DE" },
  { name: "Google Español", gender: "female", lang: "es-ES" },
  { name: "Microsoft Heera Online (Natural)", gender: "female", lang: "hi-IN" },
  { name: "Microsoft Zira Online (Natural)", gender: "female", lang: "en-US" },
  { name: "Microsoft David Online (Natural)", gender: "male", lang: "en-US" },
  { name: "Samantha", gender: "female", lang: "en-US" },
  { name: "Victoria", gender: "female", lang: "en-GB" },
];

let engineInstance: TtsEngine | null = null;

export function createTtsEngine(): TtsEngine {
  const synth = window.speechSynthesis;
  let speaking = false;
  const listeners = new Set<(s: boolean) => void>();

  const notify = (s: boolean) => listeners.forEach((l) => l(s));

  synth.onvoiceschanged = () => {
    engineInstance = buildEngine();
    notify(speaking);
  };

  function buildEngine(): TtsEngine {
    const voices = synth.getVoices();
    let selectedVoice = voices.find((v) => v.lang === "en-US" && v.name.includes("Zira")) ?? null;

    let rate = 0.9;
    let pitch = 1.0;

    function setSpeaking(s: boolean) {
      speaking = s;
      notify(s);
    }

    return {
      get voices() {
        return synth.getVoices();
      },
      get speaking() {
        return speaking;
      },
      get selectedVoice() {
        return selectedVoice;
      },
      setVoice(v) {
        selectedVoice = v;
      },
      get rate() {
        return rate;
      },
      setRate(r) {
        rate = r;
      },
      get pitch() {
        return pitch;
      },
      setPitch(p) {
        pitch = p;
      },
      speak(text: string) {
        if (!text) return;
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        if (selectedVoice) utterance.voice = selectedVoice;
        utterance.lang = selectedVoice?.lang ?? "en-US";
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = 1;
        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);
        synth.speak(utterance);
      },
      stop() {
        synth.cancel();
        setSpeaking(false);
      },
    };
  }

  const instance = buildEngine();
  engineInstance = instance;
  return instance;
}

export function getTtsEngine(): TtsEngine | null {
  return engineInstance;
}
