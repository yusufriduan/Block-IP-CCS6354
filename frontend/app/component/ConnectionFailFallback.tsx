"use client"

import Image from "next/image";

export default function ConnectionFailFallback(){
    return(
        <div id="not-connected-screen" className="h-screen w-screen flex flex-col justify-center items-center">
            <h1 className="text-5xl font-bold font-mono tracking-wider">It seems you're not connected.</h1>
            <p className="text-xl font-mono tracking-wide mt-4">Connect now to start protecting your assets</p>
            <a href="https://metamask.io/download" target="_blank" rel="noopener noreferrer" className="w-1/4 h-18 mt-8 bg-amber-500 rounded-2xl font-mono font-semibold text-2xl cursor-pointer">
            <div className="flex flex-row items-center justify-around h-full w-full">
                <div id="image-container" className="relative h-3/4 aspect-square">
                    <Image src="/images/MetaMask_Fox.png" alt="metamask-logo" fill className="object-cover" sizes="100vw"></Image>
                </div>
                <p className="mr-4">Download MetaMask</p>
            </div>
            </a>
      </div>
    )
}