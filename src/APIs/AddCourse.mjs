
import { CoursesModel } from "../../models/Courses.mjs";
import YambiClass from "../Express.mjs";

export default function AddCourse() {
    YambiClass.post("/payall/API/insert_course", async (request, response) => {
        const course = request.body.course;

        const new_course = {
            course_name: course.course_name,
            classe: course.classe,
            total_marks: course.total_marks,
            has_exam: course.has_exam,
            hours_week: course.hours_week,
            course_active: course.course_active
        }

        try {
            await CoursesModel.create(new_course)
                .then(async cu => {

                    response.send({ success: "1", course: cu });

                })
        } catch (error) {
            response.send({ success: "0" });
        }

    });
}

