"use client";
import { useState } from "react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "Rahul Varma",
    phone: "78950458",
    email: "rahul.verma@student.mitcollege.edu",
    department: "Computer Science",
    year: "Final Year",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
          <div className="flex items-center gap-4">
            <img
              src="https://i.pravatar.cc/100"
              alt="Profile"
              className="w-20 h-20 rounded-full border-4 border-white"
            />
            <div>
              <h2 className="text-2xl font-semibold">{formData.name}</h2>
              <p className="text-sm opacity-90">Student Profile</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="absolute top-6 right-6 bg-white text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {Object.keys(formData).map((key) => (
            <div key={key}>
              <label className="block text-sm text-gray-500 capitalize mb-1">
                {key}
              </label>

              {isEditing ? (
                <input
                  type="text"
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="w-full bg-gray-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="bg-gray-50 p-3 rounded-lg text-gray-800">
                  {formData[key]}
                </div>
              )}
            </div>
          ))}

          {isEditing && (
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
