import { redirect, RedirectType } from "next/navigation";

interface headerProps {
    isConnected: boolean | null;
    isNotAdmin: boolean;
    isDashboard: boolean;
    isRegister: boolean;
    isCredit: boolean;
}

export const Header = ({isConnected, isNotAdmin, isDashboard, isRegister, isCredit} : headerProps) => {

    function redirectToCredits(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault();
        redirect('/credits', RedirectType.push)
    }

    function redirectToDashboard(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault();
        redirect('/', RedirectType.push)
    }

    return(
        <div className="w-screen absolute h-16 bg-accent">
            <div id="header-left" className="relative float-left ml-16 h-full flex items-center">
                <h1 className="font-mono text-4xl tracking-wider font-semibold">BlockIP</h1>
            </div>
            <div id="header-right" className="relative float-end mr-16 h-full flex flex-row items-center">
                {isConnected && isNotAdmin && !isRegister ? 
                    <div className="group">
                        <button className="relative mr-8 font-mono text-xl font-semibold cursor-pointer">
                            Register IP
                            <span className="absolute left-0 bottom-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full bg-foreground"></span>
                        </button>
                    </div>
                    : null}
                {isConnected && isNotAdmin && !isDashboard ? 
                    <div className="group">
                        <button className="relative mr-8 font-mono text-xl font-semibold cursor-pointer" onClick={redirectToDashboard}>
                            Dashboard
                            <span className="absolute left-0 bottom-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full bg-foreground"></span>
                        </button>
                    </div>
                    : null}
                {isConnected && !isCredit ? 
                    <div className="group">
                        <button className="relative mr-8 font-mono text-xl font-semibold cursor-pointer" onClick={redirectToCredits}>
                            Credits
                            <span className="absolute left-0 bottom-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full bg-foreground"></span>
                        </button>
                    </div>
                    : null}
            </div>
        </div>
    )
}