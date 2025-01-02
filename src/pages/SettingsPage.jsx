import React, { useState } from 'react';
import Header from '../components/common_components/Header';
import Profile from '../components/settings/Profile';
import MembershipPlans from '../components/settings/MembershipPlans'; 

const SettingsPage = () => {
  const [tabIndex, setTabIndex] = useState(0); // Set default tab to "User Management"

  const handleTabChange = (newIndex) => {
    setTabIndex(newIndex);
  };

  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
      <Header title="Settings" />
      <main className="max-w-4xl mx-auto py-6 px-4 lg:px-8">
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg mb-4 flex justify-between">
          <div className="flex space-x-4">
            <button
              className={`p-2 ${tabIndex === 0 ? 'bg-blue-500 text-white' : 'text-gray-400'}`}
              onClick={() => handleTabChange(0)}
            >
              User Management
            </button>
            <button
              className={`p-2 ${tabIndex === 1 ? 'bg-blue-500 text-white' : 'text-gray-400'}`}
              onClick={() => handleTabChange(1)}
            >
              Membership Plans
            </button>
          </div>
        </div>
        {tabIndex === 0 && <Profile />}
        {tabIndex === 1 && <MembershipPlans />}
      </main>
    </div>
  );
};

export default SettingsPage;
