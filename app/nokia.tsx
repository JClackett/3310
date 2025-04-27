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
	const [capitalizeMode, setCapitalizeMode] = useState(false);
	const [numbersMode, setNumbersMode] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const ringtoneRef = useRef<HTMLAudioElement | null>(null);
	const hashPressRef = useRef<NodeJS.Timeout | null>(null);
	const longPressDetectedRef = useRef(false);

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
		"1": [".", ",", "?", "!", "-", "@", "_", "+", "(", ")"],
		"2": ["a", "b", "c"],
		"3": ["d", "e", "f"],
		"4": ["g", "h", "i"],
		"5": ["j", "k", "l"],
		"6": ["m", "n", "o"],
		"7": ["p", "q", "r", "s"],
		"8": ["t", "u", "v"],
		"9": ["w", "x", "y", "z"],
		"0": [" "],
		"*": ["*", "+", "/", "=", "<", ">", "$", "%", "&", '"', "'"],
		"#": ["#"],
	};

	const handlePress = (e: React.MouseEvent<HTMLButtonElement>) => {
		const key = e.currentTarget.getAttribute("data-key");
		if (key) {
			handleKeyPress(key);
		}
	};

	// Handle # key press start (for long press detection)
	const handleHashPressStart = () => {
		initAudioContext();
		playKeySound();
		vibrate(30);

		// Reset the long press flag for this press
		longPressDetectedRef.current = false;

		hashPressRef.current = setTimeout(() => {
			// Mark that a long press occurred
			longPressDetectedRef.current = true;

			// Toggle numbers mode and reset capitalize mode if turning numbers off
			setNumbersMode((prevNumbersMode) => {
				const nextNumbersMode = !prevNumbersMode;
				// If we are turning numbers mode OFF, reset capitalize mode
				if (!nextNumbersMode) {
					setCapitalizeMode(false);
				}
				return nextNumbersMode;
			});

			vibrate(60); // Provide feedback for long press activation
			hashPressRef.current = null; // Clear the ref after timeout fires
		}, 800); // 800ms threshold for long press
	};

	// Handle # key press end
	const handleHashPressEnd = () => {
		// Only process if the timer is still active (meaning it hasn't fired yet)
		if (hashPressRef.current) {
			clearTimeout(hashPressRef.current);
			hashPressRef.current = null;

			// Since the timer was cleared before firing, it's a short press.
			// longPressDetectedRef will be false here.
			setCapitalizeMode(!capitalizeMode);
		}
		// If hashPressRef.current was null, the timeout already fired (long press)
		// or this function was called redundantly (e.g., pointerLeave after pointerUp).
		// In the long press case, numbersMode was already toggled by the timeout.
		// No need to reset longPressDetectedRef here, it's reset on press start.
	};

	// Handle key press with debouncing
	const handleKeyPress = (key: string) => {
		// Initialize audio context on first key press
		initAudioContext();
		playKeySound();
		// Provide haptic feedback - short vibration for number keys
		vibrate(30);

		if (key === "#") {
			// Just return as # is handled by the dedicated handlers
			return;
		}

		if (numbersMode) {
			// In numbers mode, just output the key itself
			setInput((prev) => prev + key);

			// Scroll to bottom after updating input
			messageRef.current?.scrollTo({
				top: messageRef.current?.scrollHeight,
				behavior: "instant",
			});

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
			const char = keyMappings[key][nextIndex];
			setInput(
				(prev) =>
					prev.slice(0, -1) + (capitalizeMode ? char.toUpperCase() : char),
			);
		} else {
			// Different key pressed, add new character
			if (currentKey !== null && timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			setCurrentKey(key);
			setCurrentKeyIndex(0);
			const char = keyMappings[key][0];
			setInput((prev) => prev + (capitalizeMode ? char.toUpperCase() : char));
		}

		messageRef.current?.scrollTo({
			top: messageRef.current?.scrollHeight,
			behavior: "instant",
		});

		// Set timeout to finalize character after 1 second of inactivity
		timeoutRef.current = setTimeout(() => {
			setCurrentKey(null);
		}, 800);
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
			if (hashPressRef.current) {
				clearTimeout(hashPressRef.current);
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
									<p className="text-sm opacity-70 text-shadow-2xs">
										{numbersMode ? "123" : capitalizeMode ? "ABC" : "Abc"}
									</p>
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
								{input}
								{currentKey ? (
									<span className="opacity-0">|</span>
								) : (
									<span className="animate-pulse-quick">|</span>
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
						onPointerDown={handleHashPressStart}
						onPointerUp={handleHashPressEnd}
						onPointerLeave={handleHashPressEnd}
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
