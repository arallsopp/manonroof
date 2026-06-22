/**
 * CompleteScreen — singleton
 */

const CompleteScreen = (() => {
    function _fmt(ms) {
        const totalSecs = Math.round(ms / 1000);
        const m = Math.floor(totalSecs / 60);
        const s = totalSecs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function render(totalExercises, skipped, durationMs) {
        const done = totalExercises - skipped;
        const skipNote = skipped > 0 ? ` (${skipped} skipped)` : '';

        document.getElementById('app').innerHTML = `
            <div class="screen screen-complete">
                <div class="complete-body">
                    <div class="complete-check">✓</div>
                    <h1 class="complete-title">Done!</h1>
                    <p class="complete-sub">${done} of ${totalExercises} exercises${skipNote}</p>
                    <p class="complete-time">${_fmt(durationMs)}</p>
                </div>
                <div class="complete-actions">
                    <button id="againBtn" class="primary-button">GO AGAIN</button>
                    <button id="homeBtn" class="secondary-button">Home</button>
                </div>
            </div>
        `;

        document.getElementById('againBtn').addEventListener('click', () => WorkoutController.start());
        document.getElementById('homeBtn').addEventListener('click', () => WorkoutController.goHome());
    }

    return { render };
})();
