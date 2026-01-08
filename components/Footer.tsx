import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-gray-800 py-6 bg-black backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <p className="text-sm text-gray-400">
              {new Date().getFullYear()} IdleForest. All rights reserved.
            </p>
            <div className="flex items-center">
              <span className="text-sm text-gray-400 flex items-center gap-1">
                <span className="text-brand-yellow">🇪🇺</span> Proudly made in Lisbon, Portugal
              </span>
            </div>
            <div data-widget-type="offset-website" data-tree-nation-code="cb31716592a11a9b" data-lang="en" data-theme="dark"></div>
          </div>
          <div className="flex items-center gap-4">
            {/* Footer quick links */}
            <nav className="hidden sm:flex items-center gap-3 text-sm">
              <Link href="/game" className="text-gray-400 hover:text-brand-yellow">Play</Link>
              <span className="text-gray-700">•</span>
              <Link href="/blog" className="text-gray-400 hover:text-brand-yellow">Blog</Link>
              <span className="text-gray-700">•</span>
              <Link href="/report" className="text-gray-400 hover:text-brand-yellow">Report</Link>
              <span className="text-gray-700">•</span>
              <Link href="/compare/idleforest-vs-ecosia-vs-treeclicks" className="text-gray-400 hover:text-brand-yellow">Comparison</Link>
              <span className="text-gray-700">•</span>
              <Link href="/transparency" className="text-gray-400 hover:text-brand-yellow">Transparency</Link>
              <span className="text-gray-700">•</span>
              <Link href="/terms" className="text-gray-400 hover:text-brand-yellow">Terms</Link>
            </nav>
            <span className="hidden sm:inline-block h-4 w-px bg-gray-800" />
            {/* Social media links */}
            <div className="flex items-center gap-4">
              <a
                href="https://discord.gg/y9jZmRQtad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-yellow hover:text-brand-yellow"
                aria-label="Join our Discord"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
              <a
                href="https://github.com/daniiba/idleforest"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-yellow hover:text-brand-yellow"
                aria-label="View on GitHub"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@idleforest"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-yellow hover:text-brand-yellow"
                aria-label="Follow on TikTok"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/idleforest"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-yellow hover:text-brand-yellow"
                aria-label="Follow on LinkedIn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/idleforest"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-yellow hover:text-brand-yellow"
                aria-label="Follow on Instagram"
              >
                {/* Instagram SVG - Inlined */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="w-5 h-5 bi bi-instagram" viewBox="0 0 16 16">
                  <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Popular Carbon Footprints SEO Links */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 text-center">Popular Carbon Footprints</p>
          <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center text-xs text-gray-400">
            <Link href="/carbon-footprint/chatgpt" className="hover:text-brand-yellow transition-colors duration-200">ChatGPT</Link>
            <Link href="/carbon-footprint/tiktok" className="hover:text-brand-yellow transition-colors duration-200">TikTok</Link>
            <Link href="/carbon-footprint/fortnite" className="hover:text-brand-yellow transition-colors duration-200">Fortnite</Link>
            <Link href="/carbon-footprint/netflix" className="hover:text-brand-yellow transition-colors duration-200">Netflix</Link>
            <Link href="/carbon-footprint/instagram" className="hover:text-brand-yellow transition-colors duration-200">Instagram</Link>
            <Link href="/carbon-footprint/bitcoin" className="hover:text-brand-yellow transition-colors duration-200">Bitcoin</Link>
            <Link href="/carbon-footprint/youtube" className="hover:text-brand-yellow transition-colors duration-200">YouTube</Link>
            <Link href="/carbon-footprint/minecraft" className="hover:text-brand-yellow transition-colors duration-200">Minecraft</Link>
            <Link href="/carbon-footprint/zoom" className="hover:text-brand-yellow transition-colors duration-200">Zoom</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
