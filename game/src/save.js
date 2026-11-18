// authored r11 — written by this agent session
// Save System
export const saveSystem = {
    save(data) {
        localStorage.setItem('solano-save', JSON.stringify(data));
    },
    load() {
        return JSON.parse(localStorage.getItem('solano-save'));
    },
    clear() {
        localStorage.removeItem('solano-save');
    }
};
