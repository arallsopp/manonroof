/**
 * CooldownScreen — singleton
 *
 * Auto-advances after cooldownSecs. "Tap to skip" is disabled immediately on press
 * to prevent double-fire into the next exercise screen.
 */

const CooldownScreen = (() => {
    let _timeout = null;
    let _interval = null;

    function render(nextExercise, percentComplete, cooldownSecs) {
        _clear();

        document.getElementById('app').innerHTML = `
            <div class="screen screen-cooldown">
                <div class="cooldown-top">
                    <span class="cooldown-label">REST</span>
                    <div class="cooldown-timer-wrap">
                        <span id="cdCount" class="cooldown-count">${cooldownSecs}</span>
                    </div>
                </div>

                <div class="cooldown-progress-wrap">
                    <div class="progress-track">
                        <div class="progress-fill" style="width:${percentComplete}%"></div>
                    </div>
                    <span class="progress-pct">${percentComplete}% complete</span>
                </div>

                <div class="next-card">
                    <span class="next-label">NEXT UP</span>
                    ${nextExercise ? (() => {
                        const imgs = ExerciseData.getImages(nextExercise.id);
                        return `<span class="next-name">${nextExercise.name}</span>
                                ${imgs.length
                                    ? `<img class="exercise-img exercise-img--sm" src="${imgs[0]}" alt="${nextExercise.name}">`
                                    : `<div class="diagram-placeholder diagram-sm"><span class="diagram-label">Diagram</span></div>`
                                }`;
                    })() : `<span class="next-name">Final exercise done!</span>`}
                </div>

                <button id="skipBtn" class="skip-button" touch-action="manipulation">tap to skip</button>
            </div>
        `;

        document.getElementById('skipBtn').addEventListener('click', _onSkip);

        let remaining = cooldownSecs;
        _interval = setInterval(() => {
            remaining--;
            const el = document.getElementById('cdCount');
            if (el) el.textContent = remaining;
            if (remaining <= 0) _clear();
        }, 1000);

        _timeout = setTimeout(() => {
            _clear();
            WorkoutController.advanceFromCooldown();
        }, cooldownSecs * 1000);
    }

    function _onSkip() {
        // Disable immediately before any async work
        const btn = document.getElementById('skipBtn');
        if (btn) {
            btn.disabled = true;
            btn.style.pointerEvents = 'none';
        }
        _clear();
        WorkoutController.advanceFromCooldown();
    }

    function _clear() {
        if (_timeout)  { clearTimeout(_timeout);  _timeout  = null; }
        if (_interval) { clearInterval(_interval); _interval = null; }
    }

    return { render };
})();
