import mongoose from "mongoose";

const ExpensesSchema = mongoose.Schema(
    {
        expense_detail: { type: String },
        amount: { type: Number },
        expense_type: { type: Number },
        quantity: { type: Number },
        currency: { type: Number },
        user_concerned: { type: mongoose.Schema.Types.ObjectId },
        month: { type: Number },
        folder: { type: mongoose.Schema.Types.ObjectId },
        created_by: { type: mongoose.Schema.Types.ObjectId },
        expense_active: { type: Number }
    },
    {
        versionKey: false,
        timestamps: true
    }
)

export const ExpensesModel = mongoose.model("expenses_yambi_class", ExpensesSchema, 'expenses');

