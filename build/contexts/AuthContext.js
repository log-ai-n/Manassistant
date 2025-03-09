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
exports.AuthProvider = AuthProvider;
exports.useAuth = useAuth;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("../lib/supabase");
const AuthContext = (0, react_1.createContext)(undefined);
function AuthProvider({ children }) {
    const [user, setUser] = (0, react_1.useState)(null);
    const [session, setSession] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        // Get initial session
        supabase_1.supabase.auth.getSession().then(({ data: { session } }) => {
            var _a;
            setSession(session);
            setUser((_a = session === null || session === void 0 ? void 0 : session.user) !== null && _a !== void 0 ? _a : null);
            setLoading(false);
        });
        // Listen for auth changes
        const { data: { subscription } } = supabase_1.supabase.auth.onAuthStateChange((_event, session) => {
            var _a;
            setSession(session);
            setUser((_a = session === null || session === void 0 ? void 0 : session.user) !== null && _a !== void 0 ? _a : null);
            setLoading(false);
        });
        return () => subscription.unsubscribe();
    }, []);
    const signIn = (email, password) => __awaiter(this, void 0, void 0, function* () {
        const { error } = yield supabase_1.supabase.auth.signInWithPassword({ email, password });
        if (error)
            throw error;
    });
    const signUp = (email, password) => __awaiter(this, void 0, void 0, function* () {
        const { error } = yield supabase_1.supabase.auth.signUp({ email, password });
        if (error)
            throw error;
    });
    const signOut = () => __awaiter(this, void 0, void 0, function* () {
        const { error } = yield supabase_1.supabase.auth.signOut();
        if (error)
            throw error;
    });
    const value = {
        user,
        session,
        loading,
        signIn,
        signOut,
        signUp,
    };
    return ((0, jsx_runtime_1.jsx)(AuthContext.Provider, { value: value, children: !loading && children }));
}
function useAuth() {
    const context = (0, react_1.useContext)(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
