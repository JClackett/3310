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
	const lastKeyPressTime = useRef<number>(0);

	// Vibration function
	const vibrate = (pattern: number | number[]) => {
		// Only vibrate if the device supports it and we're not in a rapid-fire situation
		if (
			typeof window !== "undefined" &&
			window.navigator.vibrate &&
			!timeoutRef.current
		) {
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

	// Handle key press with debouncing
	const handleKeyPress = (key: string) => {
		const now = Date.now();
		if (now - lastKeyPressTime.current < 100) {
			return; // Debounce rapid presses
		}
		lastKeyPressTime.current = now;

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

	// Handle touch events for better mobile performance
	const handleTouchStart = (e: React.TouchEvent) => {
		e.preventDefault(); // Prevent default touch behavior
		const target = e.target as HTMLElement;
		const key = target.getAttribute("data-key");
		if (key) {
			handleKeyPress(key);
		}
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
		<div className="bg-[#EFEFEF] select-none h-dvh w-screen overflow-hidden flex flex-col items-center pt-10 p-4 touch-none">
			<div className="relative w-[400px] h-[580px]">
				{/* Nokia 3310 Image */}
				<div className="relative w-full h-full">
					<Image
						src="/nokia-3310.png"
						alt="Nokia 3310"
						fill
						className="object-contain touch-none"
						priority
						loading="eager"
						sizes="400px"
					/>

					{/* Screen Overlay */}

					<div className="absolute shadow-[inset_0_2px_4px_0_rgb(0_0_0_/_0.55)] rounded-t-sm rounded-b-md top-[185px] left-[130px] w-[141px] h-[100px] bg-[#94C7A1] flex flex-col items-center justify-center px-2 font-mono text-black text-sm">
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
					<div className="absolute top-[300px]">
						<button
							type="button"
							onClick={handleCenterPress}
							className="debug absolute left-[170px] w-[60px] h-[30px] rounded-full opacity-0 focus:outline-none"
							aria-label="Center button"
						/>
						<button
							type="button"
							onClick={handleBackspace}
							className="debug absolute top-[14px] left-[132px] w-[30px] h-[30px] opacity-0 focus:outline-none"
							aria-label="Left button"
						/>
						<button
							type="button"
							className="debug absolute left-[220px] top-[20px] w-[50px] -rotate-12 h-[30px] opacity-0 focus:outline-none"
							aria-label="Right button"
						/>

						{/* Number Buttons */}
						<button
							type="button"
							onClick={() => handleKeyPress("1")}
							onTouchStart={handleTouchStart}
							data-key="1"
							className="debug absolute top-[64px] left-[116px] w-[49px] h-[25px] opacity-0 focus:outline-none touch-manipulation"
							aria-label="Button 1"
						/>
						<button
							type="button"
							onClick={() => handleKeyPress("2")}
							onTouchStart={handleTouchStart}
							data-key="2"
							className="debug absolute top-[69px] left-[176px] w-[49px] h-[25px] opacity-0 focus:outline-none touch-manipulation"
							aria-label="Button 2"
						/>
						<button
							type="button"
							onClick={() => handleKeyPress("3")}
							onTouchStart={handleTouchStart}
							data-key="3"
							className="debug absolute top-[64px] left-[236px] w-[49px] h-[25px] opacity-0 focus:outline-none touch-manipulation"
							aria-label="Button 3"
						/>

						<button
							type="button"
							onClick={() => handleKeyPress("4")}
							onTouchStart={handleTouchStart}
							data-key="4"
							className="debug absolute top-[97px] left-[118px] w-[49px] h-[25px] opacity-0 focus:outline-none touch-manipulation"
							aria-label="Button 4"
						/>
						<button
							type="button"
							onClick={() => handleKeyPress("5")}
							onTouchStart={handleTouchStart}
							data-key="5"
							className="debug absolute top-[102px] left-[176px] w-[49px] h-[25px] opacity-0 focus:outline-none touch-manipulation"
							aria-label="Button 5"
						/>
						<button
							type="button"
							onClick={() => handleKeyPress("6")}
							onTouchStart={handleTouchStart}
							data-key="6"
							className="debug absolute top-[97px] left-[236px] w-[49px] h-[25px] opacity-0 focus:outline-none touch-manipulation"
							aria-label="Button 6"
						/>

						<button
							type="button"
							onClick={() => handleKeyPress("7")}
							onTouchStart={handleTouchStart}
							data-key="7"
							className="debug absolute top-[129px] left-[121px] w-[49px] h-[25px] opacity-0 focus:outline-none touch-manipulation"
							aria-label="Button 7"
						/>
						<button
							type="button"
							onClick={() => handleKeyPress("8")}
							onTouchStart={handleTouchStart}
							data-key="8"
							className="debug absolute top-[135px] left-[178px] w-[49px] h-[25px] opacity-0 focus:outline-none touch-manipulation"
							aria-label="Button 8"
						/>
						<button
							type="button"
							onClick={() => handleKeyPress("9")}
							onTouchStart={handleTouchStart}
							data-key="9"
							className="debug absolute top-[131px] left-[236px] w-[49px] h-[25px] opacity-0 focus:outline-none touch-manipulation"
							aria-label="Button 9"
						/>

						<button
							type="button"
							onClick={() => handleKeyPress("*")}
							onTouchStart={handleTouchStart}
							data-key="*"
							className="debug absolute top-[162px] left-[124px] w-[49px] h-[25px] opacity-0 focus:outline-none touch-manipulation"
							aria-label="Button *"
						/>
						<button
							type="button"
							onClick={() => handleKeyPress("0")}
							onTouchStart={handleTouchStart}
							data-key="0"
							className="debug absolute top-[169px] left-[178px] w-[49px] h-[25px] opacity-0 focus:outline-none touch-manipulation"
							aria-label="Button 0"
						/>
						<button
							type="button"
							onClick={() => handleKeyPress("#")}
							onTouchStart={handleTouchStart}
							data-key="#"
							className="debug absolute top-[162px] left-[234px] w-[49px] h-[25px] opacity-0 focus:outline-none touch-manipulation"
							aria-label="Button #"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
