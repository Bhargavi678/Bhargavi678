"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return router.replace("/login");

    fetch(`${BASE_URL}/api/student/courses`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setCourses(data.courses));
  }, [router]);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">My Courses</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {courses.map(course => (
          <Link
            key={course.course_id}
            href={`/student/courses/${course.course_id}`}
            className="bg-white border rounded-xl p-5 hover:shadow transition"
          >
            <h3 className="font-semibold">{course.title}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {course.category} • {course.level}
            </p>

            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-blue-600 rounded-full"
                  style={{ width: `${course.progress_percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {course.progress_percentage}% completed
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
