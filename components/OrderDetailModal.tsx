
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { ManagedOrder, Task, CartItem, Order, OrderStatus, StripeSettings } from '../src/types';
import * as orderService from '../services/orderService';
import XIcon from './icons/XIcon';
import AssociatedTasks from './AssociatedTasks';
import LoaderIcon from './icons/LoaderIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import EditIcon from './icons/EditIcon';
import ItemPricingModal from './ItemPricingModal';
import PrintIcon from './icons/PrintIcon';
import SendIcon from './icons/SendIcon';
import PhoneIcon from './icons/PhoneIcon';
import MailIcon from './icons/MailIcon';
import EmailModal from './EmailModal';
import InvoiceTemplate from './InvoiceTemplate';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


interface OrderDetailModalProps {
    order: ManagedOrder;
    isOpen: boolean;
    onClose: () => void;
    allTasks?: Task[];
    onOpenTaskModal?: (task: Task | null, initialLink: any) => void;
    onUpdate: () => void;
    stripeSettings: StripeSettings | null;
}

const ORDER_STATUSES: OrderStatus[] = ['New Order', 'Pending Payment', 'Processing', 'Delivering', 'Completed', 'Canceled', 'Refunded'];

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, isOpen, onClose, allTasks = [], onOpenTaskModal, onUpdate, stripeSettings }) => {
    const [mode, setMode] = useState<'view' | 'edit'>('view');
    const [editedData, setEditedData] = useState<ManagedOrder>(order);
    const [isLoading, setIsLoading] = useState(false);
    const [isItemPricingModalOpen, setItemPricingModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const invoiceRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        // When a new order is passed in, reset the state
        if (isOpen) {
            setEditedData(order);
            setMode('view');
        }
    }, [isOpen, order]);
    
    const total = useMemo(() => {
        return editedData.items.reduce((sum, item) => sum + ((item.finalPrice || item.price) * item.quantity), 0);
    }, [editedData.items]);

    const handleItemChange = (index: number, field: 'quantity' | 'finalPrice' | 'name', value: string | number) => {
        const newItems = [...editedData.items];
        const itemToUpdate = { ...newItems[index] };

        if (field === 'quantity') itemToUpdate.quantity = Math.max(0, Number(value));
        if (field === 'finalPrice') itemToUpdate.finalPrice = Number(value);
        if (field === 'name') itemToUpdate.name = String(value);

        newItems[index] = itemToUpdate;
        setEditedData(prev => ({...prev, items: newItems as CartItem[]}));
    };
    
    const handleAddItem = () => {
        const newItem: CartItem = {
            id: `new-${Date.now()}`, name: 'New Item', description: '', price: 0, status: 'Active',
            fulfillment_type: 'Shippable', category_id: null, category: '', featured_image_url: null,
            gallery_images: [], options: [], user_id: '', created_at: new Date().toISOString(),
            quantity: 1, finalPrice: 0,
        };
        setEditedData(prev => ({...prev, items: [...prev.items, newItem]}));
    };
    
    const handleRemoveItem = (indexToRemove: number) => {
        setEditedData(prev => ({...prev, items: prev.items.filter((_, index) => index !== indexToRemove)}));
    };

    const handleSave = async () => {
        setIsLoading(true);
        const [firstName, ...lastNameParts] = editedData.customer.name.split(' ');
        const orderToSave: Partial<Order> = {
            customerInfo: {
                firstName: firstName || '',
                lastName: lastNameParts.join(' ') || '',
                email: editedData.customer.email || '',
                address: editedData.customer.shippingAddress
            },
            items: editedData.items,
            status: editedData.status,
        };
        try {
            await orderService.updateOrder(parseInt(order.id, 10), orderToSave, "Invoice details updated.");
            onUpdate();
        } catch (error) {
            console.error("Failed to save invoice:", error);
            alert("Failed to save invoice changes.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setEditedData(order); // Revert changes to original order prop
        setMode('view');
    };
     
    const handleSavePricing = async (items: CartItem[]) => {
        setEditedData(prev => ({ ...prev, items }));
        // Intentionally not saving to DB here, user must click "Save Changes" on the main modal.
        // This is just updating the state for the editor.
        setItemPricingModalOpen(false);
    };

    const generatePdf = async () => {
        if (!invoiceRef.current) return null;
        const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        return pdf;
    };

    const handlePrint = async () => {
        const pdf = await generatePdf();
        if (pdf) {
            pdf.save(`invoice_${order.id}.pdf`);
        }
    };
    
    const handleSendEmail = async () => {
        const pdf = await generatePdf();
        if (pdf) {
            setPdfBlob(pdf.output('blob'));
            setIsEmailModalOpen(true);
        }
    };


    if (!isOpen) return null;
    
     // --- Task Handlers ---
    const handleAddTask = () => {
        onOpenTaskModal && onOpenTaskModal(null, { type: 'order', id: parseInt(order.id, 10) });
    };

    const handleEditTask = (task: Task) => {
        onOpenTaskModal && onOpenTaskModal(task, null);
    };

    return (
        <>
            {/* Hidden div for PDF generation */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '210mm' }}>
                <InvoiceTemplate order={editedData} refProp={invoiceRef} />
            </div>

            <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Invoice</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Order #{order.id} &bull; {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                            <XIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                        </button>
                    </header>
                    <main className="p-6 overflow-y-auto space-y-6">
                        {/* Customer Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Customer</h3>
                                {mode === 'edit' ? (
                                    <div className="space-y-2">
                                        <input value={editedData.customer.name} onChange={e => setEditedData(p => ({...p, customer: {...p.customer, name: e.target.value}}))} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"/>
                                        <input value={editedData.customer.email} onChange={e => setEditedData(p => ({...p, customer: {...p.customer, email: e.target.value}}))} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"/>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="text-slate-900 dark:text-white">{order.customer.name}</p>
                                            <p className="text-slate-500 dark:text-slate-400">{order.customer.email}</p>
                                        </div>
                                        <a href={`mailto:${order.customer.email}`} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><MailIcon className="w-4 h-4 text-slate-500"/></a>
                                        {order.customer.phone && <a href={`tel:${order.customer.phone}`} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><PhoneIcon className="w-4 h-4 text-slate-500"/></a>}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Shipping Address</h3>
                                {mode === 'edit' ? (
                                    <textarea value={editedData.customer.shippingAddress} onChange={e => setEditedData(p => ({...p, customer: {...p.customer, shippingAddress: e.target.value}}))} rows={3} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"/>
                                ) : (
                                    <p className="text-slate-900 dark:text-white whitespace-pre-line">{order.customer.shippingAddress}</p>
                                )}
                            </div>
                        </div>

                        {/* Items */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-slate-700 dark:text-slate-300">Items</h3>
                                {mode === 'edit' && (
                                    <button
                                        onClick={() => setItemPricingModalOpen(true)}
                                        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        Item Pricing Workflow
                                    </button>
                                )}
                            </div>
                            <div className="border rounded-lg dark:border-slate-700 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                                        <tr>
                                            <th className="p-2 text-left font-medium">Product</th>
                                            <th className="p-2 text-center font-medium w-24">Qty</th>
                                            <th className="p-2 text-right font-medium w-32">Price</th>
                                            <th className="p-2 text-right font-medium w-32">Total</th>
                                            {mode === 'edit' && <th className="w-10"></th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {editedData.items.map((item, index) => (
                                            <tr key={item.id} className="border-t dark:border-slate-700">
                                                <td className="p-2">{mode === 'edit' ? <input value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} className="w-full bg-transparent p-1 rounded focus:ring-1 focus:ring-indigo-500"/> : <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>}</td>
                                                <td className="p-2 text-center">{mode === 'edit' ? <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="w-20 text-center bg-transparent p-1 rounded focus:ring-1 focus:ring-indigo-500"/> : item.quantity}</td>
                                                <td className="p-2 text-right">{mode === 'edit' ? <input type="number" step="0.01" value={item.finalPrice} onChange={e => handleItemChange(index, 'finalPrice', e.target.value)} className="w-28 text-right bg-transparent p-1 rounded focus:ring-1 focus:ring-indigo-500"/> : `$${item.finalPrice.toFixed(2)}`}</td>
                                                <td className="p-2 text-right font-semibold">${(item.quantity * item.finalPrice).toFixed(2)}</td>
                                                {mode === 'edit' && <td className="p-2 text-center"><button type="button" onClick={() => handleRemoveItem(index)}><TrashIcon className="w-4 h-4 text-red-500"/></button></td>}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {mode === 'edit' && <button type="button" onClick={handleAddItem} className="mt-2 text-sm flex items-center gap-1 text-indigo-600 hover:underline"><PlusIcon className="w-4 h-4"/> Add Item</button>}
                        </div>
                        {mode === 'view' && onOpenTaskModal && (
                            <AssociatedTasks entityType="order" entityId={parseInt(order.id, 10)} allTasks={allTasks} onAddTask={handleAddTask} onEditTask={handleEditTask} />
                        )}
                    </main>
                    <footer className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex-shrink-0 flex justify-between items-center gap-6">
                         <div className="flex items-center gap-2">
                             {mode === 'view' && (
                                <>
                                 <button onClick={handlePrint} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" title="Print to PDF"><PrintIcon className="w-5 h-5 text-slate-600 dark:text-slate-300"/></button>
                                 <button onClick={handleSendEmail} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" title="Send Email"><SendIcon className="w-5 h-5 text-slate-600 dark:text-slate-300"/></button>
                                </>
                             )}
                            <div className="ml-4">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Status: </label>
                                {mode === 'edit' ? (
                                    <select value={editedData.status} onChange={e => setEditedData(p => ({...p, status: e.target.value as OrderStatus}))} className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600">
                                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                ) : (
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{order.status}</span>
                                )}
                            </div>
                         </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Grand Total</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">${total.toFixed(2)}</p>
                            </div>
                            {mode === 'view' ? (
                                <button onClick={() => setMode('edit')} className="py-2.5 px-6 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
                                    <EditIcon className="w-5 h-5"/> Edit
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button onClick={handleCancel} className="py-2.5 px-6 rounded-md font-semibold bg-white dark:bg-slate-700 border dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600">Cancel</button>
                                    <button onClick={handleSave} disabled={isLoading} className="py-2.5 px-6 rounded-md font-semibold text-white bg-green-600 hover:bg-green-700 flex items-center justify-center w-32">
                                        {isLoading ? <LoaderIcon className="w-5 h-5"/> : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </footer>
                </div>
            </div>
            {isItemPricingModalOpen && (
                <ItemPricingModal
                    isOpen={isItemPricingModalOpen}
                    onClose={() => setItemPricingModalOpen(false)}
                    items={editedData.items as unknown as CartItem[]}
                    onSave={handleSavePricing}
                />
            )}
             {isEmailModalOpen && (
                <EmailModal
                    isOpen={isEmailModalOpen}
                    onClose={() => setIsEmailModalOpen(false)}
                    order={order}
                    pdfBlob={pdfBlob}
                    stripeEnabled={!!(stripeSettings?.publishableKey && stripeSettings?.secretKey)}
                />
            )}
        </>
    );
};

export default OrderDetailModal;
