
import { Router } from "express";
const skillsRouter = Router();

skillsRouter.get('/',GetAllSkills);
skillsRouter.post('/',CreateSkill);
skillsRouter.post('/mentor/:id/skills',AddSkillsToMentor);
skillsRouter.delete('/mentor/:mentorId/skills/:skillId',RemoveSkillFromMentor);

export default skillsRouter;