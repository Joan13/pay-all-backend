import mongoose from "mongoose";

const CompanySchema = mongoose.Schema(
    {
        _id: { type: String, required: true, unique: true },
        company_name: { type: String, required: true },
        company_name_abb: { type: String, required: true },
        category: { type: Number, required: true },
        description_service: { type: String },
        country: { type: String },
        slogan: { type: String },
        logo: { type: String },
        background: { type: String },
        phones: { type: String },
        emails: { type: String },
        company_address: { type: String },
        national_number: { type: String },
        national_id: { type: String },
        tax_number: { type: String },
        keywords: { type: String },
        bio: { type: String },
        open_days: { type: String },
        followers: { type: String },
        following: { type: String },
        status_information: { type: String },
        subscription_active: { type: Number },
        valid_until: { type: String },
        website: { type: String },
        other_links: { type: String },
        company_privacy: { type: Number },
        company_active: { type: Number },
        company_visible: { type: Number },
        certified: { type: Number }
    },
    {
        versionKey: false,
        timestamps: true,
        primaryKey: '_id'
    }
)

export const CompanyModel = mongoose.model("companies_yb", CompanySchema, 'companies');

