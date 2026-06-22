/**
 * ExerciseScreen — singleton
 *
 * One DONE tap per exercise. SKIP in the header jumps to next exercise.
 * Both buttons are disabled immediately on press to prevent accidental double-fire.
 *
 * Hold exercises: countdown timer shown as a guide; tap DONE when finished.
 */

const ExerciseScreen = (() => {
    let _holdInterval = null;

    function render(exercise, exerciseIndex, totalExercises) {
        _stopHoldTimer();

        const isHold = exercise.type === 'hold';
        const repLabel = isHold ? `${exercise.reps} seconds` : `${exercise.reps} reps`;

        document.getElementById('app').innerHTML = `
            <div class="screen screen-exercise">
                <header class="screen-header">
                    <button class="btn-icon" id="btnQuit" aria-label="Quit workout">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                    <span class="exercise-pos">${exerciseIndex + 1} / ${totalExercises}</span>
                    <button class="btn-text" id="btnSkip">SKIP</button>
                </header>

                <div class="exercise-info">
                    <h1 class="exercise-name">${exercise.name}</h1>
                    <p class="exercise-reps">${repLabel}</p>
                    <div class="diagram-placeholder">
                        <span class="diagram-label">Diagram</span>
                    </div>
                    ${isHold ? `
                        <div class="hold-display">
                            <span id="holdTimer" class="hold-seconds">${exercise.reps}</span>
                            <span class="hold-unit">sec remaining</span>
                        </div>` : ''}
                </div>

                <button id="tapBtn" class="tap-button">DONE</button>
            </div>
        `;

        document.getElementById('tapBtn').addEventListener('click', _onDone);
        document.getElementById('btnSkip').addEventListener('click', _onSkip);
        document.getElementById('btnQuit').addEventListener('click', _onQuit);

        if (isHold) _startHoldTimer(exercise.reps);
    }

    function _lockButton(id) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.disabled = true;
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.35';
    }

    function _onDone() {
        // Disable immediately — prevents rapid-tap advancing past this screen
        _lockButton('tapBtn');
        _lockButton('btnSkip');
        _stopHoldTimer();
        WorkoutController.tap();
    }

    function _onSkip() {
        _lockButton('btnSkip');
        _lockButton('tapBtn');
        _stopHoldTimer();
        WorkoutController.skip();
    }

    function _onQuit() {
        _lockButton('btnQuit');
        if (confirm('Quit workout?')) {
            _stopHoldTimer();
            WorkoutController.goHome();
        } else {
            // Re-enable if they cancel
            const btn = document.getElementById('btnQuit');
            if (btn) { btn.disabled = false; btn.style.pointerEvents = ''; btn.style.opacity = ''; }
        }
    }

    function _startHoldTimer(totalSecs) {
        let elapsed = 0;
        _holdInterval = setInterval(() => {
            elapsed++;
            const remaining = Math.max(0, totalSecs - elapsed);
            const el = document.getElementById('holdTimer');
            if (el) el.textContent = remaining;
            if (remaining === 0) {
                _stopHoldTimer();
                const btn = document.getElementById('tapBtn');
                if (btn) btn.classList.add('tap-button--ready');
            }
        }, 1000);
    }

    function _stopHoldTimer() {
        if (_holdInterval) {
            clearInterval(_holdInterval);
            _holdInterval = null;
        }
    }

    return { render };
})();
