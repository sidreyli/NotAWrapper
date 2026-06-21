import { useEffect, useMemo, useState } from "react";
import { Cloud, CloudDownload, CloudUpload, Loader2, LogIn, ShieldCheck, Trash2 } from "lucide-react";
import { SignInButton, useSession, useUser } from "@clerk/clerk-react";
import { Button } from "./Button";
import { clerkConfigured } from "@/auth/OptionalClerkProvider";
import { useT } from "@/i18n";
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
  const t = useT();
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
        if (error) setMessage(t("cloud.notReady"));
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
    if (error) setMessage(t("cloud.saveError"));
    else {
      setRemote(data as CloudCaseFileRow);
      setMessage(t("cloud.saved"));
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
    if (!window.confirm(t("cloud.deleteConfirm"))) return;
    setLoading(true);
    const { error } = await client.from("user_case_files").delete().eq("user_id", user.id);
    if (error) setMessage(t("cloud.deleteError"));
    else {
      setRemote(null);
      setMessage(t("cloud.deleted"));
    }
    setLoading(false);
  };

  if (!isSignedIn) {
    return (
      <aside className="rounded-[1.75rem] border border-sky/15 bg-gradient-to-b from-sky/10 to-paper p-6 shadow-soft">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky text-white shadow-soft"><Cloud className="h-5 w-5" /></span>
        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-sky">{t("cloud.kickerOptional")}</p>
        <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-ink">{t("cloud.signedOutTitle")}</h2>
        <p className="mt-3 text-sm leading-6 text-haze">{t("cloud.signedOutBody")}</p>
        <SignInButton mode="modal">
          <Button variant="outline" className="mt-5 w-full"><LogIn />{t("cloud.signInToSave")}</Button>
        </SignInButton>
      </aside>
    );
  }

  return (
    <aside className="rounded-[1.75rem] border border-sky/15 bg-gradient-to-b from-sky/10 to-paper p-6 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky text-white shadow-soft"><Cloud className="h-5 w-5" /></span>
        {remote && <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">{t("cloud.cloudCopyFound")}</span>}
      </div>
      <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-sky">{t("cloud.kicker")}</p>
      <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-ink">{remote ? t("cloud.titleChoose") : t("cloud.titleSave")}</h2>
      <p className="mt-3 text-sm leading-6 text-haze">{remote ? t("cloud.lastSaved", { date: new Date(remote.updated_at).toLocaleString() }) : t("cloud.storedNote")}</p>
      <Button className="mt-5 w-full" onClick={save} disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : <CloudUpload />}{remote ? t("cloud.replace") : t("cloud.save")}</Button>
      {remote && <Button variant="outline" className="mt-2 w-full" onClick={restore} disabled={loading}><CloudDownload />{t("cloud.restore")}</Button>}
      {remote && <button type="button" onClick={remove} disabled={loading} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-haze hover:text-clay"><Trash2 className="h-3.5 w-3.5" />{t("cloud.delete")}</button>}
      {message && <p className="mt-4 rounded-xl bg-paper/80 p-3 text-xs leading-5 text-haze">{message}</p>}
      <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-haze"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />{t("cloud.privacyNote")}</p>
    </aside>
  );
}
