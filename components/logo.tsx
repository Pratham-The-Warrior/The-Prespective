import Link from "next/link"

export default function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className="relative">
        <div className="text-2xl font-bold tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            THE PERSPECTIVE
          </span>
        </div>
        <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
      </div>
    </Link>
  )
}
