import mongoose from "mongoose";

const FoldersSchema = mongoose.Schema(
    {
        school: { type: mongoose.Schema.Types.ObjectId, index: true },
        school_year: { type: String },
        cycle: { type: Number },
        folder_name: { type: String },
        folder_description: { type: String },
        folder_active: { type: Number, index: true },
        other_information: { type: String },
        report_card_data: { type: String },
        classes: { type: String },
        subjects: { type: String },
        payment_categories: { type: String },
        created_by: { type: mongoose.Schema.Types.ObjectId }
    },
    {
        versionKey: false,
        timestamps: true
    });

export const FoldersModel = mongoose.model("folders_yambi_class", FoldersSchema, 'folders');

