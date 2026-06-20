import { useEffect, useMemo, useState } from "react";
import { Cloud, CloudDownload, CloudUpload, Loader2, LogIn, ShieldCheck, Trash2 } from "lucide-react";
import { SignInButton, useSession, useUser } from "@clerk/clerk-react";
import { Button } from "./Button";
import { clerkConfigured } from "@/auth/OptionalClerkProvider";
import {
  captureLocalCaseFile,
  cloudStorageConfigured,
  createClerkSupabaseClient,
  restoreCloudCaseFile,
  type CloudCaseFileRow
} from "@/lib/cloudSync";

export function CloudSyncCard() {
  if (!clerkConfigured || !cloudStorageConfigured) return null;
  return <ConfiguredCloudSyncCard />;
}

function ConfiguredCloudSyncCard() {
  const { isSignedIn, user } = useUser();
  const { session } = useSession();
  const client = useMemo(() => session ? createClerkSupabaseClient(session) : null, [session]);
  const [remote, setRemote] = useState<CloudCaseFileRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!client || !user) {
      setRemote(null);
      return;
    }
    let active = true;
    setLoading(true);
    void (async () => {
      try {
        const { data, error } = await client
          .from("user_case_files")
          .select("user_id,schema_version,payload,updated_at")
          .eq("user_id", user.id)
          .maybeSingle();
        if (!active) return;
        if (error) setMessage("Cloud storage is not ready yet. Check the Supabase integration.");
        else setRemote((data as CloudCaseFileRow | null) ?? null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [client, user]);

  const save = async () => {
    if (!client || !user) return;
    setLoading(true);
    setMessage("");
    const payload = captureLocalCaseFile();
    const { data, error } = await client
      .from("user_case_files")
      .upsert(
        {
          user_id: user.id,
          schema_version: 1,
          payload,
          updated_at: payload.saved_at
        },
        { onConflict: "user_id" }
      )
      .select("user_id,schema_version,payload,updated_at")
      .single();
    if (error) setMessage("Your case file could not be saved. Please try again.");
    else {
      setRemote(data as CloudCaseFileRow);
      setMessage("Your reviewed case file is saved across devices.");
    }
    setLoading(false);
  };

  const restore = () => {
    if (!remote) return;
    restoreCloudCaseFile(remote.payload);
    window.location.reload();
  };

  const remove = async () => {
    if (!client || !user || !remote) return;
    if (!window.confirm("Delete the cloud copy? The case file in this browser will remain available.")) return;
    setLoading(true);
    const { error } = await client.from("user_case_files").delete().eq("user_id", user.id);
    if (error) setMessage("The cloud copy could not be deleted.");
    else {
      setRemote(null);
      setMessage("Cloud copy deleted. This browser’s local case file is unchanged.");
    }
    setLoading(false);
  };

  if (!isSignedIn) {
    return (
      <aside className="rounded-[1.75rem] border border-sky/15 bg-gradient-to-b from-sky/10 to-paper p-6 shadow-soft">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky text-white shadow-soft"><Cloud className="h-5 w-5" /></span>
        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-sky">Optional cloud save</p>
        <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-ink">Keep your plan across devices.</h2>
        <p className="mt-3 text-sm leading-6 text-haze">Sign in only if you want Compass to store your reviewed case file. Anonymous tools remain fully available.</p>
        <SignInButton mode="modal">
          <Button variant="outline" className="mt-5 w-full"><LogIn />Sign in to save</Button>
        </SignInButton>
      </aside>
    );
  }

  return (
    <aside className="rounded-[1.75rem] border border-sky/15 bg-gradient-to-b from-sky/10 to-paper p-6 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky text-white shadow-soft"><Cloud className="h-5 w-5" /></span>
        {remote && <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Cloud copy found</span>}
      </div>
      <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-sky">Private cloud case file</p>
      <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-ink">{remote ? "Choose which copy to use." : "Save when you are ready."}</h2>
      <p className="mt-3 text-sm leading-6 text-haze">{remote ? `Last saved ${new Date(remote.updated_at).toLocaleString()}.` : "Only structured results, reviewed details, saved places, and your timeline are stored."}</p>
      <Button className="mt-5 w-full" onClick={save} disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : <CloudUpload />}{remote ? "Replace cloud with this browser" : "Save this case file"}</Button>
      {remote && <Button variant="outline" className="mt-2 w-full" onClick={restore} disabled={loading}><CloudDownload />Restore cloud copy</Button>}
      {remote && <button type="button" onClick={remove} disabled={loading} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-haze hover:text-clay"><Trash2 className="h-3.5 w-3.5" />Delete cloud copy</button>}
      {message && <p className="mt-4 rounded-xl bg-paper/80 p-3 text-xs leading-5 text-haze">{message}</p>}
      <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-haze"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />Original uploaded documents and Google tokens are never stored in Supabase.</p>
    </aside>
  );
}
