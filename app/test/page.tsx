import { fetchCoursesByDepartment, fetchDepartments, fetchSubjectsBySemester } from "@/actions/department"

export default async function TestPage(){

    // const departments = await fetchDepartments();
    // console.log(departments);

    // for (const e of departments) {
    //     const courses = await fetchCoursesByDepartment(e.id);
    //     console.log(courses);
    // }

    // const courses = await fetchCoursesByDepartment(4);
    // console.log(courses);

    const subjects = await fetchSubjectsBySemester(1);
    console.log(subjects);

    return(
        <h1>Test Page</h1>
    )
}