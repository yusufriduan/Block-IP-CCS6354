"use client";

import { Header } from "../component/Header";
import Dropdown from "../component/Dropdown";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function registerIP() {

    const [connectedStatus, setConnectedStatus] = useState<String>("");
    const [inputValue, setInputValue] = useState<string>("");
    const [saved, setSaved] = useState<String>("");

    const handleSubmit = (e: SubmitEvent) => {
        e.preventDefault();
        setSaved(inputValue); // store in state
    };


    useEffect(() => {
        const temp = localStorage.getItem("isConnected");
        if (temp != null) {
            setConnectedStatus(temp);
        }
    }, [])

    return (
        <div className="overflow-y-hidden">
            <Header
                isConnected={connectedStatus === "True"}
                isNotAdmin={true}
                isDashboard={false}
                isRegister={true}
                isCredit={false}>
            </Header>
            <div id="dashboard-ui" className="flex flex-col w-screen mt-8 h-screen justify-center items-center">
              <video autoPlay loop muted playsInline className="absolute top-1/2 left-1/2 w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 -z-10">
                <source src="/videos/food-video.mp4" type="video/mp4"></source>
              </video>  

                <div id="overlay-content" className="relative mt-8 flex flex-col w-7/8 h-10/12 bg-background/30 z-50 backdrop-blur-md rounded-2xl items-center justify-center">
                    <div className="box-border h-32 w-240 border-2 rounded-3xl border-secondary bg-secondary
                    flex flex-row items-center justify-center">
                        <h1 className="font-mono font-bold text-4xl tracking-wider ">Register Intellectual Property</h1>
                    </div>
                
                <form onSubmit={(e) => { e.preventDefault(); setSaved(inputValue);}}>
                    <div id="content-section" className="m-10 box-border h-60 w-260 border-4 rounded-3xl border-secondary bg-secondary
                    grid grid-flow-row grid-cols-2 items-flex-start justify-flex-start grid-container">
                        
                        <div>
                            <h1 className="m-4 font-mono font-bold text-xl tracking-wider place-content-center row-start-1">Intellectual Property Name</h1>
                        </div>
                        <div>
                            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} id="Input IP Name" placeholder="IP Name"
                                className="m-4 box-border h-10 w-100 border-2 rounded-3xl border-textbox bg-textbox row-start-1 hover:border-foreground
                                px-4 py-3 font-mono text-xl tracking-wider place-content-center text-white cursor-pointer transition-transform delay-150 duration-300 ease-out hover:scale-110"
                            >
                            </input>
                        </div>

                        <div>
                            <h1 className="m-4 font-mono font-bold text-xl tracking-wider place-content-center col-start-1 ">Register IP Type</h1>
                        </div>
                        <div>
                            <div id="dropdown box" className="cursor-pointer transition-transform delay-150 duration-300 ease-out hover:scale-110 ">
                                <Dropdown />
                            </div>
                        </div>
                        <div>
                        <h1 className="m-4 font-mono font-bold text-xl tracking-wider place-content-start">Intellectual Property</h1>
                        </div>
                        <div>
                            <input type="file" hidden />
                            <input type="file" id="Insert IP " placeholder=""
                                className="m-3 h-10 w-100 font-mono text-sm border border-textbox rounded-3xl cursor-pointer
                                            bg-textbox focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground
                                            file:cursor-pointer file:border-0 file:py-3 file:px-3 file:mr-4
                                            file:bg-gray-400 text-white transition-transform delay-150 duration-300 ease-out hover:scale-110"
                            >
                            </input>
                            <p className="m-6 mt-1 font-mono text-sm " id="file_input_help">SVG, PNG, JPG or GIF (MAX. 800x400px).</p>
                        </div>
                        

                    <div className="m-4 flex justify-center gap-20 w-260">
                        <button id="submit-button" className="box-border h-10 w-30 border-4 border-radius rounded-3xl border-approve bg-approve hover:border-[#00EE00] hover:bg-[#00EE00] cursor-pointer transition-transform delay-150 duration-300 ease-out hover:scale-110">
                            <h1 className="font-mono text-xl tracking-wider">Submit</h1>
                        </button>
                
                        <button id="clear-button" className="box-border h-10 w-40 border-4 border-radius rounded-3xl border-reject bg-reject hover:border-[#E90000] hover:bg-[#E90000] cursor-pointer transition-transform delay-150 duration-300 ease-out hover:scale-110">
                            <h1 className="font-mono text-xl tracking-wider">Clear All</h1>
                        </button>
                    </div>
                    </div>
                </form>
                </div>
            </div> 
        </div>
    )
}
