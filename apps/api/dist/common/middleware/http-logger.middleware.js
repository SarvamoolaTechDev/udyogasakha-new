"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpLoggerMiddleware = void 0;
const common_1 = require("@nestjs/common");
let HttpLoggerMiddleware = class HttpLoggerMiddleware {
    constructor() {
        this.logger = new common_1.Logger('HTTP');
    }
    use(req, res, next) {
        const { method, originalUrl, ip } = req;
        const userAgent = req.get('user-agent') ?? '';
        const start = Date.now();
        res.on('finish', () => {
            const { statusCode } = res;
            const ms = Date.now() - start;
            const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'log';
            this.logger[level](`${method} ${originalUrl} ${statusCode} +${ms}ms — ${ip} "${userAgent.slice(0, 60)}"`);
        });
        next();
    }
};
exports.HttpLoggerMiddleware = HttpLoggerMiddleware;
exports.HttpLoggerMiddleware = HttpLoggerMiddleware = __decorate([
    (0, common_1.Injectable)()
], HttpLoggerMiddleware);
//# sourceMappingURL=http-logger.middleware.js.map