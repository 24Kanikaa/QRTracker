import api from "./api";

export const getUsers = () => api.get("/settings/users");

export const getUser = (id) =>
  api.get(`/settings/users/${id}`);

export const createUser = (data) =>
  api.post("/settings/users", data);

export const updateUser = (id, data) =>
  api.put(`/settings/users/${id}`, data);

export const deleteUser = (id) =>
  api.delete(`/settings/users/${id}`);

export const toggleUserStatus = (id,active) =>
  api.patch(`/settings/users/${id}/status`,{active});

export const getOnboardingSettings = () =>
  api.get("/settings/onboarding");

export const getOnboardings = (id) =>
  api.get(`/settings/onboarding/${id}`);

export const createOnboarding = (data) =>
  api.post("/settings/onboarding", data);

export const updateOnboarding = (id, data) =>
  api.put(`/settings/onboarding/${id}`, data);

export const deleteOnboarding = (id) =>
  api.delete(`/settings/onboarding/${id}`);

export const toggleOnboardingStatus = (id) =>
  api.patch(`/settings/onboarding/${id}/status`);

export const syncStudents = (admissionId) =>
  api.post(`/settings/${admissionId}/sync-students`);

export const getStudentInfo = (email) =>
    api.get("settings/students/info", {
        params: { email },
    });

export const downloadStudentsCSV = () =>
  api.get("/settings/students/export", {
    responseType: "blob",
  });

export const importStudentsCSV = (settingsId, formData) =>
  api.post(`/settings/${settingsId}/students/import`, formData);

export const updateStudentRemarks = (id, remarks) =>
  api.patch(`/settings/student/${id}/remarks`, {
    remarks,
  });