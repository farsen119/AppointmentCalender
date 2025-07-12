import React from 'react';
import { format } from 'date-fns';
import { patients, doctors } from '../data/appointmentData';
import { useDarkMode } from '../contexts/DarkModeContext';

function getPatientName(patientId) {
  const patient = patients.find(p => String(p.id) === String(patientId));
  return patient ? patient.name : 'Unknown Patient';
}
function getDoctorName(doctorId) {
  const doctor = doctors.find(d => String(d.id) === String(doctorId));
  return doctor ? doctor.name : 'Unknown Doctor';
}

const ShowAppointmentList = ({
  open,
  onClose,
  appointments,
  date,
  onSelectAppointment
}) => {
  const { isDarkMode } = useDarkMode();
  
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`rounded-lg p-6 w-full max-w-md mx-4 ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-dark'}`}>
            Appointments for {date ? format(date, 'EEEE, MMMM d, yyyy') : ''}
          </h2>
          <button
            onClick={onClose}
            className={`hover:text-gray-700 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                isDarkMode 
                  ? 'border-gray-600 hover:bg-gray-700' 
                  : 'border-green-600 hover:bg-gray-50'
              }`}
              onClick={() => {
                onClose();
                onSelectAppointment(appointment);
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-dark'}`}>
                    {getPatientName(appointment.patientId)}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-accent'}`}>
                    {getDoctorName(appointment.doctorId)}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {format(new Date(`2000-01-01T${appointment.time}`), 'HH:mm')} - {appointment.type}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  {appointment.type}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button
            onClick={onClose}
            className={`w-full py-2 px-4 border rounded-lg font-medium ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-accent text-accent hover:bg-gray-50'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowAppointmentList;