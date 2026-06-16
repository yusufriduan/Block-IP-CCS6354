import { getIsAdmin } from "@/lib/isAdmin";
import { getIsOwner } from "@/lib/isOwner";
import { NextResponse, NextRequest } from "next/server";
import jwt from 'jsonwebtoken';

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
        const jwtToken = process.env.JWT_SECRET_KEY
        if (isAdmin && jwtToken) {
            const token = jwt.sign(
                { wallet: wallet }, 
                jwtToken,
                { expiresIn: '8h' }
            );
            
            response.cookies.set("admin_session", token, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 60 * 60 * 8,
                path: "/",
            });

            const isOwner = await getIsOwner(wallet);
            if(isOwner){
                response.cookies.set("owner_session", token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "strict",
                    maxAge: 60 * 60 * 8,
                    path: "/",
                });
            }
        }

        return response;
    } catch (e) {
        return NextResponse.json(
            {error: "Internal Server Error"},
            {status: 500}
        );
    }
}