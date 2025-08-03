import { Github, Linkedin, Globe } from 'lucide-react';

export function AuthFooter() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
          <span className="flex items-center space-x-1">
            <span>Made with</span>
            <span className="text-red-500">❤</span>
            <span>by SuhithCodes</span>
          </span>
          
          <div className="flex items-center space-x-3">
            <a
              href="https://github.com/SuhithCodes"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
            
            <a
              href="https://www.linkedin.com/in/gsuhith/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 hover:text-foreground transition-colors"
            >
              <Linkedin className="h-4 w-4" />
              <span>LinkedIn</span>
            </a>
            
            <a
              href="https://suhithghanathay.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 hover:text-foreground transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span>Website</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 