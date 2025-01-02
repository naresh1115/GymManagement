import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const TrainerGrowthChart = ({ trainers }) => {
  const processTrainerData = (trainers) => {
    const monthCounts = {};

    trainers.forEach(trainer => {
      const joinDate = new Date(trainer.joindate); // use 'joindate' as per your table structure
      const monthYear = `${joinDate.getMonth() + 1}-${joinDate.getFullYear()}`;
      if (!monthCounts[monthYear]) {
        monthCounts[monthYear] = 0;
      }
      monthCounts[monthYear]++;
    });

    const sortedMonths = Object.keys(monthCounts).sort((a, b) => {
      const [monthA, yearA] = a.split('-').map(Number);
      const [monthB, yearB] = b.split('-').map(Number);
      return yearA - yearB || monthA - monthB;
    });

    return sortedMonths.map(monthYear => {
      const [month, year] = monthYear.split('-');
      return {
        name: `${month}-${year}`,
        Trainers: monthCounts[monthYear]
      };
    });
  };

  const formatXAxis = (tickItem) => {
    const [month, year] = tickItem.split('-');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames[month - 1];
  };

  const formatYAxis = (tickItem) => {
    return tickItem % 4 === 0 ? tickItem : '';
  };

  const getLast6MonthsData = (data) => {
    const currentDate = new Date();
    const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1);

    return data.filter(data => {
      const [month, year] = data.name.split('-');
      const dataDate = new Date(year, month - 1);
      return dataDate >= sixMonthsAgo && dataDate <= currentDate;
    });
  };

  const trainerGrowthData = processTrainerData(trainers);
  const filteredData = getLast6MonthsData(trainerGrowthData);
  const maxTrainers = Math.max(...filteredData.map(data => data.Trainers), 0);

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700'
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.3, delay: 0.7 }}
    >
      <h2 className='text-xl font-semibold mb-4 text-gray-100'>
        Trainer Growth
      </h2>

      <div className='h-80'>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray={'3 3'} stroke='#374151' />
            <XAxis dataKey="name" stroke='#9ca3af' tickFormatter={formatXAxis} />
            <YAxis
              stroke='#9ca3af'
              domain={[0, maxTrainers + 4]}
              ticks={Array.from({ length: Math.ceil((maxTrainers + 4) / 4) + 1 }, (_, i) => i * 4)}
              tickFormatter={formatYAxis}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 45, 55, 0.8)",
                borderColor: "#4b5563"
              }}
              itemStyle={{ color: "#e5e7eb" }}
            />
            <Line
              type="linear"
              dataKey='Trainers'
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

export default TrainerGrowthChart;
