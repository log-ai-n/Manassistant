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
exports.ActivityFeed = ActivityFeed;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("../lib/supabase");
const RealtimeWrapper_1 = require("./RealtimeWrapper");
const lucide_react_1 = require("lucide-react");
function ActivityFeed() {
    const [activities, setActivities] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        function loadActivities() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const { data, error } = yield supabase_1.supabase
                        .from('activities')
                        .select('*')
                        .order('created_at', { ascending: false })
                        .limit(10);
                    if (error)
                        throw error;
                    setActivities(data || []);
                }
                catch (error) {
                    console.error('Error loading activities:', error);
                }
                finally {
                    setLoading(false);
                }
            });
        }
        loadActivities();
    }, []);
    const handleRealtimeUpdate = (payload) => {
        if (payload.eventType === 'INSERT') {
            setActivities((current) => [payload.new, ...current].slice(0, 10));
        }
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center h-64", children: (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) }));
    }
    return ((0, jsx_runtime_1.jsx)(RealtimeWrapper_1.RealtimeWrapper, { config: {
            table: 'activities',
            event: 'INSERT',
        }, onUpdate: handleRealtimeUpdate, children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Activity, { className: "w-5 h-5 text-blue-600" }), (0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold", children: "Activity Feed" })] }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: activities.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 text-center py-8", children: "No activities yet" })) : (activities.map((activity) => ((0, jsx_runtime_1.jsx)("div", { className: "bg-white p-4 rounded-lg shadow-sm border border-gray-100", children: (0, jsx_runtime_1.jsx)("div", { className: "flex items-start space-x-3", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-900", children: activity.action }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 truncate", children: new Date(activity.created_at).toLocaleString() }), Object.entries(activity.details).map(([key, value]) => ((0, jsx_runtime_1.jsxs)("div", { className: "mt-1 text-sm text-gray-600", children: [(0, jsx_runtime_1.jsxs)("span", { className: "font-medium", children: [key, ":"] }), ' ', JSON.stringify(value)] }, key)))] }) }) }, activity.id)))) })] }) }));
}
