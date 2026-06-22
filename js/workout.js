/**
 * WorkoutController — singleton
 *
 * State machine: home → exercise → cooldown → exercise → … → complete
 *
 * One tap per exercise (DONE). Skip goes directly to next exercise (no cooldown).
 * Tracks elapsed time from start to complete.
 */

const WorkoutController = (() => {
    let _exercises = [];
    let _index = 0;
    let _phase = 'home'; // 'home' | 'exercise' | 'cooldown' | 'complete' | 'settings'
    let _startTime = null;
    let _skipped = 0;

    function init() {
        ExerciseData.load();
        HomeScreen.render();
    }

    function start() {
        AudioService.unlock();
        _exercises = ExerciseData.getActiveExercises();
        if (_exercises.length === 0) {
            alert('No exercises enabled. Go to Settings to enable some.');
            return;
        }
        _index = 0;
        _skipped = 0;
        _startTime = Date.now();
        _phase = 'exercise';
        _showExercise();
    }

    function _showExercise() {
        const ex = _exercises[_index];
        ExerciseScreen.render(ex, _index, _exercises.length);
        const announcement = ex.type === 'hold'
            ? `${ex.reps} second ${ex.name}`
            : `${ex.reps} ${ex.name}`;
        AudioService.speak(announcement);
    }

    // Tap DONE — exercise complete, go to cooldown.
    function tap() {
        if (_phase !== 'exercise') return;
        _phase = 'cooldown'; // guard against double-fire during the chime delay
        AudioService.chime();
        setTimeout(_goToCooldown, 350);
    }

    // SKIP — jump directly to next exercise, no cooldown.
    function skip() {
        if (_phase !== 'exercise') return;
        _skipped++;
        _phase = 'exercise';
        _index++;
        if (_index >= _exercises.length) {
            _finish();
        } else {
            _showExercise();
        }
    }

    function _goToCooldown() {
        const isLast = _index + 1 >= _exercises.length;
        const nextEx = isLast ? null : _exercises[_index + 1];
        const pct = Math.round((_index + 1) / _exercises.length * 100);
        const secs = ExerciseData.getConfig().cooldownSecs;
        CooldownScreen.render(nextEx, pct, secs);
    }

    // Called by CooldownScreen when timer fires or user skips cooldown.
    function advanceFromCooldown() {
        _index++;
        if (_index >= _exercises.length) {
            _finish();
        } else {
            _phase = 'exercise';
            _showExercise();
        }
    }

    function _finish() {
        _phase = 'complete';
        const durationMs = Date.now() - _startTime;
        const done = _exercises.length - _skipped;
        ExerciseData.saveWorkout(durationMs, done, _exercises.length);
        CompleteScreen.render(_exercises.length, _skipped, durationMs);
    }

    function goHome() {
        _phase = 'home';
        HomeScreen.render();
    }

    function openSettings() {
        _phase = 'settings';
        SettingsScreen.render();
    }

    function closeSettings() {
        _phase = 'home';
        HomeScreen.render();
    }

    return { init, start, tap, skip, advanceFromCooldown, goHome, openSettings, closeSettings };
})();
