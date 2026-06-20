import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/clerk-react";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();

export const clerkConfigured = Boolean(clerkPublishableKey);

export function OptionalClerkProvider({ children }: { children: ReactNode }) {
  if (!clerkPublishableKey) return children;

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      appearance={{
        variables: {
          colorPrimary: "#0C7A57",
          colorText: "#0A1C16",
          borderRadius: "1rem",
          fontFamily: '"Hanken Grotesk", ui-sans-serif, system-ui, sans-serif'
        }
      }}
    >
      {children}
    </ClerkProvider>
  );
}
