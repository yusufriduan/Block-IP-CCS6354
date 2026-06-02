"use client";

import { Header } from "../component/Header";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function registerIP() {

    const [connectedStatus, setConnectedStatus] = useState<String>("");

    useEffect(() => {
        const temp = localStorage.getItem("isConnected");
        if (temp != null) {
            setConnectedStatus(temp);
        }
    }, [])

    return (
        <div>
            <Header
                isConnected={connectedStatus === "True"}
                isNotAdmin={true}
                isDashboard={false}
                isRegister={true}
                isCredit={false}>
            </Header>
            <div id="register-section" className="h-screen justify-center items-center flex flex-col">
                <div id="top-section" className="box-border h-32 w-240 p-4 border-4 border-radius rounded-3xl border-secondary bg-secondary
                flex flex-row items-center justify-center">
                    <h1 className="font-mono font-bold text-4xl tracking-wider">Register Intellectual Property</h1>
                </div>

                <div id="content-section" className="m-20 box-border h-60 w-260 p-4 border-4 border-radius rounded-3xl border-secondary bg-secondary
                grid grid-flow-row grid-cols-2 items-flex-start justify-flex-start grid-container">
                    <div>
                        <h1 className="m-4 font-mono font-bold text-xl tracking-wider place-content-center row-start-1">Intellectual Property Name</h1>
                    </div>
                    <div>
                        <input type="text" id="IP Name"
                            className="m-4 box-border h-10 w-100 p-4 border-4 border-radius rounded-3xl border-textbox bg-textbox row-start-1">
                        </input>
                    </div>
                    <div>
                        <h1 className="m-4 font-mono font-bold text-xl tracking-wider place-content-center row-start-2">Register IP Type</h1>
                    </div>
                    <div>
                        <input type="text" id="IP Name"
                            className="m-4 box-border h-10 w-100 p-4 border-4 border-radius rounded-3xl border-textbox bg-textbox row-start-1">
                        </input>
                    </div>
                    <h1 className="m-4 font-mono font-bold text-xl tracking-wider place-content-start">Intellectual Property</h1>
                <div>
                    <button id="Submit IP" className="m-4 box-border h-10 w-100 p-4 border-4 border-radius rounded-3xl border-textbox bg-textbox row-start-1"></button>
                </div>
                </div>

            </div>
        </div>
    )
}