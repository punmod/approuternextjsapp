import { PrismaAdapter } from "@auth/prisma-adapter";

import {
   type DefaultSession,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import { env } from "~/env";
import { db } from "~/server/db";
import NextAuth from "next-auth"


declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      roles:string[];
     
    } & DefaultSession["user"];
  }
}

 export const {
                 handlers: { GET, POST },  auth,} = NextAuth({
            callbacks: {
              async session({ session, user }) 
                   {
                     const userWithRoles =  db.user.findUnique(
                           {
                           where: { id: user.id },
                           include: {roles: { select: { rolename: true } }}
                           });
                       
                       const userRoles = await userWithRoles.then(res => {
                                         return res?.roles.map(res => res.rolename) || []; 
                                          });                                                 
                        return {
                                  ...session,
                                  user: {
                                    ...session.user,
                                    roles: userRoles
                                  },
                                };
                    },
                  },
            adapter: PrismaAdapter(db) as Adapter,
            providers: [GoogleProvider({})],
                  })