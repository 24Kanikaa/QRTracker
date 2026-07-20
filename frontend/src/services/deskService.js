import api from "./api";

export const getDesks = () =>
  api.get("/desks");

export const getDeskReports = () =>
  api.get("/desks/reports");

export const createDesk = (data) =>
  api.post("/desks", data);

export const updateDesk = (id, data) =>
  api.put(`/desks/${id}`, data);

export const deleteDesk = (id) =>
  api.delete(`/desks/${id}`);

export const toggleDeskStatus = (id, active) =>
  api.patch(`/desks/${id}/status`, {
    active,
  });

export const getDesk = (id) =>
  api.get(`/desks/${id}`);

export const getDashboardData = () =>
  api.get("/dashboard/overview");

export const getDeskStudents = (id) =>
  api.get(`/desks/${id}/students`);

export const getDeskQR = (id) =>
  api.get(`/desks/${id}/qr`);

export const scanDesk = (data) => {
  return api.post("/desks/scan", data);
};

export const getJourney = (email) =>
  api.get("/desks/journey", {
    params: { email },
  });

export const getStudentOverview = () =>
  api.get("desks/students");


