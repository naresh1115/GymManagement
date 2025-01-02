import React, { useState, useEffect } from 'react';
import { User, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [tempName, setTempName] = useState('');
    const [tempEmail, setTempEmail] = useState('');

    useEffect(() => {
        // Retrieve user data from localStorage
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
            setName(userData.userName || '');
            setEmail(userData.email || '');
            setTempName(userData.userName || '');
            setTempEmail(userData.email || '');
        }
    }, []);

    // Toggle modal visibility
    const openModal = () => {
        setTempName(name);
        setTempEmail(email);
        setIsModalOpen(true);
    };
    const closeModal = () => setIsModalOpen(false);

    // Save changes
    const handleSave = () => {
        setName(tempName);
        setEmail(tempEmail);
        // Update localStorage with new values
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
            userData.userName = tempName;
            userData.email = tempEmail;
            localStorage.setItem('user', JSON.stringify(userData));
        }
        closeModal();
    };

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700 mb-6 relative z-10 min-h-screen'
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
        >
            <div className='flex flex-col sm:flex-row items-center mb-6'>
                <div className='rounded-full size-28 bg-gray-700 flex items-center justify-center mr-4 mb-4 sm:mb-0'>
                    <User className='text-gray-100 size-14' />
                </div>
                <div>
                    <h3 className='text-xl font-semibold text-gray-100 mb-1'>{name}</h3>
                    <p className='text-gray-300'>{email}</p>
                </div>
            </div>

            <button
                onClick={openModal}
                className='bg-indigo-600 hover:bg-indigo-800 text-white font-semibold py-2 px-6 rounded transition duration-300 w-full sm:w-auto'
            >
                Edit Profile
            </button>

            {/* Inline Modal for editing profile */}
            {isModalOpen && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0, duration: 0.5 }}
                >
                    <div className="bg-gray-800 p-6 rounded shadow-2xl w-full max-w-xl relative">
                        <button
                            onClick={closeModal}
                            className="text-gray-300 hover:text-gray-100 absolute top-4 right-4"
                        >
                            <X />
                        </button>
                        <h2 className="text-2xl font-semibold text-gray-100 mb-4 underline tracking-wider">Edit Profile</h2>
                        <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="w-full mb-3 p-2 rounded bg-gray-700 text-white outline-none"
                            placeholder="Enter name"
                        />
                        <input
                            type="email"
                            value={tempEmail}
                            onChange={(e) => setTempEmail(e.target.value)}
                            className="w-full mb-3 p-2 rounded bg-gray-700 text-white outline-none"
                            placeholder="Enter email"
                        />
                        <button
                            onClick={handleSave}
                            className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-300 w-full'
                        >
                            Save Changes
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default Profile;
