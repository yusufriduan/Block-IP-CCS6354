import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest){
    const isOwner = request.cookies.get("owner_session");

    return NextResponse.json(
        {isOwner: isOwner ? true : false},
        {status: 200}
    )
}