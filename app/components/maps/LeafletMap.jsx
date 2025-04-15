"use client";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import DisasterDataFetcher without SSR
const DisasterDataFetcher = dynamic(() => import("./DisasterDataFetcher"), { ssr: false });

export default function LeafletMap() {
    return (
        <div className="w-full h-[500px]">
            <DisasterDataFetcher />
        </div>
    );
}