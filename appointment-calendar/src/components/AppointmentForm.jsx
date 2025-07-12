import React, { useState, useEffect } from 'react';
import { patients, doctors, timeSlots } from '../data/appointmentData';
import { useDarkMode } from '../contexts/DarkModeContext';

const defaultForm = {
  patientId: '',
  doctorId: '',
  date: '',
  time: '',
  duration: 30,
  type: 'consultation',
  notes: ''
};

const AppointmentForm = ({
  initialData,
  onSave,
  onCancel,
  onDelete,
  isEditing
}) => {
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState('');
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    setForm(initialData || defaultForm);
    setFormError('');
  }, [initialData]);

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (formError) setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.patientId || !form.doctorId || !form.date || !form.time) {
      setFormError('Please fill in all required fields');
      return;
    }
    onSave(form);
  };

  return (
    <form
      className={`rounded-lg p-6 w-full max-w-md mx-4 ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}
      onSubmit={handleSubmit}
    >
      <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-dark'}`}>
        {isEditing ? 'Edit Appointment' : 'Add Appointment'}
      </h2>
      {formError && <div className="text-red-600 mb-2">{formError}</div>}
      
      <div className="mb-2">
        <label className={`block mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Patient *</label>
        <select
          className={`w-full border rounded p-2 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          value={form.patientId}
          onChange={e => handleChange('patientId', e.target.value)}
        >
          <option value="">Select Patient</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      
      <div className="mb-2">
        <label className={`block mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Doctor *</label>
        <select
          className={`w-full border rounded p-2 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          value={form.doctorId}
          onChange={e => handleChange('doctorId', e.target.value)}
        >
          <option value="">Select Doctor</option>
          {doctors.map(d => (
            <option key={d.id} value={d.id}>{d.name} - {d.specialization}</option>
          ))}
        </select>
      </div>
      
      <div className="mb-2">
        <label className={`block mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date *</label>
        <input
          type="date"
          className={`w-full border rounded p-2 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          value={form.date}
          onChange={e => handleChange('date', e.target.value)}
        />
      </div>
      
      <div className="mb-2">
        <label className={`block mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Time *</label>
        <select
          className={`w-full border rounded p-2 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          value={form.time}
          onChange={e => handleChange('time', e.target.value)}
        >
          <option value="">Select Time</option>
          {timeSlots.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      
      <div className="mb-2">
        <label className={`block mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Notes</label>
        <input
          type="text"
          className={`w-full border rounded p-2 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          value={form.notes}
          onChange={e => handleChange('notes', e.target.value)}
        />
      </div>
      
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          className={`flex-1 py-2 border rounded font-medium ${
            isDarkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-accent text-accent hover:bg-gray-50'
          }`}
          onClick={onCancel}
        >
          Cancel
        </button>
        {isEditing && (
          <button
            type="button"
            className="flex-1 py-2 border rounded font-medium text-white bg-red-600 hover:bg-red-700"
            onClick={onDelete}
          >
            Delete
          </button>
        )}
        <button
          type="submit"
          className="flex-1 py-2 border rounded font-medium text-white bg-accent hover:bg-green-700"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;