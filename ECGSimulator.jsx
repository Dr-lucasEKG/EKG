import { useEffect, useRef, useState } from "react";

const rhythms = {
  sinusal: "Sinusal",
  taquicardia: "Taquicardia",
  bradicardia: "Bradicardia",
  fibrilacao: "Fibrilação Atrial",
  bloqueio_av: "Bloqueio AV",
};

const leadLabels = [
  "DI", "DII", "DIII", "aVR", "aVL", "aVF", "V1", "V2", "V3", "V4", "V5", "V6"
];

function generateWaveform(rhythm, t) {
  const base = (center, width, amplitude = 1) => (x) => amplitude * Math.exp(-((x - center) * width) ** 2);
  let wave = new Array(t.length).fill(0);
  switch (rhythm) {
    case "sinusal":
      return wave.map((_, i) =>
        base(0.1, 50)(t[i]) + -base(0.2, 300, 0.8)(t[i]) + base(0.22, 100, 1.6)(t[i]) + -base(0.25, 200, 0.6)(t[i]) + base(0.4, 40, 0.4)(t[i])
      );
    case "taquicardia":
      return wave.map((_, i) =>
        base(0.05, 70)(t[i]) + base(0.12, 80, 1.4)(t[i]) + base(0.15, 100, 0.3)(t[i])
      );
    case "bradicardia":
      return wave.map((_, i) => base(0.2, 30)(t[i]) + base(0.4, 100, 0.5)(t[i]));
    case "fibrilacao":
      return wave.map(() => 0.2 * Math.sin(50 * Math.random()));
    case "bloqueio_av":
      return wave.map((_, i) => base(0.1, 50)(t[i]) + base(0.3, 80, 0.2)(t[i]));
    default:
      return wave;
  }
}

export default function ECGSimulator() {
  const canvasRef = useRef(null);
  const [rhythm, setRhythm] = useState("sinusal");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const fs = 500;
    const t = Array.from({ length: fs }, (_, i) => i / fs);
    const leads = 12;
    const totalLeads = leads + 1; // 12 derivações + DII longo
    const leadHeight = height / totalLeads;

    function drawAllLeads() {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);

      for (let l = 0; l < leads; l++) {
        const yBuffer = generateWaveform(rhythm, t);
        const yOffset = l * leadHeight;

        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.fillText(leadLabels[l], 10, yOffset + 15);

        ctx.strokeStyle = "black";
        ctx.beginPath();
        for (let i = 0; i < yBuffer.length; i++) {
          const xPos = (i / yBuffer.length) * width;
          const yPos = yOffset + leadHeight / 2 - yBuffer[i] * 40;
          if (i === 0) ctx.moveTo(xPos, yPos);
          else ctx.lineTo(xPos, yPos);
        }
        ctx.stroke();
      }

      const longT = Array.from({ length: fs * 10 }, (_, i) => i / fs);
      const longY = generateWaveform(rhythm, longT);
      const yOffset = leads * leadHeight;

      ctx.fillStyle = "black";
      ctx.font = "12px Arial";
      ctx.fillText("DII Longo", 10, yOffset + 15);

      ctx.strokeStyle = "black";
      ctx.beginPath();
      for (let i = 0; i < longY.length; i++) {
        const xPos = (i / longY.length) * width;
        const yPos = yOffset + leadHeight / 2 - longY[i] * 40;
        if (i === 0) ctx.moveTo(xPos, yPos);
        else ctx.lineTo(xPos, yPos);
      }
      ctx.stroke();
    }

    const interval = setInterval(() => {
      drawAllLeads();
    }, 1500);

    return () => clearInterval(interval);
  }, [rhythm]);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Simulador de ECG - 12 Derivações + DII Longo</h1>
      <select
        className="mb-4 p-2 bg-gray-200 text-black"
        value={rhythm}
        onChange={(e) => setRhythm(e.target.value)}
      >
        {Object.entries(rhythms).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <canvas ref={canvasRef} width={1000} height={700} className="rounded shadow bg-white border" />
    </div>
  );
}
