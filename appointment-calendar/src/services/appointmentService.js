const STORAGE_KEY = 'appointments';

export const getAllAppointments = () => {
  try {
    const appointments = localStorage.getItem(STORAGE_KEY);
    return appointments ? JSON.parse(appointments) : [];
  } catch (error) {
    console.error('Error reading appointments from localStorage:', error);
    return [];
  }
};

export const saveAllAppointments = (appointments) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  } catch (error) {
    console.error('Error saving appointments to localStorage:', error);
  }
};

export const addAppointment = (appointment) => {
  const appointments = getAllAppointments();
  const newAppointment = {
    ...appointment,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  appointments.push(newAppointment);
  saveAllAppointments(appointments);
  return newAppointment;
};

export const updateAppointment = (id, updatedAppointment) => {
  const appointments = getAllAppointments();
  const index = appointments.findIndex(app => app.id === id);
  if (index !== -1) {
    appointments[index] = {
      ...appointments[index],
      ...updatedAppointment,
      updatedAt: new Date().toISOString()
    };
    saveAllAppointments(appointments);
    return appointments[index];
  }
  return null;
};

export const deleteAppointment = (id) => {
  const appointments = getAllAppointments();
  const filteredAppointments = appointments.filter(app => app.id !== id);
  saveAllAppointments(filteredAppointments);
};

export const getAppointmentsForDate = (date) => {
  const appointments = getAllAppointments();
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  return appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate.getTime() === targetDate.getTime();
  });
};