/**
 * HomeScreen — singleton
 */

const HomeScreen = (() => {
    function _fmt(ms) {
        const totalSecs = Math.round(ms / 1000);
        const m = Math.floor(totalSecs / 60);
        const s = totalSecs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function render() {
        const config = ExerciseData.getConfig();
        const active = ExerciseData.getActiveExercises();
        const totalReps = active.reduce((sum, ex) => sum + (ex.type === 'hold' ? 0 : ex.reps), 0);

        const last = ExerciseData.getHistory()[0];
        const lastLine = last
            ? `Last: ${new Date(last.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · ${_fmt(last.durationMs)}`
            : '';

        document.getElementById('app').innerHTML = `
            <div class="screen screen-home">
                <header class="screen-header">
                    <span></span>
                    <button class="btn-icon" id="btnSettings" aria-label="Settings">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                        </svg>
                    </button>
                </header>

                <div class="home-body">
                    <div class="home-badge">WORKOUT</div>
                    <div class="home-meta">
                        <span>${active.length} exercises</span>
                        <span class="meta-dot">·</span>
                        <span>${totalReps} reps</span>
                        <span class="meta-dot">·</span>
                        <span>${config.cooldownSecs}s rest</span>
                    </div>
                    ${lastLine ? `<p class="home-last">${lastLine}</p>` : ''}
                </div>

                <button id="btnStart" class="primary-button">START</button>
            </div>
        `;

        document.getElementById('btnStart').addEventListener('click', () => WorkoutController.start());
        document.getElementById('btnSettings').addEventListener('click', () => WorkoutController.openSettings());
    }

    return { render };
})();
