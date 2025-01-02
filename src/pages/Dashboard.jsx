import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import AnalyticsStatCards from '../components/dashboard/AnalyticsStatCards';
import Header from '../components/common_components/Header';
import MemberGrowthChart from '../components/dashboard/MemberGrowthChart';
import TrainerDemographicChartDashboard from '../components/dashboard/TrainerDemographicChartDashboard';
import RevenueChart from '../components/dashboard/RevenueChart'; // Import the RevenueChart component

const Dashboard = () => {
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [membershipGrowth, setMembershipGrowth] = useState(0);
  const [totalMemberChange, setTotalMemberChange] = useState(0);
  const [currentMonthMemberships, setCurrentMonthMemberships] = useState(0);
  const [memberGrowthData, setMemberGrowthData] = useState([]);
  const [revenueData, setRevenueData] = useState([]); // State to hold revenue data
  const tenantId = localStorage.getItem('tenantId');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('tenantid', tenantId);

        if (error) {
          throw new Error(error.message);
        }

        setMembers(data);
        calculateTotalMemberChange(data);
        setMemberGrowthData(processMemberData(data));
      } catch (error) {
        console.error('Failed to fetch members:', error);
      }
    };

    const fetchTrainers = async () => {
      try {
        const { data, error } = await supabase
          .from('trainers')
          .select('*')
          .eq('tenantid', tenantId);

        if (error) {
          throw new Error(error.message);
        }

        setTrainers(data);
      } catch (error) {
        console.error('Failed to fetch trainers:', error);
      }
    };

    const fetchMemberships = async () => {
      try {
        const { data, error } = await supabase
          .from('memberships')
          .select('*')
          .eq('tenantid', tenantId);

        if (error) {
          throw new Error(error.message);
        }

        calculateMembershipGrowth(data);
      } catch (error) {
        console.error('Failed to fetch memberships:', error);
      }
    };

    const fetchPayments = async () => {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('tenantid', tenantId);

        if (error) {
          throw new Error(error.message);
        }

        processPaymentData(data);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      }
    };

    fetchMembers();
    fetchTrainers();
    fetchMemberships();
    fetchPayments();
  }, [tenantId]);

  const processMemberData = (members) => {
    const monthCounts = {};

    members.forEach(member => {
      const joinDate = new Date(member.joindate);
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
        month: `${month}-${year}`,
        Members: monthCounts[monthYear]
      };
    });
  };

  const calculateTotalMemberChange = (members) => {
    const monthlyMembers = calculateMonthlyMembers(members);
    const currentMonthIndex = new Date().getMonth();
    const currentMonthMembers = monthlyMembers[currentMonthIndex].members || 0;
    const lastMonthMembers = monthlyMembers[currentMonthIndex - 1].members || 0;

    const memberChange = lastMonthMembers === 0
      ? (currentMonthMembers === 0 ? 0 : 100) // Handle division by zero case
      : ((currentMonthMembers - lastMonthMembers) / lastMonthMembers) * 100;

    setTotalMemberChange(memberChange.toFixed(1));
  };

  const calculateMonthlyMembers = (members) => {
    const months = Array(12).fill(0).map((_, i) => ({
      month: new Date(0, i).toLocaleString('default', { month: 'short' }),
      members: 0
    }));
    members.forEach(member => {
      const joinMonth = new Date(member.joindate).getMonth();
      months[joinMonth].members++;
    });
    return months;
  };

  const calculateMonthlyMemberships = (memberships) => {
    const months = Array(12).fill(0); // Initialize an array with 12 zeros
    memberships.forEach(membership => {
      const startMonth = new Date(membership.startdate).getMonth();
      months[startMonth]++;
    });
    return months;
  };

  const calculateMembershipGrowth = (memberships) => {
    const monthlyMemberships = calculateMonthlyMemberships(memberships);
    const currentMonthIndex = new Date().getMonth();
    const currentMonthMemberships = monthlyMemberships[currentMonthIndex] || 0;
    const lastMonthMemberships = monthlyMemberships[currentMonthIndex - 1] || 0;

    const growthRate = lastMonthMemberships === 0
      ? (currentMonthMemberships === 0 ? 0 : 100) // Handle division by zero case
      : ((currentMonthMemberships - lastMonthMemberships) / lastMonthMemberships) * 100;

    setMembershipGrowth(growthRate.toFixed(1));
    setCurrentMonthMemberships(currentMonthMemberships);
  };

  const processPaymentData = (payments) => {
    const monthlyRevenue = Array(12).fill(0); // Initialize an array with 12 zeros

    payments.forEach(payment => {
      const paymentMonth = new Date(payment.paymentdate).getMonth();
      monthlyRevenue[paymentMonth] += payment.amount;
    });

    const revenueData = monthlyRevenue.map((revenue, index) => ({
      month: new Date(2024, index, 1).toLocaleString('default', { month: 'short' }),
      revenue
    }));

    console.log('Processed Revenue Data:', revenueData); // Debugging log
    setRevenueData(revenueData);
  };

  return (
    <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
      <Header title="Gym Dashboard" />
      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        <AnalyticsStatCards
          totalMembers={members.length}
          totalMemberChange={totalMemberChange}
          membershipGrowth={membershipGrowth}
          currentMonthMemberships={currentMonthMemberships}
        />
        <div className='mb-7'></div> {/* Add spacing below the RevenueChart */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-7'>
          <div className='w-full h-full'>
            <MemberGrowthChart data={memberGrowthData} />
          </div>
          <div className='w-full h-full'>
            <TrainerDemographicChartDashboard trainers={trainers} />
          </div>
        </div>
        <div className='w-full h-full'>
          <RevenueChart revenueData={revenueData} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
