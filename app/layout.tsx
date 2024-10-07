import { Inter } from "next/font/google";
import "./globals.css";
import Warnings from "./components/warnings";
import { assistantId } from "./assistant-config";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Assistants API Quickstart",
  description: "A quickstart template using the Assistants API with OpenAI",
  icons: {
    icon: "/openai.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
            {assistantId ? children : <Warnings />}
          </SignedIn>
          <img className="logo" src="/openai.svg" alt="OpenAI Logo" />
        </body>
      </html>
    </ClerkProvider>
  );
}
