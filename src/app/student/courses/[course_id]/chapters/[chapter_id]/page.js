"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ChapterContentPage() {
  const router = useRouter();
  const { course_id, chapter_id } = useParams();

  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  

  useEffect(() => {
    const fetchPDF = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch(
          `${BASE_URL}/student/courses/${course_id}/chapters/${chapter_id}/content`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status === 403) {
          setLocked(true);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }

        const blob = await res.blob();
        const fileURL = URL.createObjectURL(blob);
        setPdfUrl(fileURL);
        setLoading(false);

      } catch (err) {
        console.error(err);
        setError(true);
        setLoading(false);
      }
    };

    if (course_id && chapter_id) {
      fetchPDF();
    }

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [course_id, chapter_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <p className="text-gray-500 text-lg">Loading chapter...</p>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <p className="text-yellow-600 text-lg">
          🔒 Chapter Locked
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <p className="text-red-500 text-lg">
          Failed to load chapter.
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">

      {/* Top Bar */}
      <div className="flex justify-between items-center px-6 py-3 border-b bg-white">
        <button
          onClick={() => router.back()}
          className="text-blue-600 font-medium"
        >
          ← Back
        </button>

        {pdfUrl && (
          <a
            href={pdfUrl}
            download
            className="text-blue-600 font-medium"
          >
            Download PDF
          </a>
        )}
      </div>

      {/* Full Width PDF Viewer */}
      <div className="flex-1 w-full bg-white">
        {pdfUrl && (
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&zoom=page-width`}
            className="w-full h-full"
            title="Chapter Content"
          />
        )}
      </div>

    </div>
  );
}
