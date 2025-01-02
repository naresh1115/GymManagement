import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient'; // Ensure the correct import path
import { motion } from 'framer-motion';
import { UserIcon, UserCheck } from 'lucide-react';
import Header from '../components/common_components/Header';
import StatCards from '../components/common_components/StatCards';
import TrainerPageTable from '../components/trainers/TrainerPageTable';
import TrainerGrowthChart from '../components/trainers/TrainerGrowthChart';
import TrainerGenderBarChart from '../components/trainers/TrainerGenderBarChart';
import TrainerDemographicChart from '../components/trainers/TrainerDemographicChart';

const TrainerPage = () => {
    const [trainers, setTrainers] = useState([]);
    const [trainersStat, setTrainersStat] = useState({
        totalTrainers: 0,
        activeTrainers: 0,
    });
    const tenantId = localStorage.getItem('tenantId'); // Retrieve tenantId from localStorage

    useEffect(() => {
        fetchTrainers();
    }, []);

    const fetchTrainers = async () => {
        try {
            let { data: trainers, error } = await supabase
                .from('trainers')
                .select('*')
                .eq('tenantid', tenantId);

            if (error) throw error;

            // Log the fetched trainers data
            console.log('Fetched trainers data:', trainers);

            setTrainers(trainers);
            const processedData = processTrainerData(trainers);
            setTrainersStat(processedData);
        } catch (error) {
            console.error('Failed to fetch trainers:', error);
        }
    };

    const processTrainerData = (trainers) => {
        let totalTrainers = trainers.length;
        let activeTrainers = trainers.filter(trainer => trainer.isActive).length;

        return {
            totalTrainers,
            activeTrainers,
        };
    };

    const addTrainer = async (newTrainer) => {
        try {
            const { data, error } = await supabase
                .from('trainers')
                .insert([newTrainer])
                .select();

            if (error) throw error;

            // Fetch the newly inserted trainer data
            const insertedTrainer = data[0];
            console.log('Newly added trainer:', insertedTrainer); // Log the newly added trainer
            setTrainers(prevTrainers => [...prevTrainers, insertedTrainer]);
            updateStats([...trainers, insertedTrainer]); // Include new trainer data
        } catch (error) {
            console.error('Failed to add trainer:', error);
        }
    };

    const updateTrainer = async (updatedTrainer) => {
        try {
            const { error } = await supabase
                .from('trainers')
                .update(updatedTrainer)
                .eq('id', updatedTrainer.id);

            if (error) throw error;

            const updatedTrainers = trainers.map(trainer =>
                trainer.id === updatedTrainer.id ? updatedTrainer : trainer
            );
            setTrainers(updatedTrainers);
            updateStats(updatedTrainers);
        } catch (error) {
            console.error('Failed to update trainer:', error);
        }
    };

    const deleteTrainer = async (trainerId) => {
        try {
            const { error } = await supabase
                .from('trainers')
                .delete()
                .eq('id', trainerId);

            if (error) throw error;

            const updatedTrainers = trainers.filter(trainer => trainer.id !== trainerId);
            setTrainers(updatedTrainers);
            updateStats(updatedTrainers);
        } catch (error) {
            console.error('Failed to delete trainer:', error);
        }
    };

    const updateStats = (trainers) => {
        const processedData = processTrainerData(trainers);
        setTrainersStat(processedData);
    };

    return (
        <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
            <Header title="Trainers" />
            {/* STAT DATA */}
            <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                <motion.div
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-7"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCards name="Total Trainers" icon={UserIcon} value={trainersStat.totalTrainers.toLocaleString()} color="#6366f1" />
                    <StatCards name="Active Trainers" icon={UserCheck} value={trainersStat.activeTrainers.toLocaleString()} color="#f59e0b" />
                </motion.div>
                {/* TRAINER DATA */}
                <TrainerPageTable
                    trainers={trainers}
                    addTrainer={addTrainer}
                    updateTrainer={updateTrainer}
                    deleteTrainer={deleteTrainer}
                />
                {/* TRAINERS CHARTS */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 pt-8'>
                    <TrainerGrowthChart trainers={trainers} />
                    <TrainerGenderBarChart trainers={trainers} />
                    <TrainerDemographicChart trainers={trainers} />
                </div>
            </main>
        </div>
    );
};

export default TrainerPage;
