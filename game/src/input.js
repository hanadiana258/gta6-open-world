// rebuilt r8 — authored in this session
/* Handles input and browser events. */
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;

const KEY_LEFT = new Set(['ArrowLeft', 'KeyA']);
const KEY_RIGHT = new Set(['ArrowRight', 'KeyD']);
const KEY_CONFIRM = new Set(['Space', 'Enter']);
const KEY_PAUSE = new Set(['KeyP', 'Escape']);

export function createInput(target) {
    let left = false;
    let right = false;
    let actions = 0;

    window.addEventListener('keydown', (event) => {
        if (KEY_LEFT.has(event.code)) left = true;
        else if (KEY_RIGHT.has(event.code)) right = true;
        else if (KEY_CONFIRM.has(event.code)) {
            if (!event.repeat) actions |= ACTION_CONFIRM;
        } else if (KEY_PAUSE.has(event.code)) {
            if (!event.repeat) actions |= ACTION_PAUSE;
        } else return;
        event.preventDefault();
    });

    window.addEventListener('keyup', (event) => {
        if (KEY_LEFT.has(event.code)) left = false;
        else if (KEY_RIGHT.has(event.code)) right = false;
    });

    window.addEventListener('blur', () => {
        left = false;
        right = false;
    });

    target.addEventListener('pointerdown', () => {
        actions |= ACTION_CONFIRM;
    });

    return {
        direction: () => (right ? 1 : 0) - (left ? 1 : 0),
        takeActions: () => {
            const current = actions;
            actions = 0;
            return current;
        }
    };
}
