import { useRef, useEffect } from "react";

const HISTORY_LENGTH = 200;

export function DataGraph({ dataA, dataB, focusedSphere, onClearFocus }: { dataA: number[], dataB: number[], focusedSphere: 'A' | 'B' | null, onClearFocus: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Clear
    ctx.clearRect(0, 0, width, height);
    
    // Background Grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2); // Zero line
    ctx.stroke();

    // Data Processing based on Focus
    let drawDataA: number[] = [];
    let drawDataB: number[] = [];
    let maxLen = 0;

    if (focusedSphere === 'A') {
        drawDataA = dataA;
        maxLen = dataA.length;
    } else if (focusedSphere === 'B') {
        drawDataB = dataB;
        maxLen = dataB.length;
    } else {
        // Monitor Mode: Last 200 points
        const windowSize = HISTORY_LENGTH;
        drawDataA = dataA.slice(-windowSize);
        drawDataB = dataB.slice(-windowSize);
        maxLen = windowSize;
    }

    const drawLine = (data: number[], color: string) => {
      if (data.length === 0) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const xStep = width / (maxLen > 1 ? maxLen - 1 : 1);
      
      data.forEach((val, i) => {
        // Y Scale: 1 unit speed = 20 pixels
        const y = (height / 2) - (val * 20); 
        const x = i * xStep;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    };

    if (focusedSphere !== 'B') drawLine(drawDataA, '#ff5555');
    if (focusedSphere !== 'A') drawLine(drawDataB, '#5555ff');

  }, [dataA, dataB, focusedSphere]);

  return (
    <div style={{ background: 'rgba(0,0,0,0.8)', padding: '10px', borderRadius: '8px', marginTop: '10px', pointerEvents: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
        <div style={{ color: 'white', fontSize: '12px' }}>
            {focusedSphere ? `History: Sphere ${focusedSphere}` : 'Real-time Monitor'}
        </div>
        {focusedSphere && (
            <button 
                onClick={onClearFocus}
                style={{ background: '#444', border: 'none', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer' }}
            >
                Back to Monitor
            </button>
        )}
      </div>
      <canvas ref={canvasRef} width={300} height={100} />
    </div>
  );
}
