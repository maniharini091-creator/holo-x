import React, { useState } from 'react';
import { Delete, Cpu } from 'lucide-react';
import { soundFx } from '../../services/soundFx';

export const CalculatorScreen: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleBtn = (val: string) => {
    soundFx.playKeyBeep(700);

    if (val === 'C') {
      setDisplay('0');
      setEquation('');
      return;
    }

    if (val === 'DEL') {
      setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      return;
    }

    if (val === '=') {
      try {
        // Sanitize equation and safely evaluate arithmetic
        const sanitized = equation + display;
        const cleanExpr = sanitized.replace(/×/g, '*').replace(/÷/g, '/');
        // Simple safe numeric evaluator
        const result = Function(`'use strict'; return (${cleanExpr})`)();
        setDisplay(String(Number(result.toFixed(6))));
        setEquation('');
      } catch {
        setDisplay('ERR');
      }
      return;
    }

    if (['+', '-', '×', '÷'].includes(val)) {
      setEquation(`${display} ${val} `);
      setDisplay('0');
      return;
    }

    if (display === '0' || display === 'ERR') {
      setDisplay(val);
    } else {
      setDisplay((prev) => prev + val);
    }
  };

  const BUTTONS = [
    ['C', 'DEL', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  return (
    <div className="h-full flex flex-col p-4 select-none justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div>
          <h2 className="text-sm font-bold font-orbitron text-cyan-400">Quantum Matrix Calc</h2>
          <p className="text-[9px] font-mono text-slate-400">TENSOR LOGIC UNIT</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-300">
          <Cpu className="w-3.5 h-3.5" />
          <span>RADIX: DEC</span>
        </div>
      </div>

      {/* Screen Display */}
      <div className="my-2 p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 flex flex-col justify-end text-right min-h-[76px] shadow-[0_0_15px_rgba(0,240,255,0.15)]">
        <span className="text-[10px] font-mono text-slate-400 tracking-wider h-4">
          {equation}
        </span>
        <span className="text-3xl font-extrabold font-orbitron text-white tracking-wider truncate">
          {display}
        </span>
      </div>

      {/* Keypad Grid */}
      <div className="grid grid-cols-4 gap-2 my-auto">
        {/* Row 1 */}
        <button
          onClick={() => handleBtn('C')}
          className="h-12 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold font-orbitron hover:bg-rose-900/60 cursor-pointer"
        >
          C
        </button>
        <button
          onClick={() => handleBtn('DEL')}
          className="h-12 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 flex items-center justify-center hover:text-white cursor-pointer"
        >
          <Delete className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleBtn('%')}
          className="h-12 rounded-xl bg-slate-800/80 border border-slate-700 text-cyan-300 font-orbitron hover:text-white cursor-pointer"
        >
          %
        </button>
        <button
          onClick={() => handleBtn('÷')}
          className="h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-bold text-lg hover:bg-cyan-900/60 cursor-pointer"
        >
          ÷
        </button>

        {/* Row 2 */}
        <button onClick={() => handleBtn('7')} className="calc-num-btn">7</button>
        <button onClick={() => handleBtn('8')} className="calc-num-btn">8</button>
        <button onClick={() => handleBtn('9')} className="calc-num-btn">9</button>
        <button onClick={() => handleBtn('×')} className="calc-op-btn">×</button>

        {/* Row 3 */}
        <button onClick={() => handleBtn('4')} className="calc-num-btn">4</button>
        <button onClick={() => handleBtn('5')} className="calc-num-btn">5</button>
        <button onClick={() => handleBtn('6')} className="calc-num-btn">6</button>
        <button onClick={() => handleBtn('-')} className="calc-op-btn">-</button>

        {/* Row 4 */}
        <button onClick={() => handleBtn('1')} className="calc-num-btn">1</button>
        <button onClick={() => handleBtn('2')} className="calc-num-btn">2</button>
        <button onClick={() => handleBtn('3')} className="calc-num-btn">3</button>
        <button onClick={() => handleBtn('+')} className="calc-op-btn">+</button>

        {/* Row 5 */}
        <button onClick={() => handleBtn('0')} className="col-span-2 h-12 rounded-xl bg-slate-900/60 border border-slate-800/80 text-white font-orbitron font-bold text-base hover:bg-slate-800 cursor-pointer">
          0
        </button>
        <button onClick={() => handleBtn('.')} className="calc-num-btn">.</button>
        <button
          onClick={() => handleBtn('=')}
          className="h-12 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xl font-orbitron shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer active:scale-95"
        >
          =
        </button>
      </div>
    </div>
  );
};
