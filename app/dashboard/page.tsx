
import KanbanBoard from "@/components/Kanban-board";
import { getSession } from "@/lib/auth/auth"
import connectDB from "@/lib/db";
import { Board } from "@/lib/models";
import { redirect } from "next/navigation";
import { Suspense } from "react";



//in order to "use cache" we had to edit auth.ts
 
//we move the getBoard logic in it's own function so we can "use cache" only where needed
// here, we don't want the board data to be fetched every time we go to the dashboard
async function getBoard(userId: string) {
  "use cache"
   await connectDB();

  // retrieve board and populate it with columns through path to data
  //then we nest a populate inside the first populate to show our job applications in the board
  const boardDoc = await Board.findOne({
    userId: userId,
    name: "Job Hunt",
  }).populate({
    path: "columns",
    populate: {
      path: "jobApplications",
    }
  });

  // here we turn the JSON into object before returning the board
  if (!boardDoc) {
    return null;
  }
  const board = JSON.parse(JSON.stringify(boardDoc));

  return board;
}

async function DashboardPage() {

  // as this is a server-side component, 
  // we decide to protect the route here instead of in the proxy
  const session = await getSession();
  const board = await getBoard(session?.user.id ?? "");

  if (!session?.user) {
    redirect("/sign-in")
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black">{board.name}</h1>
          <p className="text-gray-600">Track your job applications</p>
        </div>
        <KanbanBoard board={board} userId={session.user.id} />
      </div>
    </div>
  )
}


// we moved everything out of this function, now it only returns the DashboardPage component inside
// Suspense wrappers, as required by NextJS
export default async function Dashboard() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <DashboardPage />
    </Suspense>
  )
}
