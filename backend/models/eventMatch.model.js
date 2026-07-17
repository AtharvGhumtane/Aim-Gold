import mongoose from "mongoose";

const TeamRefSchema = new mongoose.Schema({
    name:  { type: String, required: true },
    color: { type: String, default: "#667eea" }
}, { _id: false });

const EventMatchSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SportEvent",
        required: true
    },
    sport: { type: String, required: true },
    homeTeam: { type: TeamRefSchema, required: true },
    awayTeam: { type: TeamRefSchema, required: true },
    homeScore: { type: Number, default: 0 },
    awayScore: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ["scheduled", "live", "completed"],
        default: "scheduled"
    },
    // e.g. "Group Stage", "Quarter Final", "Semi Final", "Final"
    round: { type: String, default: "Group Stage" },
    matchDate: { type: Date },
    venue: { type: String, default: "" },
    // set when status → completed
    winner: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});

const EventMatch = mongoose.model("EventMatch", EventMatchSchema);
export default EventMatch;
