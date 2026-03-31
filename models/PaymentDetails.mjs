import mongoose from "mongoose";

const PaymentDetailsSchema = mongoose.Schema(
    {
        payment_detail: { type: String, required: true },
        user_id: { type: mongoose.Schema.Types.ObjectId, index: true },
        payment_detail_active: { type: Number, index: true }
    },
    {
        versionKey: false,
        timestamps: true
    }
)

export const PaymentDetailsModel = mongoose.model("payment_details_yb", PaymentDetailsSchema, 'payment_details');

