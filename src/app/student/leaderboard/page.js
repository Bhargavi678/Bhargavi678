"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentLeaderboardPage() {
  const router = useRouter();

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState(null);
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(
      `${BASE_URL}/student/leaderboard?college_id=1&limit=50`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLeaderboard(data.leaderboard || []);
          setMyRank(data.my_rank);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-gray-500">
        Loading leaderboard...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">College Leaderboard 🏆</h1>
        <p className="text-gray-500 mt-1">
          See how you rank among your classmates
        </p>
      </div>

      {/* MY RANK CARD */}
      {myRank && (
        <div className="bg-blue-50 border border-blue-400 rounded-xl p-5">
          <p className="text-sm text-gray-600">Your Current Rank</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            #{myRank}
          </p>
        </div>
      )}

      {/* LEADERBOARD LIST */}
      <div className="bg-white border rounded-2xl shadow-sm divide-y">
        {leaderboard.length === 0 && (
          <p className="p-6 text-gray-500">
            No leaderboard data available.
          </p>
        )}

        {leaderboard.map((student, index) => {
          const percentage =
            student.percentage !== null
              ? student.percentage
              : 0;

          const rowStyle =
            index === 0
              ? "bg-amber-50"
              : index === 1
              ? "bg-slate-100"
              : index === 2
              ? "bg-orange-50"
              : "bg-white";

          return (
            <div
              key={student.student_id}
              className={`flex items-center justify-between p-5 ${rowStyle}`}
            >
              {/* LEFT */}
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold">
                  {student.rank_position}
                </div>

                <div>
                  <p className="font-semibold text-gray-900">
                    {student.student_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {student.branch}
                  </p>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-8">
                <div className="w-40">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-right text-gray-500 mt-1">
                    {percentage}%
                  </p>
                </div>

                <div className="text-right min-w-[80px]">
                  <p className="text-lg font-bold">
                    {student.total_score ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    / {student.total_max_marks}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
