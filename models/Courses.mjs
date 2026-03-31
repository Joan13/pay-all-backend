import mongoose from "mongoose";

const CoursesSchema = mongoose.Schema(
    {
        course_name: { type: String },
        classe: { type: mongoose.Schema.Types.ObjectId },
        total_marks: { type: Number },
        has_exam: { type: Number },
        hours_week: { type: Number },
        course_active: { type: Number, index: true }
    },
    {
        versionKey: false,
        timestamps: true,
        // primaryKey: '_id'
    }
)

export const CoursesModel = mongoose.model("courses_yambi_class", CoursesSchema, 'courses');

