import { Request, Response } from "express";
import { ProfileuserService } from "../services/ProfileuserService";

class ProfileUserController {
  async handle(req: Request, res: Response) {
    const { user_id } = req

    const service = new ProfileuserService()

    const result = await service.execute(user_id)

    return res.json(result)
  }
}

export { ProfileUserController };