import mongoose from "mongoose";

const ClassesSchema = mongoose.Schema(
    {
        class_number: { type: Number },
        class_order: { type: String },
        cycle: { type: Number, indexed: true },
        section: { type: mongoose.Schema.Types.ObjectId, index: true },
        keywords: { type: String },
        // school_year: { type: String },
        class_valid: { type: Number, index: true },
        created_by: { type: mongoose.Schema.Types.ObjectId }
    },
    {
        versionKey: false,
        timestamps: true,
        // primaryKey: '_id'
    }
)

export const ClassesModel = mongoose.model("classes_yambi_class", ClassesSchema, 'classes');

