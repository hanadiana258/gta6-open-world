// rebuilt r5 — authored by this session
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
