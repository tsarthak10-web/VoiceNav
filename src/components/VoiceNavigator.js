import React, { useEffect, useRef, useState } from 'react';

// Simple VoiceNavigator component using the Web Speech API (SpeechRecognition).
// Props:
// - onCommand: function({ command, phrase }) called when a command is recognized.
// - commands: optional object mapping custom phrase keys to arbitrary payloads. If a recognized transcript contains a key, it's used as the command.
// Example usage:
// <VoiceNavigator onCommand={(c) => console.log(c)} commands={{"go to section": {action: 'gotoSection'}}} />

const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition) ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

export default function VoiceNavigator({ onCommand, commands = {} }) {
  const [supported] = useState(!!SpeechRecognition);
  const [listening, setListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!supported) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      try {
        const result = event.results[event.results.length - 1][0].transcript.trim();
        setLastTranscript(result);
        handleTranscript(result);
      } catch (err) {
        console.error('VoiceNavigator: result parse error', err);
      }
    };

    recognition.onerror = (err) => {
      console.warn('VoiceNavigator recognition error', err);
    };

    recognition.onend = () => {
      // When recognition naturally ends, reflect the state.
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    };
  }, [supported]);

  const handleTranscript = (text) => {
    const normalized = text.toLowerCase();

    // First check any custom commands keys (exact substring match)
    for (const key of Object.keys(commands)) {
      if (normalized.includes(key.toLowerCase())) {
        const payload = { command: key, phrase: text, meta: commands[key] };
        onCommand && onCommand(payload);
        return;
      }
    }

    // Fallback to built-in simple keyword mapping
    const keywordMap = [
      [/\bnext\b/i, 'next'],
      [/\b(previous|back|prev)\b/i, 'previous'],
      [/\b(start|play)\b/i, 'start'],
      [/\b(stop|pause)\b/i, 'stop'],
      [/\b(open)\b/i, 'open'],
      [/\b(close)\b/i, 'close'],
      [/\b(help|what can i say)\b/i, 'help'],
    ];

    for (const [re, cmd] of keywordMap) {
      if (re.test(text)) {
        onCommand && onCommand({ command: cmd, phrase: text });
        return;
      }
    }

    // Unknown command
    onCommand && onCommand({ command: 'unknown', phrase: text });
  };

  const start = () => {
    if (!supported || !recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (e) {
      // Some browsers throw if start is called while already running
      console.warn('VoiceNavigator start warning', e);
    }
  };

  const stop = () => {
    if (!supported || !recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.warn('VoiceNavigator stop warning', e);
    }
    setListening(false);
  };

  return (
    <div className="voice-navigator" style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
      <div style={{ fontWeight: 600 }}>
        Voice Navigator {supported ? (listening ? '— listening' : '— idle') : '— not supported in this browser'}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={start} disabled={!supported || listening}>Start</button>
        <button onClick={stop} disabled={!supported || !listening}>Stop</button>
      </div>

      <div style={{ fontSize: 13, color: '#333' }}>
        <strong>Last phrase:</strong> {lastTranscript || <em>—</em>}
      </div>

      <div style={{ fontSize: 12, color: '#666' }}>
        Tips: Try saying "next", "previous", "open", or configure custom phrases via the <code>commands</code> prop.
      </div>
    </div>
  );
}
