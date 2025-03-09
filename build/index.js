"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = require("@modelcontextprotocol/sdk");
const zod_1 = require("zod");
const server = new sdk_1.McpServer({
    name: 'weather',
    version: '1.0.0',
});
server.tool('getWeather', {
    location: zod_1.z.string().describe('The location to get weather for'),
}, (_a) => __awaiter(void 0, [_a], void 0, function* ({ location }) {
    // This is a mock implementation
    return `Weather forecast for ${location}: Sunny with a high of 75°F`;
}));
server.start();
