"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  LockClosedIcon,
  BookOpenIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


export default function CourseDetailsPage() {
  const { course_id } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(`${BASE_URL}/api/student/courses/${course_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setCourse(data.course);
        setProgress(data.enrollment?.progress_percentage || 0);
      });

    fetch(`${BASE_URL}/api/student/courses/${course_id}/chapters`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setChapters(data.chapters));
  }, [course_id, router]);

  // ✅ ONLY FUNCTIONAL CHANGE HERE
  const handleStartTest = async (chapter) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const res = await fetch(
        `${BASE_URL}/api/student/tests/start?course_id=${course_id}&module_number=${chapter.chapter_number}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      console.log("START API RESPONSE:", data);

      if (!res.ok) {
        alert(data.message);
        return;
      }

      // Store full test data (contains questions)
      sessionStorage.setItem("currentTest", JSON.stringify(data));

      // Navigate correctly
      router.push(
        `/student/courses/${course_id}/tests/${data.test_id}`
      );

    } catch (error) {
      console.error(error);
      alert("Unable to start test. Please try again.");
    }
  };

  if (!course) return <p className="p-8">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-xl">←</button>

        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-gray-500">{course.description}</p>
        </div>

        <div className="ml-auto text-sm font-medium">
          {progress}% Complete
        </div>
      </div>

      {/* PROGRESS CARD */}
      <div className="bg-white rounded-xl border p-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="relative w-16 h-16 rounded-full border-4 border-gray-200 flex items-center justify-center font-bold">
            {progress}%
          </div>

          <div>
            <h3 className="font-semibold">Your Progress</h3>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <LockClosedIcon className="w-4 h-4" />
              Complete each module with 70%+ to unlock the next
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          {chapters.filter(c => c.is_completed).length} of{" "}
          {chapters.length} modules completed
        </p>
      </div>

      {/* COURSE MODULES */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Course Modules</h2>

        {chapters.map(ch => (
          <div
            key={ch.chapter_id}
            onClick={() => {
              if (ch.is_unlocked) {
                router.push(
                  `/student/courses/${course_id}/chapters/${ch.chapter_number}`
                );
              }
            }}
            className={`rounded-xl border p-5 flex items-center justify-between ${
              ch.is_unlocked
                ? "bg-white cursor-pointer"
                : "bg-gray-50 opacity-60"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                {ch.is_unlocked ? (
                  <BookOpenIcon className="w-6 h-6 text-blue-600" />
                ) : (
                  <LockClosedIcon className="w-6 h-6 text-gray-400" />
                )}
              </div>

              <div>
                <p className="font-medium">{ch.chapter_title}</p>
                <p className="text-sm text-gray-500">
                  {ch.chapter_description}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    {ch.duration_hours || 3} hours
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpenIcon className="w-4 h-4" />
                    {ch.questions_count || 3} questions
                  </span>
                </div>
              </div>
            </div>

            {ch.is_unlocked ? (
              <button
                onClick={(e) => {
                  e.stopPropagation(); 
                  handleStartTest(ch);   // ✅ updated
                }}
                className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700"
              >
                ▶ Take Test
              </button>
            ) : (
              <LockClosedIcon className="w-6 h-6 text-gray-400" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
