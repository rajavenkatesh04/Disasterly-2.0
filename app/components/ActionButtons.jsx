"use client";
import { useRouter } from "next/navigation";
import { Plus, Handshake, DollarSign, AlertTriangle } from "lucide-react";

export default function ActionButtons() {
    const router = useRouter();

    const buttons = [
        {
            label: "Get Help",
            number: "Request assistance",
            gradient: "from-indigo-100 to-indigo-200",
            hoverGradient: "from-indigo-200 to-indigo-300",
            icon: <Plus className="w-5 h-5 sm:w-6 sm:h-6" />,
            href: "/get-help",
            description: "Access support services"
        },
        {
            label: "Provide Help",
            number: "Volunteer services",
            gradient: "from-sky-100 to-sky-200",
            hoverGradient: "from-sky-200 to-sky-300",
            icon: <Handshake className="w-5 h-5 sm:w-6 sm:h-6" />,
            href: "/provide-help",
            description: "Offer your assistance"
        },
        {
            label: "Donate",
            number: "Support relief efforts",
            gradient: "from-emerald-100 to-emerald-200",
            hoverGradient: "from-emerald-200 to-emerald-300",
            icon: <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />,
            href: "/donate",
            description: "Financial contributions"
        },
        {
            label: "SOS",
            number: "Emergency assistance",
            gradient: "from-rose-100 to-rose-200",
            hoverGradient: "from-rose-200 to-rose-300",
            icon: <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />,
            href: "/sos",
            description: "Urgent help needed"
        },
    ];

    return (
        <div className="rounded-xl overflow-hidden bg-white/95 backdrop-blur-md shadow-lg">
            <div className="bg-gradient-to-r from-indigo-500 to-sky-400 py-3 px-4 text-center">
                <h2 className="text-xl md:text-2xl font-bold text-white">Need or Offer Help?</h2>
            </div>
            <div className="p-3 md:p-4">
                <ul className="space-y-3">
                    {buttons.map((button, index) => (
                        <li
                            key={index}
                            className="group relative rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer border border-indigo-300"
                            onClick={() => router.push(button.href)}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-r ${button.gradient} group-hover:${button.hoverGradient} transition-all duration-300`}></div>
                            <div className="relative flex items-center gap-4 p-4 text-indigo-900">
                                <div className="bg-white/40 p-2 rounded-full border border-indigo-200">
                                    {button.icon}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm md:text-base font-semibold">{button.label}</span>
                                    <span className="text-sm font-bold">{button.number}</span>
                                    <span className="text-xs text-indigo-800 hidden sm:block">{button.description}</span>
                                </div>
                                <div className="ml-auto">
                                    <div className="px-3 py-1 bg-white/50 group-hover:bg-white/70 rounded-full text-xs transition-all border border-indigo-300 font-medium">
                                        Go
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
