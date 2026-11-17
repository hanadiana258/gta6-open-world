export const wantedSystem = {
    level: 0,
    frozen: false,
    crimes: { car: 1, ped: 1, shoot: 1, cop: 2 },
    lastCopTime: 0,
    add(crime) {
        if (this.frozen) return;
        this.level = Math.min(5, this.level + this.crimes[crime]);
        this.lastCopTime = Date.now();
    },
    update(dt, player, copsNearby) {
        if (this.frozen) return;
        if (copsNearby && copsNearby.length > 0) {
            this.lastCopTime = Date.now();
        } else if (this.level > 0 && Date.now() - this.lastCopTime > 8000) {
            this.level = 0;
        }
    },
    getStars() {
        return this.level;
    }
};
