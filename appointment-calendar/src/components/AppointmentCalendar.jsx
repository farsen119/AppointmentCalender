import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { patients, doctors, timeSlots } from '../data/appointmentData';
import { getAllAppointments, addAppointment, updateAppointment, deleteAppointment } from '../services/appointmentService';
import AppointmentForm from './AppointmentForm';
import ShowAppointmentList from './ShowAppointmentList';

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
  
  // Filter states
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterPatient, setFilterPatient] = useState('');

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

  // Filter appointments when filters change
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
    <div className="mb-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3" style={{ color: '#013237' }}>
        Filter Appointments
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Filter by Doctor</label>
          <select
            value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
            className="w-full p-2 border rounded"
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
          <label className="block text-sm font-medium mb-1">Filter by Patient</label>
          <select
            value={filterPatient}
            onChange={(e) => setFilterPatient(e.target.value)}
            className="w-full p-2 border rounded"
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
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
      </div>
      {(filterDoctor || filterPatient) && (
        <div className="mt-2 text-sm text-gray-600">
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
      <div style={{ backgroundColor: '#eaf9e7', minHeight: '100vh' }}>
        {/* Filter Section */}
        <FilterSection />
        
        {/* Header with Date Picker */}
        <div style={{ backgroundColor: 'white', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button
              onClick={() => navigateDay(-1)}
              style={{ 
                padding: '8px', 
                borderRadius: '50%', 
                border: 'none',
                color: '#4ca771',
                cursor: 'pointer'
              }}
            >
              ←
            </button>
            
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: '#013237', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
              <p style={{ color: '#4ca771', fontSize: '14px', margin: '4px 0 0 0' }}>
                {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <button
              onClick={() => navigateDay(1)}
              style={{ 
                padding: '8px', 
                borderRadius: '50%', 
                border: 'none',
                color: '#4ca771',
                cursor: 'pointer'
              }}
            >
              →
            </button>
          </div>
          
          {/* Date Picker */}
          <div style={{ marginBottom: '16px' }}>
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #4ca771',
                borderRadius: '4px',
                color: '#013237',
                fontSize: '16px'
              }}
            />
          </div>
        </div>

        {/* Appointments List */}
        <div style={{ padding: '16px', overflowY: 'auto', height: 'calc(100vh - 280px)' }}>
          {dayAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <p style={{ color: '#4ca771', marginBottom: '16px' }}>No appointments for this day</p>
              <button
                onClick={() => openModal(selectedDate)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: '#4ca771',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                + Add Appointment
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    borderLeft: '4px solid #4ca771'
                  }}
                  onClick={() => {
                    setSelectedDayAppointments([appointment]);
                    setSelectedDay(selectedDate);
                    setShowAppointmentList(true);
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ color: '#013237', fontWeight: '600', margin: '0 0 4px 0' }}>
                        {getPatientName(appointment.patientId)}
                      </h3>
                      <p style={{ color: '#4ca771', fontSize: '14px', margin: '0 0 4px 0' }}>
                        {getDoctorName(appointment.doctorId)}
                      </p>
                      <p style={{ color: '#666', fontSize: '14px', margin: '0' }}>
                        {format(new Date(`2000-01-01T${appointment.time}`), 'HH:mm')} - {appointment.type}
                      </p>
                      {appointment.notes && (
                        <p style={{ color: '#999', fontSize: '14px', margin: '4px 0 0 0' }}>{appointment.notes}</p>
                      )}
                    </div>
                    <span style={{
                      fontSize: '12px',
                      backgroundColor: '#f0f0f0',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      {appointment.type}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Add Appointment Button */}
              <button
                onClick={() => openModal(selectedDate)}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: '#4ca771',
                  border: 'none',
                  cursor: 'pointer'
                }}
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
          className={`h-28 p-1 relative flex flex-col rounded ${isToday ? 'border-2 border-green-600' : ''}`}
          style={{ 
            cursor: 'pointer',
            backgroundColor: isCurrentMonth ? '#eaf9e7' : '#f5f5f5'
          }}
          onClick={e => {
            if (dayAppointments.length === 0) openModal(date);
          }}
        >
          {/* Row 1: Date */}
          <div
            className="text-xs font-bold mb-1"
            style={{ color: isCurrentMonth ? '#013237' : '#aaa' }}
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

    // Custom month view
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
      <div className="p-4">
        {/* Filter Section */}
        <FilterSection />
        
        <div className="mb-4 flex justify-between items-center">
          <button
            className="px-3 py-1 rounded bg-dark text-white"
            onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
          >
            Prev
          </button>
          <h2 className="text-2xl font-bold" style={{ color: '#013237' }}>
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            className="px-3 py-1 rounded bg-dark text-white "
            onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
          >
            Next
          </button>
        </div>
        <div className="grid grid-cols-7 mb-2 text-center text-sm font-semibold" style={{ color: '#013237' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <CustomMonth date={currentDate} />
      </div>
    );
  };

  return (
    <div>
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