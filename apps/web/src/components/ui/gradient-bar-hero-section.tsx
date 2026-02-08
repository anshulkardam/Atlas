import React, { useState, useEffect } from "react";
import { Github, Instagram, Linkedin, Menu, Twitter, X } from "lucide-react";
import { Button } from "./button";
import { SystemHealthButton } from "../SystemHealthButton";
import { AnimatedBadge } from "./animated-badge";
import { Link } from "react-router";
import { socials } from "@/utils/constants";

const GradientBars: React.FC = () => {
  const [numBars] = useState(15);

  const calculateHeight = (index: number, total: number) => {
    const position = index / (total - 1);
    const maxHeight = 100;
    const minHeight = 30;

    const center = 0.5;
    const distanceFromCenter = Math.abs(position - center);
    const heightPercentage = Math.pow(distanceFromCenter * 2, 1.2);

    return minHeight + (maxHeight - minHeight) * heightPercentage;
  };

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div
        className="flex h-full"
        style={{
          width: "100%",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        {Array.from({ length: numBars }).map((_, index) => {
          const height = calculateHeight(index, numBars);
          return (
            <div
              key={index}
              style={{
                flex: "1 0 calc(100% / 15)",
                maxWidth: "calc(100% / 15)",
                height: "100%",
                background: "linear-gradient(to top, rgb(145, 20, 4), transparent)",
                transform: `scaleY(${height / 100})`,
                transformOrigin: "bottom",
                transition: "transform 0.5s ease-in-out",
                animation: "pulseBar 2s ease-in-out infinite alternate",
                animationDelay: `${index * 0.1}s`,
                outline: "1px solid rgba(0, 0, 0, 0)",
                boxSizing: "border-box",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent py-6 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-white font-bold text-xl tracking-tighter font-space">Atlas</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#contact"
              className="text-gray-300 hover:text-white transition-colors duration-300 font-space"
            >
              Features
            </a>
            <a
              href={socials.linkedin}
              className="text-gray-300 hover:text-white transition-colors duration-300 font-space"
            >
              Contact
            </a>
            <a
              href="/login"
              className="text-gray-300 cursor-pointer hover:text-white transition-colors duration-300 font-space"
            >
              Sign In
            </a>
            <Link to="/register">
              <button className="bg-white cursor-pointer hover:bg-gray-100 text-black px-5 py-2 rounded-full transition-all duration-300 transform hover:scale-105 font-space">
                Sign Up
              </button>
            </Link>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-gray-900 bg-opacity-95 backdrop-blur-sm rounded-lg p-4 animate-fadeIn">
            <div className="flex flex-col space-y-4">
              <a
                href="#features"
                className="text-gray-300 hover:text-white transition-colors duration-300 py-2 font-space"
              >
                Features
              </a>
              <a
                href="#vision"
                className="text-gray-300 hover:text-white transition-colors duration-300 py-2 font-space"
              >
                Vision
              </a>
              <a
                href="#press"
                className="text-gray-300 hover:text-white transition-colors duration-300 py-2 font-space"
              >
                Press
              </a>
              <a
                href="#contact"
                className="text-gray-300 hover:text-white transition-colors duration-300 py-2 font-space"
              >
                Contact
              </a>
              <button className="bg-white hover:bg-gray-100 text-black px-5 py-2 rounded-full transition-all duration-300 w-full font-space">
                Join The Waitlist
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export const Component: React.FC = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center px-6 sm:px-8 md:px-12 overflow-hidden">
      <div className="absolute inset-0 bg-gray-950"></div>
      <GradientBars />
      <Navbar />

      <div className="relative z-10 text-center w-full max-w-5xl mx-auto flex flex-col items-center justify-center min-h-screen py-8 sm:py-16">
        <div className="mb-6 sm:mb-8">
          <AnimatedBadge color="#911403" href="register" text="Intoducing Atlas" />
        </div>

        <h1 className="w-full text-white leading-tight tracking-tight mb-6 sm:mb-8 animate-fadeIn px-4">
          <span className="block font-inter font-medium text-[clamp(1.5rem,6vw,3.75rem)]">
            Turn Your Contacts Into Business Intelligence
          </span>
        </h1>

        <div className="mb-6 sm:mb-10 px-4">
          <p className="text-[clamp(1rem,3vw,1.5rem)] text-gray-400 leading-relaxed animate-fadeIn animation-delay-200 font-space">
            Research companies, extract products, pricing, competitors, and news, powered by a
            resilient AI enrichment pipeline.
          </p>
        </div>

        <div className="w-full max-w-2xl space-x-10 mb-6 sm:mb-8 px-4">
          <SystemHealthButton status="operational" />{" "}
          <Button size={"lg"} className="rounded-lg text-base">
            Watch the Demo
          </Button>
        </div>

        <div className="flex justify-center space-x-6">
          <a
            href={socials.twitter}
            className="text-gray-500 hover:text-gray-300 transition-colors duration-300"
          >
            <Twitter size={20} className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
          </a>
          <a
            href={socials.linkedin}
            className="text-gray-500 hover:text-gray-300 transition-colors duration-300"
          >
            <Linkedin size={20} className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
          </a>
          <a
            href={socials.github}
            className="text-gray-500 hover:text-gray-300 transition-colors duration-300"
          >
            <Github size={20} className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
          </a>
        </div>
      </div>
    </section>
  );
};
