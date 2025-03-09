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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const client_1 = require("react-dom/client");
const App_1 = __importDefault(require("./App"));
require("./index.css");
const supabase_1 = require("./lib/supabase");
const environment_1 = require("./lib/environment");
// First initialize environment configuration to get API keys
// Then initialize Supabase with those keys
const initializeApp = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, environment_1.initializeConfig)();
        yield (0, supabase_1.initializeSupabase)();
        console.log('Application initialization complete');
    }
    catch (error) {
        console.error('Failed to initialize application:', error);
    }
});
// Wait for initialization before rendering
initializeApp().then(() => {
    (0, client_1.createRoot)(document.getElementById('root')).render((0, jsx_runtime_1.jsx)(react_1.StrictMode, { children: (0, jsx_runtime_1.jsx)(App_1.default, {}) }));
});
