import Link from "next/link"
import Logo from "@/components/logo"
import { Twitter, Facebook, Instagram, Linkedin, Youtube, Mail, MapPin, Phone } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div>
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-gray-400 mb-6">
              A platform for news and diverse perspectives, fostering thoughtful discussion and understanding.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Categories</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/category/technology" className="text-gray-400 hover:text-white transition-colors">
                  Tech
                </Link>
              </li>
              <li>
                <Link href="/category/business" className="text-gray-400 hover:text-white transition-colors">
                  Business
                </Link>
              </li>
              <li>
                <Link href="/category/politics" className="text-gray-400 hover:text-white transition-colors">
                  Geopolitics
                </Link>
              </li>
              <li>
                <Link href="/category/science" className="text-gray-400 hover:text-white transition-colors">
                  Science
                </Link>
              </li>
              <li>
                <Link href="/category/health" className="text-gray-400 hover:text-white transition-colors">
                  Health
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-400 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <span className="text-gray-400">
                  123 Perspective Avenue
                  <br />
                  New York, NY 10001
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-400">info@theperspective.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} The Perspective. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
