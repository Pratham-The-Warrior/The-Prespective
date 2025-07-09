"use client"

import { useState, useRef, useEffect } from "react"
import { Bold, Italic, List, ListOrdered, LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  onHtmlChange: (html: string) => void
  placeholder?: string
  disabled?: boolean
  minHeight?: string
}

export default function RichTextEditor({
  value,
  onChange,
  onHtmlChange,
  placeholder = "Write something...",
  disabled = false,
  minHeight = "150px",
}: RichTextEditorProps) {
  const [html, setHtml] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Convert markdown to HTML
  useEffect(() => {
    const convertToHtml = (markdown: string) => {
      const html = markdown
        // Convert line breaks
        .replace(/\n/g, "<br>")
        // Convert bold
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        // Convert italic
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        // Convert links
        .replace(/\[([^\]]+)\]$$([^)]+)$$/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        // Convert unordered lists
        .replace(/^\s*-\s+(.*)/gm, "<li>$1</li>")
        .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
        // Convert ordered lists
        .replace(/^\s*\d+\.\s+(.*)/gm, "<li>$1</li>")
        .replace(/(<li>.*<\/li>)/s, "<ol>$1</ol>")

      return html
    }

    const htmlContent = convertToHtml(value)
    setHtml(htmlContent)
    onHtmlChange(htmlContent)
  }, [value, onHtmlChange])

  const insertText = (before: string, after = "") => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange(newText)

    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length + selectedText.length + after.length,
        start + before.length + selectedText.length + after.length,
      )
    }, 0)
  }

  const handleBold = () => {
    insertText("**", "**")
  }

  const handleItalic = () => {
    insertText("*", "*")
  }

  const handleUnorderedList = () => {
    const lines = value
      .substring(textareaRef.current?.selectionStart || 0, textareaRef.current?.selectionEnd || 0)
      .split("\n")
    const formattedLines = lines.map((line) => `- ${line}`).join("\n")
    insertText(formattedLines)
  }

  const handleOrderedList = () => {
    const lines = value
      .substring(textareaRef.current?.selectionStart || 0, textareaRef.current?.selectionEnd || 0)
      .split("\n")
    const formattedLines = lines.map((line, index) => `${index + 1}. ${line}`).join("\n")
    insertText(formattedLines)
  }

  const handleLink = () => {
    if (linkText && linkUrl) {
      insertText(`[${linkText}](${linkUrl})`)
      setLinkText("")
      setLinkUrl("")
      setIsLinkPopoverOpen(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-1 border-b pb-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="sm" onClick={handleBold} disabled={disabled}>
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="sm" onClick={handleItalic} disabled={disabled}>
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="sm" onClick={handleUnorderedList} disabled={disabled}>
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="sm" onClick={handleOrderedList} disabled={disabled}>
                <ListOrdered className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Numbered List</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button type="button" variant="ghost" size="sm" disabled={disabled}>
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Link</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="link-text">Link Text</Label>
                <Input
                  id="link-text"
                  placeholder="Text to display"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button type="button" size="sm" onClick={handleLink} disabled={!linkText || !linkUrl}>
                  Insert Link
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[150px]"
        style={{ minHeight }}
      />

      <div className="text-xs text-gray-500">
        <p>
          Formatting: <strong>**bold**</strong>, <em>*italic*</em>, [link text](https://example.com)
        </p>
      </div>
    </div>
  )
}
