"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spot = void 0;
const typeorm_1 = require("typeorm");
const Zone_1 = require("./Zone");
const Report_1 = require("./Report");
let Spot = class Spot {
    // Virtual properties for latitude and longitude
    get latitude() {
        return this.getCoordinateFromLocation(1);
    }
    get longitude() {
        return this.getCoordinateFromLocation(0);
    }
    getCoordinateFromLocation(index) {
        if (typeof this.location === 'string') {
            const match = this.location.match(/POINT\(([^)]+)\)/);
            if (match) {
                const coords = match[1].split(' ');
                return parseFloat(coords[index]);
            }
        }
        return 0;
    }
    // Helper method to set location from lat/lon
    setLocationFromCoordinates(longitude, latitude) {
        this.location = `POINT(${longitude} ${latitude})`;
    }
};
exports.Spot = Spot;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Spot.prototype, "place_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'geometry',
        spatialFeatureType: 'Point',
        srid: 4326
    }),
    __metadata("design:type", String)
], Spot.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Spot.prototype, "display_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Spot.prototype, "zona", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], Spot.prototype, "zona_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Spot.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Spot.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Zone_1.Zone, zone => zone.spots),
    (0, typeorm_1.JoinColumn)({ name: 'zona_id' }),
    __metadata("design:type", Zone_1.Zone)
], Spot.prototype, "zone", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Report_1.Report, report => report.spot),
    __metadata("design:type", Array)
], Spot.prototype, "reports", void 0);
exports.Spot = Spot = __decorate([
    (0, typeorm_1.Entity)('spots')
], Spot);
//# sourceMappingURL=Spot.js.map