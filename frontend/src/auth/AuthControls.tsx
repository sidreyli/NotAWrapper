import { Cloud } from "lucide-react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { clerkConfigured } from "./OptionalClerkProvider";

export function AuthControls() {
  if (!clerkConfigured) return null;
  return <ConfiguredAuthControls />;
}

function ConfiguredAuthControls() {
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button
            type="button"
            className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/15 sm:inline-flex"
          >
            <Cloud className="h-3.5 w-3.5 text-gold-300" />
            Save my plan
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <div className="rounded-full bg-white/10 p-1 ring-1 ring-white/15">
          <UserButton
            appearance={{ elements: { avatarBox: "h-8 w-8" } }}
            userProfileMode="modal"
          />
        </div>
      </SignedIn>
    </>
  );
}
