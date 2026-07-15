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

// Get one onboarding
export const getOnboardings = (id) =>
  api.get(`/settings/onboarding/${id}`);

// Create onboarding
export const createOnboarding = (data) =>
  api.post("/settings/onboarding", data);

// Update onboarding
export const updateOnboarding = (id, data) =>
  api.put(`/settings/onboarding/${id}`, data);

// Delete onboarding
export const deleteOnboarding = (id) =>
  api.delete(`/settings/onboarding/${id}`);

// Activate / Deactivate onboarding
export const toggleOnboardingStatus = (id) =>
  api.patch(`/settings/onboarding/${id}/status`);