import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon, DocumentDuplicateIcon, CalculatorIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';

const initialLineItem = { description: '', unitPrice: 0, qty: 1, lineTotal: 0 };

function AddInvoice() {
    const { orgId, projectId, invoiceId } = useParams();
    const navigate = useNavigate();
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(!!invoiceId);

    const [invoiceData, setInvoiceData] = useState({
        organizationId: orgId,
        projectId: projectId,
        invoiceNo: '',
        poNo: '',
        invoiceDate: new Date().toISOString().substring(0, 10),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10), // 30 days default
        status: 'Draft',
        lineItems: [initialLineItem],
        currency: 'LKR',
        taxRate: 15,
        discount: 0,
        terms: '1. Payment is due within 30 days from the invoice date.\n2. All bank or transfer fees are the responsibility of the client.',
        notes: '',
        // Calculated fields (updated in useEffect)
        subTotal: 0,
        taxAmount: 0,
        total: 0,
    });

    // --- Data Fetching & Initial Setup ---
    useEffect(() => {
        const fetchOrganizationAndInvoice = async () => {
            try {
                // Fetch Organization (needed for name/address in the form)
                const orgResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/organizations/${orgId}`);
                setOrganization(orgResponse.data);

                if (isEditMode) {
                    const invoiceResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/invoices/${invoiceId}`);
                    const inv = invoiceResponse.data;
                    setInvoiceData({
                        ...inv,
                        invoiceDate: new Date(inv.invoiceDate).toISOString().substring(0, 10),
                        dueDate: new Date(inv.dueDate).toISOString().substring(0, 10),
                        // Line items need re-calculation for clean input fields
                        lineItems: inv.lineItems.map(item => ({...item, lineTotal: (item.unitPrice || 0) * (item.qty || 0)})),
                    });
                }
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to fetch initial data.');
                console.error(err);
            } finally {
                setFetchLoading(false);
            }
        };
        fetchOrganizationAndInvoice();
    }, [orgId, projectId, invoiceId, isEditMode]);

    // --- Calculation Effect ---
    useEffect(() => {
        let subTotal = 0;
        invoiceData.lineItems.forEach(item => {
            subTotal += (item.lineTotal || 0);
        });

        const taxAmount = subTotal * ((invoiceData.taxRate || 0) / 100);
        const discount = invoiceData.discount || 0;
        const total = subTotal + taxAmount - discount;

        setInvoiceData(prev => ({
            ...prev,
            subTotal: parseFloat(subTotal.toFixed(2)),
            taxAmount: parseFloat(taxAmount.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
        }));
    }, [invoiceData.lineItems, invoiceData.taxRate, invoiceData.discount]);

    // --- Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setInvoiceData(prev => ({ 
            ...prev, 
            [name]: ['unitPrice', 'qty', 'discount', 'taxRate'].includes(name) ? (parseFloat(value) || 0) : value 
        }));
    };

    const handleLineItemChange = (index, e) => {
        const { name, value } = e.target;
        const numericValue = ['unitPrice', 'qty'].includes(name) ? parseFloat(value) || 0 : value;

        const newItems = [...invoiceData.lineItems];
        newItems[index] = { ...newItems[index], [name]: numericValue };

        // Auto-calculate line total
        if (name === 'unitPrice' || name === 'qty') {
            newItems[index].lineTotal = parseFloat((newItems[index].unitPrice * newItems[index].qty).toFixed(2));
        }

        setInvoiceData(prev => ({ ...prev, lineItems: newItems }));
    };

    const addLineItem = () => {
        setInvoiceData(prev => ({ ...prev, lineItems: [...prev.lineItems, initialLineItem] }));
    };

    const removeLineItem = (index) => {
        if (invoiceData.lineItems.length > 1) {
            setInvoiceData(prev => ({ ...prev, lineItems: prev.lineItems.filter((_, i) => i !== index) }));
        } else {
            toast.error("An invoice must have at least one line item.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Quick validation
        if (!invoiceData.invoiceNo || invoiceData.lineItems.length === 0 || invoiceData.lineItems.some(item => !item.description || item.unitPrice <= 0 || item.qty <= 0)) {
            toast.error('Please fill required fields: Invoice No, and valid line items.');
            setLoading(false);
            return;
        }

        const apiEndpoint = isEditMode 
            ? `${import.meta.env.VITE_BACKEND_URL}/api/invoices/${invoiceId}`
            : `${import.meta.env.VITE_BACKEND_URL}/api/invoices`;
        const method = isEditMode ? axios.put : axios.post;

        try {
            await method(apiEndpoint, invoiceData);
            setLoading(false);
            toast.success(`Invoice ${isEditMode ? 'updated' : 'created'} successfully!`);
            navigate(`/dashboard/organizations/${orgId}`);
        } catch (err) {
            setLoading(false);
            toast.error(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} invoice.`);
            console.error(err);
        }
    };
    
    const project = organization?.projects.find(p => p._id === projectId);
    
    if (fetchLoading) return <div className="p-8 font-main text-center">Loading Invoice Data...</div>;
    if (!organization || !project) return <div className="p-8 font-main text-center text-red-500">Organization or Project not found for invoicing.</div>;

    return (
        <div className="p-8 font-second rounded-lg shadow-md max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold font-main text-gray-800 mb-6">
                {isEditMode ? 'Edit Invoice' : 'Create New Invoice'} for {organization.name}
            </h1>
            <h2 className="text-lg text-gray-600 mb-8">Project: <span className='font-semibold'>{project.name}</span></h2>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* --- Header Details --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 border rounded-lg bg-gray-50">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Invoice No *</label>
                        <input type="text" name="invoiceNo" required value={invoiceData.invoiceNo} onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">P.O. No</label>
                        <input type="text" name="poNo" value={invoiceData.poNo} onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Invoice Date *</label>
                        <input type="date" name="invoiceDate" required value={invoiceData.invoiceDate} onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Due Date *</label>
                        <input type="date" name="dueDate" required value={invoiceData.dueDate} onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                </div>

                {/* --- Line Items --- */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 flex justify-between items-center">
                        <DocumentDuplicateIcon className='h-5 w-5 mr-2 text-gray-700' /> Line Items
                        <button type="button" onClick={addLineItem} className="text-[#4A90E2] hover:text-[#3A7BBE] text-sm font-medium flex items-center">
                            <PlusIcon className="h-4 w-4 mr-1" /> Add Item
                        </button>
                    </h2>
                    
                    <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600 border-b pb-2">
                        <span className="col-span-6">Description</span>
                        <span className="col-span-2 text-right">Unit Price ({invoiceData.currency})</span>
                        <span className="col-span-1 text-center">Qty</span>
                        <span className="col-span-2 text-right">Total ({invoiceData.currency})</span>
                        <span className="col-span-1"></span>
                    </div>

                    {invoiceData.lineItems.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-4 items-center">
                            <input type="text" name="description" required value={item.description || ''}
                                onChange={(e) => handleLineItemChange(index, e)}
                                placeholder="Service or Product description"
                                className="col-span-6 px-3 py-2 border rounded-md text-sm" />
                            
                            <input type="number" name="unitPrice" required value={item.unitPrice || ''}
                                onChange={(e) => handleLineItemChange(index, e)}
                                placeholder="0.00" step="0.01" min="0"
                                className="col-span-2 px-3 py-2 border rounded-md text-sm text-right" />
                            
                            <input type="number" name="qty" required value={item.qty || ''}
                                onChange={(e) => handleLineItemChange(index, e)}
                                placeholder="1" min="1"
                                className="col-span-1 px-3 py-2 border rounded-md text-sm text-center" />
                            
                            <span className="col-span-2 font-semibold text-right text-gray-800">
                                {(item.lineTotal || 0).toFixed(2)}
                            </span>
                            
                            <button type="button" onClick={() => removeLineItem(index)}
                                className="col-span-1 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 disabled:opacity-50"
                                disabled={invoiceData.lineItems.length === 1}>
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* --- Totals, Terms, Notes --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Terms & Notes */}
                    <div className="space-y-4 p-4 border rounded-lg lg:col-span-2">
                        <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 flex items-center">
                            <CalculatorIcon className='h-5 w-5 mr-2 text-gray-700' /> Financial Summary
                        </h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Discount ({invoiceData.currency})</label>
                                <input type="number" name="discount" value={invoiceData.discount || ''} onChange={handleChange}
                                    placeholder="0.00" min="0" step="0.01"
                                    className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
                                <input type="number" name="taxRate" value={invoiceData.taxRate || ''} onChange={handleChange}
                                    placeholder="0" min="0" max="100"
                                    className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm" />
                            </div>
                        </div>

                        <div className="mt-4 p-4 border rounded-lg bg-white">
                            <h4 className='font-bold mb-2'>Payment Terms</h4>
                            <textarea rows="3" name="terms" value={invoiceData.terms} onChange={handleChange}
                                className="block w-full px-3 py-2 border rounded-md shadow-sm text-sm" />
                            <h4 className='font-bold mt-4 mb-2'>Notes / Internal Memo</h4>
                            <textarea rows="2" name="notes" value={invoiceData.notes} onChange={handleChange}
                                className="block w-full px-3 py-2 border rounded-md shadow-sm text-sm" />
                        </div>
                    </div>

                    {/* Calculations Display */}
                    <div className="p-4 border rounded-lg bg-white shadow-lg space-y-3 self-start">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium text-gray-800">{invoiceData.currency} {(invoiceData.subTotal || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Discount:</span>
                            <span className="font-medium text-red-500"> -{invoiceData.currency} {(invoiceData.discount || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Tax ({(invoiceData.taxRate || 0)}%):</span>
                            <span className="font-medium text-gray-800">+{invoiceData.currency} {(invoiceData.taxAmount || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold pt-2">
                            <span className='flex items-center text-[#4A90E2]'><CurrencyDollarIcon className='h-6 w-6 mr-2' /> TOTAL:</span>
                            <span className='text-[#4A90E2]'>{invoiceData.currency} {(invoiceData.total || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button type="submit" disabled={loading}
                        className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#8a5cf6] to-[#4a90e2] hover:from-[#7b4fe0] hover:to-[#3b82d9] disabled:opacity-50">
                        {loading ? 'Processing...' : (isEditMode ? 'Update Invoice' : 'Create Invoice')}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddInvoice;