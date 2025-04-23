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

	const messageRef = useRef<HTMLParagraphElement>(null);

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

	useEffect(() => {
		initAudioContext();
		if (!ringtoneRef.current) {
			ringtoneRef.current = new Audio("/ringtone.mp3");
		}
	}, [initAudioContext]);

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
		osc.type = "triangle";
		osc.frequency.setValueAtTime(900, audioContextRef.current.currentTime);

		gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(
			0.01,
			audioContextRef.current.currentTime + 0.1,
		);
		osc.connect(gainNode);
		gainNode.connect(audioContextRef.current.destination);
		osc.start();
		osc.stop(audioContextRef.current.currentTime + 0.08);
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

		messageRef.current?.scrollTo({
			top: messageRef.current?.scrollHeight,
			behavior: "smooth",
		});

		// Set timeout to finalize character after 1 second of inactivity
		timeoutRef.current = setTimeout(() => {
			setCurrentKey(null);
		}, 600);
	};

	// Handle center button press
	const handleCenterPress = async () => {
		// Provide haptic feedback - medium vibration for navigation buttons
		// Play ringtone
		if (!ringtoneRef.current) ringtoneRef.current = new Audio("/ringtone.mp3");

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

		playKeySound();
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
		<div
			className={cn(
				"z-0 bg-[#EFEFEF] h-dvh py-4 md:py-8 font-mono transition-opacity duration-300 relative select-none overflow-hidden flex flex-col items-center justify-start touch-none",
				isReady ? "opacity-100" : "opacity-0",
			)}
		>
			<div className="relative h-full">
				<div>
					<Image
						src="/3310.png"
						alt="Nokia 3310"
						onLoad={() => setIsReady(true)}
						className="!z-[6] relative object-contain touch-none h-full w-[280px]"
						priority
						loading="eager"
						width={600}
						height={1350}
					/>
				</div>

				{/* Screen Overlay */}
				<div
					style={{
						left: 48,
						top: 166,
						width: 182,
						height: 130,
					}}
					className="absolute z-5 shadow-[inset_0px_4px_10px_1px_rgb(0_0_0_/_0.8)] rounded-t-sm rounded-b-[12px] bg-gradient-to-br from-[#55684E] to-[#55684E]/70 flex flex-col items-center justify-center p-3 pb-2 overflow-scroll text-black text-sm"
				>
					<div className="absolute inset-0 grid grid-cols-[repeat(47,1fr)] grid-rows-[repeat(33,1fr)] pointer-events-none">
						{[...Array(47 * 33)].map((_, i) => (
							<div
								key={`pixel-${Math.floor(i / 47)}-${i % 47}`}
								className="border-[0.5px] !border-gray-700/5"
							/>
						))}
					</div>

					<div className="w-full h-full flex flex-col justify-between space-y-0.5 overflow-hidden">
						<div className="space-y-1">
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-2">
									<Pencil className="scale-150 opacity-70 text-shadow-2xs" />
									<p className="text-sm opacity-70 text-shadow-2xs">Abc</p>
								</div>
								<p className="text-sm opacity-70 text-shadow-2xs">
									{459 - input.length}/1
								</p>
							</div>
							<p
								ref={messageRef}
								style={{
									maxHeight: "60px",
								}}
								className="text-base/tight break-words opacity-70 text-shadow-2xs overflow-hidden"
							>
								{input || <span className="animate-pulse !duration-75">|</span>}
								{currentKey ? (
									<span className="animate-pulse">|</span>
								) : (
									<span className="opacity-0">|</span>
								)}
							</p>
						</div>
						<p className="text-base opacity-70 text-shadow-2xs text-center">
							Options
						</p>
					</div>
				</div>

				{/* Navigation Buttons */}
				<div className="z-10 absolute top-[320px] left-0">
					<button
						type="button"
						onClick={handleBackspace}
						style={{
							top: 20,
							left: 47,
							width: 50,
							height: 30,
						}}
						className="debug rounded-lg absolute rotate-45 focus:outline-hidden"
						aria-label="Clear button"
					/>
					<button
						type="button"
						onClick={handleCenterPress}
						style={{
							top: 0,
							left: 90,
							height: 33,
							width: 100,
						}}
						className="debug rounded-lg absolute focus:outline-hidden"
						aria-label="Center button"
					/>
					<button
						type="button"
						style={{
							top: 35,
							left: 152,
							width: 40,
							height: 40,
						}}
						className="debug rounded-lg absolute -rotate-25 focus:outline-hidden"
						aria-label="Left button"
					/>
					<button
						type="button"
						style={{
							top: 16,
							left: 190,
							width: 40,
							height: 40,
						}}
						className="debug rounded-lg absolute -rotate-25 focus:outline-hidden"
						aria-label="Righty button"
					/>

					{/* Number Buttons */}
					<button
						type="button"
						onClick={handlePress}
						data-key="1"
						style={{
							top: 80,
							left: 40,
							width: 50,
							height: 35,
						}}
						className="debug rounded-lg absolute focus:outline-hidden touch-manipulation"
						aria-label="Button 1"
					/>
					<button
						type="button"
						onClick={handlePress}
						data-key="2"
						style={{
							top: 95,
							left: 115,
							width: 50,
							height: 30,
						}}
						className="debug rounded-lg absolute focus:outline-hidden touch-manipulation"
						aria-label="Button 2"
					/>
					<button
						type="button"
						onClick={handlePress}
						data-key="3"
						style={{
							top: 83,
							left: 190,
							width: 50,
							height: 30,
						}}
						className="debug rounded-lg absolute focus:outline-hidden touch-manipulation"
						aria-label="Button 3"
					/>

					<button
						type="button"
						onClick={handlePress}
						data-key="4"
						style={{
							top: 125,
							left: 45,
							width: 50,
							height: 30,
						}}
						className="debug rounded-lg absolute focus:outline-hidden touch-manipulation"
						aria-label="Button 4"
					/>
					<button
						type="button"
						onClick={handlePress}
						data-key="5"
						style={{
							top: 135,
							left: 115,
							width: 50,
							height: 30,
						}}
						className="debug rounded-lg absolute focus:outline-hidden touch-manipulation"
						aria-label="Button 5"
					/>
					<button
						type="button"
						onClick={handlePress}
						data-key="6"
						style={{
							top: 125,
							left: 190,
							width: 50,
							height: 30,
						}}
						className="debug rounded-lg absolute focus:outline-hidden touch-manipulation"
						aria-label="Button 6"
					/>

					<button
						type="button"
						onClick={handlePress}
						data-key="7"
						style={{
							top: 170,
							left: 45,
							width: 50,
							height: 30,
						}}
						className="debug rounded-lg absolute focus:outline-hidden touch-manipulation"
						aria-label="Button 7"
					/>
					<button
						type="button"
						onClick={handlePress}
						data-key="8"
						style={{
							top: 180,
							left: 115,
							width: 50,
							height: 30,
						}}
						className="debug rounded-lg absolute focus:outline-hidden touch-manipulation"
						aria-label="Button 8"
					/>
					<button
						type="button"
						onClick={handlePress}
						data-key="9"
						style={{
							top: 168,
							left: 185,
							width: 50,
							height: 30,
						}}
						className="debug rounded-lg absolute focus:outline-hidden touch-manipulation"
						aria-label="Button 9"
					/>

					<button
						type="button"
						onClick={handlePress}
						data-key="*"
						style={{
							top: 212,
							left: 50,
							width: 50,
							height: 30,
						}}
						className="debug rounded-lg absolute focus:outline-hidden touch-manipulation"
						aria-label="Button *"
					/>
					<button
						type="button"
						onClick={handlePress}
						data-key="0"
						style={{
							top: 223,
							left: 115,
							width: 50,
							height: 30,
						}}
						className="debug rounded-lg absolute focus:outline-hidden touch-manipulation"
						aria-label="Button 0"
					/>
					<button
						type="button"
						onClick={handlePress}
						data-key="#"
						style={{
							top: 212,
							left: 182,
							width: 50,
							height: 30,
						}}
						className="debug rounded-lg absolute focus:outline-hidden touch-manipulation"
						aria-label="Button #"
					/>
				</div>
			</div>
		</div>
	);
}
