// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"

// --- Icons ---
import { MoonStarIcon } from "@/components/tiptap-icons/moon-star-icon"
import { SunIcon } from "@/components/tiptap-icons/sun-icon"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  // Força sempre tema claro: não aplica classe .dark no documento
  const [isDarkMode] = useState(false)

  return (
    <Button
      aria-label="Light mode only"
      data-style="ghost"
      disabled>
      <SunIcon className="tiptap-button-icon" />
    </Button>
  );
}
