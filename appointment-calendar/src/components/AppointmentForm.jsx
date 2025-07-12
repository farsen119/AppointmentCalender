import React, { useState, useEffect } from 'react';
import { patients, doctors, timeSlots } from '../data/appointmentData';

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
      className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
      onSubmit={handleSubmit}
    >
      <h2 className="text-xl font-semibold mb-4" style={{ color: '#013237' }}>
        {isEditing ? 'Edit Appointment' : 'Add Appointment'}
      </h2>
      {formError && <div className="text-red-600 mb-2">{formError}</div>}
      <div className="mb-2">
        <label className="block mb-1">Patient *</label>
        <select
          className="w-full border rounded p-2"
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
        <label className="block mb-1">Doctor *</label>
        <select
          className="w-full border rounded p-2"
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
        <label className="block mb-1">Date *</label>
        <input
          type="date"
          className="w-full border rounded p-2"
          value={form.date}
          onChange={e => handleChange('date', e.target.value)}
        />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Time *</label>
        <select
          className="w-full border rounded p-2"
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
        <label className="block mb-1">Notes</label>
        <input
          type="text"
          className="w-full border rounded p-2"
          value={form.notes}
          onChange={e => handleChange('notes', e.target.value)}
        />
      </div>
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          className="flex-1 py-2 border rounded text-accent border-accent"
          onClick={onCancel}
        >
          Cancel
        </button>
        {isEditing && (
          <button
            type="button"
            className="flex-1 py-2 border rounded text-white bg-red-600"
            onClick={onDelete}
          >
            Delete
          </button>
        )}
        <button
          type="submit"
          className="flex-1 py-2 border rounded text-white"
          style={{ backgroundColor: '#4ca771' }}
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;