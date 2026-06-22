/**
 * SettingsScreen — singleton
 *
 * Lets the user toggle exercises, adjust rep counts, and change the cooldown duration.
 * Changes persist to localStorage immediately via ExerciseData.
 */

const SettingsScreen = (() => {
    function render() {
        const config = ExerciseData.getConfig();

        const rows = config.exercises.map(ex => `
            <div class="settings-row" data-id="${ex.id}">
                <label class="toggle-wrap">
                    <input type="checkbox" class="ex-toggle" data-id="${ex.id}" ${ex.enabled ? 'checked' : ''}>
                    <span class="toggle-track"></span>
                </label>
                <span class="settings-name${ex.enabled ? '' : ' settings-name--off'}">${ex.name}</span>
                <div class="stepper">
                    <button class="stepper-btn rep-adj" data-id="${ex.id}" data-delta="-1">−</button>
                    <span class="stepper-val" id="rep-${ex.id}">${ex.reps}${ex.type === 'hold' ? 's' : ''}</span>
                    <button class="stepper-btn rep-adj" data-id="${ex.id}" data-delta="1">+</button>
                </div>
            </div>
        `).join('');

        document.getElementById('app').innerHTML = `
            <div class="screen screen-settings">
                <header class="screen-header">
                    <button class="btn-icon" id="btnBack" aria-label="Back">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                    </button>
                    <span class="screen-title">Settings</span>
                    <span class="header-spacer"></span>
                </header>

                <div class="settings-scroll">
                    <div class="settings-section">
                        <p class="settings-section-title">Cooldown rest</p>
                        <div class="settings-row">
                            <span class="settings-name">Duration</span>
                            <div class="stepper">
                                <button class="stepper-btn" id="cdDown">−</button>
                                <span class="stepper-val" id="cdVal">${config.cooldownSecs}s</span>
                                <button class="stepper-btn" id="cdUp">+</button>
                            </div>
                        </div>
                    </div>

                    <div class="settings-section">
                        <p class="settings-section-title">Exercises</p>
                        ${rows}
                    </div>

                    <button id="btnReset" class="reset-button">Reset to defaults</button>
                </div>
            </div>
        `;

        _attachEvents();
    }

    function _attachEvents() {
        document.getElementById('btnBack').addEventListener('click', () => WorkoutController.closeSettings());

        document.getElementById('cdDown').addEventListener('click', () => {
            const cur = ExerciseData.getConfig().cooldownSecs;
            ExerciseData.setCooldown(Math.max(5, cur - 5));
            document.getElementById('cdVal').textContent = ExerciseData.getConfig().cooldownSecs + 's';
        });

        document.getElementById('cdUp').addEventListener('click', () => {
            const cur = ExerciseData.getConfig().cooldownSecs;
            ExerciseData.setCooldown(Math.min(120, cur + 5));
            document.getElementById('cdVal').textContent = ExerciseData.getConfig().cooldownSecs + 's';
        });

        document.querySelectorAll('.ex-toggle').forEach(cb => {
            cb.addEventListener('change', e => {
                const id = e.target.dataset.id;
                ExerciseData.updateExercise(id, { enabled: e.target.checked });
                const nameEl = e.target.closest('.settings-row').querySelector('.settings-name');
                nameEl.classList.toggle('settings-name--off', !e.target.checked);
            });
        });

        document.querySelectorAll('.rep-adj').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = e.currentTarget.dataset.id;
                const delta = parseInt(e.currentTarget.dataset.delta, 10);
                const ex = ExerciseData.getConfig().exercises.find(x => x.id === id);
                if (!ex) return;
                const next = Math.max(1, Math.min(50, ex.reps + delta));
                ExerciseData.updateExercise(id, { reps: next });
                const label = document.getElementById(`rep-${id}`);
                if (label) label.textContent = next + (ex.type === 'hold' ? 's' : '');
            });
        });

        document.getElementById('btnReset').addEventListener('click', () => {
            if (confirm('Reset all exercises and settings to defaults?')) {
                ExerciseData.reset();
                render();
            }
        });
    }

    return { render };
})();
