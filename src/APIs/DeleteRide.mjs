import PayAll from "../Express.mjs";
import { RideModel } from "../../models/Rides.mjs";

export default function DeleteRide() {

    PayAll.post("/payall/API/delete_ride", async (request, response) => {

        const { ride } = request.body;

        try {
            const deleted = await RideModel.findByIdAndDelete(ride._id);
            if (deleted) {
                response.send({ success: "1" });
            } else {
                response.send({ success: "0", error: "Ride not found" });
            }
        } catch (error) {
            response.send({ success: "0", error: error.message });
        }
    });
}