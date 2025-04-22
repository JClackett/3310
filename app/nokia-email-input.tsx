"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NokiaEmailInputProps {
  onEmailChange?: (email: string) => void
  className?: string
}

export default function NokiaEmailInput({ onEmailChange, className }: NokiaEmailInputProps) {
  const [input, setInput] = useState("")
  const [currentKey, setCurrentKey] = useState<string | null>(null)
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Simplified key mappings focused on email characters
  const keyMappings: Record<string, string[]> = {
    "1": ["1", "@", "."],
    "2": ["a", "b", "c", "2"],
    "3": ["d", "e", "f", "3"],
    "4": ["g", "h", "i", "4"],
    "5": ["j", "k", "l", "5"],
    "6": ["m", "n", "o", "6"],
    "7": ["p", "q", "r", "s", "7"],
    "8": ["t", "u", "v", "8"],
    "9": ["w", "x", "y", "z", "9"],
    "0": ["0", "_", "-"],
    "*": [".", "_", "-"],
    "#": ["#"],
  }

  // Handle key press
  const handleKeyPress = (key: string) => {
    if (key === currentKey) {
      // Same key pressed, cycle through characters
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      const chars = keyMappings[key]
      const nextIndex = (currentKeyIndex + 1) % chars.length
      setCurrentKeyIndex(nextIndex)

      // Update the input by replacing the last character
      const newInput = input.slice(0, -1) + keyMappings[key][nextIndex]
      setInput(newInput)
      onEmailChange?.(newInput)
    } else {
      // Different key pressed, add new character
      if (currentKey !== null && timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      setCurrentKey(key)
      setCurrentKeyIndex(0)
      const newInput = input + keyMappings[key][0]
      setInput(newInput)
      onEmailChange?.(newInput)
    }

    // Set timeout to finalize character after 1 second of inactivity
    timeoutRef.current = setTimeout(() => {
      setCurrentKey(null)
    }, 1000)
  }

  // Handle backspace
  const handleBackspace = () => {
    const newInput = input.slice(0, -1)
    setInput(newInput)
    onEmailChange?.(newInput)
    setCurrentKey(null)
  }

  // Check if input is a valid email format
  const isValidEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(input)
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
    <div className={cn("flex flex-col items-center", className)}>
      {/* Email display */}
      <div className="w-full mb-2 overflow-hidden border rounded">
        <div
          className={cn("px-3 py-2 font-mono text-sm transition-colors", isValidEmail() ? "bg-green-50" : "bg-white")}
        >
          {input || <span className="text-gray-400">email@example.com</span>}
          {currentKey && <span className="animate-pulse">|</span>}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-1 w-full">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((key) => (
          <Button
            key={key}
            onClick={() => handleKeyPress(key)}
            variant="outline"
            size="sm"
            className={cn("h-8 text-xs font-medium", currentKey === key && "bg-gray-100")}
          >
            <div className="flex flex-col items-center">
              <span>{key}</span>
              <span className="text-[8px] text-gray-500">{keyMappings[key].join("")}</span>
            </div>
          </Button>
        ))}
      </div>

      {/* Function buttons */}
      <div className="flex justify-between w-full mt-1 gap-1">
        <Button onClick={handleBackspace} variant="outline" size="sm" className="flex-1 text-xs">
          Delete
        </Button>
        <Button
          onClick={() => {
            setInput("")
            onEmailChange?.("")
          }}
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
        >
          Clear
        </Button>
      </div>

      {/* Hint */}
      <p className="w-full mt-2 text-xs text-center text-gray-500">Tap multiple times for different letters</p>
    </div>
  )
}
