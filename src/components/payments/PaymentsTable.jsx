import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../services/supabaseClient'; // Adjust the import path as needed

const PaymentsTable = ({ payments, addPayment, updatePayment, deletePayment }) => {
  const [filteredPayments, setFilteredPayments] = useState(payments);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [membershipTypes, setMembershipTypes] = useState([]);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const tenantId = localStorage.getItem('tenantId'); // Retrieve tenantId from localStorage

  useEffect(() => {
    if (tenantId) {
      fetchMembershipTypes(tenantId).then(setMembershipTypes);
    }
  }, [tenantId]);

  useEffect(() => {
    setFilteredPayments(payments);
  }, [payments]);

  const fetchMembershipTypes = async (tenantId) => {
    try {
      let { data: membershipTypes, error } = await supabase
        .from('membershipTypes')
        .select('*')
        .eq('tenantId', tenantId);

      if (error) throw error;
      console.log('Fetched membership types:', membershipTypes); // Debugging statement
      return membershipTypes;
    } catch (error) {
      console.error('Error fetching membership types:', error);
      return [];
    }
  };

  const fetchMemberDetails = async (memberId) => {
    try {
      let { data: member, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId)
        .single();

      if (error) throw error;
      return member;
    } catch (error) {
      console.error('Error fetching member details:', error);
      return null;
    }
  };

  const handleEdit = (payment) => {
    console.log('Editing payment:', payment); // Debugging statement
    setCurrentPayment({ ...payment, paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0] });
    setEditModalOpen(true);
  };

  const handleAdd = () => {
    setCurrentPayment({ id: null, memberId: '', amount: '', paymentDate: '', paymentMethod: '', membershipTypeId: '' });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      const requestBody = {
        id: currentPayment.id || 0,
        memberId: parseInt(currentPayment.memberId, 10),
        amount: parseFloat(currentPayment.amount),
        paymentDate: currentPayment.paymentDate,
        paymentMethod: currentPayment.paymentMethod,
        tenantId: parseInt(tenantId, 10),
      };

      console.log('Request Body:', requestBody); // Debugging statement

      let { data: newPayment, error } = currentPayment.id
        ? await supabase
          .from('payments')
          .update(requestBody)
          .eq('id', currentPayment.id)
          .single()
        : await supabase
          .from('payments')
          .insert([requestBody])
          .single();

      if (error) throw error;

      console.log('New Payment:', newPayment); // Debugging statement

      // Fetch member details for the new payment
      const memberDetails = await fetchMemberDetails(newPayment.memberId);

      const paymentWithMember = { ...newPayment, member: memberDetails };

      if (currentPayment.id) {
        updatePayment(paymentWithMember);
      } else {
        addPayment(paymentWithMember);
      }

      setOpen(false); // Close the payment form
      setEditModalOpen(false); // Close the edit modal
    } catch (error) {
      console.error('Error saving payment:', error);
    }
  };

  const handleDelete = async (paymentId) => {
    try {
      let { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;
      deletePayment(paymentId);
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentPayment({ ...currentPayment, [name]: value });

    // Automatically fill the amount based on the selected membership type
    if (name === 'membershipTypeId') {
      const selectedMembershipType = membershipTypes.find(type => type.id === parseInt(value, 10));
      if (selectedMembershipType) {
        setCurrentPayment(prevPayment => ({
          ...prevPayment,
          amount: selectedMembershipType.price,
        }));
      }
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term === "") {
      setFilteredPayments(payments);
    } else {
      const filtered = payments.filter(payment =>
        payment.member?.fullName.toLowerCase().includes(term) ||
        payment.amount.toString().includes(term)
      );
      setFilteredPayments(filtered);
    }
    setCurrentPage(1); // Reset to the first page when searching
  };

  const handleMemberSearch = async (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 2) {
      try {
        let { data: members, error } = await supabase
          .from('members')
          .select('*')
          .eq('tenantId', tenantId)
          .ilike('fullName', `%${e.target.value}%`);

        if (error) throw error;
        setSearchResults(members);
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const selectMember = (member) => {
    setCurrentPayment({ ...currentPayment, memberId: member.id });
    setSearchResults([]);
    setSearchQuery('');
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const getCurrentPagePayments = () => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  };

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700 mb-6 relative z-10'
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold text-gray-100'>Payments</h2>
        <div className='relative flex items-center'>
          <Search className='absolute left-3 text-gray-400 sm:left-2.5 top-2.5' size={20} />
          <input
            type="text"
            placeholder='Search Payment...'
            className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500'
            onChange={handleSearch}
            value={searchTerm}
          />
        </div>
      </div>

      <button
        onClick={handleAdd}
        className="bg-indigo-600 hover:bg-indigo-800 text-white font-semibold py-2 px-6 rounded transition duration-300 w-full sm:w-auto"
      >
        Add Payment
      </button>

      <div className='overflow-x-auto' style={{ minHeight: '400px' }}>
        <table className='min-w-full divide-y divide-gray-400'>
          <thead>
            <tr>
              <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Member</th>
              <th className='px-6 py-3 text-center text-sm font-medium text-gray-300 uppercase tracking-wider'>Amount</th>
              <th className='px-6 py-3 text-center text-sm font-medium text-gray-300 uppercase tracking-wider'>Date</th>
              <th className='px-6 py-3 text-center text-sm font-medium text-gray-300 uppercase tracking-wider'>Method</th>
              <th className='px-6 py-3 text-center text-sm font-medium text-gray-300 uppercase tracking-wider'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-500'>
            {getCurrentPagePayments().map((payment) => (
              <motion.tr
                key={payment.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.1, delay: 0.2 }}
              >
                <td className='px-6 py-4 text-left whitespace-nowrap'>
                  <div className='text-sm text-gray-300'>{payment.member?.fullName || 'N/A'}</div>
                </td>
                <td className='px-6 py-4 text-center whitespace-nowrap'>
                  <div className='text-sm text-gray-300'>${payment.amount}</div>
                </td>
                <td className='px-6 py-4 text-center whitespace-nowrap'>
                  <div className='text-sm text-gray-300'>{new Date(payment.paymentDate).toLocaleDateString()}</div>
                </td>
                <td className='px-6 py-4 text-center whitespace-nowrap'>
                  <div className='text-sm text-gray-300'>{payment.paymentMethod}</div>
                </td>
                <td className='px-6 py-4 text-center whitespace-nowrap'>
                  <button className='text-indigo-400 hover:text-indigo-300 mr-3 ml-3' onClick={() => handleEdit(payment)}>
                    <Edit size={18} />
                  </button>
                  <button className='text-red-400 hover:text-red-300' onClick={() => handleDelete(payment.id)}>
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

        <div className='text-sm font-medium text-gray-300 tracking-wider mt-5 md:mt-0'>Total Payments: {filteredPayments.length}</div>
      </div>

      {open && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
          <motion.div
            className='bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-xl'
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className='text-2xl font-semibold text-gray-100 mb-3 underline tracking-wider'>
              {currentPayment?.id ? 'Edit Payment' : 'Add Payment'}
            </h1>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='flex flex-col space-y-1'>
                <label className='text-sm text-gray-300'>Member ID</label>
                <input
                  type='number'
                  name='memberId'
                  value={currentPayment?.memberId || ''}
                  onChange={handleChange}
                  className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                />
              </div>

              <div className='flex flex-col space-y-1'>
                <label className='text-sm text-gray-300'>Amount</label>
                <input
                  type='number'
                  name='amount'
                  value={currentPayment?.amount || ''}
                  onChange={handleChange}
                  className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                />
              </div>

              <div className='flex flex-col space-y-1'>
                <label className='text-sm text-gray-300'>Payment Date</label>
                <input
                  type='date'
                  name='paymentDate'
                  value={currentPayment?.paymentDate || ''}
                  onChange={handleChange}
                  className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                />
              </div>

              <div className='flex flex-col space-y-1'>
                <label className='text-sm text-gray-300'>Payment Method</label>
                <select
                  name='paymentMethod'
                  value={currentPayment?.paymentMethod || ''}
                  onChange={handleChange}
                  className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                >
                  <option value=''>Select Payment Method</option>
                  <option value='Cash'>Cash</option>
                  <option value='Card'>Card</option>
                  <option value='UPI'>UPI</option>
                </select>
              </div>

              <div className='flex flex-col space-y-1'>
                <label className='text-sm text-gray-300'>Membership Type</label>
                <select
                  name='membershipTypeId'
                  value={currentPayment?.membershipTypeId || ''}
                  onChange={handleChange}
                  className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                >
                  <option value=''>Select Membership Type</option>
                  {membershipTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div className='flex flex-col space-y-1'>
                <label className='text-sm text-gray-300'>Search Member</label>
                <input
                  type='text'
                  value={searchQuery}
                  onChange={handleMemberSearch}
                  className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                  placeholder='Search by name'
                />
              </div>

              {searchResults.length > 0 && (
                <div className='mt-2'>
                  <ul className='list-none p-0 m-0'>
                    {searchResults.map(member => (
                      <li
                        key={member.id}
                        className='text-sm text-gray-300 cursor-pointer hover:text-gray-100'
                        onClick={() => selectMember(member)}
                      >
                        {member.fullName}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className='flex justify-end mt-5 space-x-2'>
              <button
                onClick={() => setOpen(false)}
                className='bg-gray-600 hover:bg-red-500 text-gray-100 px-4 py-2 rounded-md'
              >
                <X size={22} />
              </button>
              <button
                onClick={handleSave}
                className='bg-indigo-600 hover:bg-indigo-800 text-white font-semibold py-2 px-6 rounded transition duration-300 w-full sm:w-auto'
              >
                {currentPayment?.id ? 'Save' : 'Add'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {isEditModalOpen && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
          <motion.div
            className='bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-xl'
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className='text-2xl font-semibold text-gray-100 mb-3 underline tracking-wider'>
              Edit Payment
            </h1>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='flex flex-col space-y-1'>
                <label className='text-sm text-gray-300'>Member ID</label>
                <input
                  type='number'
                  name='memberId'
                  value={currentPayment?.memberId || ''}
                  onChange={handleChange}
                  className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                />
              </div>

              <div className='flex flex-col space-y-1'>
                <label className='text-sm text-gray-300'>Amount</label>
                <input
                  type='number'
                  name='amount'
                  value={currentPayment?.amount || ''}
                  onChange={handleChange}
                  className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                />
              </div>

              <div className='flex flex-col space-y-1'>
                <label className='text-sm text-gray-300'>Payment Date</label>
                <input
                  type='date'
                  name='paymentDate'
                  value={currentPayment?.paymentDate || ''}
                  onChange={handleChange}
                  className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                />
              </div>

              <div className='flex flex-col space-y-1'>
                <label className='text-sm text-gray-300'>Payment Method</label>
                <select
                  name='paymentMethod'
                  value={currentPayment?.paymentMethod || ''}
                  onChange={handleChange}
                  className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                >
                  <option value=''>Select Payment Method</option>
                  <option value='Cash'>Cash</option>
                  <option value='Card'>Card</option>
                  <option value='UPI'>UPI</option>
                </select>
              </div>

              <div className='flex flex-col space-y-1'>
                <label className='text-sm text-gray-300'>Membership Type</label>
                <select
                  name='membershipTypeId'
                  value={currentPayment?.membershipTypeId || ''}
                  onChange={handleChange}
                  className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                >
                  <option value=''>Select Membership Type</option>
                  {membershipTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div className='flex flex-col space-y-1'>
                <label className='text-sm text-gray-300'>Search Member</label>
                <input
                  type='text'
                  value={searchQuery}
                  onChange={handleMemberSearch}
                  className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                  placeholder='Search by name'
                />
              </div>

              {searchResults.length > 0 && (
                <div className='mt-2'>
                  <ul className='list-none p-0 m-0'>
                    {searchResults.map(member => (
                      <li
                        key={member.id}
                        className='text-sm text-gray-300 cursor-pointer hover:text-gray-100'
                        onClick={() => selectMember(member)}
                      >
                        {member.fullName}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className='flex justify-end mt-5 space-x-2'>
              <button
                onClick={() => setEditModalOpen(false)}
                className='bg-indigo-600 hover:bg-indigo-800 text-white font-semibold py-2 px-6 rounded transition duration-300 w-full sm:w-auto'
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
    </motion.div>
  );
};

export default PaymentsTable;
