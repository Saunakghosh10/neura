import { SignUp } from "@clerk/nextjs";
import { clerkTheme } from "@/app/clerk-theme";
import { motion } from "framer-motion";
import { dark } from "@clerk/themes";

export default function SignUpPage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SignUp 
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: "hsl(var(--primary))",
              colorBackground: "hsl(var(--background))",
              colorText: "hsl(var(--foreground))",
              colorTextSecondary: "hsl(var(--muted-foreground))",
            },
            ...clerkTheme
          }}
        />
      </motion.div>
    </motion.div>
  );
} 