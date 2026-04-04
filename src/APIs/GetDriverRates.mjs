import PayAll from "../Express.mjs";
import { DriversRateModel } from "../../models/DriversRate.mjs";

export default function GetDriverRates() {

    // List all ratings for a given driver
    PayAll.post("/payall/API/get_driver_rates", async (request, response) => {
        try {
            const { driver_id } = request.body || {};

            if (!driver_id) {
                return response.send({ success: "0", error: "driver_id is required" });
            }

            const rates = await DriversRateModel
                .find({ driver_id })
                .sort({ createdAt: -1 });

            return response.send({
                success: "1",
                count: rates.length,
                rates
            });
        } catch (error) {
            console.error("GetDriverRates Error:", error);
            return response.send({ success: "0", error: error.message });
        }
    });
}

