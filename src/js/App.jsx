import React, { useState } from "react";
import VoiceNavigator from "../components/VoiceNavigator.jsx";
import "../App.css";

function App() {
  const [events, setEvents] = useState([]);

  const handleCommand = (c) => {
    setEvents((s) => [
      { time: new Date().toLocaleTimeString(), payload: c },
      ...s,
    ]);
    console.log("Voice command:", c);
  };

  return (
    <div
      className="app-root"
      style={{ padding: 20, fontFamily: "system-ui, sans-serif" }}
    >
      <h1>VoiceNav — demo</h1>

      <VoiceNavigator
        onCommand={handleCommand}
        commands={{
          "go to section": { action: "gotoSection" },
          "show help": { action: "help" },
        }}
      />

      <section style={{ marginTop: 20 }}>
        <h2>Command log</h2>
        {events.length === 0 ? (
          <div style={{ color: "#666" }}>
            No commands yet. Try "next", "previous", or speak a custom phrase
            like "go to section".
          </div>
        ) : (
          <ul>
            {events.map((e, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                <strong>{e.time}</strong>:{" "}
                <code>{JSON.stringify(e.payload)}</code>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;
