import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
              🎓 Welcome to Schedulify
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              India's No.1 Smart Timetable Generator
            </p>
            <p className="text-gray-500">
              Multi-school timetable management system for schools across India
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🏫 For Schools</h2>
              <p className="text-gray-600 mb-6">
                Manage your entire school timetable with ease. Upload data, configure settings, 
                and generate optimized timetables automatically.
              </p>
              <div className="space-y-3">
                <Link
                  to="/school/register"
                  className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition text-center font-semibold"
                >
                  Register Your School
                </Link>
                <Link
                  to="/school/login"
                  className="block w-full bg-blue-100 text-blue-700 px-6 py-3 rounded-lg hover:bg-blue-200 transition text-center font-semibold"
                >
                  School Admin Login
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">👨‍🏫 For Teachers</h2>
              <p className="text-gray-600 mb-6">
                View your personal timetable anytime, anywhere. Download as PDF or CSV 
                for your records.
              </p>
              <Link
                to="/teacher/login"
                className="block w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition text-center font-semibold"
              >
                Teacher Login
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">🌟 Key Features</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">🤖</div>
                <h3 className="font-semibold text-gray-900 mb-2">Smart Generation</h3>
                <p className="text-sm text-gray-600">
                  AI-powered timetable generation with no clashes, balanced workloads, and optimized scheduling
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-semibold text-gray-900 mb-2">Multi-School</h3>
                <p className="text-sm text-gray-600">
                  Separate data storage and management for each school with secure authentication
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">📄</div>
                <h3 className="font-semibold text-gray-900 mb-2">Export Options</h3>
                <p className="text-sm text-gray-600">
                  Download timetables as professional PDFs or CSV files for easy sharing
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
