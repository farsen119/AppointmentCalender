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
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAppointmentList, setShowAppointmentList] = useState(false);
  const [selectedDayAppointments, setSelectedDayAppointments] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  // Load appointments from localStorage
  useEffect(() => {
    try {
      const appointments = getAllAppointments();
      setEvents(appointments);
    } catch (e) {
      setEvents([]);
    }
  }, []);

  // Add or update appointment
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

  // Open modal for new or edit
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

  // Delete
  const handleDelete = () => {
    if (selectedEvent) {
      deleteAppointment(selectedEvent.id);
      setEvents(events.filter(ev => ev.id !== selectedEvent.id));
      setShowModal(false);
      setForm(defaultForm);
      setSelectedEvent(null);
    }
  };

  // Custom day cell rendering
  const DayCell = ({ date }) => {
    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
    const isToday = new Date().toDateString() === date.toDateString();
    const dayAppointments = events.filter(ev => ev.date === format(date, 'yyyy-MM-dd'));
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
          // Only open add form if not clicking on appointment or +X more
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
              // Always open the list modal, even if only one appointment
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

  // Navigation
  const handleNavigate = (date) => {
    setCurrentDate(date);
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <button
          className="px-3 py-1 rounded bg-green-100 text-green-800"
          onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
        >
          Prev
        </button>
        <h2 className="text-2xl font-bold" style={{ color: '#013237' }}>
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button
          className="px-3 py-1 rounded bg-green-100 text-green-800"
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