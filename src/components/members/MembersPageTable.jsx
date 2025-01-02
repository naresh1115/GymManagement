import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Edit, Search, Trash2, X } from 'lucide-react';
import { supabase } from '../../services/supabaseClient'; // Import the Supabase client

const MembersPageTable = ({
    members,
    addMember,
    updateMember,
    deleteMember,
    isAddModalOpen,
    setAddModalOpen,
    newMember,
    setNewMember,
    isEditModalOpen,
    setEditModalOpen,
    editMember,
    setEditMember
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredMembers, setFilteredMembers] = useState(members);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setFilteredMembers(members);
    }, [members]);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        if (term === "") {
            setFilteredMembers(members);
        } else {
            const filtered = members.filter(member =>
                member.fullname.toLowerCase().includes(term) ||
                member.email.toLowerCase().includes(term)
            );
            setFilteredMembers(filtered);
        }
        setCurrentPage(1);
    };

    const handleAdd = async () => {
        try {
            await addMember(newMember);
            setAddModalOpen(false); // Close the modal immediately
            setNewMember({
                fullname: "",
                email: "",
                dateofbirth: "",
                joindate: "",
                address: "",
                phonenumber: "",
                gender: "",
                emergencycontactname: "",
                emergencycontactphone: "",
                tenantid: 1,
                trainerid: null,
                membershipstatus: null
            }); // Reset new member state
        } catch (error) {
            console.error('Failed to add member:', error);
        }
    };

    const handleEdit = (member) => {
        setEditMember({
            ...member,
            dateofbirth: formatDate(member.dateofbirth),
            joindate: formatDate(member.joindate),
        });
        setEditModalOpen(true);
    };

    const handleSave = async () => {
        try {
            await updateMember(editMember);
            setEditModalOpen(false);
        } catch (error) {
            console.error('Failed to update member:', error);
        }
    };

    const handleDelete = async (memberId) => {
        try {
            await deleteMember(memberId);
        } catch (error) {
            console.error('Failed to delete member:', error);
        }
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const getCurrentPageMembers = () => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredMembers.slice(start, start + itemsPerPage);
    };

    const formatJoinDate = (joinDate) => {
        const date = new Date(joinDate);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700 mb-6 relative z-10'
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Members</h2>
                <div className='relative flex items-center'>
                    <Search className='absolute left-3 text-gray-400 sm:left-2.5 top-2.5' size={20} />
                    <input
                        type="text"
                        placeholder='Search Member...'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500'
                        onChange={handleSearch}
                        value={searchTerm}
                    />
                </div>
            </div>

            <button
                onClick={() => setAddModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-800 text-white font-semibold py-2 px-6 rounded transition duration-300 w-full sm:w-auto"
            >
                Add Member
            </button>

            <div className='overflow-x-auto' style={{ minHeight: '400px' }}>
                <table className='min-w-full divide-y divide-gray-400'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Full Name</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Email</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Phone Number</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Membership Status</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Join Date</th>
                            <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Actions</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-500'>
                        {getCurrentPageMembers().map((member) => (
                            <motion.tr
                                key={member.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1.1, delay: 0.2 }}
                            >
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='flex items-center'>
                                        <div className='flex-shrink-0 h-10 w-10'>
                                            <div className='h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold'>
                                                {member.fullname.charAt(0)}
                                            </div>
                                        </div>
                                        <div className='ml-4'>
                                            <div className='text-sm font-semibold text-gray-100 tracking-wider'>{member.fullname}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{member.email}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{member.phonenumber}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <span className={`px-4 inline-flex rounded-full text-xs bg-gray-200 leading-5 font-semibold
                                        ${member.membershipstatus === "Active" ? "text-green-700" : "text-red-700"}`}>
                                        {member.membershipstatus || 'Unknown'}
                                    </span>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{formatJoinDate(member.joindate)}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <button className='text-indigo-400 hover:text-indigo-300 mr-3 ml-3' onClick={() => handleEdit(member)}>
                                        <Edit size={18} />
                                    </button>
                                    <button className='text-red-400 hover:text-red-300' onClick={() => handleDelete(member.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className='flex flex-col md:flex-row justify-between mt-4 space-x-2 items-center'>
                <div className='flex items-center'>
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`text-sm px-3 py-1 border rounded-md ${currentPage === 1 ? 'text-gray-400 border-gray-600' : 'text-gray-100 border-gray-300 hover:bg-gray-300 hover:text-gray-800'}`}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className='mx-2 text-sm font-medium text-gray-100'>Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`text-sm px-3 py-1 border rounded-md ${currentPage === totalPages ? 'text-gray-400 border-gray-600' : 'text-gray-100 border-gray-300 hover:bg-gray-300 hover:text-gray-800'}`}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                <div className='text-sm font-medium text-gray-300 tracking-wider mt-5 md:mt-0'>Total Members: {filteredMembers.length}</div>
            </div>

            {isEditModalOpen && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
                    <motion.div
                        className='bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-xl'
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h1 className='text-2xl font-semibold text-gray-100 mb-3 underline tracking-wider'>Edit Member</h1>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Full Name</label>
                                <input
                                    type='text'
                                    value={editMember.fullname}
                                    onChange={(e) => setEditMember({ ...editMember, fullname: e.target.value })}
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Email</label>
                                <input
                                    type='email'
                                    value={editMember.email}
                                    onChange={(e) => setEditMember({ ...editMember, email: e.target.value })}
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Phone Number</label>
                                <input
                                    type='text'
                                    value={editMember.phonenumber}
                                    onChange={(e) => setEditMember({ ...editMember, phonenumber: e.target.value })}
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Date of Birth</label>
                                <input
                                    type='date'
                                    value={editMember.dateofbirth}
                                    onChange={(e) => setEditMember({ ...editMember, dateofbirth: e.target.value })}
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Join Date</label>
                                <input
                                    type='date'
                                    value={editMember.joindate}
                                    onChange={(e) => setEditMember({ ...editMember, joindate: e.target.value })}
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Address</label>
                                <input
                                    type='text'
                                    value={editMember.address}
                                    onChange={(e) => setEditMember({ ...editMember, address: e.target.value })}
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Gender</label>
                                <select
                                    value={editMember.gender}
                                    onChange={(e) => setEditMember({ ...editMember, gender: e.target.value })}
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Emergency Contact Name</label>
                                <input
                                    type='text'
                                    value={editMember.emergencycontactname}
                                    onChange={(e) => setEditMember({ ...editMember, emergencycontactname: e.target.value })}
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Emergency Contact Phone</label>
                                <input
                                    type='text'
                                    value={editMember.emergencycontactphone}
                                    onChange={(e) => setEditMember({ ...editMember, emergencycontactphone: e.target.value })}
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>
                        </div>

                        <div className='flex justify-end mt-5 space-x-2'>
                            <button
                                onClick={() => setEditModalOpen(false)}
                                className='bg-gray-600 hover:bg-red-500 text-gray-100 px-4 py-2 rounded-md'
                            >
                                <X size={22} />
                            </button>
                            <button
                                onClick={handleSave}
                                className='bg-indigo-600 hover:bg-indigo-800 text-white font-semibold py-2 px-6 rounded transition duration-300 w-full sm:w-auto'
                            >
                                Save
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {isAddModalOpen && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
                    <motion.div
                        className='bg-gray-800 rounded-lg shadow-lg p-6 max-w-xl w-full'
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h1 className='text-2xl font-semibold text-gray-100 mb-6 underline tracking-wider'>Add New Member</h1>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Full Name</label>
                                <input
                                    type="text"
                                    value={newMember.fullname}
                                    onChange={(e) => setNewMember({ ...newMember, fullname: e.target.value })}
                                    placeholder='Full Name'
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Email</label>
                                <input
                                    type="email"
                                    value={newMember.email}
                                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                    placeholder='Email'
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Phone Number</label>
                                <input
                                    type='text'
                                    value={newMember.phonenumber}
                                    onChange={(e) => setNewMember({ ...newMember, phonenumber: e.target.value })}
                                    placeholder='Phone Number'
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Date of Birth</label>
                                <input
                                    type='date'
                                    value={newMember.dateofbirth}
                                    onChange={(e) => setNewMember({ ...newMember, dateofbirth: e.target.value })}
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Join Date</label>
                                <input
                                    type='date'
                                    value={newMember.joindate}
                                    onChange={(e) => setNewMember({ ...newMember, joindate: e.target.value })}
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Address</label>
                                <input
                                    type='text'
                                    value={newMember.address}
                                    onChange={(e) => setNewMember({ ...newMember, address: e.target.value })}
                                    placeholder='Address'
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Gender</label>
                                <select
                                    value={newMember.gender}
                                    onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Emergency Contact Name</label>
                                <input
                                    type='text'
                                    value={newMember.emergencycontactname}
                                    onChange={(e) => setNewMember({ ...newMember, emergencycontactname: e.target.value })}
                                    placeholder='Emergency Contact Name'
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>

                            <div className='flex flex-col space-y-1'>
                                <label className='text-sm text-gray-300'>Emergency Contact Phone</label>
                                <input
                                    type='text'
                                    value={newMember.emergencycontactphone}
                                    onChange={(e) => setNewMember({ ...newMember, emergencycontactphone: e.target.value })}
                                    placeholder='Emergency Contact Phone'
                                    className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                                />
                            </div>
                        </div>

                        <div className='flex justify-end mt-6 space-x-2'>
                            <button onClick={() => setAddModalOpen(false)} className='bg-gray-600 hover:bg-red-500 text-gray-100 px-4 py-2 rounded-md'>
                                <X size={22} />
                            </button>
                            <button onClick={handleAdd} className='bg-indigo-600 hover:bg-indigo-800 text-white font-semibold py-2 px-6 rounded transition duration-300 w-full sm:w-auto'>
                                Add
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default MembersPageTable;
