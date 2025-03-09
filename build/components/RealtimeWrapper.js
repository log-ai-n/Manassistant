"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeWrapper = RealtimeWrapper;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const supabase_1 = require("../lib/supabase");
function RealtimeWrapper({ config, onUpdate, children, }) {
    const [channel, setChannel] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const { table, event = '*', filter } = config;
        // Create a new realtime channel
        const channel = supabase_1.supabase.channel(`public:${table}`)
            .on('postgres_changes', // Type assertion needed due to Supabase types
        { event, schema: 'public', table, filter }, (payload) => {
            console.log('Change received!', payload);
            onUpdate === null || onUpdate === void 0 ? void 0 : onUpdate(payload);
        })
            .subscribe((status) => {
            console.log(`Realtime subscription status: ${status}`);
        });
        setChannel(channel);
        // Cleanup subscription
        return () => {
            channel.unsubscribe();
        };
    }, [config, onUpdate]);
    return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: children });
}
