import { NextResponse } from "next/server";
import connectToDatabase from "@/src/config/db.config";
import Team from "@/src/models/team.model";
import User from "@/src/models/user.model";
import { authMiddleware } from "@/src/middleware/auth.middleware";

export async function POST(req: Request) {

}