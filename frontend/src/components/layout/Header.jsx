import { Menu, Bell } from "lucide-react";

function Header({ setOpen }) {

    return (

        <header className="sticky top-0 z-30 h-20 bg-white border-b flex items-center justify-between px-8">

            <button
                className="lg:hidden"
                onClick={() => setOpen(true)}
            >
                <Menu />

            </button>

            <h2 className="font-semibold text-lg">
                Admission Tracker
            </h2>

            <div className="flex items-center gap-5">
                <Bell size={20} />
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center">
                    A
                </div>
            </div>

        </header>

    );

}

export default Header;