import { useState } from 'react';
import Image from "next/image";

export default function Dropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedType, setSelectedType] = useState('IP Type');

    const ipType = ['IP Types', 'Copyright', 'Trademark', 'Patent'];
    //Insert the IP Types here

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (ipType: string) => {
        setSelectedType(ipType);
        setIsOpen(false);
    };

    return (
        <div className="flex justify-start p-2">
            <div className="relative inline-block text-left">
                <button
                    type="button"
                    className="px-4 py-3 
                                m-2 h-10 w-100 
                                flex items-center justify-center gap-2 
                                rounded-3xl border-2
                                border-textbox bg-textbox
                                hover:border-foreground
                                font-mono text-xl 
                                tracking-wider place-content-center"
                    onClick={toggleDropdown}
                >
                    <span className="truncate pr-2">{selectedType}</span>
                    <div className="shrink-0 flex items-center">
                    <Image
                        src="/images/nijika-dorito.png"
                        alt="dropdown icon"
                        width={20}
                        height={20}
                        className="shrink-0"
                    />
                    </div>
                </button>

                {isOpen && (
                    <div className="
                                    m-2 origin-top-right absolute
                                    right-0 mt-2 w-100 rounded-xl
                                    shadow-lg bg-accent ring-2 ring-foreground
                                    ring-opacity-5"> 
                        <div className="py-1">
                            {ipType.map((ipType, index) => (
                                <a
                                    key={index}
                                    href="#"
                                    className="block px-4 py-2
                                               tracking-wider place-content-center
                                               font-mono text-l
                                               hover:bg-secondary 
                                               hover:ring-0 hover:rounded-xl
                                               "
                                    onClick={() => handleSelect(ipType)}
                                >
                                    {ipType}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}