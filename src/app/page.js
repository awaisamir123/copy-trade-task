"use client";

import { useEffect, useState } from 'react';

export default function Home() {
  const [ws, setWs] = useState(null);
  const [tradeResult, setTradeResult] = useState(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3001');
    setWs(socket);

    socket.onopen = () => {
      console.log('Connected to Backend...');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setTradeResult(data);
      console.log('Displaying Trade Details:', data);
    };

    socket.onclose = () => {
      console.log('Client disconnected');
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleTrade = () => {
    if (ws) {
      console.log('(On Trade Button Press)');
      ws.send('trade');
    } else {
      console.log('WebSocket is not open.');
    }
  };

  return (
    <div className="container">
      <h1>Trade Simulator</h1>
      <button className="trade-button" onClick={handleTrade}>Trade</button>
      {tradeResult && (
        <div className="result">
          <h2>Trade Result</h2>
          <pre>{JSON.stringify(tradeResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
