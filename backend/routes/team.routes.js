import { Router } from "express";
import { getAllTeams, createTeam, joinTeam, leaveTeam } from "../controllers/team.controller.js";

const router = Router();

router.route("/teams").get(getAllTeams);
router.route("/teams/create").post(createTeam);
router.route("/teams/join").post(joinTeam);
router.route("/teams/leave").post(leaveTeam);

export default router;
