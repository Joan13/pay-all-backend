import mongoose from "mongoose";

const SchoolSchema = mongoose.Schema(
    {
        school_name: { type: String },
        school_name_abb: { type: String },
        is_public: { type: Number },
        id_number: { type: String },
        national_id: { type: String },
        post_office_box: { type: String },
        school_type: { type: Number },
        phone_numbers: { type: String },
        address: { type: String },
        emails: { type: String },
        photo: { type: String },
        background_photo: { type: String },
        state: { type: String },
        city: { type: String },
        country: { type: String },
        account_privacy: { type: Number },
        account_valid: { type: Number },
        created_by: { type: mongoose.Schema.Types.ObjectId }
    },
    {
        versionKey: false,
        timestamps: true,
        // primaryKey: '_id'
    }
)

export const SchoolModel = mongoose.model("schools_yambi_class", SchoolSchema, 'schools');

