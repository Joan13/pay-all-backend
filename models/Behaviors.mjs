import mongoose from "mongoose";

const BehaviorsSchema = mongoose.Schema(
    {
        assignment_id: { type: mongoose.Schema.Types.ObjectId, index: true, required: true },
        behavior: { type: Number, required: true },
        observation: { type: String },
        period: { type: Number, index: true },
    },
    {
        versionKey: false,
        timestamps: true
    }
)

export const BehaviorsModel = mongoose.model("behaviors_yambi_class", BehaviorsSchema, 'behaviors');

