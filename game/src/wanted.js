// rebuilt r5 — authored by this session
/* Solano Drive: Wanted level tracking, crimes, and decay. */
export const wantedSystem = {
    level: 0,
    isFrozen: false,
    crimeWeights: { car: 1, ped: 1, shoot: 1, cop: 2 },
    lastWantedUpdate: 0,

    addCrime(crimeType) {
        if (this.isFrozen) return;
        this.level = Math.min(5, this.level + (this.crimeWeights[crimeType] || 0));
        this.lastWantedUpdate = Date.now();
    },

    update(dt, player, copsNearby) {
        if (this.isFrozen) return;
        if (copsNearby && copsNearby.length > 0) {
            this.lastWantedUpdate = Date.now();
        } else if (this.level > 0 && Date.now() - this.lastWantedUpdate > 8000) {
            this.level = 0;
        }
    },

    getStars() {
        return this.level;
    }
};
