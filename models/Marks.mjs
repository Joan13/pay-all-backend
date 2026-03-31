import mongoose from "mongoose";

const MarkSchema = mongoose.Schema(
    {
        course: { type: Number },
        assignment_id: { type: mongoose.Schema.Types.ObjectId, index: true },
        folder_id: { type: mongoose.Schema.Types.ObjectId, index: true },
        main_marks: { type: Number },
        period: { type: Number, index: true },
        created_by: { type: mongoose.Schema.Types.ObjectId },
    },
    {
        versionKey: false,
        timestamps: true,
        // primaryKey: '_id'
    }
)

// Create compound index for better query performance
// Note: Not unique to allow for existing data compatibility
MarkSchema.index({ assignment_id: 1, course: 1, period: 1, folder_id: 1 });

export const MarksModel = mongoose.model("marks_yambi_class", MarkSchema, 'marks');

