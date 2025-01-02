import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, X } from 'lucide-react';
import { supabase } from '../../services/supabaseClient'; // Ensure the correct import path

const MembershipPlans = () => {
  const [plans, setPlans] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const tenantId = 1; // Hardcode tenantId to 1

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      let { data, error } = await supabase
        .from('membershiptypes')
        .select('*')
        .eq('tenantid', tenantId);

      if (error) {
        throw new Error(error.message);
      }

      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleEdit = (plan) => {
    setCurrentPlan(plan);
    setOpen(true);
  };

  const handleAdd = () => {
    setCurrentPlan({ id: null, name: '', description: '', durationinmonths: '', price: '' });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      const requestBody = {
        name: currentPlan.name,
        description: currentPlan.description,
        durationinmonths: parseInt(currentPlan.durationinmonths, 10),
        price: parseFloat(currentPlan.price),
        tenantid: tenantId,
      };

      console.log('Saving plan:', requestBody); // Log the request body for debugging

      if (currentPlan.id) {
        const { error } = await supabase
          .from('membershiptypes')
          .update(requestBody)
          .eq('id', currentPlan.id);

        if (error) {
          throw new Error(error.message);
        }

        setPlans(plans.map(p => (p.id === currentPlan.id ? { ...p, ...requestBody } : p)));
      } else {
        const { data, error } = await supabase
          .from('membershiptypes')
          .insert([requestBody])
          .select();

        if (error) {
          throw new Error(error.message);
        }

        setPlans([...plans, data[0]]);
      }
      setOpen(false);
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const handleDelete = async (planId) => {
    try {
      const { error } = await supabase
        .from('membershiptypes')
        .delete()
        .eq('id', planId);

      if (error) {
        throw new Error(error.message);
      }

      setPlans(plans.filter(p => p.id !== planId));
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentPlan({ ...currentPlan, [name]: value });
  };

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700 mb-6 relative z-10'
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold text-gray-100'>Membership Plans</h2>
      </div>

      <button
        onClick={handleAdd}
        className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4"
      >
        Add Plan
      </button>

      <div className='overflow-x-auto' style={{ minHeight: '400px' }}>
        <table className='min-w-full divide-y divide-gray-400'>
          <thead>
            <tr>
              <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Name</th>
              <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Description</th>
              <th className='px-6 py-3 text-center text-sm font-medium text-gray-300 uppercase tracking-wider'>Price</th>
              <th className='px-6 py-3 text-center text-sm font-medium text-gray-300 uppercase tracking-wider'>Duration (months)</th>
              <th className='px-6 py-3 text-center text-sm font-medium text-gray-300 uppercase tracking-wider'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-500'>
            {plans.map((plan) => (
              <motion.tr
                key={plan.id} // Ensure each row has a unique key
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.1, delay: 0.2 }}
              >
                <td className='px-6 py-4 text-left whitespace-nowrap'>
                  <div className='text-sm text-gray-300'>{plan.name}</div>
                </td>
                <td className='px-6 py-4 text-left whitespace-nowrap'>
                  <div className='text-sm text-gray-300'>{plan.description}</div>
                </td>
                <td className='px-6 py-4 text-center whitespace-nowrap'>
                  <div className='text-sm text-gray-300'>${plan.price}</div>
                </td>
                <td className='px-6 py-4 text-center whitespace-nowrap'>
                  <div className='text-sm text-gray-300'>{plan.durationinmonths}</div>
                </td>
                <td className='px-6 py-4 text-center whitespace-nowrap'>
                  <button className='text-indigo-400 hover:text-indigo-300 mr-3 ml-3' onClick={() => handleEdit(plan)}>
                    <Edit size={18} />
                  </button>
                  <button className='text-red-400 hover:text-red-300' onClick={() => handleDelete(plan.id)}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
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
              {currentPlan?.id ? 'Edit Plan' : 'Add Plan'}
            </h1>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='flex flex-col space-y-1'>
                <label className='text-sm text-gray-300'>Name</label>
                <input
                  type='text'
                  name='name'
                  value={currentPlan?.name || ''}
                  onChange={handleChange}
                  className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                />
              </div>

              <div className='flex flex-col space-y-1'>
                <label className='text-sm text-gray-300'>Description</label>
                <input
                  type='text'
                  name='description'
                  value={currentPlan?.description || ''}
                  onChange={handleChange}
                  className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                />
              </div>

              <div className='flex flex-col space-y-1'>
                <label className='text-sm text-gray-300'>Duration (months)</label>
                <input
                  type='number'
                  name='durationinmonths'
                  value={currentPlan?.durationinmonths || ''}
                  onChange={handleChange}
                  className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                />
              </div>

              <div className='flex flex-col space-y-1'>
                <label className='text-sm text-gray-300'>Price</label>
                <input
                  type='number'
                  name='price'
                  value={currentPlan?.price || ''}
                  onChange={handleChange}
                  className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                />
              </div>
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
                className='bg-blue-600 hover:bg-blue-800 text-white text-md px-4 py-2 rounded-md w-24'
              >
                {currentPlan?.id ? 'Save' : 'Add'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default MembershipPlans;
