// this is to be used for server side auth

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { initializeUserBoard } from "../init-user-board";
import connectDB from "../db";

const mongooseInstance = await connectDB();
const client = mongooseInstance.connection.getClient();
const db = client.db();



export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  //added in order to "use cache"
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  // we can add DB hooks for so that better auth does different things at different stages
  // in this case, we're implementing a hook to run after the user is created
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
            console.log("user in after: " , user);
            console.log("user id in after: " , user.id);
          if (user.id) {
            await initializeUserBoard(user.id);
          }
        },
      },
    },
  },
});

export async function getSession() {
  const result = await auth.api.getSession({
    //passing headers required by better auth docs
    headers: await headers(),
  });
  return result;
}

export async function signOut() {
  const result = await auth.api.signOut({
    //passing headers required by better auth docs
    headers: await headers(),
  });

  if (result.success) {
    //as it is server-side, we don't use useRouter(), but simply use redirect() from next/navigation
    redirect("/sign-in");
  }
}
