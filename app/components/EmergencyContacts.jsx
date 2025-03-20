"use client";
import { Shield, Flame, Heart, LifeBuoy } from "lucide-react";

export default function EmergencyContacts() {
    // Indian standard emergency contacts
    const contacts = [
        {
            label: "Police",
            number: "100",
            gradient: "from-red-500 to-red-600",
            hoverGradient: "from-red-600 to-red-700",
            icon: <Shield className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />,
            description: "For law enforcement emergencies"
        },
        {
            label: "Fire Department",
            number: "101",
            gradient: "from-orange-500 to-orange-600",
            hoverGradient: "from-orange-600 to-orange-700",
            icon: <Flame className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />,
            description: "For fire and rescue emergencies"
        },
        {
            label: "Ambulance",
            number: "102",
            gradient: "from-blue-500 to-blue-600",
            hoverGradient: "from-blue-600 to-blue-700",
            icon: <Heart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />,
            description: "For medical emergencies"
        },
        {
            label: "Disaster Relief",
            number: "108",
            gradient: "from-green-500 to-green-600",
            hoverGradient: "from-green-600 to-green-700",
            icon: <LifeBuoy className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />,
            description: "For disaster and emergency relief"
        },
    ];

    // Function to handle phone call
    const handleCall = (phoneNumber) => {
        // Format the phone number for tel: protocol
        const formattedNumber = phoneNumber.replace(/\s+/g, '').replace(/-/g, '');
        // Open the dialer with the number
        window.location.href = `tel:${formattedNumber}`;
    };

    return (
        <div className="rounded-xl overflow-hidden bg-white/95 backdrop-blur-md shadow-md">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-500 py-2 sm:py-3 px-4">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center">Emergency Contacts</h2>
            </div>

            {/* Contact List */}
            <div className="p-2 sm:p-3 md:p-4">
                <ul className="space-y-2 sm:space-y-3">
                    {contacts.map((contact, index) => (
                        <li
                            key={index}
                            className="group relative rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg"
                        >
                            {/* Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${contact.gradient} group-hover:${contact.hoverGradient} transition-all duration-300`}></div>

                            {/* Contact Details */}
                            <div className="relative flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 text-white">
                                {/* Icon */}
                                <div className="bg-white/20 p-1.5 sm:p-2 rounded-full">
                                    {contact.icon}
                                </div>

                                {/* Label, Number, and Description */}
                                <div className="flex flex-col">
                                    <span className="text-xs sm:text-sm md:text-base font-medium">{contact.label}</span>
                                    <span className="text-xs sm:text-sm md:text-base font-bold">{contact.number}</span>
                                    <span className="text-xs md:text-xs text-white/80 hidden sm:block">{contact.description}</span>
                                </div>

                                {/* Call Button */}
                                <div className="ml-auto">
                                    <button
                                        className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs sm:text-sm transition-colors duration-200"
                                        onClick={() => handleCall(contact.number)}
                                        aria-label={`Call ${contact.label}`}
                                    >
                                        Call
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}