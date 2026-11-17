/* Demo shot state manager for recording/automated play. */
export const shotsSystem = {
    handleUrlParams() {
        const params = new URLSearchParams(window.location.search);
        if (!params.has('shot')) return;
        
        window.__solanoReady = false;
        const shot = params.get('shot');
        const t = parseFloat(params.get('t') || 0);
        
        window.player.x = 14 * 280 + 35;
        window.player.y = 12 * 280 + 35;

        if (shot === 'city') {
            window.missionSystem.active = false;
            window.wantedSystem.level = 0;
        } else if (shot === 'drive') {
            window.missionSystem.active = false;
            window.player.inVehicle = { type: 'sports', color: 'red', x: window.player.x, y: window.player.y, angle: 0, speed: 0, width: 38, height: 18 };
        } else if (shot === 'chase') {
            window.missionSystem.active = false;
            window.player.inVehicle = { type: 'sports', color: 'red', x: window.player.x, y: window.player.y, angle: 0, speed: 0, width: 38, height: 18 };
            window.wantedSystem.level = 3;
            window.wantedSystem.frozen = true;
            window.policeSystem.spawn(3, window.player.x - 200, window.player.y - 200);
        } else if (shot === 'mission') {
            window.missionSystem.active = true;
            window.player.x = 14 * 280 + 35;
            window.player.y = 12 * 280 + 35 + 80;
            window.wantedSystem.level = 0;
        }

        setTimeout(() => {
            window.__solanoReady = true;
        }, t * 1000);
    }
};
