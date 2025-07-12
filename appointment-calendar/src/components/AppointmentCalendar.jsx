import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { patients, doctors, timeSlots } from '../data/appointmentData';
import { getAllAppointments, addAppointment, updateAppointment, deleteAppointment } from '../services/appointmentService';
import AppointmentForm from './AppointmentForm';
import ShowAppointmentList from './ShowAppointmentList';
import { useDarkMode } from '../contexts/DarkModeContext';

function getPatientName(patientId) {
  const patient = patients.find(p => String(p.id) === String(patientId));
  return patient ? patient.name : 'Unknown Patient';
}
function getDoctorName(doctorId) {
  const doctor = doctors.find(d => String(d.id) === String(doctorId));
  return doctor ? doctor.name : 'Unknown Doctor';
}

const defaultForm = {
  patientId: '',
  doctorId: '',
  date: '',
  time: '',
  duration: 30,
  type: 'consultation',
  notes: ''
};

const AppointmentCalendar = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAppointmentList, setShowAppointmentList] = useState(false);
  const [selectedDayAppointments, setSelectedDayAppointments] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterPatient, setFilterPatient] = useState('');
  
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    try {
      const appointments = getAllAppointments();
      setEvents(appointments);
      setFilteredEvents(appointments);
    } catch (e) {
      setEvents([]);
      setFilteredEvents([]);
    }
  }, []);

  useEffect(() => {
    let filtered = events;
    
    if (filterDoctor) {
      filtered = filtered.filter(event => String(event.doctorId) === filterDoctor);
    }
    
    if (filterPatient) {
      filtered = filtered.filter(event => String(event.patientId) === filterPatient);
    }
    
    setFilteredEvents(filtered);
  }, [events, filterDoctor, filterPatient]);

  const handleSave = (formData) => {
    if (selectedEvent) {
      updateAppointment(selectedEvent.id, formData);
      const newEvent = { ...formData, id: selectedEvent.id };
      setEvents(events.map(ev => ev.id === selectedEvent.id ? newEvent : ev));
    } else {
      const saved = addAppointment(formData);
      setEvents([...events, saved]);
    }
    setShowModal(false);
    setForm(defaultForm);
    setSelectedEvent(null);
  };

  const openModal = (date) => {
    setForm({
      ...defaultForm,
      date: format(date, 'yyyy-MM-dd'),
    });
    setSelectedEvent(null);
    setShowModal(true);
  };
  
  const openEditModal = (event) => {
    setForm({
      patientId: event.patientId,
      doctorId: event.doctorId,
      date: event.date,
      time: event.time,
      duration: event.duration,
      type: event.type,
      notes: event.notes || ''
    });
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleDelete = () => {
    if (selectedEvent) {
      deleteAppointment(selectedEvent.id);
      setEvents(events.filter(ev => ev.id !== selectedEvent.id));
      setShowModal(false);
      setForm(defaultForm);
      setSelectedEvent(null);
    }
  };

  const clearFilters = () => {
    setFilterDoctor('');
    setFilterPatient('');
  };

  const FilterSection = () => (
    <div className={`mb-4 p-4 rounded-lg shadow ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Filter Appointments
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Filter by Doctor
          </label>
          <select
            value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
            className={`w-full p-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="">All Doctors</option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Filter by Patient
          </label>
          <select
            value={filterPatient}
            onChange={(e) => setFilterPatient(e.target.value)}
            className={`w-full p-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="">All Patients</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className={`px-4 py-2 rounded font-medium ${isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-500 text-white hover:bg-gray-600'}`}
          >
            Clear Filters
          </button>
        </div>
      </div>
      {(filterDoctor || filterPatient) && (
        <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Showing {filteredEvents.length} of {events.length} appointments
        </div>
      )}
    </div>
  );

  const MobileDayView = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const dayAppointments = filteredEvents.filter(ev => ev.date === format(selectedDate, 'yyyy-MM-dd'));

    const navigateDay = (direction) => {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + direction);
      setSelectedDate(newDate);
    };

    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-primary'}`}>

        <FilterSection />
        
        {/* Header with Date Picker */}
        <div className={`p-4 shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateDay(-1)}
              className={`p-2 rounded-full ${isDarkMode ? 'text-green-400 hover:bg-gray-700' : 'text-green-600 hover:bg-gray-100'}`}
            >
              ←
            </button>
            
            <div className="text-center">
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <button
              onClick={() => navigateDay(1)}
              className={`p-2 rounded-full ${isDarkMode ? 'text-green-400 hover:bg-gray-700' : 'text-green-600 hover:bg-gray-100'}`}
            >
              →
            </button>
          </div>
          
          {/* Date Picker */}
          <div className="mb-4">
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className={`w-full p-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-green-600 text-gray-800'}`}
            />
          </div>
        </div>

        {/* Appointments List */}
        <div className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 280px)' }}>
          {dayAppointments.length === 0 ? (
            <div className="text-center py-8">
              <p className={`mb-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                No appointments for this day
              </p>
              <button
                onClick={() => openModal(selectedDate)}
                className="px-4 py-2 rounded font-medium text-white bg-green-600 hover:bg-green-700"
              >
                + Add Appointment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {dayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`p-4 rounded-lg cursor-pointer border-l-4 border-green-600 ${
                    isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedDayAppointments([appointment]);
                    setSelectedDay(selectedDate);
                    setShowAppointmentList(true);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {getPatientName(appointment.patientId)}
                      </h3>
                      <p className={`text-sm mb-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {getDoctorName(appointment.doctorId)}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {format(new Date(`2000-01-01T${appointment.time}`), 'HH:mm')} - {appointment.type}
                      </p>
                      {appointment.notes && (
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {appointment.type}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Add Appointment Button */}
              <button
                onClick={() => openModal(selectedDate)}
                className="w-full mt-4 px-4 py-2 rounded font-medium text-white bg-green-600 hover:bg-green-700"
              >
                + Add Appointment
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const DesktopMonthView = () => {
    const DayCell = ({ date }) => {
      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
      const isToday = new Date().toDateString() === date.toDateString();
      const dayAppointments = filteredEvents.filter(ev => ev.date === format(date, 'yyyy-MM-dd'));
      const firstAppointment = dayAppointments[0];
      const moreCount = dayAppointments.length - 1;

      return (
        <div
          className={`h-28 p-1 relative flex flex-col rounded ${isToday ? 'border-2 border-green-600' : ''} ${
            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
          style={{ 
            cursor: 'pointer',
            backgroundColor: isCurrentMonth 
              ? (isDarkMode ? '#1a202c' : '#eaf9e7') 
              : (isDarkMode ? '#2d3748' : '#f5f5f5')
          }}
          onClick={e => {
            if (dayAppointments.length === 0) openModal(date);
          }}
        >
          {/* Row 1: Date */}
          <div
            className="text-xs font-bold mb-1"
            style={{ 
              color: isCurrentMonth 
                ? (isDarkMode ? '#e2e8f0' : '#013237') 
                : (isDarkMode ? '#718096' : '#aaa')
            }}
            onClick={e => {
              e.stopPropagation();
              openModal(date);
            }}
          >
            {format(date, 'd')}
          </div>
          {/* Row 2: First appointment */}
          {firstAppointment && (
            <div
              className="text-xs p-1 rounded mb-1"
              style={{ backgroundColor: '#4ca771', color: 'white', minHeight: 24, cursor: 'pointer' }}
              onClick={e => {
                e.stopPropagation();
                setSelectedDayAppointments(dayAppointments);
                setSelectedDay(date);
                setShowAppointmentList(true);
              }}
            >
              {`${getPatientName(firstAppointment.patientId)} - ${format(new Date(`2000-01-01T${firstAppointment.time}`), 'HH:mm')}`}
            </div>
          )}
          {/* Row 3: +X more */}
          {moreCount > 0 && (
            <div
              className="text-xs text-blue-600 mb-1"
              style={{ minHeight: 20, cursor: 'pointer' }}
              onClick={e => {
                e.stopPropagation();
                setSelectedDayAppointments(dayAppointments);
                setSelectedDay(date);
                setShowAppointmentList(true);
              }}
            >
              {`+${moreCount} more`}
            </div>
          )}
          {/* Row 4: Blank, click to book */}
          <div
            className="flex-1"
            onClick={e => {
              e.stopPropagation();
              openModal(date);
            }}
          />
        </div>
      );
    };

    const CustomMonth = ({ date }) => {
      const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
      const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 });
      const days = [];
      let day = start;
      while (day <= end) {
        days.push(new Date(day));
        day = addDays(day, 1);
      }
      return (
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, idx) => (
            <DayCell key={idx} date={d} />
          ))}
        </div>
      );
    };

    return (
      <div className={`p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-primary'}`}>
        {/* Filter Section */}
        <FilterSection />
        
        <div className="mb-4 flex justify-between items-center">
          <button
            className={`px-3 py-1 rounded font-medium ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-dark text-white'}`}
            onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
          >
            Prev
          </button>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-dark'}`}>
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            className={`px-3 py-1 rounded font-medium ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-dark text-white'}`}
            onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
          >
            Next
          </button>
        </div>
        <div className={`grid grid-cols-7 mb-2 text-center text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-dark'}`}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <CustomMonth date={currentDate} />
      </div>
    );
  };

  return (
    <div className={isDarkMode ? 'bg-gray-900' : 'bg-primary'}>
      {isMobileView ? <MobileDayView /> : <DesktopMonthView />}
      
      {/* Appointment Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <AppointmentForm
            initialData={form}
            onSave={handleSave}
            onCancel={() => {
              setShowModal(false);
              setForm(defaultForm);
              setSelectedEvent(null);
            }}
            onDelete={handleDelete}
            isEditing={!!selectedEvent}
          />
        </div>
      )}
      
      {/* Appointment List Modal */}
      <ShowAppointmentList
        open={showAppointmentList}
        onClose={() => setShowAppointmentList(false)}
        appointments={selectedDayAppointments}
        date={selectedDay}
        onSelectAppointment={openEditModal}
      />
    </div>
  );
};

export default AppointmentCalendar;