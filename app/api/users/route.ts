import { NextResponse } from "next/server";
import db from "../../lib/db";
import bcrypt from "bcryptjs";
import { ResultSetHeader } from "mysql2"; // Import ResultSetHeader


// Export the POST method handler for registering a new user
export async function POST(req: Request) {
  try {
    // Parse the request body (expects name and password)
    const { name, password } = await req.json();

    // Validate the input (ensure name and password are provided)
    if (!name || !password) {
      return NextResponse.json(
        { message: "Name and password are required" },
        { status: 400 }
      );
    }

    // Query the database to check if the name already exists
    const [rows] = await db.query("SELECT * FROM user WHERE name = ?", [name]);

    // Check if the user already exists by checking the length of rows
    if (Array.isArray(rows) && rows.length > 0) {
      return NextResponse.json(
        { message: "Name already taken" },
        { status: 409 }
      );
    }

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Insert the new user into the database
    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO user (name, password) VALUES (?, ?)",
      [name, hashedPassword]
    );

    // Check if the insert was successful by inspecting affectedRows
    if (result.affectedRows > 0) {
      return NextResponse.json({
        message: "User registered successfully",
        userId: result.insertId,
      });
    } else {
      return NextResponse.json(
        { message: "Error registering user" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      {
        message: "Error in POST request",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
