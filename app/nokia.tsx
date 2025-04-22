"use client";
import "ios-vibrator-pro-max";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function Nokia3310Simulator() {
	const [input, setInput] = useState("");
	const [currentKey, setCurrentKey] = useState<string | null>(null);
	const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
	const [isMenuScreen, setIsMenuScreen] = useState(true);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Vibration function
	const vibrate = (pattern: number | number[]) => {
		if (typeof window !== "undefined") {
			window.navigator.vibrate(pattern);
		}
	};

	// Key mappings similar to Nokia 3310
	const keyMappings: Record<string, string[]> = {
		"1": [".", ",", "?", "!", "1", "-", "@", "_", "+", "(", ")"],
		"2": ["a", "b", "c", "2"],
		"3": ["d", "e", "f", "3"],
		"4": ["g", "h", "i", "4"],
		"5": ["j", "k", "l", "5"],
		"6": ["m", "n", "o", "6"],
		"7": ["p", "q", "r", "s", "7"],
		"8": ["t", "u", "v", "8"],
		"9": ["w", "x", "y", "z", "9"],
		"0": [" ", "0"],
		"*": ["*", "+", "/", "=", "<", ">", "$", "%", "&", '"', "'"],
		"#": ["#"],
	};

	// Handle key press
	const handleKeyPress = (key: string) => {
		// Provide haptic feedback - short vibration for number keys
		vibrate(20);

		if (isMenuScreen) {
			setIsMenuScreen(false);
			return;
		}

		if (key === "#") {
			// Toggle uppercase/lowercase for the last character
			if (input.length > 0) {
				const lastChar = input.slice(-1);
				const isUpperCase =
					lastChar === lastChar.toUpperCase() &&
					lastChar !== lastChar.toLowerCase();
				const newLastChar = isUpperCase
					? lastChar.toLowerCase()
					: lastChar.toUpperCase();
				setInput(input.slice(0, -1) + newLastChar);
			}
			return;
		}

		if (key === currentKey) {
			// Same key pressed, cycle through characters
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			const chars = keyMappings[key];
			const nextIndex = (currentKeyIndex + 1) % chars.length;
			setCurrentKeyIndex(nextIndex);

			// Update the input by replacing the last character
			setInput((prev) => prev.slice(0, -1) + keyMappings[key][nextIndex]);
		} else {
			// Different key pressed, add new character
			if (currentKey !== null && timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			setCurrentKey(key);
			setCurrentKeyIndex(0);
			setInput((prev) => prev + keyMappings[key][0]);
		}

		// Set timeout to finalize character after 1 second of inactivity
		timeoutRef.current = setTimeout(() => {
			setCurrentKey(null);
		}, 1000);
	};

	// Handle center button press
	const handleCenterPress = () => {
		// Provide haptic feedback - medium vibration for navigation buttons
		vibrate(30);

		if (isMenuScreen) {
			setIsMenuScreen(false);
		} else {
			setIsMenuScreen(true);
			setInput("");
		}
	};

	// Handle backspace (left button)
	const handleBackspace = () => {
		// Provide haptic feedback - medium vibration for navigation buttons
		vibrate(30);

		if (!isMenuScreen) {
			setInput((prev) => prev.slice(0, -1));
			setCurrentKey(null);
		}
	};

	// Clear timeout on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return (
		<div className="bg-[#EFEFEF] h-dvh w-screen flex flex-col items-center justify-center p-4">
			<div className="relative w-[400px] h-[800px]">
				{/* Nokia 3310 Image */}
				<div className="relative w-full h-full">
					<Image
						src="/nokia-3310.png"
						alt="Nokia 3310"
						fill
						className="object-contain"
						priority
					/>

					{/* Screen Overlay */}

					<div className="absolute shadow-[inset_0_2px_4px_0_rgb(0_0_0_/_0.55)] rounded-t-sm rounded-b-md top-[290px] left-[130px] w-[141px] h-[100px] bg-[#94C7A1] flex flex-col items-center justify-center px-2 font-mono text-black text-sm">
						<div className="absolute inset-0 grid grid-cols-[repeat(47,1fr)] grid-rows-[repeat(33,1fr)] pointer-events-none">
							{[...Array(47 * 33)].map((_, i) => (
								<div
									key={`pixel-${Math.floor(i / 47)}-${i % 47}`}
									className="border-[0.2px] border-black/5"
								/>
							))}
						</div>
						{isMenuScreen ? (
							<>
								<div className="text-center font-bold mb-4">NOKIA</div>
								<div className="text-center">Menu</div>
							</>
						) : (
							<div className="w-full h-full p-1 overflow-hidden">
								<div className="text-xs mb-1">New message</div>
								<div className="text-sm break-words overflow-hidden">
									{input || <span className="animate-pulse">_</span>}
									{currentKey && <span className="animate-pulse">|</span>}
								</div>
							</div>
						)}
					</div>

					{/* Navigation Buttons */}
					<div className="absolute top-[410px]">
						<button
							type="button"
							onClick={handleCenterPress}
							className="absolute left-[170px] w-[60px] h-[30px] rounded-full opacity-0 hover:opacity-20 focus:outline-none"
							aria-label="Center button"
						/>
						<button
							type="button"
							onClick={handleBackspace}
							className="absolute top-[14px] left-[132px] w-[30px] h-[30px] opacity-0 hover:opacity-20 focus:outline-none"
							aria-label="Left button"
						/>
						<button
							type="button"
							className="absolute left-[220px] top-[20px] w-[50px] -rotate-12 h-[30px] opacity-0 hover:opacity-20 focus:outline-none"
							aria-label="Right button"
						/>

						{/* Number Buttons */}
						<button
							type="button"
							onClick={() => handleKeyPress("1")}
							className="absolute top-[67px] left-[120px] w-[40px] h-[25px] opacity-0 hover:opacity-20 focus:outline-none"
							aria-label="Button 1"
						/>
						<button
							type="button"
							onClick={() => handleKeyPress("2")}
							className="absolute top-[72px] left-[180px] w-[40px] h-[25px] opacity-0 hover:opacity-20 focus:outline-none"
							aria-label="Button 2"
						/>
						<button
							type="button"
							onClick={() => handleKeyPress("3")}
							className="absolute top-[67px] left-[240px] w-[40px] h-[25px] opacity-0 hover:opacity-20 focus:outline-none"
							aria-label="Button 3"
						/>

						<button
							type="button"
							onClick={() => handleKeyPress("4")}
							className="absolute top-[100px] left-[122px] w-[40px] h-[25px] opacity-0 hover:opacity-20 focus:outline-none"
							aria-label="Button 4"
						/>
						<button
							type="button"
							onClick={() => handleKeyPress("5")}
							className="absolute top-[105px] left-[180px] w-[40px] h-[25px] opacity-0 hover:opacity-20 focus:outline-none"
							aria-label="Button 5"
						/>
						<button
							type="button"
							onClick={() => handleKeyPress("6")}
							className="absolute top-[100px] left-[240px] w-[40px] h-[25px] opacity-0 hover:opacity-20 focus:outline-none"
							aria-label="Button 6"
						/>

						<button
							type="button"
							onClick={() => handleKeyPress("7")}
							className="absolute top-[132px] left-[125px] w-[40px] h-[25px] opacity-0 hover:opacity-20 focus:outline-none"
							aria-label="Button 7"
						/>
						<button
							type="button"
							onClick={() => handleKeyPress("8")}
							className="absolute top-[140px] left-[182px] w-[40px] h-[25px] opacity-0 hover:opacity-20 focus:outline-none"
							aria-label="Button 8"
						/>
						<button
							type="button"
							onClick={() => handleKeyPress("9")}
							className="absolute top-[134px] left-[240px] w-[40px] h-[25px] opacity-0 hover:opacity-20 focus:outline-none"
							aria-label="Button 9"
						/>

						<button
							type="button"
							onClick={() => handleKeyPress("*")}
							className="absolute top-[168px] left-[128px] w-[40px] h-[25px] opacity-0 hover:opacity-20 focus:outline-none"
							aria-label="Button *"
						/>
						<button
							type="button"
							onClick={() => handleKeyPress("0")}
							className="absolute top-[175px] left-[182px] w-[40px] h-[25px] opacity-0 hover:opacity-20 focus:outline-none"
							aria-label="Button 0"
						/>
						<button
							type="button"
							onClick={() => handleKeyPress("#")}
							className="absolute top-[168px] left-[238px] w-[40px] h-[25px] opacity-0 hover:opacity-20 focus:outline-none"
							aria-label="Button #"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
