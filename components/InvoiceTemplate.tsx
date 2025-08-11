
import React from 'react';
import type { ManagedOrder } from '../src/types';

interface InvoiceTemplateProps {
    order: ManagedOrder;
    refProp: React.Ref<HTMLDivElement>;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order, refProp }) => {
    const total = order.items.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

    return (
        <div ref={refProp} className="p-8 bg-white text-black font-sans text-sm">
            <header className="flex justify-between items-start pb-4 border-b border-gray-300">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
                    <p className="text-gray-500">Order #{order.id}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg">Your Company Inc.</p>
                    <p className="text-gray-600">123 Business Rd.</p>
                    <p className="text-gray-600">Suite 100, City, ST 12345</p>
                </div>
            </header>
            <section className="grid grid-cols-2 gap-8 my-6">
                <div>
                    <h2 className="font-semibold text-gray-500 mb-1">BILLED TO</h2>
                    <p className="font-bold">{order.customer.name}</p>
                    <p>{order.customer.email}</p>
                    <p>{order.customer.shippingAddress}</p>
                </div>
                <div className="text-right">
                     <p><span className="font-semibold text-gray-500">Invoice Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                     <p><span className="font-semibold text-gray-500">Due Date:</span> {new Date(new Date(order.createdAt).setDate(new Date(order.createdAt).getDate() + 30)).toLocaleDateString()}</p>
                </div>
            </section>
            <section>
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 text-left font-semibold">Item</th>
                            <th className="p-2 text-center font-semibold w-20">Qty</th>
                            <th className="p-2 text-right font-semibold w-28">Unit Price</th>
                            <th className="p-2 text-right font-semibold w-28">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {order.items.map(item => (
                            <tr key={item.id}>
                                <td className="p-2">
                                    <p className="font-medium">{item.name}</p>
                                    {item.variantDescription && <p className="text-xs text-gray-500">{item.variantDescription}</p>}
                                </td>
                                <td className="p-2 text-center">{item.quantity}</td>
                                <td className="p-2 text-right">${item.finalPrice.toFixed(2)}</td>
                                <td className="p-2 text-right">${(item.finalPrice * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            <section className="flex justify-end mt-6">
                <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-600">Subtotal:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="font-semibold text-gray-600">Tax (0%):</span>
                        <span>$0.00</span>
                    </div>
                    <div className="flex justify-between font-bold text-xl border-t border-gray-300 pt-2">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            </section>
             <footer className="mt-12 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
                <p>Thank you for your business!</p>
                <p>Please contact us with any questions.</p>
            </footer>
        </div>
    );
};

export default InvoiceTemplate;