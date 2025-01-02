import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { motion } from 'framer-motion';

const TrainerGenderBarChart = ({ trainers }) => {
  const [genderData, setGenderData] = useState([]);

  useEffect(() => {
    if (trainers) {
      const processedData = processTrainerData(trainers);
      setGenderData(processedData);
    }
  }, [trainers]);

  const processTrainerData = (trainers) => {
    const genderCounts = { Male: 0, Female: 0, Unknown: 0 };

    trainers.forEach(trainer => {
      const gender = inferGender(trainer.fullname); // use 'fullname' instead of 'fullName'
      if (gender === 'Male') {
        genderCounts.Male++;
      } else if (gender === 'Female') {
        genderCounts.Female++;
      } else {
        genderCounts.Unknown++;
      }
    });

    return [
      { name: 'Male', value: genderCounts.Male },
      { name: 'Female', value: genderCounts.Female },
    ];
  };

  const inferGender = (fullname) => {
    if (!fullname) return 'Unknown';
    
    const maleNames = ["Ravi", "Suresh", "Arun", "Naveen", "Ashwin", "Vikas", "Karthik", "Ganesh", "Raghav", "Manoj"];
    const femaleNames = ["Meera", "Priya", "Divya", "Sneha", "Kavya", "Sadhana", "Harini", "Nivedita", "Amrita"];

    const firstName = fullname.split(' ')[0];
    if (maleNames.includes(firstName)) {
      return 'Male';
    } else if (femaleNames.includes(firstName)) {
      return 'Female';
    } else {
      return 'Unknown';
    }
  };

  const COLORS = ['#8884d8', '#82ca9d']; // Colors for Male and Female

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700'
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.3, delay: 0.7 }}
    >
      <h2 className='text-xl font-semibold mb-4 text-gray-100'>
        Trainer Gender Distribution
      </h2>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={genderData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke='#9ca3af' />
            <YAxis stroke='#9ca3af' />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "#4b5563",
              }}
              itemStyle={{ color: "#e5e7eb" }}
            />
            <Legend />
            <Bar dataKey="value" fill="#8884d8">
              {genderData.map((entry, index) => (
                <Cell key={`cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default TrainerGenderBarChart;
