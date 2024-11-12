import { NextResponse } from "next/server";
import db from "../../lib/db";
import bcrypt from "bcryptjs";

// Define the User type to match the structure of your user table
interface User {
  id: number;
  name: string;
  password: string;
  // Add any other fields that your user table has
}

// To configure dynamic behavior (e.g., dynamic API)
export const dynamic = "force-dynamic"; // Ensure the route is dynamic

// Add revalidation if needed, but usually not required for API
export const revalidate = 0; // No cache for this API route

// Export the GET method handler
export async function GET() {
  try {
    // Fetch data from the MySQL database
    const [rows] = await db.query("SELECT * FROM user");

    // Cast rows to User[] as the response contains rows of data
    const users = rows as User[];

    // Return the fetched data as a JSON response
    return NextResponse.json({
      message: "Data fetched successfully",
      data: users,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching data:", err);
    return NextResponse.json(
      { message: "Error in GET request", error: err.message },
      { status: 500 }
    );
  }
}

// Export the POST method handler to verify name and password
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

    // Query the database for the user by name
    const [rows] = await db.query("SELECT * FROM user WHERE name = ?", [name]);

    // Cast rows to User[] as the response contains rows of data
    const users = rows as User[];

    // Check if the user exists
    if (users.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = users[0]; // Now TypeScript knows `users` is an array of `User` objects

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // If the password is valid, return a success response
    if (isPasswordValid) {
      return NextResponse.json({
        message: "Login successful",
        userId: user.id,
      });
    } else {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }
  } catch (error: unknown) {
    console.error("Error during login:", error);
    return NextResponse.json(
      {
        message: "Error in POST request",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
