import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest){
    const isAdmin = request.cookies.get("session_admin");

    return NextResponse.json(
        {isAdmin: isAdmin ? true : false},
        {status: 200}
    )
}