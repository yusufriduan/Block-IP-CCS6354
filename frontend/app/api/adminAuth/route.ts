import { getIsAdmin } from "@/lib/isAdmin";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest){
    try{
        const {wallet} = await request.json();
        if(!wallet){
            return NextResponse.json(
                {error: "No Wallet Found"},
                {status: 400}
            );
        }

        const isAdmin = await getIsAdmin(wallet);
        const response = NextResponse.json({ redirect: isAdmin ? "/admin" : null });
        if (isAdmin) {
            response.cookies.set("admin_session", wallet, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 60 * 60 * 8,
                path: "/",
            });
        }

        return response;
    } catch (e) {
        return NextResponse.json(
            {error: "Internal Server Error"},
            {status: 500}
        );
    }
}