const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


/* ======================
   LOGIN
====================== */
export async function studentLogin(payload) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },




    
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.detail || "Login failed");
  }

  // 🔑 SAVE TOKEN (VERY IMPORTANT)
  localStorage.setItem("accessToken", data.access_token);

  return data;
}

/* ======================
   HELPER: GET TOKEN
====================== */
function getToken() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("No access token found. Please login again.");
  }
  return token;
}

/* ======================
   DASHBOARD
====================== */
export async function getStudentDashboard() {
  const token = getToken();

  const res = await fetch(`${BASE_URL}/api/student/dashboard`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load dashboard");
  }

  return res.json();
}

/* ======================
   COURSES
====================== */
export async function getStudentCourses() {
  const token = getToken();

  const res = await fetch(`${BASE_URL}/api/student/courses`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load courses");
  }

  return res.json();
}

/* ======================
   UPDATE COURSE PROGRESS
====================== */
export async function updateCourseProgress(courseId, progress) {
  const token = getToken();

  const res = await fetch(
    `${BASE_URL}/api/student/courses/${courseId}/progress`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        progress_percentage: progress,
      }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to update progress");
  }

  return res.json();
}

/* ======================
   PROFILE
====================== */
export async function getStudentProfile() {
  const token = getToken();

  const res = await fetch(`${BASE_URL}/api/student/profile`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load profile");
  }

  return res.json();
}

/* ======================
   LOGOUT (OPTIONAL)
====================== */
export function logoutStudent() {
  localStorage.removeItem("accessToken");
}
