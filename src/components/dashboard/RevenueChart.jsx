import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RevenueChart = ({ revenueData }) => {
    const [selectedTimeRange, setSelectedTimeRange] = useState("6 Months");
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        filterData(revenueData, selectedTimeRange);
    }, [revenueData, selectedTimeRange]);

    const filterData = (data, timeRange) => {
        const currentDate = new Date();
        let filtered = [];

        switch (timeRange) {
            case '3 Months':
                filtered = data.filter(entry => {
                    const entryDate = new Date(entry.month);
                    const diffInMonths = (currentDate.getFullYear() - entryDate.getFullYear()) * 12 +
                                         currentDate.getMonth() - entryDate.getMonth();
                    return diffInMonths <= 3;
                });
                break;
            case '6 Months':
                filtered = data.filter(entry => {
                    const entryDate = new Date(entry.month);
                    const diffInMonths = (currentDate.getFullYear() - entryDate.getFullYear()) * 12 +
                                         currentDate.getMonth() - entryDate.getMonth();
                    return diffInMonths <= 6;
                });
                break;
            case '1 Year':
                filtered = data.filter(entry => {
                    const entryDate = new Date(entry.month);
                    return entryDate.getFullYear() === currentDate.getFullYear();
                });
                break;
            default:
                filtered = data;
        }

        console.log('Filtered Data:', filtered); // Debugging log
        setFilteredData(filtered);
    };

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700 mb-7'
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.4 }}
        >
            <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold text-gray-100 mb-4'>
                    Revenue
                </h2>

                <select
                    className='bg-gray-700 text-white rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-600'
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                >
                    <option>3 Months</option>
                    <option>6 Months</option>
                    <option>1 Year</option>
                </select>
            </div>

            <div className='w-full h-80'>
                <ResponsiveContainer>
                    <LineChart data={filteredData}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                        <XAxis dataKey="month" stroke='#9ca3af' />
                        <YAxis
                            stroke='#9ca3af'
                            domain={[0, Math.max(...filteredData.map(entry => entry.revenue)) + 4]}
                            ticks={Array.from({ length: Math.ceil((Math.max(...filteredData.map(entry => entry.revenue)) + 4) / 4) + 1 }, (_, i) => i * 4)}
                            tickFormatter={(tick) => tick % 4 === 0 ? tick : ''}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(31, 41, 55, 0.8)",
                                borderColor: "#4b5563",
                            }}
                            itemStyle={{ color: "#e5e7eb" }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey='revenue'
                            stroke='#8b5cf6'
                            strokeWidth={2}
                            dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default RevenueChart;
