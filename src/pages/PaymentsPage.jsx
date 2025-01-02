import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient'; // Adjust the import path as needed

import Header from '../components/common_components/Header';
import StatCards from '../components/common_components/StatCards';
import PaymentsTable from '../components/payments/PaymentsTable';

const PaymentsPage = () => {
    const [payments, setPayments] = useState([]);
    const [paymentsStat, setPaymentsStat] = useState({
        totalPayments: 0,
        paymentsToday: 0,
        paymentsMonthly: 0,
        totalAmount: 0,
    });

    const tenantId = localStorage.getItem('tenantId'); // Retrieve tenantId from localStorage

    useEffect(() => {
        if (tenantId) {
            fetchPayments();
        }
    }, [tenantId]);

    const fetchPayments = async () => {
        try {
            let { data: payments, error } = await supabase
                .from('payments')
                .select(`
                    *,
                    member:members(fullName)
                `)
                .eq('tenantId', tenantId);

            if (error) throw error;

            setPayments(payments);
            const processedData = processPaymentData(payments);
            setPaymentsStat(processedData);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        }
    };

    const processPaymentData = (payments) => {
        const currentDate = new Date();
        const startOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59, 999);

        let totalPayments = payments.length;
        let paymentsToday = 0;
        let paymentsMonthly = 0;
        let totalAmount = 0;

        payments.forEach(payment => {
            const paymentDate = new Date(payment.paymentDate);
            totalAmount += payment.amount;
            if (paymentDate >= startOfToday && paymentDate <= endOfToday) {
                paymentsToday++;
            }
            if (paymentDate >= startOfMonth && paymentDate < startOfToday.setDate(startOfToday.getDate() + 1)) {
                paymentsMonthly++;
            }
        });

        return {
            totalPayments,
            paymentsToday,
            paymentsMonthly,
            totalAmount: totalAmount.toFixed(2),
        };
    };

    const addPayment = (newPayment) => {
        console.log('Adding payment:', newPayment); // Debugging statement
        setPayments(prevPayments => [...prevPayments, newPayment]);
        updateStats();
    };

    const updatePayment = (updatedPayment) => {
        console.log('Updating payment:', updatedPayment); // Debugging statement
        setPayments(prevPayments =>
            prevPayments.map(payment =>
                payment.id === updatedPayment.id ? updatedPayment : payment
            )
        );
        updateStats();
    };

    const deletePayment = (paymentId) => {
        console.log('Deleting payment with ID:', paymentId); // Debugging statement
        setPayments(prevPayments => prevPayments.filter(payment => payment.id !== paymentId));
        updateStats();
    };

    const updateStats = () => {
        const processedData = processPaymentData(payments);
        setPaymentsStat(processedData);
    };

    return (
        <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
            <Header title="Payments" />

            {/* STAT DATA */}
            <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                <motion.div
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 mb-7"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCards name="Total Payments" icon={DollarSign} value={paymentsStat.totalPayments.toLocaleString()} color="#6366f1" />
                    <StatCards name="Payments Today" icon={CreditCard} value={paymentsStat.paymentsToday} color="#10b981" />
                    <StatCards name="Payments This Month" icon={CheckCircle} value={paymentsStat.paymentsMonthly.toLocaleString()} color="#f59e0b" />
                    <StatCards name="Total Amount" icon={XCircle} value={`$${paymentsStat.totalAmount}`} color="#ef4444" />
                </motion.div>

                {/* PAYMENT DATA */}
                <PaymentsTable
                    payments={payments}
                    addPayment={addPayment}
                    updatePayment={updatePayment}
                    deletePayment={deletePayment}
                />
            </main>
        </div>
    );
};

export default PaymentsPage;
