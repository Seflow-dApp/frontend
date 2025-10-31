"use client";

import { Icon } from "@iconify/react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#22C55E] rounded-lg flex items-center justify-center">
                <Icon icon="mdi:coins" className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold">Seflow</span>
            </div>
            <p className="text-gray-400 text-sm">
              Auto-grow your salary through smart DeFi splitting for professionals worldwide.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <Icon icon="mdi:twitter" className="w-5 h-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <Icon icon="mdi:github" className="w-5 h-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <Icon icon="mdi:linkedin" className="w-5 h-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <Icon icon="mdi:telegram" className="w-5 h-5" />
                <span className="sr-only">Telegram</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">
                  How it Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">
                  Security
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">
                  Supported Protocols
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">
                  Support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors cursor-pointer">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">© 2025 Seflow. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span className="text-xs text-gray-500">
              Made with ❤️ by{" "}
              <a href="https://ramadhvni.com/" target="_blank" rel="noopener noreferrer">
                Rama
              </a>
              .
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
