// ============================================================================
// PINIK PIPRA - TUTORIAL SYSTEM
// ============================================================================

export interface TutorialStep {
    id: string;
    title: string;
    description: string;
    target?: string; // Element ID to highlight
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
    action?: 'tap' | 'swipe' | 'wait';
    actionLabel?: string;
    duration?: number; // Auto-advance after ms (0 = manual)
    emoji: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to Pinik Pipra!',
        description: 'Collect adorable neon insects and match them to score points!',
        position: 'center',
        emoji: '👋'
    },
    {
        id: 'tap',
        title: 'Tap to Collect',
        description: 'Tap on the falling insects to collect them!',
        target: 'game-area',
        position: 'bottom',
        action: 'tap',
        actionLabel: 'TAP ANYWHERE',
        duration: 0,
        emoji: '👆'
    },
    {
        id: 'combos',
        title: 'Build Combos!',
        description: 'Collect insects quickly in succession to build your combo multiplier!',
        target: 'score-display',
        position: 'top',
        emoji: '🔥'
    },
    {
        id: 'fever',
        title: 'Fever Mode!',
        description: 'Fill the fever bar by scoring to activate Fever Mode - everything slows down for massive points!',
        target: 'fever-bar',
        position: 'right',
        emoji: '🚀'
    },
    {
        id: 'powerups',
        title: 'Power-Ups!',
        description: 'Look for power-ups! 🛡️ Shield protects you, ⏰ Slow-Mo slows time!',
        target: 'powerup-area',
        position: 'left',
        emoji: '⚡'
    }
];

export interface TutorialState {
    completed: boolean;
    skipped: boolean;
    currentStep: number;
    totalSteps: number;
    completedAt?: number;
    stepCompletionTimes: number[];
}

export class TutorialSystem {
    private state: TutorialState;
    private listeners: Set<() => void> = new Set();
    private onCompleteCallback: (() => void) | null = null;
    private onStepCompleteCallback: ((step: TutorialStep) => void) | null = null;

    constructor() {
        this.state = this.load();
        // Reset if never completed
        if (!this.state.completed && !this.state.skipped) {
            this.state.currentStep = 0;
            this.state.stepCompletionTimes = [];
        }
    }

    private load(): TutorialState {
        try {
            const saved = localStorage.getItem('pinik_tutorial');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch {
            // Start fresh
        }
        return {
            completed: false,
            skipped: false,
            currentStep: 0,
            totalSteps: TUTORIAL_STEPS.length,
            stepCompletionTimes: []
        };
    }

    private save(): void {
        try {
            localStorage.setItem('pinik_tutorial', JSON.stringify(this.state));
        } catch {
            // Storage full
        }
    }

    // Check if tutorial should show
    shouldShow(): boolean {
        return !this.state.completed && !this.state.skipped;
    }

    // Get current step
    getCurrentStep(): TutorialStep | null {
        if (!this.shouldShow()) return null;
        return TUTORIAL_STEPS[this.state.currentStep] || null;
    }

    // Get all steps
    getAllSteps(): TutorialStep[] {
        return TUTORIAL_STEPS;
    }

    // Get progress (0-1)
    getProgress(): number {
        return this.state.currentStep / this.state.totalSteps;
    }

    // Advance to next step
    nextStep(): void {
        const currentStep = this.state.currentStep;
        const startTime = this.state.stepCompletionTimes[currentStep] || Date.now();
        const newCompletionTimes = [...this.state.stepCompletionTimes];
        newCompletionTimes[currentStep] = Date.now() - startTime;

        if (currentStep + 1 >= TUTORIAL_STEPS.length) {
            this.state = {
                ...this.state,
                completed: true,
                completedAt: Date.now(),
                stepCompletionTimes: newCompletionTimes
            };
            this.save();
            this.notify();
            if (this.onCompleteCallback) this.onCompleteCallback();
        } else {
            this.state = {
                ...this.state,
                currentStep: currentStep + 1,
                stepCompletionTimes: newCompletionTimes
            };
            this.save();
            this.notify();
        }
    }

    // Complete tutorial
    complete(): void {
        this.state = {
            ...this.state,
            completed: true,
            completedAt: Date.now()
        };
        this.save();
        this.notify();

        if (this.onCompleteCallback) {
            this.onCompleteCallback();
        }
    }

    // Skip tutorial
    skip(): void {
        this.state = {
            ...this.state,
            skipped: true
        };
        this.save();
        this.notify();
    }

    // Reset tutorial (for testing)
    reset(): void {
        this.state = {
            completed: false,
            skipped: false,
            currentStep: 0,
            totalSteps: TUTORIAL_STEPS.length,
            stepCompletionTimes: []
        };
        this.save();
        this.notify();
    }

    // Check if completed
    isCompleted(): boolean {
        return this.state.completed;
    }

    // Check if skipped
    isSkipped(): boolean {
        return this.state.skipped;
    }

    // Get state
    getState(): TutorialState {
        return this.state;
    }

    // Set callbacks
    onComplete(callback: () => void): void {
        this.onCompleteCallback = callback;
    }

    onStepComplete(callback: (step: TutorialStep) => void): void {
        this.onStepCompleteCallback = callback;
    }

    // Subscribe to changes
    subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notify(): void {
        this.listeners.forEach(l => l());
    }

    // Get tutorial statistics
    getStats(): {
        totalTime: number;
        averageStepTime: number;
        completed: boolean;
        skipped: boolean;
    } {
        const totalTime = this.state.stepCompletionTimes.reduce((a, b) => a + b, 0);
        const completedSteps = this.state.stepCompletionTimes.filter(t => t > 0).length;

        return {
            totalTime,
            averageStepTime: completedSteps > 0 ? totalTime / completedSteps : 0,
            completed: this.state.completed,
            skipped: this.state.skipped
        };
    }
}

// Singleton instance
export const tutorialSystem = new TutorialSystem();
