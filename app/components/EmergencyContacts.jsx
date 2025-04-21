"use client";
import { Shield, Flame, Heart, LifeBuoy } from "lucide-react";

export default function EmergencyContacts() {
    const contacts = [
        {
            label: "Police",
            number: "100",
            gradient: "from-rose-500 to-rose-600",
            hoverGradient: "from-rose-600 to-rose-700",
            icon: <Shield className="w-6 h-6" />,
            description: "For law enforcement emergencies"
        },
        {
            label: "Fire Dept.",
            number: "101",
            gradient: "from-amber-500 to-amber-600",
            hoverGradient: "from-amber-600 to-amber-700",
            icon: <Flame className="w-6 h-6" />,
            description: "For fire and rescue emergencies"
        },
        {
            label: "Ambulance",
            number: "102",
            gradient: "from-cyan-500 to-cyan-600",
            hoverGradient: "from-cyan-600 to-cyan-700",
            icon: <Heart className="w-6 h-6" />,
            description: "For medical emergencies"
        },
        {
            label: "Disaster Relief",
            number: "112",
            gradient: "from-emerald-500 to-emerald-600",
            hoverGradient: "from-emerald-600 to-emerald-700",
            icon: <LifeBuoy className="w-6 h-6" />,
            description: "For disaster and emergency relief"
        },
    ];

    const handleCall = (phoneNumber) => {
        const formatted = phoneNumber.replace(/\s+/g, '').replace(/-/g, '');
        window.location.href = `tel:${formatted}`;
    };

    return (
        <div className="rounded-xl overflow-hidden bg-white/95 backdrop-blur-md shadow-lg">
            <div className="bg-gradient-to-r from-rose-500 to-indigo-500 py-3 px-4 text-center">
                <h2 className="text-xl md:text-2xl font-bold text-white">Emergency Contacts</h2>
            </div>
            <div className="p-3 md:p-4">
                <div className="grid grid-cols-2 gap-3">
                    {contacts.map((contact, index) => (
                        <div
                            key={index}
                            className="group relative rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer border border-rose-300"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-r ${contact.gradient} group-hover:${contact.hoverGradient} transition-all duration-300`}></div>
                            <div className="relative h-full">
                                <div className="flex flex-col items-center gap-3 p-4 text-white text-center h-full sm:flex-col sm:items-center">
                                    <div className="bg-white/20 p-3 rounded-full border border-rose-200">
                                        {contact.icon}
                                    </div>
                                    <div className="flex-1 space-y-1 sm:space-y-1">
                                        <h3 className="text-base font-semibold">{contact.label}</h3>
                                        <p className="text-lg font-bold">{contact.number}</p>
                                        <p className="text-xs text-white/80">{contact.description}</p>
                                    </div>
                                    <button
                                        className="px-4 py-2 bg-white/20 group-hover:bg-white/30 rounded-full text-sm font-medium transition-all duration-200 border border-rose-300 sm:mt-auto"
                                        onClick={() => handleCall(contact.number)}
                                    >
                                        Call
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}