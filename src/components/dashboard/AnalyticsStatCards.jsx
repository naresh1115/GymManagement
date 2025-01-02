import React from 'react';
import { motion } from 'framer-motion';
import { Users, Dumbbell, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const AnalyticsStatCards = ({ totalMembers, totalMemberChange, membershipGrowth, currentMonthMemberships }) => {
  const Analytics_Card_Data = [
    { name: 'Total Members', value: totalMembers, change: totalMemberChange, icon: Users },
    { name: 'Membership Growth', value: currentMonthMemberships, change: membershipGrowth, icon: Dumbbell },
  ];

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8'>
      {Analytics_Card_Data.map((item, index) => (
        <motion.div
          key={item.name}
          className='bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700'
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2 }}
        >
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-base font-medium text-gray-300'>{item.name}</h3>
              <p className='mt-2 text-xl font-semibold text-gray-100'>{item.value}</p>
            </div>

            <div className={`
              p-3 rounded-full bg-opacity-20 ${item.change >= 0 ? "bg-green-500" : "bg-red-500"}
            `}>
              <item.icon
                className={`size-6 ${item.change >= 0 ? "text-green-500" : "text-red-500"}`}
              />
            </div>
          </div>

          <div className={`
            mt-4 flex items-center ${item.change >= 0 ? "text-green-500" : "text-red-500"}
          `}>
            {item.change >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
            <span className='ml-1 text-sm font-medium'>{Math.abs(item.change)}%</span>
            <span className='ml-2 text-sm font-medium text-gray-400'>vs last period</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AnalyticsStatCards;
