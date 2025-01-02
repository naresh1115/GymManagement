import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

const MemberDemographicChart = ({ members }) => {
    const [demographicData, setDemographicData] = useState([]);

    useEffect(() => {
        const processedData = processMemberData(members);
        setDemographicData(processedData);
    }, [members]);

    const processMemberData = (members) => {
        const ageRanges = {
            '18-24': 0,
            '25-34': 0,
            '35-44': 0,
            '45-54': 0,
            '55+': 0,
        };

        members.forEach(member => {
            const dob = new Date(member.dateofbirth);
            const age = calculateAge(dob);
            if (age >= 18 && age <= 24) {
                ageRanges['18-24']++;
            } else if (age >= 25 && age <= 34) {
                ageRanges['25-34']++;
            } else if (age >= 35 && age <= 44) {
                ageRanges['35-44']++;
            } else if (age >= 45 && age <= 54) {
                ageRanges['45-54']++;
            } else if (age >= 55) {
                ageRanges['55+']++;
            }
        });

        const processedData = Object.keys(ageRanges)
            .map(range => ({
                name: range,
                value: ageRanges[range],
            }))
            .filter(entry => entry.value > 0);

        console.log('Processed Demographic Data:', processedData);

        return processedData;
    };

    const calculateAge = (dob) => {
        const diff = Date.now() - dob.getTime();
        const ageDate = new Date(diff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 lg:col-span-2 border border-gray-700'
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.8, delay: 1.2 }}
        >
            <h2 className='text-xl font-semibold mb-4 text-gray-100'>
                Member Age Demographics
            </h2>

            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={demographicData}
                            cx='50%'
                            cy='50%'
                            outerRadius={100}
                            fill='#8884d8'
                            labelLine={false}
                            dataKey='value'
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {demographicData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>

                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(31, 45, 55, 0.8)',
                                borderColor: '#4b5563',
                            }}
                            itemStyle={{ color: '#e5e7eb' }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default MemberDemographicChart;
