/**
 * ExerciseScreen — singleton
 *
 * One DONE tap per exercise. SKIP in the header jumps to next exercise.
 * Both buttons are disabled immediately on press to prevent double-fire.
 *
 * Multi-image exercises cycle through their frames every 500ms.
 * Hold exercises show a countdown timer as a guide.
 */

const ExerciseScreen = (() => {
    let _holdInterval  = null;
    let _imageInterval = null;

    function render(exercise, exerciseIndex, totalExercises) {
        _stopTimers();

        const isHold   = exercise.type === 'hold';
        const repLabel = isHold ? `${exercise.reps} seconds` : `${exercise.reps} reps`;
        const images   = ExerciseData.getImages(exercise.id);
        const hasImg   = images.length > 0;

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
                    ${hasImg
                        ? `<img id="exerciseImg" class="exercise-img" src="${images[0]}" alt="${exercise.name}">`
                        : `<div class="diagram-placeholder"><span class="diagram-label">Diagram</span></div>`
                    }
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

        if (images.length > 1) _startImageCycle(images);
        if (isHold)            _startHoldTimer(exercise.reps);
    }

    function _lockButton(id) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.disabled = true;
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.35';
    }

    function _onDone() {
        _lockButton('tapBtn');
        _lockButton('btnSkip');
        _stopTimers();
        WorkoutController.tap();
    }

    function _onSkip() {
        _lockButton('btnSkip');
        _lockButton('tapBtn');
        _stopTimers();
        WorkoutController.skip();
    }

    function _onQuit() {
        _lockButton('btnQuit');
        if (confirm('Quit workout?')) {
            _stopTimers();
            WorkoutController.goHome();
        } else {
            const btn = document.getElementById('btnQuit');
            if (btn) { btn.disabled = false; btn.style.pointerEvents = ''; btn.style.opacity = ''; }
        }
    }

    function _startImageCycle(images) {
        let idx = 0;
        _imageInterval = setInterval(() => {
            idx = (idx + 1) % images.length;
            const img = document.getElementById('exerciseImg');
            if (img) img.src = images[idx];
        }, 500);
    }

    function _startHoldTimer(totalSecs) {
        let elapsed = 0;
        _holdInterval = setInterval(() => {
            elapsed++;
            const remaining = Math.max(0, totalSecs - elapsed);
            const el = document.getElementById('holdTimer');
            if (el) el.textContent = remaining;
            if (remaining === 0) {
                clearInterval(_holdInterval);
                _holdInterval = null;
                const btn = document.getElementById('tapBtn');
                if (btn) btn.classList.add('tap-button--ready');
            }
        }, 1000);
    }

    function _stopTimers() {
        if (_holdInterval)  { clearInterval(_holdInterval);  _holdInterval  = null; }
        if (_imageInterval) { clearInterval(_imageInterval); _imageInterval = null; }
    }

    return { render };
})();
