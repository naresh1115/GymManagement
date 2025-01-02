import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Edit, Search, Trash2, X } from 'lucide-react';
import { supabase } from '../../services/supabaseClient'; // Ensure the correct import path

const TrainerPageTable = ({ trainers, addTrainer, updateTrainer, deleteTrainer }) => {
  const [filteredTrainers, setFilteredTrainers] = useState(trainers);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [currentTrainer, setCurrentTrainer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const tenantId = 1; // Hardcoded tenantId

  useEffect(() => {
    setFilteredTrainers(trainers);
  }, [trainers]);

  const handleEdit = (trainer) => {
    setCurrentTrainer({ ...trainer, joindate: new Date(trainer.joindate).toISOString().split('T')[0] });
    setOpen(true);
  };

  const handleAdd = () => {
    setCurrentTrainer({ fullname: '', email: '', specialization: '', joindate: new Date().toISOString().split('T')[0] });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      // Prepare trainer data without id for new trainer
      const trainerData = {
        fullname: currentTrainer.fullname,
        email: currentTrainer.email,
        specialization: currentTrainer.specialization,
        joindate: currentTrainer.joindate,
        tenantid: tenantId,
      };

      if (currentTrainer.id) {
        // Update existing trainer
        const { data, error } = await supabase
          .from('trainers')
          .update(trainerData)
          .eq('id', currentTrainer.id)
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          updateTrainer({ ...trainerData, id: currentTrainer.id });
        } else {
          // If no data is returned, manually update the local state
          updateTrainer({ ...trainerData, id: currentTrainer.id });
        }
      } else {
        // Add new trainer
        const { data, error } = await supabase
          .from('trainers')
          .insert([trainerData])
          .select();

        if (error) {
          console.error('Error inserting new trainer:', error);
          throw error;
        }

        console.log('Insert response:', data); // Log the response for debugging

        if (data && data.length > 0) {
          addTrainer(data[0]);
        } else {
          console.error('Failed to insert new trainer: No data returned from the database.');
        }
      }
      setOpen(false);
    } catch (error) {
      console.error('Failed to save trainer:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentTrainer({ ...currentTrainer, [name]: value });
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term === "") {
      setFilteredTrainers(trainers);
    } else {
      const filtered = trainers.filter(trainer =>
        trainer.fullname.toLowerCase().includes(term) ||
        trainer.email.toLowerCase().includes(term)
      );
      setFilteredTrainers(filtered);
    }
    setCurrentPage(1);
  };

  const handleDelete = async (trainerId) => {
    try {
      const { error } = await supabase
        .from('trainers')
        .delete()
        .eq('id', trainerId);

      if (error) throw error;

      deleteTrainer(trainerId);
    } catch (error) {
      console.error('Failed to delete trainer:', error);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const getCurrentPageTrainers = () => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTrainers.slice(start, start + itemsPerPage);
  };

  const totalPages = Math.ceil(filteredTrainers.length / itemsPerPage);

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700 mb-6 relative z-10'
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold text-gray-100'>Trainers</h2>
        <div className='relative flex items-center'>
          <Search className='absolute left-3 text-gray-400 sm:left-2.5 top-2.5' size={20} />
          <input
            type="text"
            placeholder='Search Trainer...'
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
        Add Trainer
      </button>

      <div className='overflow-x-auto' style={{ minHeight: '400px' }}>
        <table className='min-w-full divide-y divide-gray-400'>
          <thead>
            <tr>
              <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Name</th>
              <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Email</th>
              <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Specialization</th>
              <th className='px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase tracking-wider'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-500'>
            {getCurrentPageTrainers().map((trainer) => (
              <motion.tr
                key={trainer.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.1, delay: 0.2 }}
              >
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0 h-10 w-10'>
                      <div className='h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold'>
                        {trainer.fullname ? trainer.fullname.charAt(0) : 'N/A'}
                      </div>
                    </div>
                    <div className='ml-4'>
                      <div className='text-sm font-semibold text-gray-100 tracking-wider'>{trainer.fullname || 'N/A'}</div>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-300'>{trainer.email}</div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-300'>{trainer.specialization}</div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <button className='text-indigo-400 hover:text-indigo-300 mr-3 ml-3' onClick={() => handleEdit(trainer)}>
                    <Edit size={18} />
                  </button>
                  <button className='text-red-400 hover:text-red-300' onClick={() => handleDelete(trainer.id)}>
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

        <div className='text-sm font-medium text-gray-300 tracking-wider mt-5 md:mt-0'>Total Trainers: {filteredTrainers.length}</div>
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
              {currentTrainer?.id ? 'Edit Trainer' : 'Add Trainer'}
            </h1>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='flex flex-col space-y-1'>
                <label className='text-sm text-gray-300'>Full Name</label>
                <input
                  type='text'
                  name='fullname'
                  value={currentTrainer?.fullname || ''}
                  onChange={handleChange}
                  className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                />
              </div>

              <div className='flex flex-col space-y-1'>
                <label className='text-sm text-gray-300'>Email</label>
                <input
                  type='email'
                  name='email'
                  value={currentTrainer?.email || ''}
                  onChange={handleChange}
                  className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                />
              </div>

              <div className='flex flex-col space-y-1'>
                <label className='text-sm text-gray-300'>Specialization</label>
                <input
                  type='text'
                  name='specialization'
                  value={currentTrainer?.specialization || ''}
                  onChange={handleChange}
                  className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                />
              </div>

              <div className='flex flex-col space-y-1'>
                <label className='text-sm text-gray-300'>Join Date</label>
                <input
                  type='date'
                  name='joindate'
                  value={currentTrainer?.joindate ? new Date(currentTrainer.joindate).toISOString().split('T')[0] : ''}
                  onChange={handleChange}
                  className='w-full px-4 py-2 bg-gray-700 text-white rounded-md'
                />
              </div>
            </div>

            <div className='flex justify-end mt-5 space-x-2'>
              <button
                onClick={() => setOpen(false)}
                className='bg-red-600 hover:bg-red-800 text-white font-semibold py-2 px-6 rounded transition duration-300 w-full sm:w-auto'
              >
                <X size={22} />
              </button>
              <button
                onClick={handleSave}
                className='bg-indigo-600 hover:bg-indigo-800 text-white font-semibold py-2 px-6 rounded transition duration-300 w-full sm:w-auto'
              >
                {currentTrainer?.id ? 'Save' : 'Add'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default TrainerPageTable;
