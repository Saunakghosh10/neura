'use client'

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { motion } from "framer-motion";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SignIn
          appearance={{
            baseTheme: dark,
            elements: {
              formButtonPrimary: 
                "bg-primary hover:bg-primary/90 text-white",
              card: "bg-background/50 backdrop-blur-xl border border-border/50",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: 
                "bg-background/50 border border-border/50 text-foreground hover:bg-accent",
              formFieldLabel: "text-foreground",
              formFieldInput: 
                "bg-background/50 border border-border/50 text-foreground",
              footerActionLink: "text-primary hover:text-primary/90",
              dividerLine: "bg-border/50",
              dividerText: "text-muted-foreground"
            }
          }}
          redirectUrl="/notes"
          signUpUrl="/sign-up"
        />
      </motion.div>
    </div>
  );
} 