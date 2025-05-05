import { Link } from "wouter";
import { 
  FacebookIcon, 
  InstagramIcon, 
  TwitterIcon, 
  YoutubeIcon 
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          <div className="px-5 py-2">
            <Link to="/about" className="text-base text-gray-400 hover:text-gray-300">
              About
            </Link>
          </div>

          <div className="px-5 py-2">
            <Link to="/blog" className="text-base text-gray-400 hover:text-gray-300">
              Blog
            </Link>
          </div>

          <div className="px-5 py-2">
            <Link to="/jobs" className="text-base text-gray-400 hover:text-gray-300">
              Jobs
            </Link>
          </div>

          <div className="px-5 py-2">
            <Link to="/press" className="text-base text-gray-400 hover:text-gray-300">
              Press
            </Link>
          </div>

          <div className="px-5 py-2">
            <Link to="/privacy" className="text-base text-gray-400 hover:text-gray-300">
              Privacy
            </Link>
          </div>

          <div className="px-5 py-2">
            <Link to="/terms" className="text-base text-gray-400 hover:text-gray-300">
              Terms
            </Link>
          </div>

          <div className="px-5 py-2">
            <Link to="/contact" className="text-base text-gray-400 hover:text-gray-300">
              Contact
            </Link>
          </div>
        </nav>
        <div className="mt-8 flex justify-center space-x-6">
          <a href="#" className="text-gray-400 hover:text-gray-300">
            <span className="sr-only">Facebook</span>
            <FacebookIcon className="h-6 w-6" />
          </a>

          <a href="#" className="text-gray-400 hover:text-gray-300">
            <span className="sr-only">Instagram</span>
            <InstagramIcon className="h-6 w-6" />
          </a>

          <a href="#" className="text-gray-400 hover:text-gray-300">
            <span className="sr-only">Twitter</span>
            <TwitterIcon className="h-6 w-6" />
          </a>

          <a href="#" className="text-gray-400 hover:text-gray-300">
            <span className="sr-only">YouTube</span>
            <YoutubeIcon className="h-6 w-6" />
          </a>
        </div>
        <p className="mt-8 text-center text-base text-gray-400">
          &copy; 2023 ShopEase, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
