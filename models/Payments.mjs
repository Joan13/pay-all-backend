import mongoose from "mongoose";

const PaymentsSchema = mongoose.Schema(
    {
        // user_id: { type: mongoose.Schema.Types.ObjectId, unique: true },
        created_by: { type: mongoose.Schema.Types.ObjectId, required: true },
        payment_detail: { type: mongoose.Schema.Types.ObjectId, required: true },
        amount: { type: Number, required: true },
        assignment_id: { type: mongoose.Schema.Types.ObjectId, required: true },
        folder_id: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
        payment_active: { type: Number },
        subscription_month: { type: Number },
        payment_type: { type: Number }
    },
    {
        versionKey: false,
        timestamps: true
    }
)

export const PaymentsModel = mongoose.model("payments_yb", PaymentsSchema, 'payments');

