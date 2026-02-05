import connectDB from "./db";
import { Board, Column } from "./models";


const DEFAULT_COLUMNS = [
  {
    name: "Wish List",
    order: 0,
  },
  {
    name: "Applied",
    order: 1,
  },
  {
    name: "Interviewing",
    order: 2,
  },
  {
    name: "Offer",
    order: 3,
  },
  {
    name: "Rejected",
    order: 4,
  },
];

export async function initializeUserBoard(userId: string) {
  try {
    await connectDB();

    // check if board already exists
    const existingBoard = await Board.findOne({ userId, name: "Job Hunt" });
    console.log("we checked if board exists")

    //if it exists, we return it
    if (existingBoard) {
        console.log("looks like board exists")
        console.log("this is the existing board: ", existingBoard)
      return existingBoard;
    }

    // if it doesn't exist, we create it
    console.log("we trying to create the board")
    const board = await Board.create({
      name: "Job Hunt",
      userId,
      columns: [],
    });

    console.log("this is the board in init function: ", board)

    // we also need to create the default columns that will fill the board
    const columns = await Promise.all(
      DEFAULT_COLUMNS.map((col) =>
        Column.create({
          name: col.name,
          order: col.order,
          boardId: board._id,
          jobApplication: [],
        }),
      ),
    );
    console.log("this is the columns in init function: ", columns)

    // update the board with the new column IDs and return it
    board.columns = columns.map((col) => col._id);
    await board.save();

    console.log("this is the board once populated in init function: ", board)

    return board;

  } catch (error) {
    console.log("we are having an error in the init function")
    throw error;
  }
}
