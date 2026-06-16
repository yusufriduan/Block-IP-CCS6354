import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest){
    const isAdmin = request.cookies.get("admin_session");
    const isOwner = request.cookies.get("owner_session")
    
    const response = NextResponse.json(
        {message: "User logout success"},
        {status: 200}
    )

    if(isAdmin){
        response.cookies.set("admin_session", "", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
            maxAge: 0,
        });
    }

    if(isOwner){
        response.cookies.set("owner_session", "", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
            maxAge: 0,
        });
    }

    return response;
}