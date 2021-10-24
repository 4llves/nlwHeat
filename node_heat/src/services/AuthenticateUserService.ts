import axios from 'axios'
import prismaClient from "../prisma"
import { sign } from 'jsonwebtoken'

/*
*RECEBER O CODIGO VIA STRING*
*RECUPERAR ACCESS_TOKEN NO GITHUB*
*RECUPERAR INFOS DO USER NO GITHUB*
*VERIFICAR SE O USER EXISTE NO DB*
*EXISTE: GERAR UM TOKEN*
*N_EXISTE: CRIA UM TOKEN*
*RETORNAR TOKEN COM INFO DO USER*
*/

interface IAccessTokenRes {
  access_token: string
}

interface IUserRes {
  avatar_url: string
  login: string
  id: number
  name: string
}

class AuthenticateUserService {
  async execute(code: string) {
    const url = "https://github.com/login/oauth/access_token"

    const { data: accessTokenRes } = await axios.post<IAccessTokenRes>(url, null, {
      params: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      headers: {
        Accept: "application/json"
      }
    })

    const res = await axios.get<IUserRes>("https://api.github.com/user", {
      headers: {
        authorization: `Bearer ${accessTokenRes.access_token}`,
      },
    })

    const { login, id, avatar_url, name } = res.data

    let user = await prismaClient.user.findFirst({
      where: {
        github_id: id
      }
    })

    if (!user) {
      await prismaClient.user.create({
        data: {
          github_id: id,
          login,
          avatar_url,
          name
        }
      })
    }

    const token = sign({
      user: {
        name: user.name,
        avatar_url: user.avatar_url,
        id: user.id
      }
    },
      process.env.JWT_SECRET,
      {
        subject: user.id,
        expiresIn: "1d"
      }
    )

    return { token, user }
  }
}

export { AuthenticateUserService }