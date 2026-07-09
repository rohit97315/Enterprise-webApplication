import axios from "axios";

const handleHRAgentChat = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message)
            return res.status(400).json({ error: "Message is required" });

        const pythonResponse = await axios.post(
            "http://127.0.0.1:8000/api/hr-agent",
            { message, hr_id: req.user.id }
        );

        return res.status(200).json({ response: pythonResponse.data.response });

    } catch (error) {
        console.error("HR Agent error:", error.message);
        return res.status(500).json({ error: "HR Agent service unavailable" });
    }
};

export default { handleHRAgentChat };