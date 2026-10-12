export type SttState = "idle" | "listening" | "processing";

export interface SttEngine {
  start: () => void;
  stop: () => void;
  isListening: boolean;
  state: SttState;
  transcript: string;
  onResult: (t: string) => void;
}

let sttInstance: SttEngine | null = null;

export function createSttEngine(onResult: (t: string) => void): SttEngine {
  const SR = (window.SpeechRecognition || window.webkitSpeechRecognition) as
    | SpeechRecognition
    | undefined;

  let isListening = false;
  let state: SttState = "idle";
  let transcript = "";

  const listeners = new Set<(s: boolean) => void>();
  const notify = () => listeners.forEach((l) => l(isListening));

  const instance: SttEngine = {
    get isListening() {
      return isListening;
    },
    get state() {
      return state;
    },
    get transcript() {
      return transcript;
    },
    onResult: (t: string) => onResult(t),
    start() {
      if (!SR) return;
      try {
        const rec = new SR();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-IN";

        rec.onstart = () => {
          isListening = true;
          state = "listening";
          notify();
        };

        rec.onresult = (e: SpeechRecognitionEvent) => {
          let interim = "";
          let final = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const r = e.results[i][0].transcript;
            if (e.results[i].isFinal) final += r;
            else interim += r;
          }
          transcript = final || interim;
          state = final ? "processing" : "listening";
        };

        rec.onend = () => {
          isListening = false;
          state = "idle";
          if (transcript) {
            onResult(transcript);
            transcript = "";
          }
          notify();
        };

        rec.onerror = () => {
          isListening = false;
          state = "idle";
          notify();
        };

        (instance as any)._rec = rec;
        rec.start();
      } catch {
        state = "idle";
      }
    },
    stop() {
      isListening = false;
      state = "idle";
      (instance as any)._rec?.stop();
      notify();
    },
  };

  sttInstance = instance;
  return instance;
}

export function getSttEngine(): SttEngine | null {
  return sttInstance;
}

export function isSttSupported(): boolean {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}
