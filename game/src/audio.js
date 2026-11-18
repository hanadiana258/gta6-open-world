// authored r11 — written by this agent session
// Audio System
export const audioSystem = {
    muted: false,
    init() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    },
    toggleMute() {
        this.muted = !this.muted;
    },
    playGunshot() {
        if (this.muted) return;
        // implementation
    },
    playSiren() {
        if (this.muted) return;
        // implementation
    },
    playDing() {
        if (this.muted) return;
    },
    playArpeggio() {
        if (this.muted) return;
    },
    playSkid() {
        if (this.muted) return;
    }
};
