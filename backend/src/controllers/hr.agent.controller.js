import axios from "axios";

const handleHRAgentChat = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message)
            return res.status(400).json({ error: "Message is required" });

        const pythonResponse = await axios.post(
            `${process.env.FASTAPI_URL}/api/hr-agent`,
            { message, hr_id: req.user.id }
        );

        return res.status(200).json({ response: pythonResponse.data.response });

    } catch (error) {
        console.error("HR Agent error:", error.message);
        return res.status(500).json({ error: "HR Agent service unavailable" });
    }
};

export default { handleHRAgentChat };