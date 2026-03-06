import React, { useEffect, useSyncExternalStore } from 'react';
import { tutorialSystem } from '../utils/tutorial';

function subscribe(callback: () => void) {
    return tutorialSystem.subscribe(callback);
}

function getSnapshot() {
    return tutorialSystem.getState();
}

export default function TutorialOverlay() {
    const state = useSyncExternalStore(subscribe, getSnapshot);

    useEffect(() => {
        // Handle auto-advance duration
        const currentStep = tutorialSystem.getCurrentStep();
        if (currentStep && currentStep.duration && currentStep.duration > 0) {
            const timer = setTimeout(() => {
                tutorialSystem.nextStep();
            }, currentStep.duration);
            return () => clearTimeout(timer);
        }
    }, [state.currentStep]);

    if (!tutorialSystem.shouldShow()) return null;

    const currentStep = tutorialSystem.getCurrentStep();
    if (!currentStep) return null;

    // Positioning classes (using flex-col so items-align controls cross axis X, justify controls main axis Y)
    let positioning = 'items-center justify-center'; // center
    if (currentStep.position === 'top') positioning = 'items-center justify-start pt-24';
    if (currentStep.position === 'bottom') positioning = 'items-center justify-end pb-32';
    if (currentStep.position === 'left') positioning = 'items-start justify-center pl-8';
    if (currentStep.position === 'right') positioning = 'items-end justify-center pr-8';

    return (
        <div className={`absolute inset-0 z-40 pointer-events-none flex flex-col ${positioning} p-6`}>
            <div className={`bg-slate-900/90 backdrop-blur-md border border-cyan-500/50 rounded-2xl p-6 max-w-sm shadow-[0_0_40px_rgba(6,182,212,0.3)] pointer-events-auto transform transition-all duration-300`}>
                <div className="text-5xl text-center mb-4 animate-bounce">{currentStep.emoji}</div>
                <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 mb-3 text-center tracking-tight">
                    {currentStep.title}
                </h2>
                <p className="text-white/90 font-mono text-sm leading-relaxed mb-6 text-center">
                    {currentStep.description}
                </p>
                <div className="flex gap-4 justify-between items-center">
                    <button
                        onClick={(e) => { e.stopPropagation(); tutorialSystem.skip(); }}
                        className="px-4 py-2 text-white/50 hover:text-white font-mono text-xs uppercase transition-colors"
                    >
                        Skip Tour
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            tutorialSystem.nextStep();
                        }}
                        className="px-6 py-2 bg-white text-black rounded-full font-black text-sm uppercase shadow-[0_0_15px_rgba(255,255,255,0.5)] hover:scale-105 active:scale-95 transition-all"
                    >
                        {currentStep.actionLabel || "NEXT"}
                    </button>
                </div>
                {/* Progress Indicators */}
                <div className="flex justify-center gap-1.5 mt-5">
                    {tutorialSystem.getAllSteps().map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${idx === state.currentStep ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee] scale-125' : 'bg-white/20'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
