import PayAll from "../Express.mjs";
import { ClientPointsModel } from "../../models/ClientsPoints.mjs";

export default function GetClientPoints() {
    PayAll.post("/payall/API/get_client_points", async (request, response) => {
        const { user_id } = request.body;

        if (!user_id) {
            return response.send({ success: "0", error: "user_id is required" });
        }

        try {
            const points = await ClientPointsModel
                .find({ user_id })
                .sort({ createdAt: -1 });

            const total = points.reduce((sum, p) => sum + (p.points || 0), 0);

            response.send({ success: "1", points, total });
        } catch (error) {
            console.error("GetClientPoints Error:", error);
            response.send({ success: "0", error: error.message });
        }
    });
}
