import Image from "next/image"

interface IPComponentProp{
    tokenURI: string;
}

export const IPComponent = () => {
    return(
        <div className="flex flex-col h-48 w-72 bg-accent m-4 rounded-2xl cursor-pointer">
            <div id="ip-image" className="relative h-2/5 w-full top-0 left-0 rounded-t-2xl overflow-hidden">
                <Image src="/images/example.jpg" alt="example-ip" fill className="object-cover"></Image>
            </div>
            <div id="ip-details" className="h-3/5 w-full flex flex-col items-start p-2">
                <h1 id="ip-title" className="font-mono font-semibold text-md">Nijika Okay (Copyright)</h1>
                <p className="font-mono text-xs">Hash: 0x24c <span className="ml-1">...</span></p>
                <p className="font-mono text-xs">Date Posted: 02/06/2026</p>
                <p className="font-mono text-xs">Date Approved: 02/06/2026</p>
                <div className="flex flex-row justify-center items-center w-full mt-1">
                    <button className="mr-4 h-6 w-20 bg-green-400 p-2 flex justify-center items-center rounded-lg cursor-pointer">Approve</button>
                    <button className="ml-4 h-6 w-20 bg-red-400 p-2 flex justify-center items-center rounded-lg cursor-pointer">Reject</button>
                </div>
            </div>
        </div>
    )
}