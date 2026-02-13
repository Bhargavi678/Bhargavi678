"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function TestPage() {
  const router = useRouter();
  const { course_id, test_id } = useParams();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [testMeta, setTestMeta] = useState(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  

  useEffect(() => {
    const storedTest = sessionStorage.getItem("currentTest");

    if (storedTest) {
      const parsed = JSON.parse(storedTest);
      setQuestions(parsed.questions || []);
      setTestMeta(parsed);
      setLoading(false);
      return;
    }

    const fetchResume = async () => {
      const token = localStorage.getItem("accessToken");

      try {
        const res = await fetch(
          `${BASE_URL}/api/student/tests/${test_id}/resume`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        setQuestions(data.questions || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchResume();
  }, [test_id]);

  const handleOptionChange = (question_id, option_key) => {
    setAnswers({
      ...answers,
      [question_id]: option_key,
    });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("accessToken");
    if (!testMeta) return;

    const payload = {
      course_id: testMeta.course_id,
      module_number: testMeta.module_number,
      test_id: testMeta.test_id,
      attempt_id: testMeta.attempt_id,
      duration_minutes: testMeta.duration_minutes,
      answers: answers,
    };

    try {
      const res = await fetch(
        `${BASE_URL}/api/student/tests/${testMeta.attempt_id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.message);
        return;
      }

      setSubmitted(true);
      sessionStorage.removeItem("currentTest");

    } catch (error) {
      alert("Error submitting test.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Loading test...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center w-[400px]">
          <h2 className="text-2xl font-bold text-green-600">
            🎉 Congratulations!
          </h2>
          <p className="text-gray-500 mt-3">
            Your test has been submitted successfully.
          </p>

          <button
            onClick={() => router.push(`/student/courses/${course_id}`)}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto p-8">

      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-lg p-8">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Module Test</h1>
          <span className="text-sm text-gray-500">
            {answeredCount}/{questions.length} answered
          </span>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full bg-gray-200 h-2 rounded-full mb-8">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {questions.length === 0 && (
          <p className="text-gray-500">No questions available.</p>
        )}

        {questions.map((q, index) => (
          <div key={q.question_id} className="mb-8">

            <p className="font-semibold text-lg mb-4">
              {index + 1}. {q.question}
            </p>

            <div className="space-y-3">
              {q.options?.map((opt) => (
                <label
                  key={opt.option_key}
                  className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition
                  ${
                    answers[q.question_id] === opt.option_key
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${q.question_id}`}
                    value={opt.option_key}
                    checked={answers[q.question_id] === opt.option_key}
                    onChange={() =>
                      handleOptionChange(q.question_id, opt.option_key)
                    }
                    className="accent-blue-600"
                  />

                  <span className="font-medium">
                    {opt.option_key}.
                  </span>

                  <span>{opt.option_text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {questions.length > 0 && (
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Submit Test
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

