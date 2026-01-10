import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import SchoolRegister from "./pages/SchoolRegister";
import SchoolLogin from "./pages/SchoolLogin";
import Dashboard from "./pages/Dashboard";
import UploadData from "./pages/UploadData";
import Settings from "./pages/Settings";
import GenerateTimetable from "./pages/GenerateTimetable";
import TeacherLogin from "./pages/TeacherLogin";
import TeacherTimetable from "./pages/TeacherTimetable";

import Teachers from "./pages/Teachers";
import Subjects from "./pages/Subjects";
import Classes from "./pages/Classes";
import LabRooms from "./pages/LabRooms";
import ClassTimetable from "./pages/ClassTimetable";
import ClassSubjects from "./pages/ClassSubjects";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/school/register" element={<SchoolRegister />} />
        <Route path="/school/login" element={<SchoolLogin />} />

        {/* Admin */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/upload" element={<UploadData />} />
        <Route path="/dashboard/settings" element={<Settings />} />
        <Route path="/dashboard/generate" element={<GenerateTimetable />} />

        <Route path="/dashboard/teachers" element={<Teachers />} />
        <Route path="/dashboard/subjects" element={<Subjects />} />
        <Route path="/dashboard/classes" element={<Classes />} />
        <Route path="/dashboard/class-subjects" element={<ClassSubjects />} />
        <Route path="/dashboard/labs" element={<LabRooms />} />

        <Route
          path="/dashboard/class-timetable/:classId"
          element={<ClassTimetable />}
        />

        {/* Teacher */}
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/teacher/timetable" element={<TeacherTimetable />} />
        <Route
          path="/admin/teacher/:teacherId/timetable"
          element={<TeacherTimetable />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
