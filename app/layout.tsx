import { Inter } from "next/font/google";
import "./globals.css";
import Warnings from "./components/warnings";
import { assistantId } from "./assistant-config";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton, 
  RedirectToSignUp
} from '@clerk/nextjs';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Hey Lifey App",
  description: "Hey Lifey App for setting your life on easy mode",
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
            <RedirectToSignUp />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
            {assistantId ? children : <Warnings />}
          <img className="logo" src="/openai.svg" alt="OpenAI Logo" />
        </body>
      </html>
    </ClerkProvider>
  );
}
