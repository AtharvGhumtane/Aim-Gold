import { Router } from "express";
import { getAllTeams, createTeam, joinTeam, leaveTeam, inviteToTeam, acceptTeamInvite } from "../controllers/team.controller.js";
import { getTeamMessages, sendTeamMessage } from "../controllers/teamMessage.controller.js";

const router = Router();

router.route("/teams").get(getAllTeams);
router.route("/teams/create").post(createTeam);
router.route("/teams/join").post(joinTeam);
router.route("/teams/leave").post(leaveTeam);
router.route("/teams/invite").post(inviteToTeam);
router.route("/teams/accept_invite").post(acceptTeamInvite);

router.route("/teams/:teamId/messages").get(getTeamMessages);
router.route("/teams/:teamId/messages").post(sendTeamMessage);

export default router;
