import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PrinterIcon, PencilIcon, TrashIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';  // <-- Changed to html2canvas-pro (install via npm)

// Move constants outside component
const COMPANY_DETAILS = {
    name: import.meta.env.VITE_COMPANY_DETAILS_NAME || "Vogue Software Solutions (pvt) Ltd",
    address: import.meta.env.VITE_COMPANY_DETAILS_ADDRESS || "Malabe, Colombo, Sri Lanka",
    phone: import.meta.env.VITE_COMPANY_DETAILS_PHONE || "+94 77 555 118",
    email: import.meta.env.VITE_COMPANY_DETAILS_EMAIL || "info@voguesoftware.com",
    web: import.meta.env.VITE_COMPANY_DETAILS_WEB || "www.voguesoftware.com",
};

const BANK_DETAILS = {
    name: "COMMERCIAL BANK (MALABE)",
    accountName: COMPANY_DETAILS.name,
    accountNumber: "1000857661",
    swiftCode: "CCE YLXX XXX",
    branch: "MALABE",
};

const STATUS_STYLES = {
    'Draft': 'bg-gray-100 text-gray-800',
    'Sent': 'bg-blue-100 text-blue-800',
    'Paid': 'bg-green-100 text-green-800',
    'Overdue': 'bg-red-100 text-red-800',
    'Cancelled': 'bg-yellow-100 text-yellow-800',
};

