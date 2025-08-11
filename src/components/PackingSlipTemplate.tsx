/**
 * @file PackingSlipTemplate component.
 * @description Provides a print-friendly layout for a packing slip, excluding pricing information.
 */
import React from 'react';
import type { ManagedOrder } from '../types';

interface PackingSlipTemplateProps {
    order: ManagedOrder;
    refProp: React.Ref<HTMLDivElement>;
}

const PackingSlipTemplate: React.FC<PackingSlipTemplateProps> = ({ order, refProp }) => {
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div ref={refProp} className="p-8 bg-white text-black font-sans text-sm">
            <header className="flex justify-between items-start pb-4 border-b border-gray-300">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">PACKING SLIP</h1>
                    <p className="text-gray-500">Order #{order.id}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg">Your Company Inc.</p>
                    <p className="text-gray-600">123 Business Rd.</p>
                    <p className="text-gray-600">Suite 100, City, ST 12345</p>
                </div>
            </header>
            <section className="my-6">
                <h2 className="font-semibold text-gray-500 mb-1">SHIPPING TO</h2>
                <p className="font-bold">{order.customer.name}</p>
                <p>{order.customer.shippingAddress}</p>
            </section>
            <section>
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 text-left font-semibold">Item</th>
                            <th className="p-2 text-center font-semibold w-24">Quantity</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {order.items.map(item => (
                            <tr key={item.id}>
                                <td className="p-2">
                                    <p className="font-medium">{item.name}</p>
                                    {item.variantDescription && <p className="text-xs text-gray-500">{item.variantDescription}</p>}
                                </td>
                                <td className="p-2 text-center font-bold">{item.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
             <footer className="mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-600">
                <p><strong>Total Items:</strong> {totalItems}</p>
                <p className="mt-2">Thank you for your order!</p>
            </footer>
        </div>
    );
};

export default PackingSlipTemplate;
