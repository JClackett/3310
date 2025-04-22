"use client";
import "ios-vibrator-pro-max";
import { enableMainThreadBlocking } from "ios-vibrator-pro-max";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function Nokia3310Simulator() {
	const [input, setInput] = useState("");
	const [currentKey, setCurrentKey] = useState<string | null>(null);
	const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const ringtoneRef = useRef<HTMLAudioElement | null>(null);

	// Initialize audio context on first interaction
	const initAudioContext = () => {
		if (!audioContextRef.current && typeof window !== "undefined") {
			audioContextRef.current = new AudioContext();
			// Resume the audio context if it's suspended
			if (audioContextRef.current.state === "suspended") {
				audioContextRef.current.resume();
			}
		}
	};

	// Play key press sound
	const playKeySound = (key: string) => {
		if (!audioContextRef.current) {
			initAudioContext();
		}

		if (!audioContextRef.current) return;

		// Resume audio context if suspended (iOS requirement)
		if (audioContextRef.current.state === "suspended") {
			audioContextRef.current.resume();
		}

		// DTMF frequencies
		const rowFreqs = [697, 770, 852, 941]; // Row frequencies
		const colFreqs = [1209, 1336, 1477, 1633]; // Column frequencies

		// Create two oscillators for dual-tone
		const osc1 = audioContextRef.current.createOscillator();
		const osc2 = audioContextRef.current.createOscillator();
		const gainNode = audioContextRef.current.createGain();

		// Map keys to row and column indices
		const keyMap: Record<string, [number, number]> = {
			"1": [0, 0],
			"2": [0, 1],
			"3": [0, 2],
			"4": [1, 0],
			"5": [1, 1],
			"6": [1, 2],
			"7": [2, 0],
			"8": [2, 1],
			"9": [2, 2],
			"*": [3, 0],
			"0": [3, 1],
			"#": [3, 2],
		};

		const [row, col] = keyMap[key] || [0, 0];

		osc1.type = "triangle";
		osc2.type = "triangle";
		osc1.frequency.setValueAtTime(
			rowFreqs[row],
			audioContextRef.current.currentTime,
		);
		osc2.frequency.setValueAtTime(
			colFreqs[col],
			audioContextRef.current.currentTime,
		);

		gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(
			0.05,
			audioContextRef.current.currentTime + 0.1,
		);

		osc1.connect(gainNode);
		osc2.connect(gainNode);
		gainNode.connect(audioContextRef.current.destination);

		osc1.start();
		osc2.start();
		osc1.stop(audioContextRef.current.currentTime + 0.2);
		osc2.stop(audioContextRef.current.currentTime + 0.2);
	};

	// Vibration function
	const vibrate = (pattern: number | number[]) => {
		// Only vibrate if the device supports it and we're not in a rapid-fire situation
		if (typeof window !== "undefined" && window.navigator.vibrate) {
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

	const handlePress = (e: React.MouseEvent<HTMLButtonElement>) => {
		const key = e.currentTarget.getAttribute("data-key");
		if (key) {
			handleKeyPress(key);
		}
	};

	// Handle key press with debouncing
	const handleKeyPress = (key: string) => {
		// Initialize audio context on first key press
		initAudioContext();

		// Provide haptic feedback - short vibration for number keys
		vibrate(20);
		playKeySound(key);

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
		}, 600);
	};

	// // Handle touch events for better mobile performance
	// const handleTouchStart = (e: React.TouchEvent) => {
	// 	e.preventDefault(); // Prevent default touch behavior
	// 	const target = e.target as HTMLElement;
	// 	const key = target.getAttribute("data-key");
	// 	if (key) {
	// 		handleKeyPress(key);
	// 	}
	// };

	// Handle center button press
	const handleCenterPress = () => {
		// Provide haptic feedback - medium vibration for navigation buttons
		vibrate(30);

		// Play ringtone
		if (!ringtoneRef.current) {
			ringtoneRef.current = new Audio("/ringtone.mp3");
		}
		ringtoneRef.current.play();

		enableMainThreadBlocking(true);
		vibrate([
			1000, 100, 1000, 100, 1000, 100, 1000, 100, 1000, 100, 1000, 100, 1000,
		]);
	};

	// Handle backspace (left button)
	const handleBackspace = () => {
		// Provide haptic feedback - medium vibration for navigation buttons
		vibrate(30);

		setInput((prev) => prev.slice(0, -1));
		setCurrentKey(null);
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

						<div className="w-full h-full p-1 overflow-hidden">
							<div className="text-xs mb-1">New message</div>
							<div className="text-sm break-words overflow-hidden">
								{input || <span className="animate-pulse">_</span>}
								{currentKey && <span className="animate-pulse">|</span>}
							</div>
						</div>
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
							onClick={handlePress}
							// onTouchStart={handleTouchStart}
							data-key="1"
							className="debug absolute top-[64px] left-[116px] w-[49px] h-[25px] opacity-0 focus:outline-none touch-manipulation"
							aria-label="Button 1"
						/>
						<button
							type="button"
							onClick={handlePress}
							// onTouchStart={handleTouchStart}
							data-key="2"
							className="debug absolute top-[69px] left-[176px] w-[49px] h-[25px] opacity-0 focus:outline-none touch-manipulation"
							aria-label="Button 2"
						/>
						<button
							type="button"
							onClick={handlePress}
							// onTouchStart={handleTouchStart}
							data-key="3"
							className="debug absolute top-[64px] left-[236px] w-[49px] h-[25px] opacity-0 focus:outline-none touch-manipulation"
							aria-label="Button 3"
						/>

						<button
							type="button"
							onClick={handlePress}
							// onTouchStart={handleTouchStart}
							data-key="4"
							className="debug absolute top-[97px] left-[118px] w-[49px] h-[25px] opacity-0 focus:outline-none touch-manipulation"
							aria-label="Button 4"
						/>
						<button
							type="button"
							onClick={handlePress}
							// onTouchStart={handleTouchStart}
							data-key="5"
							className="debug absolute top-[102px] left-[176px] w-[49px] h-[25px] opacity-0 focus:outline-none touch-manipulation"
							aria-label="Button 5"
						/>
						<button
							type="button"
							onClick={handlePress}
							// onTouchStart={handleTouchStart}
							data-key="6"
							className="debug absolute top-[97px] left-[236px] w-[49px] h-[25px] opacity-0 focus:outline-none touch-manipulation"
							aria-label="Button 6"
						/>

						<button
							type="button"
							onClick={handlePress}
							// onTouchStart={handleTouchStart}
							data-key="7"
							className="debug absolute top-[129px] left-[121px] w-[49px] h-[25px] opacity-0 focus:outline-none touch-manipulation"
							aria-label="Button 7"
						/>
						<button
							type="button"
							onClick={handlePress}
							// onTouchStart={handleTouchStart}
							data-key="8"
							className="debug absolute top-[135px] left-[178px] w-[49px] h-[25px] opacity-0 focus:outline-none touch-manipulation"
							aria-label="Button 8"
						/>
						<button
							type="button"
							onClick={handlePress}
							// onTouchStart={handleTouchStart}
							data-key="9"
							className="debug absolute top-[131px] left-[236px] w-[49px] h-[25px] opacity-0 focus:outline-none touch-manipulation"
							aria-label="Button 9"
						/>

						<button
							type="button"
							onClick={handlePress}
							// onTouchStart={handleTouchStart}
							data-key="*"
							className="debug absolute top-[162px] left-[124px] w-[49px] h-[25px] opacity-0 focus:outline-none touch-manipulation"
							aria-label="Button *"
						/>
						<button
							type="button"
							onClick={handlePress}
							// onTouchStart={handleTouchStart}
							data-key="0"
							className="debug absolute top-[169px] left-[178px] w-[49px] h-[25px] opacity-0 focus:outline-none touch-manipulation"
							aria-label="Button 0"
						/>
						<button
							type="button"
							onClick={handlePress}
							// onTouchStart={handleTouchStart}
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
