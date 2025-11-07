# VoiceNavigator

A small React component that uses the browser Web Speech API (SpeechRecognition / webkitSpeechRecognition) to recognize spoken phrases and emit structured commands.

## Location

`src/components/VoiceNavigator.jsx` (JSX implementation)

> Note: Some editors/formatters may also create a `.js` copy. The project imports the `.jsx` file. Keep the `.jsx` file for best JSX parsing compatibility.

## Props

- `onCommand: (payload) => void` — required-ish. Called when a phrase is recognized. Payload shape:

  - `command: string` — normalized command identifier (e.g., "next", "start", or a custom key from `commands`).
  - `phrase: string` — the raw recognized transcript.
  - `meta?: any` — optional metadata from the `commands` map.

- `commands: Record<string, any>` — optional. A map of phrase keys to arbitrary payloads. If the recognized transcript contains a key (substring match, case-insensitive), that key is used as the `command` and `meta` contains the mapped value.

## Built-in keywords

The component detects several simple keywords automatically and maps them to commands:

- next
- previous (also matches "back" / "prev")
- start (also matches "play")
- stop (also matches "pause")
- open
- close
- help (also matches "what can i say")

If none of the rules match, the component emits `{ command: 'unknown', phrase }`.

## Example

```jsx
import VoiceNavigator from "./components/VoiceNavigator.jsx";

function App() {
  const handleCommand = (payload) => {
    console.log("voice command", payload);
  };

  return (
    <VoiceNavigator
      onCommand={handleCommand}
      commands={{
        "go to section": { action: "gotoSection" },
        "show help": { action: "help" },
      }}
    />
  );
}
```

## Browser support and testing

- The component relies on the Web Speech API. Chrome and Edge (desktop) have the best support. Firefox and Safari have inconsistent or limited support.
- Test with the Vite dev server running: `npm run dev` and open `http://localhost:5173`.

## Security & UX notes

- The browser may prompt the user for microphone permissions. The component does not request permissions proactively; starting recognition will trigger browser permission flows.
- Use clear command phrases for best recognition results. Consider offering a visual help panel showing supported phrases.

## Next steps / Improvements

- Add unit tests using Vitest + @testing-library/react (requires adding dev dependencies).
- Add a Storybook story to interactively test and document the component.
- Provide a small hook wrapper (useVoiceNavigator) for non-UI usage.
