import PayAll from "../Express.mjs";
import { RatingsModel } from "../../models/Ratings.mjs";

export default function GetRatings() {

    // List all ratings for a given user (driver or client)
    PayAll.post("/payall/API/get_ratings", async (request, response) => {
        try {
            const { rated_id } = request.body || {};

            if (!rated_id) {
                return response.send({ success: "0", error: "rated_id is required" });
            }

            const rates = await RatingsModel
                .find({ rated_id })
                .populate('rater_id', 'names user_name')
                .populate({
                    path: 'ride_id',
                    populate: {
                        path: 'driver_id',
                        select: 'names user_name'
                    }
                })
                .sort({ createdAt: -1 });

            return response.send({
                success: "1",
                count: rates.length,
                rates
            });
        } catch (error) {
            console.error("GetRatings Error:", error);
            return response.send({ success: "0", error: error.message });
        }
    });
}
