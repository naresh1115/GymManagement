import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, UserIcon, UserPlus } from 'lucide-react';
import { supabase } from '../services/supabaseClient'; // Import the Supabase client

import Header from '../components/common_components/Header';
import StatCards from '../components/common_components/StatCards';
import MembersPageTable from '../components/members/MembersPageTable';
import MemberGrowthChart from '../components/members/MemberGrowthChart';
import MemberGenderBarChart from '../components/members/MemberGenderBarChart';
import MemberDemographicChart from '../components/members/MemberDemographicChart';

const UsersPage = () => {
    const [members, setMembers] = useState([]);
    const [usersStat, setUsersStat] = useState({
        totalMembers: 0,
        newMembersToday: 0,
        newMembersMonthly: 0,
    });
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [newMember, setNewMember] = useState({
        fullname: "",
        email: "",
        dateofbirth: "",
        joindate: "",
        address: "",
        phonenumber: "",
        gender: "",
        emergencycontactname: "",
        emergencycontactphone: "",
        tenantid: 1, // Hardcoded tenantId
        trainerid: null, // Default trainerId to null
        membershipstatus: null // Default membershipStatus to null
    });
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editMember, setEditMember] = useState(null);

    const tenantId = localStorage.getItem('tenantId'); // Retrieve tenantId from localStorage

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            let { data, error } = await supabase
                .from('members')
                .select('*')
                .eq('tenantid', tenantId);

            if (error) {
                throw new Error(error.message);
            }

            setMembers(data);
            const processedData = processMemberData(data);
            setUsersStat(processedData);
        } catch (error) {
            console.error('Failed to fetch members:', error);
        }
    };

    const processMemberData = (members) => {
        const currentDate = new Date();
        const startOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59, 999);

        let totalMembers = members.length;
        let newMembersToday = 0;
        let newMembersMonthly = 0;

        members.forEach(member => {
            const joinDate = new Date(member.joindate);
            if (joinDate >= startOfToday && joinDate <= endOfToday) {
                newMembersToday++;
            }
            if (joinDate >= startOfMonth && joinDate < startOfToday.setDate(startOfToday.getDate() + 1)) {
                newMembersMonthly++;
            }
        });

        return {
            totalMembers,
            newMembersToday,
            newMembersMonthly,
        };
    };

    const addMember = async (newMember) => {
        try {
            const { data, error } = await supabase
                .from('members')
                .insert([{ ...newMember, tenantid: tenantId }])
                .select();

            if (error) {
                throw new Error(error.message);
            }

            if (data && data.length > 0) {
                setMembers(prevMembers => [...prevMembers, data[0]]);
                updateStats();
            } else {
                console.error('Failed to add member: No data returned from the database.');
            }
        } catch (error) {
            console.error('Failed to add member:', error);
        }
    };

    const updateMember = async (updatedMember) => {
        try {
            const { data, error } = await supabase
                .from('members')
                .update(updatedMember)
                .eq('id', updatedMember.id)
                .select();

            if (error) {
                throw new Error(error.message);
            }

            if (data && data.length > 0) {
                setMembers(prevMembers =>
                    prevMembers.map(member =>
                        member.id === updatedMember.id ? data[0] : member
                    )
                );
                updateStats();
            } else {
                console.error('Failed to update member: No data returned from the database.');
            }
        } catch (error) {
            console.error('Failed to update member:', error);
        }
    };

    const deleteMember = async (memberId) => {
        try {
            const { error } = await supabase
                .from('members')
                .delete()
                .eq('id', memberId);

            if (error) {
                throw new Error(error.message);
            }

            setMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
            updateStats();
        } catch (error) {
            console.error('Failed to delete member:', error);
        }
    };

    const updateStats = () => {
        const processedData = processMemberData(members);
        setUsersStat(processedData);
    };

    return (
        <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
            <Header title="Members" />

            {/* STAT DATA */}
            <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                <motion.div
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-7"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCards name="Total Members" icon={UserIcon} value={usersStat.totalMembers.toLocaleString()} color="#6366f1" />
                    <StatCards name="New Members Joined Today" icon={UserPlus} value={usersStat.newMembersToday} color="#10b981" />
                    <StatCards name="New Members Joined This Month" icon={UserCheck} value={usersStat.newMembersMonthly.toLocaleString()} color="#f59e0b" />
                </motion.div>

                {/* MEMBER DATA */}
                <MembersPageTable
                    members={members}
                    addMember={addMember}
                    updateMember={updateMember}
                    deleteMember={deleteMember}
                    isAddModalOpen={isAddModalOpen}
                    setAddModalOpen={setAddModalOpen}
                    newMember={newMember}
                    setNewMember={setNewMember}
                    isEditModalOpen={isEditModalOpen}
                    setEditModalOpen={setEditModalOpen}
                    editMember={editMember}
                    setEditMember={setEditMember}
                />

                {/* MEMBERS CHARTS */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 pt-8'>
                    <MemberGrowthChart members={members} />
                    <MemberGenderBarChart members={members} />
                    <MemberDemographicChart members={members} />
                </div>
            </main>
        </div>
    );
};

export default UsersPage;
