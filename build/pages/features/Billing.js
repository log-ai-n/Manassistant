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
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const RestaurantContext_1 = require("../../contexts/RestaurantContext");
const lucide_react_1 = require("lucide-react");
const react_router_dom_1 = require("react-router-dom");
const billingService_1 = require("../../services/billingService");
const Billing = () => {
    const { currentRestaurant } = (0, RestaurantContext_1.useRestaurant)();
    const [bills, setBills] = (0, react_1.useState)([]);
    const [totalBills, setTotalBills] = (0, react_1.useState)(0);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [statusFilter, setStatusFilter] = (0, react_1.useState)('all');
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [currentPage, setCurrentPage] = (0, react_1.useState)(1);
    const billsPerPage = 10;
    (0, react_1.useEffect)(() => {
        if (currentRestaurant) {
            fetchBills();
        }
    }, [currentRestaurant, statusFilter, currentPage]);
    const fetchBills = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!currentRestaurant)
            return;
        setIsLoading(true);
        setError(null);
        try {
            const status = statusFilter !== 'all' ? statusFilter : undefined;
            const offset = (currentPage - 1) * billsPerPage;
            const { bills: fetchedBills, count } = yield (0, billingService_1.getBills)(currentRestaurant.id, status, billsPerPage, offset);
            setBills(fetchedBills);
            setTotalBills(count);
        }
        catch (err) {
            console.error('Error fetching bills:', err);
            setError('Failed to load bills. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    });
    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft':
                return ((0, jsx_runtime_1.jsxs)("span", { className: "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "w-3 h-3 mr-1" }), " Draft"] }));
            case 'sent':
                return ((0, jsx_runtime_1.jsxs)("span", { className: "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Send, { className: "w-3 h-3 mr-1" }), " Sent"] }));
            case 'paid':
                return ((0, jsx_runtime_1.jsxs)("span", { className: "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "w-3 h-3 mr-1" }), " Paid"] }));
            case 'overdue':
                return ((0, jsx_runtime_1.jsxs)("span", { className: "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "w-3 h-3 mr-1" }), " Overdue"] }));
            case 'cancelled':
                return ((0, jsx_runtime_1.jsxs)("span", { className: "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.XCircle, { className: "w-3 h-3 mr-1" }), " Cancelled"] }));
            default:
                return null;
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };
    const pageCount = Math.ceil(totalBills / billsPerPage);
    if (!currentRestaurant) {
        return (0, jsx_runtime_1.jsx)("div", { children: "Please select a restaurant" });
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mb-6", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold", children: "Billing" }), (0, jsx_runtime_1.jsxs)(react_router_dom_1.Link, { to: "/restaurant/billing/new", className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }), "Create New Bill"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white shadow rounded-lg p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative w-full md:w-64", children: [(0, jsx_runtime_1.jsx)("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "h-5 w-5 text-gray-400" }) }), (0, jsx_runtime_1.jsx)("input", { type: "text", className: "block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm", placeholder: "Search bills...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [(0, jsx_runtime_1.jsxs)("label", { htmlFor: "statusFilter", className: "text-sm font-medium text-gray-700 flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Filter, { className: "h-4 w-4 mr-1" }), "Status:"] }), (0, jsx_runtime_1.jsxs)("select", { id: "statusFilter", className: "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md", value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "all", children: "All" }), (0, jsx_runtime_1.jsx)("option", { value: "draft", children: "Draft" }), (0, jsx_runtime_1.jsx)("option", { value: "sent", children: "Sent" }), (0, jsx_runtime_1.jsx)("option", { value: "paid", children: "Paid" }), (0, jsx_runtime_1.jsx)("option", { value: "overdue", children: "Overdue" }), (0, jsx_runtime_1.jsx)("option", { value: "cancelled", children: "Cancelled" })] })] })] }), isLoading ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center items-center h-64", children: (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" }) })) : error ? ((0, jsx_runtime_1.jsx)("div", { className: "bg-red-50 border-l-4 border-red-400 p-4 mb-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0", children: (0, jsx_runtime_1.jsx)(lucide_react_1.XCircle, { className: "h-5 w-5 text-red-400" }) }), (0, jsx_runtime_1.jsx)("div", { className: "ml-3", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-700", children: error }) })] }) })) : bills.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-12", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { className: "mx-auto h-12 w-12 text-gray-400" }), (0, jsx_runtime_1.jsx)("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "No bills found" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-1 text-sm text-gray-500", children: "Get started by creating a new bill." }), (0, jsx_runtime_1.jsx)("div", { className: "mt-6", children: (0, jsx_runtime_1.jsxs)(react_router_dom_1.Link, { to: "/restaurant/billing/new", className: "inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "-ml-1 mr-2 h-5 w-5", "aria-hidden": "true" }), "Create New Bill"] }) })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto", children: (0, jsx_runtime_1.jsxs)("table", { className: "min-w-full divide-y divide-gray-200", children: [(0, jsx_runtime_1.jsx)("thead", { className: "bg-gray-50", children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Bill #" }), (0, jsx_runtime_1.jsx)("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Customer" }), (0, jsx_runtime_1.jsx)("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Date" }), (0, jsx_runtime_1.jsx)("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Amount" }), (0, jsx_runtime_1.jsx)("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }), (0, jsx_runtime_1.jsx)("th", { scope: "col", className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { className: "bg-white divide-y divide-gray-200", children: bills.map((bill) => ((0, jsx_runtime_1.jsxs)("tr", { className: "hover:bg-gray-50", children: [(0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: `/restaurant/billing/${bill.id}`, className: "text-blue-600 hover:text-blue-900", children: bill.bill_number }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: bill.customer_name }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: formatDate(bill.bill_date) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: formatCurrency(bill.total_amount) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: getStatusBadge(bill.status) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-end space-x-2", children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: `/restaurant/billing/${bill.id}/edit`, className: "text-blue-600 hover:text-blue-900", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Edit, { className: "w-5 h-5" }) }), (0, jsx_runtime_1.jsx)("button", { className: "text-red-600 hover:text-red-900", onClick: () => {
                                                                        // Implement delete functionality
                                                                        if (window.confirm('Are you sure you want to delete this bill?')) {
                                                                            // Delete bill
                                                                        }
                                                                    }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { className: "w-5 h-5" }) })] }) })] }, bill.id))) })] }) }), pageCount > 1 && ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-between p-4 border-t border-gray-200 sm:px-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "hidden sm:flex-1 sm:flex sm:items-center sm:justify-between", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-700", children: ["Showing ", (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: (currentPage - 1) * billsPerPage + 1 }), " to", ' ', (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: Math.min(currentPage * billsPerPage, totalBills) }), ' ', "of ", (0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: totalBills }), " results"] }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)("nav", { className: "relative z-0 inline-flex rounded-md shadow-sm -space-x-px", "aria-label": "Pagination", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: () => handlePageChange(currentPage - 1), disabled: currentPage === 1, className: `relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === 1 ? 'cursor-not-allowed' : 'hover:bg-gray-50'}`, children: [(0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Previous" }), (0, jsx_runtime_1.jsx)("svg", { className: "h-5 w-5", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true", children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z", clipRule: "evenodd" }) })] }), Array.from({ length: Math.min(pageCount, 5) }).map((_, i) => {
                                                        const pageNum = i + 1;
                                                        return ((0, jsx_runtime_1.jsx)("button", { onClick: () => handlePageChange(pageNum), className: `relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === pageNum
                                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                : 'text-gray-500 hover:bg-gray-50'}`, children: pageNum }, i));
                                                    }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => handlePageChange(currentPage + 1), disabled: currentPage === pageCount, className: `relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${currentPage === pageCount ? 'cursor-not-allowed' : 'hover:bg-gray-50'}`, children: [(0, jsx_runtime_1.jsx)("span", { className: "sr-only", children: "Next" }), (0, jsx_runtime_1.jsx)("svg", { className: "h-5 w-5", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true", children: (0, jsx_runtime_1.jsx)("path", { fillRule: "evenodd", d: "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z", clipRule: "evenodd" }) })] })] }) })] }) }))] }))] })] }));
};
exports.default = Billing;
