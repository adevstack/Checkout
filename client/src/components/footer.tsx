import { Link } from "wouter";
import { 
  FacebookIcon, 
  InstagramIcon, 
  TwitterIcon, 
  YoutubeIcon 
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted dark:bg-background border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          <div className="px-5 py-2">
            <Link to="/about" className="text-base text-muted-foreground hover:text-foreground transition-colors duration-200">
              About
            </Link>
          </div>

          <div className="px-5 py-2">
            <Link to="/blog" className="text-base text-muted-foreground hover:text-foreground transition-colors duration-200">
              Blog
            </Link>
          </div>

          <div className="px-5 py-2">
            <Link to="/jobs" className="text-base text-muted-foreground hover:text-foreground transition-colors duration-200">
              Jobs
            </Link>
          </div>

          <div className="px-5 py-2">
            <Link to="/press" className="text-base text-muted-foreground hover:text-foreground transition-colors duration-200">
              Press
            </Link>
          </div>

          <div className="px-5 py-2">
            <Link to="/privacy" className="text-base text-muted-foreground hover:text-foreground transition-colors duration-200">
              Privacy
            </Link>
          </div>

          <div className="px-5 py-2">
            <Link to="/terms" className="text-base text-muted-foreground hover:text-foreground transition-colors duration-200">
              Terms
            </Link>
          </div>

          <div className="px-5 py-2">
            <Link to="/contact" className="text-base text-muted-foreground hover:text-foreground transition-colors duration-200">
              Contact
            </Link>
          </div>
        </nav>
        <div className="mt-8 flex justify-center space-x-6">
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">
            <span className="sr-only">Facebook</span>
            <FacebookIcon className="h-6 w-6" />
          </a>

          <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">
            <span className="sr-only">Instagram</span>
            <InstagramIcon className="h-6 w-6" />
          </a>

          <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">
            <span className="sr-only">Twitter</span>
            <TwitterIcon className="h-6 w-6" />
          </a>

          <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">
            <span className="sr-only">YouTube</span>
            <YoutubeIcon className="h-6 w-6" />
          </a>
        </div>
        <p className="mt-8 text-center text-base text-muted-foreground">
          &copy; {new Date().getFullYear()} <span className="text-primary dark:text-primary font-medium">Check<span className="text-secondary dark:text-secondary">Out</span></span>, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
