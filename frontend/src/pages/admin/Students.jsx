import AdminLayout from "../../layouts/AdminLayout";

import StudentStats from "../../components/students/StudentStats";
import StudentFilters from "../../components/students/StudentFilters";
import StudentTable from "../../components/students/StudentTable";
import StudentPagination from "../../components/students/StudentPagination";

function Students() {

const students = [
  {
    id: 1,
    name: "Aryan Sharma",
    email: "aryan.sharma@plaksha.edu.in",
    progress: 95,
    gate: "09:02",
    admission: "09:10",
    hostel: "09:24",
    it: "09:42",
    mess: "09:55",
    idcard: "10:05",
    library: "10:18",
  },
  {
    id: 2,
    name: "Ananya Verma",
    email: "ananya.verma@plaksha.edu.in",
    progress: 58,
    gate: "09:04",
    admission: "09:16",
    hostel: "09:31",
    it: "",
    mess: "",
    idcard: "",
    library: "",
  },
  {
    id: 3,
    name: "Rohan Mehta",
    email: "rohan.mehta@plaksha.edu.in",
    progress: 28,
    gate: "09:09",
    admission: "",
    hostel: "",
    it: "",
    mess: "",
    idcard: "",
    library: "",
  },
];

  return (
    <AdminLayout>

        <StudentStats />

        <StudentFilters />

        <StudentTable students={students} />

        <StudentPagination />

    </AdminLayout>
  );
}

export default Students;