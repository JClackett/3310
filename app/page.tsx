"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

export default function Nokia3310Simulator() {
  const [input, setInput] = useState("")
  const [currentKey, setCurrentKey] = useState<string | null>(null)
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0)
  const [isMenuScreen, setIsMenuScreen] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

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
  }

  // Handle key press
  const handleKeyPress = (key: string) => {
    if (isMenuScreen) {
      setIsMenuScreen(false)
      return
    }

    if (key === "#") {
      // Toggle uppercase/lowercase for the last character
      if (input.length > 0) {
        const lastChar = input.slice(-1)
        const isUpperCase = lastChar === lastChar.toUpperCase() && lastChar !== lastChar.toLowerCase()
        const newLastChar = isUpperCase ? lastChar.toLowerCase() : lastChar.toUpperCase()
        setInput(input.slice(0, -1) + newLastChar)
      }
      return
    }

    if (key === currentKey) {
      // Same key pressed, cycle through characters
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      const chars = keyMappings[key]
      const nextIndex = (currentKeyIndex + 1) % chars.length
      setCurrentKeyIndex(nextIndex)

      // Update the input by replacing the last character
      setInput((prev) => prev.slice(0, -1) + keyMappings[key][nextIndex])
    } else {
      // Different key pressed, add new character
      if (currentKey !== null && timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      setCurrentKey(key)
      setCurrentKeyIndex(0)
      setInput((prev) => prev + keyMappings[key][0])
    }

    // Set timeout to finalize character after 1 second of inactivity
    timeoutRef.current = setTimeout(() => {
      setCurrentKey(null)
    }, 1000)
  }

  // Handle center button press
  const handleCenterPress = () => {
    if (isMenuScreen) {
      setIsMenuScreen(false)
    } else {
      setIsMenuScreen(true)
      setInput("")
    }
  }

  // Handle backspace (left button)
  const handleBackspace = () => {
    if (!isMenuScreen) {
      setInput((prev) => prev.slice(0, -1))
      setCurrentKey(null)
    }
  }

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="relative w-[300px] h-[600px]">
        {/* Nokia 3310 Image */}
        <div className="relative w-full h-full">
          <Image src="/nokia-3310.png" alt="Nokia 3310" fill className="object-contain" priority />

          {/* Screen Overlay */}
          <div className="absolute top-[155px] left-[75px] w-[150px] h-[80px] bg-[#a8d8a0] flex flex-col items-center justify-center px-2 font-mono text-black text-sm">
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
          <button
            onClick={handleCenterPress}
            className="absolute top-[260px] left-[150px] w-[40px] h-[40px] rounded-full opacity-0 hover:opacity-20 hover:bg-blue-500 active:bg-blue-600 focus:outline-none"
            aria-label="Center button"
          />
          <button
            onClick={handleBackspace}
            className="absolute top-[260px] left-[100px] w-[30px] h-[30px] opacity-0 hover:opacity-20 hover:bg-blue-500 active:bg-blue-600 focus:outline-none"
            aria-label="Left button"
          />
          <button
            className="absolute top-[260px] left-[200px] w-[30px] h-[30px] opacity-0 hover:opacity-20 hover:bg-blue-500 active:bg-blue-600 focus:outline-none"
            aria-label="Right button"
          />

          {/* Number Buttons */}
          <button
            onClick={() => handleKeyPress("1")}
            className="absolute top-[320px] left-[90px] w-[40px] h-[25px] opacity-0 hover:opacity-20 hover:bg-blue-500 active:bg-blue-600 focus:outline-none"
            aria-label="Button 1"
          />
          <button
            onClick={() => handleKeyPress("2")}
            className="absolute top-[320px] left-[150px] w-[40px] h-[25px] opacity-0 hover:opacity-20 hover:bg-blue-500 active:bg-blue-600 focus:outline-none"
            aria-label="Button 2"
          />
          <button
            onClick={() => handleKeyPress("3")}
            className="absolute top-[320px] left-[210px] w-[40px] h-[25px] opacity-0 hover:opacity-20 hover:bg-blue-500 active:bg-blue-600 focus:outline-none"
            aria-label="Button 3"
          />

          <button
            onClick={() => handleKeyPress("4")}
            className="absolute top-[360px] left-[90px] w-[40px] h-[25px] opacity-0 hover:opacity-20 hover:bg-blue-500 active:bg-blue-600 focus:outline-none"
            aria-label="Button 4"
          />
          <button
            onClick={() => handleKeyPress("5")}
            className="absolute top-[360px] left-[150px] w-[40px] h-[25px] opacity-0 hover:opacity-20 hover:bg-blue-500 active:bg-blue-600 focus:outline-none"
            aria-label="Button 5"
          />
          <button
            onClick={() => handleKeyPress("6")}
            className="absolute top-[360px] left-[210px] w-[40px] h-[25px] opacity-0 hover:opacity-20 hover:bg-blue-500 active:bg-blue-600 focus:outline-none"
            aria-label="Button 6"
          />

          <button
            onClick={() => handleKeyPress("7")}
            className="absolute top-[400px] left-[90px] w-[40px] h-[25px] opacity-0 hover:opacity-20 hover:bg-blue-500 active:bg-blue-600 focus:outline-none"
            aria-label="Button 7"
          />
          <button
            onClick={() => handleKeyPress("8")}
            className="absolute top-[400px] left-[150px] w-[40px] h-[25px] opacity-0 hover:opacity-20 hover:bg-blue-500 active:bg-blue-600 focus:outline-none"
            aria-label="Button 8"
          />
          <button
            onClick={() => handleKeyPress("9")}
            className="absolute top-[400px] left-[210px] w-[40px] h-[25px] opacity-0 hover:opacity-20 hover:bg-blue-500 active:bg-blue-600 focus:outline-none"
            aria-label="Button 9"
          />

          <button
            onClick={() => handleKeyPress("*")}
            className="absolute top-[440px] left-[90px] w-[40px] h-[25px] opacity-0 hover:opacity-20 hover:bg-blue-500 active:bg-blue-600 focus:outline-none"
            aria-label="Button *"
          />
          <button
            onClick={() => handleKeyPress("0")}
            className="absolute top-[440px] left-[150px] w-[40px] h-[25px] opacity-0 hover:opacity-20 hover:bg-blue-500 active:bg-blue-600 focus:outline-none"
            aria-label="Button 0"
          />
          <button
            onClick={() => handleKeyPress("#")}
            className="absolute top-[440px] left-[210px] w-[40px] h-[25px] opacity-0 hover:opacity-20 hover:bg-blue-500 active:bg-blue-600 focus:outline-none"
            aria-label="Button #"
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 max-w-xs text-center text-sm text-gray-600">
        <p>Click the center button to start typing.</p>
        <p>Press the same key multiple times to cycle through letters.</p>
        <p>Press # to toggle case for the last character.</p>
        <p>Press the left button to delete a character.</p>
        <p>Press the center button again to return to the menu.</p>
      </div>
    </div>
  )
}
