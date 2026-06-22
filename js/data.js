/**
 * ExerciseData — singleton
 *
 * Holds the exercise list and user config. Persists to localStorage so each
 * device keeps its own settings independently.
 */

const ExerciseData = (() => {
    const STORAGE_KEY = 'workout_config_v1';

    const DEFAULTS = {
        cooldownSecs: 15,
        exercises: [
            { id: 'pushups',            name: 'Push-ups',             reps: 10, type: 'reps', enabled: true },
            { id: 'shoulder_taps',      name: 'Shoulder Taps',        reps: 10, type: 'reps', enabled: true },
            { id: 'commandos',          name: 'Commandos',            reps: 10, type: 'reps', enabled: true },
            { id: 'lat_pull_pushup',    name: 'Lat Pull to Push-up',  reps: 10, type: 'reps', enabled: true },
            { id: 'plank_toe_touches',  name: 'Plank Toe Touches',    reps: 10, type: 'reps', enabled: true },
            { id: 'calf_hops',          name: 'Calf Hops',            reps: 10, type: 'reps', enabled: true },
            { id: 'crunch_pause',       name: 'Crunch Pause',         reps: 10, type: 'reps', enabled: true },
            { id: 'oblique_r',          name: 'Oblique Crunch Right', reps: 10, type: 'reps', enabled: true },
            { id: 'oblique_l',          name: 'Oblique Crunch Left',  reps: 10, type: 'reps', enabled: true },
            { id: 'twisting_tabletop',  name: 'Twisting Tabletop',    reps: 10, type: 'reps', enabled: true },
            { id: 'reverse_crunch',     name: 'Reverse Crunch',       reps: 10, type: 'reps', enabled: true },
            { id: 'leg_hip_lift',       name: 'Leg Lift + Hip Lift',  reps: 10, type: 'reps', enabled: true },
            { id: 'plank_knee_tucks',   name: 'Plank Knee Tucks',     reps: 10, type: 'reps', enabled: true },
            { id: 'frog_extensions',    name: 'Frog Extensions',      reps: 10, type: 'reps', enabled: true },
            { id: 'skullcrusher',       name: 'Skullcrusher Push-ups',reps: 10, type: 'reps', enabled: true },
            { id: 'mountain_climbers',  name: 'Mountain Climbers',    reps: 10, type: 'reps', enabled: true },
            { id: 'lateral_pushup',     name: 'Lateral Push-up',      reps: 10, type: 'reps', enabled: true },
            { id: 'plank_rows',         name: 'Plank Rows',           reps: 10, type: 'reps', enabled: true },
            { id: 'superman_hold',      name: 'Superman Hold',        reps: 20, type: 'hold', enabled: true },
        ],
    };

    let _config = null;

    function load() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                _config = JSON.parse(stored);
            } else {
                _config = _deepCopy(DEFAULTS);
            }
        } catch (_) {
            _config = _deepCopy(DEFAULTS);
        }
    }

    function _deepCopy(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function _save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(_config));
    }

    function getConfig() {
        if (!_config) load();
        return _config;
    }

    function getActiveExercises() {
        return getConfig().exercises.filter(e => e.enabled);
    }

    function updateExercise(id, changes) {
        const ex = getConfig().exercises.find(e => e.id === id);
        if (ex) {
            Object.assign(ex, changes);
            _save();
        }
    }

    function setCooldown(secs) {
        getConfig().cooldownSecs = secs;
        _save();
    }

    function reset() {
        _config = _deepCopy(DEFAULTS);
        _save();
    }

    // ── Workout history ────────────────────────────────────────────────────
    const HISTORY_KEY = 'workout_history_v1';
    const MAX_HISTORY = 30;

    function saveWorkout(durationMs, exercisesDone, totalExercises) {
        let history = getHistory();
        history.unshift({ date: new Date().toISOString(), durationMs, exercisesDone, totalExercises });
        if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }

    function getHistory() {
        try {
            return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
        } catch (_) { return []; }
    }

    return { load, getConfig, getActiveExercises, updateExercise, setCooldown, reset, saveWorkout, getHistory };
})();
