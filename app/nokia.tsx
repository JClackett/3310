"use client";
import "ios-vibrator-pro-max";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Pencil } from "@/components/icons/pencil";

export default function Nokia3310Simulator() {
	const [isReady, setIsReady] = useState(false);
	const [input, setInput] = useState("");
	const [currentKey, setCurrentKey] = useState<string | null>(null);
	const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const ringtoneRef = useRef<HTMLAudioElement | null>(null);

	// Initialize audio context on first interaction
	const initAudioContext = useCallback(() => {
		if (!audioContextRef.current && typeof window !== "undefined") {
			audioContextRef.current = new AudioContext();
			// Resume the audio context if it's suspended
			if (audioContextRef.current.state === "suspended") {
				audioContextRef.current.resume();
			}
		}
	}, []);

	// Play key press sound
	const playKeySound = () => {
		if (!audioContextRef.current) initAudioContext();
		if (!audioContextRef.current) return;

		// Resume audio context if suspended (iOS requirement)
		if (audioContextRef.current.state === "suspended") {
			audioContextRef.current.resume();
		}

		// Create two oscillators for dual-tone
		const osc = audioContextRef.current.createOscillator();
		const gainNode = audioContextRef.current.createGain();

		// Main tone
		osc.type = "sine";
		osc.frequency.setValueAtTime(900, audioContextRef.current.currentTime);

		gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(
			0.01,
			audioContextRef.current.currentTime + 0.1,
		);
		osc.connect(gainNode);
		gainNode.connect(audioContextRef.current.destination);
		osc.start();
		osc.stop(audioContextRef.current.currentTime + 0.1);
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
		playKeySound();

		// Provide haptic feedback - short vibration for number keys
		vibrate(30);

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

	useEffect(() => {
		initAudioContext();
		if (!ringtoneRef.current) {
			ringtoneRef.current = new Audio("/ringtone.mp3");
		}
	}, [initAudioContext]);

	// Handle center button press
	const handleCenterPress = async () => {
		// Provide haptic feedback - medium vibration for navigation buttons

		// Play ringtone
		if (!ringtoneRef.current) {
			ringtoneRef.current = new Audio("/ringtone.mp3");
		}
		await ringtoneRef.current.play();

		vibrate([
			120, 100, 120, 100, 120, 100, 240, 100, 240, 120, 100, 120, 100, 120, 100,
			240, 100, 240, 120, 100, 120, 100, 120, 100, 240, 100, 240, 120, 100, 120,
			100, 120, 100, 240, 100, 240, 120, 100, 120, 100,
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
		<div className="z-0 bg-[#EFEFEF] select-none h-dvh w-screen overflow-hidden flex flex-col items-center pt-10 p-4 touch-none">
			<div
				className={cn(
					"relative w-[400px] h-[580px] transition-opacity duration-300",
					isReady ? "opacity-100" : "opacity-0",
				)}
			>
				{/* Nokia 3310 Image */}
				<div className="relative w-full h-full">
					<Image
						src="/nokia-3310-bg.png"
						alt="Nokia 3310"
						fill
						onLoad={() => setIsReady(true)}
						className="z-6 object-contain touch-none"
						priority
						loading="eager"
						sizes="400px"
					/>

					{/* Screen Overlay */}

					<div className="absolute z-5 shadow-[inset_0px_2px_5px_5px_rgb(0_0_0_/_0.5)] rounded-t-sm rounded-b-[12px] top-[180px] left-[130px] w-[141px] h-[103px] bg-[#72af61] flex flex-col items-center justify-center p-2 pb-1 overflow-scroll font-mono text-black text-sm">
						<div className="absolute inset-0 grid grid-cols-[repeat(47,1fr)] grid-rows-[repeat(33,1fr)] pointer-events-none">
							{[...Array(47 * 33)].map((_, i) => (
								<div
									key={`pixel-${Math.floor(i / 47)}-${i % 47}`}
									className="border-[0.1px] border-gray-500/10"
								/>
							))}
						</div>

						<div className="w-full h-full flex flex-col justify-between font-mono p-0.5 space-y-0.5 overflow-hidden">
							<div>
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-1">
										<Pencil className="opacity-70 text-shadow-2xs" />
										<p className="text-[9px] opacity-70 text-shadow-2xs">Abc</p>
									</div>
									<p className="text-[9px] opacity-70 text-shadow-2xs">
										{459 - input.length}/1
									</p>
								</div>
								<p className="text-xs break-words opacity-70 text-shadow-2xs overflow-hidden">
									{input || (
										<span className="animate-pulse !duration-75">|</span>
									)}
									{currentKey ? (
										<span className="animate-pulse">|</span>
									) : (
										<span className="opacity-0">|</span>
									)}
								</p>
							</div>
							<p className="text-[11px] opacity-70 text-shadow-2xs text-center">
								Options
							</p>
						</div>
					</div>

					{/* Navigation Buttons */}
					<div className="z-10 absolute top-[300px]">
						<button
							type="button"
							onClick={handleCenterPress}
							className="debug absolute left-[170px] w-[60px] h-[30px] rounded-full opacity-0 focus:outline-hidden"
							aria-label="Center button"
						/>
						<button
							type="button"
							onClick={handleBackspace}
							className="debug absolute top-[14px] left-[132px] w-[30px] h-[30px] opacity-0 focus:outline-hidden"
							aria-label="Left button"
						/>
						<button
							type="button"
							className="debug absolute left-[220px] top-[20px] w-[50px] -rotate-12 h-[30px] opacity-0 focus:outline-hidden"
							aria-label="Right button"
						/>

						{/* Number Buttons */}
						<button
							type="button"
							onClick={handlePress}
							data-key="1"
							className="debug absolute top-[64px] left-[116px] w-[49px] h-[25px] opacity-0 focus:outline-hidden touch-manipulation"
							aria-label="Button 1"
						/>
						<button
							type="button"
							onClick={handlePress}
							data-key="2"
							className="debug absolute top-[69px] left-[176px] w-[49px] h-[25px] opacity-0 focus:outline-hidden touch-manipulation"
							aria-label="Button 2"
						/>
						<button
							type="button"
							onClick={handlePress}
							data-key="3"
							className="debug absolute top-[64px] left-[236px] w-[49px] h-[25px] opacity-0 focus:outline-hidden touch-manipulation"
							aria-label="Button 3"
						/>

						<button
							type="button"
							onClick={handlePress}
							data-key="4"
							className="debug absolute top-[97px] left-[118px] w-[49px] h-[25px] opacity-0 focus:outline-hidden touch-manipulation"
							aria-label="Button 4"
						/>
						<button
							type="button"
							onClick={handlePress}
							data-key="5"
							className="debug absolute top-[102px] left-[176px] w-[49px] h-[25px] opacity-0 focus:outline-hidden touch-manipulation"
							aria-label="Button 5"
						/>
						<button
							type="button"
							onClick={handlePress}
							data-key="6"
							className="debug absolute top-[97px] left-[236px] w-[49px] h-[25px] opacity-0 focus:outline-hidden touch-manipulation"
							aria-label="Button 6"
						/>

						<button
							type="button"
							onClick={handlePress}
							data-key="7"
							className="debug absolute top-[129px] left-[121px] w-[49px] h-[25px] opacity-0 focus:outline-hidden touch-manipulation"
							aria-label="Button 7"
						/>
						<button
							type="button"
							onClick={handlePress}
							data-key="8"
							className="debug absolute top-[135px] left-[178px] w-[49px] h-[25px] opacity-0 focus:outline-hidden touch-manipulation"
							aria-label="Button 8"
						/>
						<button
							type="button"
							onClick={handlePress}
							data-key="9"
							className="debug absolute top-[131px] left-[236px] w-[49px] h-[25px] opacity-0 focus:outline-hidden touch-manipulation"
							aria-label="Button 9"
						/>

						<button
							type="button"
							onClick={handlePress}
							data-key="*"
							className="debug absolute top-[162px] left-[124px] w-[49px] h-[25px] opacity-0 focus:outline-hidden touch-manipulation"
							aria-label="Button *"
						/>
						<button
							type="button"
							onClick={handlePress}
							data-key="0"
							className="debug absolute top-[169px] left-[178px] w-[49px] h-[25px] opacity-0 focus:outline-hidden touch-manipulation"
							aria-label="Button 0"
						/>
						<button
							type="button"
							onClick={handlePress}
							data-key="#"
							className="debug absolute top-[162px] left-[234px] w-[49px] h-[25px] opacity-0 focus:outline-hidden touch-manipulation"
							aria-label="Button #"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
