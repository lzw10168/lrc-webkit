"use client";
import { ChevronsDown, Github, Menu } from "lucide-react";
import React from "react";

import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import { ToggleTheme } from "./toogle-theme";
import { LanguageToggle } from "./language-toggle";

interface RouteProps {
  href: string;
  label: string;
}

interface FeatureProps {
  title: string;
  description: string;
}

interface NavbarProps {
  githubLabel: string;
}

export const Navbar = ({
  githubLabel
}: NavbarProps) => {
  return (
    <header className="shadow-inner bg-opacity-15 w-[100%] sticky top-0 border opacity-90 border-secondary z-40   flex justify-between items-center p-2 bg-card">
      <Link href="/" className="font-bold text-lg pl-2 flex items-center">
        LRC-Webkit
      </Link>

      <div className="hidden lg:flex items-center gap-2">
        <LanguageToggle />
        <ToggleTheme />
        <Button asChild size="sm" variant="ghost" aria-label={githubLabel}>
          <Link
            aria-label={githubLabel}
            href="https://github.com/lzw10168/lrc-webkit.git"
            target="_blank"
          >
            <Github className="size-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
};
