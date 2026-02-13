"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trophy, Target } from "lucide-react";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


export default function StudentDashboard() {
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my");
  

  // 🔹 LEADERBOARD STATES (NEW)
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(`${BASE_URL}/api/student/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  // 🔥 LEADERBOARD API CALL (ONLY WHEN TAB IS CLICKED)
  useEffect(() => {
    if (activeTab !== "leaderboard") return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setLeaderboardLoading(true);

    fetch(`${BASE_URL}/student/leaderboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        const raw = res.leaderboard || [];

        const formatted = raw.map((item) => ({
          student_id: item.student_id,
          name: item.student_name,                 // 🔑 mapping
          branch: item.department || item.branch,  // 🔑 mapping
          progress: item.completion_percentage,    // 🔑 mapping
          points: item.score,                      // 🔑 mapping
          is_you: item.is_current_user === true,   // 🔑 mapping
        }));

        setLeaderboard(formatted);
        setLeaderboardLoading(false);
      })
      .catch(() => setLeaderboardLoading(false));
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  const {
    student_info,
    assigned_courses,
    performance_summary,
    course_summary,
  } = data;

  const completedCount = course_summary.total_courses_completed;
  const totalModules = course_summary.total_courses_assigned;

  const overallProgress =
    totalModules > 0
      ? Math.round((completedCount / totalModules) * 100)
      : 0;

  const avgScore = performance_summary.overall_percentage;
  const studentRank = student_info.rank || 3;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {student_info.student_name.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-500">
            Keep up the great work on your learning journey
          </p>
        </div>

        <div className="text-sm text-gray-600">
          {student_info.branch}
        </div>
      </div>

      {/* ================= PROGRESS OVERVIEW ================= */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <ProgressRing
              progress={overallProgress}
              size={160}
              strokeWidth={14}
            />

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-semibold">
                Overall Progress
              </h2>
              <p className="text-gray-500 mt-1">
                You've completed {completedCount} of {totalModules} modules
              </p>

              <div className="mt-4 flex justify-center md:justify-start gap-6">
                <Legend color="bg-green-500" label="Completed" />
                <Legend color="bg-gray-300" label="Remaining" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <StatCard
            title="Your Rank"
            value={`#${studentRank}`}
            subtitle="in your college"
            icon={Trophy}
          />
          <StatCard
            title="Average Score"
            value={`${avgScore}%`}
            subtitle="across all tests"
            icon={Target}
          />
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex gap-3">
        <Tab label="My Courses" active={activeTab === "my"} onClick={() => setActiveTab("my")} />
        <Tab label="Available Courses" active={activeTab === "available"} onClick={() => setActiveTab("available")} />
        <Tab label="Leaderboard" active={activeTab === "leaderboard"} onClick={() => setActiveTab("leaderboard")} />
      </div>

      {/* ================= COURSES ================= */}
      {activeTab === "my" && (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Mandatory Courses
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {assigned_courses.map((course) => (
              <Link
                key={course.course_id}
                href={`/student/courses/${course.course_id}`}
                className="bg-white border rounded-xl p-5 hover:shadow transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-sm">
                      {course.course_title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {course.category} • {course.level}
                    </p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full border text-blue-600">
                    Mandatory
                  </span>
                </div>

                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600"
                      style={{ width: `${course.progress_percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-2">
                    <span>{course.progress_percentage}%</span>
                    <span className="text-gray-500">
                      {course.enrollment_status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {activeTab === "available" && (
        <div className="text-gray-500 text-sm">
          Available courses will appear here.
        </div>
      )}

      {/* ================= LEADERBOARD ================= */}
      {activeTab === "leaderboard" && (
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            College Leaderboard
          </h2>

          {leaderboardLoading && (
            <p className="text-gray-500 text-sm">
              Loading leaderboard...
            </p>
          )}

          {!leaderboardLoading && leaderboard.length === 0 && (
            <p className="text-gray-500 text-sm">
              No leaderboard data available
            </p>
          )}

          <div className="space-y-4">
            {
              console.log(leaderboard,"......")
            }
            {leaderboard.map((student, index) => {
              const rank = index + 1;
              const safeProgress = Number(student.progress) || 0;

              const baseStyle =
                "flex items-center justify-between p-5 rounded-xl border transition";

              const rowStyle =
                student.is_you
                  ? "bg-blue-50 border-blue-400 shadow-sm"
                  : rank === 1
                    ? "bg-amber-50 border-amber-300"
                    : rank === 2
                      ? "bg-slate-100 border-slate-300"
                      : rank === 3
                        ? "bg-orange-50 border-orange-300"
                        : "bg-white border-gray-200 hover:shadow-sm";

              return (
                <div
                  key={student.student_id}
                  className={`${baseStyle} ${rowStyle}`}
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                      {rank}
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">
                        {student.name}
                        {student.is_you && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{student.branch}</p>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center gap-6">
                    <div className="w-32">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${safeProgress}%` }}


                        />
                      </div>
                      <p className="text-xs text-right text-gray-500 mt-1">
                        {safeProgress}%
                      </p>
                    </div>

                    <div className="text-right min-w-[64px]">
                      <p className="text-lg font-bold text-gray-900">
                        {student.points}
                      </p>
                      <p className="text-xs text-gray-500">pts</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}

/* ================= COMPONENTS ================= */

function ProgressRing({ progress, size, strokeWidth }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#22c55e"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute text-3xl font-bold">
        {progress}%
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>

      <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
    </div>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm ${active
          ? "bg-white shadow font-medium"
          : "text-gray-500 hover:text-gray-700"
        }`}
    >
      {label}
    </button>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      <span className="text-gray-500">{label}</span>
    </div>
  );
}