function InvoicePreview() {
    const { id: invoiceId, orgId } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [projectName, setProjectName] = useState('Unknown');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const invoiceRef = useRef(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/invoices/${invoiceId}`
                );
                const invoiceData = response.data;
                setInvoice(invoiceData);
                
                // Extract project name safely
                if (invoiceData?.organizationId?.projects && invoiceData.projectId) {
                    const project = invoiceData.organizationId.projects.find(
                        p => String(p._id) === String(invoiceData.projectId)
                    );
                    setProjectName(project?.name || 'Unknown');
                }
            } catch (err) {
                const errorMsg = err.response?.data?.message || "Failed to fetch invoice details.";
                setError(errorMsg);
                console.error("Error fetching invoice:", err);
                toast.error(errorMsg);
            } finally {
                setLoading(false);
            }
        };
        
        if (invoiceId) {
            fetchInvoice();
        }
    }, [invoiceId]);

    const handlePrint = async () => {
        if (!invoiceRef.current) return;

        setIsGeneratingPdf(true);
        try {
            const element = invoiceRef.current;
            
            // Clone element (no sanitization needed with html2canvas-pro)
            const clone = element.cloneNode(true);
            document.body.appendChild(clone);
            
            const canvas = await html2canvas(clone, { 
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            
            document.body.removeChild(clone);
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`invoice-${invoice.invoiceNo}.pdf`);
            toast.success('PDF downloaded successfully!');
        } catch (err) {
            console.error('Error generating PDF:', err);
            toast.error('Failed to generate PDF. Please try again.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to delete invoice ${invoice.invoiceNo}? This action cannot be undone.`
        );
        
        if (!confirmed) return;

        try {
            await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/api/invoices/${invoiceId}`
            );
            toast.success('Invoice deleted successfully!');
            // Navigate with fallback
            navigate(orgId ? `/dashboard/organizations/${orgId}` : '/dashboard');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to delete invoice.';
            toast.error(errorMsg);
            console.error('Delete error:', err);
        }
    };
    
    if (loading) {
        return (
            <div className="p-8 font-main text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A90E2]"></div>
                <p className="mt-2">Loading Invoice...</p>
            </div>
        );
    }
    
    if (error || !invoice) {
        return (
            <div className="p-8 font-main text-center">
                <div className="text-red-500 text-lg">{error || "Invoice not found."}</div>
                <button 
                    onClick={() => navigate(-1)}
                    className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    Go Back
                </button>
            </div>
        );
    }

    // Safe access to billing contact
    const billingContact = invoice.organizationId?.contactDetails?.[0] || { 
        name: 'N/A', 
        role: 'N/A' 
    };

    return (
        <div className="p-8 font-second">
            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mb-4">
                <button 
                    onClick={() => navigate(
                        `/dashboard/organizations/${orgId}/projects/${invoice.projectId}/invoice/edit/${invoiceId}`
                    )}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                    <PencilIcon className="h-5 w-5 mr-2" /> Edit Invoice
                </button>
                <button 
                    onClick={handlePrint}
                    disabled={isGeneratingPdf}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#4A90E2] rounded-md hover:bg-[#3A7BBE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <PrinterIcon className="h-5 w-5 mr-2" /> 
                    {isGeneratingPdf ? 'Generating...' : 'Print/Save PDF'}
                </button>
                <button 
                    onClick={handleDelete}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
                >
                    <TrashIcon className="h-5 w-5 mr-2" /> Delete
                </button>
            </div>
            
            {/* Invoice Template */}
            <div ref={invoiceRef} className="p-10 border rounded-lg shadow-2xl bg-white min-h-[11in]">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-10">
                    <div className="flex items-center">
                        <div className="h-10 w-10 bg-[#4A90E2] rounded-full mr-3 flex items-center justify-center text-white text-lg font-bold">
                            VSS
                        </div>
                        <h1 className="text-xl font-bold font-main text-[#4A90E2]">
                            VOGUE SOFTWARE SOLUTIONS
                        </h1>
                    </div>
                    
                    <div className="text-right text-sm">
                        <p className="text-xl font-bold text-gray-800 mb-1">INVOICE</p>
                        <p>Invoice NO: <span className='font-semibold'>{invoice.invoiceNo}</span></p>
                        <p>PO NO: <span className='font-semibold'>{invoice.poNo || 'N/A'}</span></p>
                        <p>Date: <span className='font-semibold'>
                            {format(new Date(invoice.invoiceDate), 'MMM d, yyyy')}
                        </span></p>
                    </div>
                </div>

                {/* Bill From/To */}
                <div className="grid grid-cols-2 gap-10 mb-10 border-b pb-5">
                    <div>
                        <h2 className="text-lg font-bold mb-2">Bill From:</h2>
                        <div className="text-sm space-y-1">
                            <p className='font-semibold'>{COMPANY_DETAILS.name}</p>
                            <p>{COMPANY_DETAILS.address}</p>
                            <p>Phone: {COMPANY_DETAILS.phone}</p>
                            <p>Email: {COMPANY_DETAILS.email}</p>
                            <p>Web: {COMPANY_DETAILS.web}</p>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold mb-2">Bill To:</h2>
                        <div className="text-sm space-y-1">
                            <p className='font-semibold'>{invoice.organizationId?.name || 'N/A'}</p>
                            <p>{invoice.organizationId?.address || 'N/A'}</p>
                            <p>Contact: {billingContact.name} ({billingContact.role})</p>
                            <p>Project: {projectName}</p>
                        </div>
                    </div>
                </div>

                {/* Line Items Table */}
                <table className="min-w-full divide-y divide-gray-300 mb-10">
                    <thead>
                        <tr className="text-left bg-gray-50 text-xs font-medium text-gray-700 uppercase tracking-wider">
                            <th className="py-3 px-4 w-1/2">Description</th>
                            <th className="py-3 px-4 text-right">Unit Price ({invoice.currency})</th>
                            <th className="py-3 px-4 text-center">Qty</th>
                            <th className="py-3 px-4 text-right">Line Total ({invoice.currency})</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {invoice.lineItems?.map((item, index) => {
                            const unitPrice = Number(item.unitPrice) || 0;
                            const qty = Number(item.qty) || 0;
                            const lineTotal = unitPrice * qty;
                            
                            return (
                                <tr key={index} className="text-sm text-gray-700">
                                    <td className="py-3 px-4">{item.description || '-'}</td>
                                    <td className="py-3 px-4 text-right">{unitPrice.toFixed(2)}</td>
                                    <td className="py-3 px-4 text-center">{qty}</td>
                                    <td className="py-3 px-4 text-right font-medium">
                                        {lineTotal.toFixed(2)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Totals and Bank Details */}
                <div className="grid grid-cols-3 gap-10">
                    {/* Notes & Bank Details */}
                    <div className="col-span-2 space-y-4">
                        <h3 className="text-lg font-bold text-gray-800">Bank Details</h3>
                        <div className='text-sm p-4 border rounded-lg bg-gray-50'>
                            <p>Bank Name: <span className='font-medium'>{BANK_DETAILS.name}</span></p>
                            <p>Account Name: <span className='font-medium'>{BANK_DETAILS.accountName}</span></p>
                            <p>Account Number: <span className='font-medium'>{BANK_DETAILS.accountNumber}</span></p>
                            <p>Swift Code: <span className='font-medium'>{BANK_DETAILS.swiftCode}</span></p>
                            <p>Branch: <span className='font-medium'>{BANK_DETAILS.branch}</span></p>
                        </div>
                        
                        {invoice.notes && (
                            <div className='mt-6'>
                                <h3 className="text-lg font-bold text-gray-800">Notes</h3>
                                <p className="text-sm whitespace-pre-line border-t pt-2">
                                    {invoice.notes}
                                </p>
                            </div>
                        )}
                    </div>
                    
                    {/* Financial Summary */}
                    <div className="space-y-2 text-right">
                        <div className='bg-gray-50 p-4 rounded-lg'>
                            <div className='flex justify-between text-sm py-1'>
                                <span>Subtotal ({invoice.currency}):</span>
                                <span className='font-medium'>
                                    {Number(invoice.subTotal || 0).toFixed(2)}
                                </span>
                            </div>
                            <div className='flex justify-between text-sm py-1'>
                                <span>Discount ({invoice.currency}):</span>
                                <span className='font-medium text-red-600'>
                                    - {Number(invoice.discount || 0).toFixed(2)}
                                </span>
                            </div>
                            <div className='flex justify-between text-sm py-1 border-b mb-2'>
                                <span>Tax ({Number(invoice.taxRate || 0)}%):</span>
                                <span className='font-medium'>
                                    + {Number(invoice.taxAmount || 0).toFixed(2)}
                                </span>
                            </div>
                            <div className='flex justify-between text-lg font-bold pt-2 border-t border-gray-300'>
                                <span>TOTAL ({invoice.currency}):</span>
                                <span className='text-xl text-[#4A90E2]'>
                                    {Number(invoice.total || 0).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className={`mt-4 p-2 font-semibold rounded-lg ${STATUS_STYLES[invoice.status] || 'bg-gray-100 text-gray-800'}`}>
                            <CheckCircleIcon className='h-5 w-5 inline-block mr-2' />
                            Status: {invoice.status}
                        </div>
                    </div>
                </div>
                
                {/* Terms & Signatures */}
                {invoice.terms && (
                    <div className="mt-12 pt-6 border-t border-gray-300">
                        <h3 className="text-sm font-bold mb-2">Terms and Conditions</h3>
                        <p className="text-xs text-gray-600 whitespace-pre-line">{invoice.terms}</p>
                    </div>
                )}
                
                <div className="mt-10">
                    <div className="flex justify-between mt-10">
                        <div className="w-1/3 border-b border-gray-400"></div>
                        <div className="w-1/3 border-b border-gray-400"></div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                        <span className='w-1/3 text-center'>Customer Signature</span>
                        <span className='w-1/3 text-center'>Authorized Signature</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InvoicePreview;