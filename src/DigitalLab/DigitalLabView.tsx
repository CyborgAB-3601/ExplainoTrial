import React, { useState } from 'react';
import { ArrowLeft, FlaskConical, Sliders, Play, RotateCcw, Sparkles } from 'lucide-react';

export interface DigitalLabViewProps {
  onBack?: () => void;
  className?: string;
}

export const DigitalLabView: React.FC<DigitalLabViewProps> = ({
  onBack,
  className = '',
}) => {
  const [lightIntensity, setLightIntensity] = useState(65);
  const [co2Concentration, setCo2Concentration] = useState(400);
  const [temperature, setTemperature] = useState(25);

  // Simulated rate of photosynthesis:
  const rateOfPhotosynthesis = Math.round(
    (lightIntensity * 0.4 + co2Concentration * 0.08) * (1 - Math.abs(temperature - 28) * 0.035)
  );

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-[#FAF8FE] text-[#1E1926] font-sans ${className}`}>
      {/* Top Header */}
      <header className="h-16 px-6 border-b border-purple-100/80 bg-white/70 backdrop-blur-xl flex items-center justify-between shrink-0 shadow-xs z-20">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl text-slate-600 hover:text-purple-700 hover:bg-purple-100/50 transition-all flex items-center gap-1.5 cursor-pointer font-bold text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Wheel</span>
            </button>
          )}
          <div className="h-4 w-[1px] bg-slate-200 mx-1" />
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C5CFF] to-[#EC4899] flex items-center justify-center text-white shadow-sm shadow-purple-500/20">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-[#1E1926]">Nilo Digital Lab</span>
              <p className="text-[11px] text-slate-500">Virtual experiment sandboxes & live parameter simulations</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Simulation View */}
      <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full space-y-6 [scrollbar-width:none]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Sliders */}
          <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-[#1E1926] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#7C5CFF]" />
              <span>Control Parameters</span>
            </h3>

            {/* Slider 1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Light Intensity</span>
                <span className="text-[#7C5CFF] font-bold">{lightIntensity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={lightIntensity}
                onChange={(e) => setLightIntensity(Number(e.target.value))}
                className="w-full accent-[#7C5CFF] cursor-pointer"
              />
            </div>

            {/* Slider 2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>CO₂ Concentration</span>
                <span className="text-[#7C5CFF] font-bold">{co2Concentration} ppm</span>
              </div>
              <input
                type="range"
                min="200"
                max="1000"
                step="50"
                value={co2Concentration}
                onChange={(e) => setCo2Concentration(Number(e.target.value))}
                className="w-full accent-[#7C5CFF] cursor-pointer"
              />
            </div>

            {/* Slider 3 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Temperature (°C)</span>
                <span className="text-[#7C5CFF] font-bold">{temperature}°C</span>
              </div>
              <input
                type="range"
                min="10"
                max="45"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-[#7C5CFF] cursor-pointer"
              />
            </div>
          </div>

          {/* Right 2 Columns: Live Results */}
          <div className="md:col-span-2 p-6 rounded-3xl bg-white border border-purple-100 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#7C5CFF] uppercase tracking-wider">Experiment Workbench: Photosynthesis</span>
              <h3 className="text-base font-extrabold text-[#1E1926] mt-1">Oxygen Evolution Rate Simulation</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Observe how varying photon flux and enzymatic thermal optimum influence the Net Photosynthetic Rate.
              </p>

              {/* Big Gauge Card */}
              <div className="my-8 p-6 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50/60 border border-purple-200/60 flex items-center justify-around text-center">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Simulated O₂ Yield</span>
                  <div className="text-4xl font-black text-[#7C5CFF] mt-1">{rateOfPhotosynthesis} <span className="text-base font-bold text-slate-600">μmol/m²s</span></div>
                </div>
                <div className="h-12 w-[1px] bg-purple-200" />
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Enzyme State</span>
                  <div className="text-lg font-bold text-emerald-600 mt-1">
                    {temperature > 38 ? '⚠️ Denaturing' : temperature < 18 ? '❄️ Sub-optimal' : '✅ Optimal'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setLightIntensity(65);
                  setCo2Concentration(400);
                  setTemperature(25);
                }}
                className="px-4 py-2 rounded-xl border border-purple-200 text-purple-700 text-xs font-bold flex items-center gap-1.5 hover:bg-purple-50 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Simulation</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
