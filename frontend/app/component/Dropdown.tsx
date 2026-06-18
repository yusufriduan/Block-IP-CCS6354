import { useState, useRef, useEffect } from 'react';
import Image from "next/image";

interface DropdownProps {
    changeTypeFunction: (ipType: string) => void;
}

export default function Dropdown({ changeTypeFunction }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedType, setSelectedType] = useState('IP Type');
    
    // This ref helps us detect when the user clicks outside the dropdown!
    const dropdownRef = useRef<HTMLDivElement>(null);

    const ipTypes = ['Copyright', 'Trademark', 'Patent']; // Insert more types here if needed

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (type: string) => {
        setSelectedType(type);
        changeTypeFunction(type);
        setIsOpen(false);
    };

    // Close the dropdown if the user clicks anywhere else on the page
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        // The z-50 ensures the dropdown always floats on top of other elements
        <div className="flex justify-start relative z-50" ref={dropdownRef}>
            <div className="relative w-full min-w-[200px]">
                <button
                    type="button"
                    className="px-4 h-10 w-100 flex items-center justify-between gap-4 rounded-3xl border-2 border-textbox bg-textbox hover:border-foreground font-mono text-xl text-white tracking-wider cursor-pointer transition-all"
                    onClick={toggleDropdown}
                >
                    <span className="truncate">{selectedType}</span>
                    <div className="shrink-0 flex items-center">
                        <Image
                            src="/images/nijika-dorito.png"
                            alt="dropdown icon"
                            width={20}
                            height={20}
                            className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-[225deg]' : 'rotate-[45deg]'}`}
                        />
                    </div>
                </button>

                {isOpen && (
                    <div className="absolute left-0 mt-2 w-100 rounded-xl shadow-lg bg-accent ring-2 ring-foreground ring-opacity-50 overflow-hidden">
                        <div className="py-1 flex flex-col">
                            {ipTypes.map((type, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className="w-full text-left px-4 py-2 font-mono text-lg text-white hover:bg-secondary tracking-wider transition-colors cursor-pointer"
                                    onClick={() => handleSelect(type)}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}