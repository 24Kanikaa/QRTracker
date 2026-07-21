import api from "./api";

// =====================================================
// GET DASHBOARD SUMMARY
// =====================================================

export const getDashboardSummary = async (date = null) => {
  const params = {};

  if (date) {
    params.date = date;
  }

  const response = await api.get("/dashboard/summary", {
    params,
  });

  return response.data;
};


// =====================================================
// GET DESK SUMMARY
// =====================================================

export const getDeskSummary = async (date = null) => {
  const params = {};

  if (date) {
    params.date = date;
  }

  const response = await api.get("/dashboard/desk-summary", {
    params,
  });

  return response.data;
};


// =====================================================
// GET FULL DASHBOARD OVERVIEW
// =====================================================

export const getDashboardOverview = async () => {
  const response = await api.get("/dashboard/overview");

  return response.data;
};


// =====================================================
// GET STUDENTS FOR A DATE
// =====================================================

export const getTodayStudents = async (date = null) => {
  const params = {};

  if (date) {
    params.date = date;
  }

  const response = await api.get("/dashboard/today-students", {
    params,
  });

  return response.data;
};


// =====================================================
// GET STUDENTS FOR A DESK
// =====================================================

export const getDeskStudents = async (
  deskId,
  date = null
) => {
  const params = {};

  if (date) {
    params.date = date;
  }

  const response = await api.get(
    `/dashboard/desk/${deskId}/students`,
    {
      params,
    }
  );

  return response.data;
};


// =====================================================
// GET STUDENT JOURNEY
// =====================================================

export const getStudentJourney = async (studentId) => {
  const response = await api.get(
    `/dashboard/student/${studentId}/journey`
  );

  return response.data;
};


// =====================================================
// GET RECENT SCANS
// =====================================================

export const getRecentScans = async (
  limit = 10,
  date = null
) => {
  const params = {
    limit,
  };

  if (date) {
    params.date = date;
  }

  const response = await api.get(
    "/dashboard/recent-scans",
    {
      params,
    }
  );

  return response.data;
};


// =====================================================
// GET ADMISSION DATES
// Returns: [{ date: "2026-07-18", isToday: false }, ...]
// Drives the Day Wise dropdown.
// =====================================================

export const getAdmissionDates = async () => {
  const response = await api.get("/dashboard/admission-dates");

  return response.data; // { success, data: [{date, isToday}, ...] }
};


// =====================================================
// GET DASHBOARD DATA (single source of truth for the page)
// mode: "daywise" | "overall"
// date: "YYYY-MM-DD" | null  (ignored for "overall"; for "daywise",
//        the backend falls back to today if omitted or invalid)
// =====================================================

export const getDashboardData = async ({
  mode = "daywise",
  date = null,
} = {}) => {
  const params = { mode };

  if (date) {
    params.date = date;
  }

  const response = await api.get("/dashboard/dashboard-data", {
    params,
  });

  return response.data; // { success, data: { mode, selectedDate, isLive, admissionDates, stats, ... } }
};