"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const react_1 = __importStar(require("react"));
const RestaurantContext_1 = require("../../../contexts/RestaurantContext");
const supabase_1 = require("../../../lib/supabase");
const lucide_react_1 = require("lucide-react");
const react_dropzone_1 = require("react-dropzone");
const papaparse_1 = __importDefault(require("papaparse"));
const tesseract_js_1 = require("tesseract.js");
const clsx_1 = __importDefault(require("clsx"));
const ImportMenuModal = ({ onClose, onSuccess }) => {
    const { currentRestaurant } = (0, RestaurantContext_1.useRestaurant)();
    const [file, setFile] = (0, react_1.useState)(null);
    const [preview, setPreview] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [success, setSuccess] = (0, react_1.useState)(false);
    const [progress, setProgress] = (0, react_1.useState)(0);
    const [allergens, setAllergens] = (0, react_1.useState)([]);
    const [processingImage, setProcessingImage] = (0, react_1.useState)(false);
    const [imageText, setImageText] = (0, react_1.useState)('');
    react_1.default.useEffect(() => {
        fetchAllergens();
    }, []);
    const fetchAllergens = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { data, error } = yield supabase_1.supabase
                .from('allergens')
                .select('id, name')
                .order('name');
            if (error)
                throw error;
            setAllergens(data || []);
        }
        catch (err) {
            console.error('Error fetching allergens:', err);
            setError('Failed to load allergens');
        }
    });
    const { getRootProps, getInputProps, isDragActive } = (0, react_dropzone_1.useDropzone)({
        accept: {
            'text/csv': ['.csv'],
            'image/*': ['.jpg', '.jpeg', '.png']
        },
        onDrop: (acceptedFiles) => __awaiter(void 0, void 0, void 0, function* () {
            const file = acceptedFiles[0];
            if (!file)
                return;
            setFile(file);
            setError(null);
            setPreview([]);
            if (file.type === 'text/csv') {
                handleCSVFile(file);
            }
            else if (file.type.startsWith('image/')) {
                yield handleImageFile(file);
            }
        })
    });
    const handleCSVFile = (file) => {
        papaparse_1.default.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    setError('Error parsing CSV file');
                    return;
                }
                const requiredColumns = ['name'];
                const hasRequiredColumns = requiredColumns.every(col => { var _a; return (_a = results.meta.fields) === null || _a === void 0 ? void 0 : _a.includes(col); });
                if (!hasRequiredColumns) {
                    setError('CSV file must include a "name" column');
                    return;
                }
                setPreview(results.data);
            },
            error: (error) => {
                setError(`Error reading file: ${error.message}`);
            }
        });
    };
    const handleImageFile = (file) => __awaiter(void 0, void 0, void 0, function* () {
        setProcessingImage(true);
        setError(null);
        try {
            const worker = yield (0, tesseract_js_1.createWorker)('eng');
            const { data: { text } } = yield worker.recognize(file);
            yield worker.terminate();
            setImageText(text);
            // Basic parsing of menu items from text
            const items = parseMenuItems(text);
            setPreview(items);
        }
        catch (err) {
            console.error('Error processing image:', err);
            setError('Failed to process image');
        }
        finally {
            setProcessingImage(false);
        }
    });
    const parseMenuItems = (text) => {
        // Split text into lines and try to identify menu items
        const lines = text.split('\n').filter(line => line.trim());
        const items = [];
        let currentCategory = '';
        for (const line of lines) {
            // Try to identify if this line is a category
            if (line.toUpperCase() === line && !line.includes('$')) {
                currentCategory = line.trim();
                continue;
            }
            // Try to identify menu items (lines with prices)
            const priceMatch = line.match(/\$\s*(\d+\.?\d*)/);
            if (priceMatch) {
                const price = priceMatch[1];
                const name = line.substring(0, line.indexOf('$')).trim();
                if (name) {
                    items.push({
                        name,
                        category: currentCategory,
                        price,
                        description: '',
                    });
                }
            }
        }
        return items;
    };
    const downloadTemplate = () => {
        const template = [
            ['name', 'description', 'category', 'price', 'allergens'],
            ['Cheeseburger', 'Classic beef burger with cheese', 'Mains', '12.99', 'Milk, Wheat'],
            ['Caesar Salad', 'Romaine lettuce with parmesan', 'Salads', '9.99', 'Eggs, Milk'],
            ['Chocolate Cake', 'Rich chocolate dessert', 'Desserts', '6.99', 'Milk, Eggs, Wheat'],
        ];
        const csv = papaparse_1.default.unparse(template);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'menu_template.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handleImport = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!currentRestaurant || !preview.length)
            return;
        setLoading(true);
        setError(null);
        setProgress(0);
        try {
            const allergenMap = new Map(allergens.map(a => [a.name.toLowerCase(), a.id]));
            for (let i = 0; i < preview.length; i++) {
                const item = preview[i];
                // Insert menu item
                const { data: menuItem, error: menuError } = yield supabase_1.supabase
                    .from('menu_items')
                    .insert({
                    restaurant_id: currentRestaurant.id,
                    name: item.name,
                    description: item.description || null,
                    category: item.category || null,
                    price: item.price ? parseFloat(item.price) : null,
                    active: true,
                })
                    .select()
                    .single();
                if (menuError)
                    throw menuError;
                // Process allergens if any
                if (item.allergens) {
                    const allergenNames = item.allergens.split(',').map(a => a.trim().toLowerCase());
                    const allergenIds = allergenNames
                        .map(name => allergenMap.get(name))
                        .filter((id) => id !== undefined);
                    if (allergenIds.length > 0) {
                        const allergenAssociations = allergenIds.map(allergenId => ({
                            menu_item_id: menuItem.id,
                            allergen_id: allergenId,
                            severity_level: 1, // Default severity
                        }));
                        const { error: allergenError } = yield supabase_1.supabase
                            .from('menu_allergens')
                            .insert(allergenAssociations);
                        if (allergenError)
                            throw allergenError;
                    }
                }
                // Update progress
                setProgress(Math.round(((i + 1) / preview.length) * 100));
            }
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 1500);
        }
        catch (err) {
            console.error('Error importing menu items:', err);
            setError('Failed to import menu items');
        }
        finally {
            setLoading(false);
        }
    });
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-xl max-w-4xl w-full p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-medium text-gray-900", children: "Import Menu Items" }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-500", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-6 w-6" }) })] }), error && ((0, jsx_runtime_1.jsx)("div", { className: "mb-4 bg-red-50 border-l-4 border-red-400 p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { className: "h-5 w-5 text-red-400" }), (0, jsx_runtime_1.jsx)("div", { className: "ml-3", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-700", children: error }) })] }) })), success ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "mx-auto h-12 w-12 text-green-500" }), (0, jsx_runtime_1.jsx)("h3", { className: "mt-2 text-lg font-medium text-gray-900", children: "Import Successful" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-gray-500", children: "Your menu items have been imported successfully." })] })) : ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("button", { onClick: downloadTemplate, className: "inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Download, { className: "h-4 w-4 mr-2" }), "Download Template"] }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-gray-500", children: "Download a sample CSV template to see the required format." })] }), (0, jsx_runtime_1.jsx)("div", Object.assign({}, getRootProps(), { className: (0, clsx_1.default)("mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md", isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300", processingImage && "opacity-50 cursor-wait"), children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-1 text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Upload, { className: "mx-auto h-12 w-12 text-gray-400" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex text-sm text-gray-600", children: [(0, jsx_runtime_1.jsxs)("label", { className: "relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500", children: [(0, jsx_runtime_1.jsx)("span", { children: "Upload a file" }), (0, jsx_runtime_1.jsx)("input", Object.assign({}, getInputProps()))] }), (0, jsx_runtime_1.jsx)("p", { className: "pl-1", children: "or drag and drop" })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500", children: "CSV files or images (JPG, PNG)" })] }) })), preview.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: ["Preview (", preview.length, " items)"] }), (0, jsx_runtime_1.jsx)("div", { className: "max-h-64 overflow-auto", children: (0, jsx_runtime_1.jsxs)("table", { className: "min-w-full divide-y divide-gray-200", children: [(0, jsx_runtime_1.jsx)("thead", { className: "bg-gray-50", children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Name" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Category" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Price" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Allergens" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { className: "bg-white divide-y divide-gray-200", children: preview.map((item, index) => ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: item.name }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: item.category }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: item.price ? `$${parseFloat(item.price).toFixed(2)}` : '' }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: item.allergens })] }, index))) })] }) })] })), loading && ((0, jsx_runtime_1.jsx)("div", { className: "mt-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "relative pt-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex mb-2 items-center justify-between", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("span", { className: "text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200", children: "Progress" }) }), (0, jsx_runtime_1.jsx)("div", { className: "text-right", children: (0, jsx_runtime_1.jsxs)("span", { className: "text-xs font-semibold inline-block text-blue-600", children: [progress, "%"] }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200", children: (0, jsx_runtime_1.jsx)("div", { style: { width: `${progress}%` }, className: "shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300" }) })] }) })), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end space-x-3", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: onClose, className: "inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: handleImport, disabled: loading || preview.length === 0, className: "inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50", children: loading ? 'Importing...' : `Import ${preview.length} Items` })] })] }) }))] }) }));
};
exports.default = ImportMenuModal;
