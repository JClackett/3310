"use client";
import dynamic from "next/dynamic";

const Nokia3310Simulator = dynamic(() => import("./nokia"), {
	ssr: false,
	loading: () => <div className="w-full h-dvh bg-[#EFEFEF]" />,
});

export default function Page() {
	return <Nokia3310Simulator />;
}
