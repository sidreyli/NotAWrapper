import { FormEvent, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Bus,
  Car,
  Check,
  Clock3,
  ExternalLink,
  Globe2,
  Loader2,
  MapPin,
  MapPinned,
  Phone,
  Search,
  Footprints
} from "lucide-react";
import { Button } from "@/components/Button";
import { findResources } from "@/lib/api";
import { loadActionCenter, saveActionCenter } from "@/lib/actionCenterStore";
import { loadSession } from "@/lib/sessionStore";
import { cn } from "@/lib/utils";
import type { LocalResource, ResourcesResponse } from "@/types/api";

const categories = [
  ["", "All nearby help"],
  ["snap", "SNAP enrollment"],
  ["wic", "WIC clinics"],
  ["medicaid", "Medicaid help"],
  ["liheap", "Utility assistance"],
  ["food", "Food banks"],
  ["health", "Community clinics"],
  ["housing", "Housing support"]
] as const;

const travelModes = [
  ["TRANSIT", "Transit", Bus],
  ["DRIVE", "Drive", Car],
  ["WALK", "Walk", Footprints]
] as const;

export function ResourceNavigatorPage({ navigate }: { navigate: (path: string) => void }) {
  const [zipCode, setZipCode] = useState(loadSession()?.profile?.zip_code ?? "");
  const [program, setProgram] = useState("");
  const [travelMode, setTravelMode] = useState("TRANSIT");
  const [response, setResponse] = useState<ResourcesResponse | null>(null);
  const [selected, setSelected] = useState<LocalResource | null>(null);
  const [savedIds, setSavedIds] = useState(() => new Set(loadActionCenter().savedResources.map((item) => item.id)));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const best = response?.resources[0] ?? null;
  const shown = useMemo(() => response?.resources ?? [], [response]);

  const search = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\d{5}$/.test(zipCode)) {
      setError("Enter a five-digit ZIP code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await findResources(zipCode, program, travelMode);
      setResponse(result);
      setSelected(result.resources[0] ?? null);
    } catch (err) {
      setResponse(null);
      setError(err instanceof Error ? err.message : "Nearby help could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  const save = (resource: LocalResource) => {
    const current = loadActionCenter();
    const exists = current.savedResources.some((item) => item.id === resource.id);
    const savedResources = exists
      ? current.savedResources.filter((item) => item.id !== resource.id)
      : [...current.savedResources, resource];
    saveActionCenter({ savedResources });
    setSavedIds(new Set(savedResources.map((item) => item.id)));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-canvas pb-20">
      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-6xl px-6 py-9">
          <button
            type="button"
            onClick={() => navigate("/action-center")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Action Center
          </button>
          <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-sky">
                <MapPinned className="h-4 w-4" /> Local Resource Navigator
              </p>
              <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
                Find the next place that can actually help.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-haze">
                Search with only a ZIP code. Compass prioritizes relevant places, opening status, and travel time when available.
              </p>
            </div>
            <div className="rounded-2xl border border-sky/15 bg-sky/5 px-5 py-3 text-sm text-haze">
              No exact address required
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <form onSubmit={search} className="rounded-[1.75rem] border border-border bg-paper p-4 shadow-soft sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[12rem_1fr_auto_auto] lg:items-end">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-haze">ZIP code</span>
              <div className="mt-2 flex h-12 items-center gap-2 rounded-xl border border-border bg-canvas px-3 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <input
                  value={zipCode}
                  onChange={(event) => setZipCode(event.target.value.replace(/\D/g, "").slice(0, 5))}
                  inputMode="numeric"
                  placeholder="90001"
                  className="min-w-0 flex-1 bg-transparent font-semibold text-ink outline-none"
                  aria-label="ZIP code"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-haze">What kind of help?</span>
              <select
                value={program}
                onChange={(event) => setProgram(event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-border bg-canvas px-4 font-medium text-ink outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              >
                {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>

            <div>
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-haze">Travel</span>
              <div className="mt-2 flex h-12 rounded-xl border border-border bg-canvas p-1">
                {travelModes.map(([value, label, Icon]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTravelMode(value)}
                    title={label}
                    className={cn(
                      "grid w-11 place-items-center rounded-lg text-haze transition",
                      travelMode === value && "bg-paper text-emerald-700 shadow-sm"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="h-12" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <Search />}
              {loading ? "Searching" : "Find help"}
            </Button>
          </div>
          {error && <p className="mt-3 text-sm font-medium text-clay" role="alert">{error}</p>}
        </form>

        {!response && !loading && (
          <div className="mt-8 grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-dashed border-sky/30 bg-sky/5 p-9">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-paper text-sky shadow-soft"><Search /></span>
              <h2 className="mt-6 font-display text-2xl font-semibold text-ink">Search by need, not agency name.</h2>
              <p className="mt-3 max-w-lg leading-7 text-haze">You can ask for food, health, housing, or a specific program. Compass translates that into nearby service searches.</p>
            </div>
            <div className="rounded-[2rem] border border-border bg-paper p-8 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">What you will see</p>
              <ul className="mt-5 space-y-4 text-sm text-haze">
                {["Places ranked by practical usefulness", "Opening status and travel time when available", "Direct calling, website, and directions links"].map((item) => (
                  <li key={item} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {response && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.05fr] lg:items-start">
            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-700">{response.source}</p>
                  <h2 className="mt-1 font-display text-2xl font-semibold text-ink">{shown.length} places near {response.zip_code}</h2>
                </div>
              </div>
              {response.message && <p className="mb-4 rounded-2xl bg-gold-50 p-4 text-sm text-haze">{response.message}</p>}
              <div className="space-y-3">
                {shown.map((resource, index) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    best={index === 0 && resource === best}
                    selected={selected?.id === resource.id}
                    saved={savedIds.has(resource.id)}
                    onSelect={() => setSelected(resource)}
                    onSave={() => save(resource)}
                  />
                ))}
              </div>
            </section>

            <aside className="lg:sticky lg:top-24">
              <MapPanel resource={selected} />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function ResourceCard({ resource, best, selected, saved, onSelect, onSave }: {
  resource: LocalResource;
  best: boolean;
  selected: boolean;
  saved: boolean;
  onSelect: () => void;
  onSave: () => void;
}) {
  const miles = resource.distance_meters ? (resource.distance_meters / 1609.344).toFixed(1) : null;
  return (
    <article className={cn("rounded-2xl border bg-paper p-5 shadow-soft transition", selected ? "border-emerald-300 ring-2 ring-emerald-100" : "border-border hover:border-emerald-200")}>
      <button type="button" onClick={onSelect} className="w-full text-left">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky/10 text-sky"><Building2 className="h-5 w-5" /></span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-lg font-semibold leading-tight text-ink">{resource.name}</h3>
                {best && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Best match</span>}
              </div>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-haze">{resource.category}</p>
            </div>
          </div>
          {resource.open_now != null && <span className={cn("shrink-0 text-xs font-bold", resource.open_now ? "text-emerald-600" : "text-clay")}>{resource.open_now ? "Open now" : "Closed"}</span>}
        </div>
        {resource.address && <p className="mt-4 flex gap-2 text-sm leading-6 text-haze"><MapPin className="mt-1 h-3.5 w-3.5 shrink-0" />{resource.address}</p>}
        <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-haze">
          {resource.travel_duration_minutes && <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{resource.travel_duration_minutes} min</span>}
          {miles && <span>{miles} miles away</span>}
        </div>
      </button>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        {resource.phone && <a href={`tel:${resource.phone}`} className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-2 text-xs font-bold text-emerald-700"><Phone className="h-3.5 w-3.5" />Call</a>}
        {resource.website && <a href={resource.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-2 text-xs font-bold text-ink"><Globe2 className="h-3.5 w-3.5" />Website</a>}
        <button type="button" onClick={onSave} className={cn("ml-auto rounded-full px-3 py-2 text-xs font-bold", saved ? "bg-emerald-600 text-white" : "border border-border text-emerald-700")}>
          {saved ? "Saved" : "Save place"}
        </button>
      </div>
    </article>
  );
}

function MapPanel({ resource }: { resource: LocalResource | null }) {
  if (!resource) return <div className="grid min-h-[28rem] place-items-center rounded-[2rem] border border-border bg-paper p-8 text-center text-haze">Select a place to see its details.</div>;
  const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
  const mapSrc = resource.source === "Google Places"
    ? googleMapsKey
      ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(googleMapsKey)}&q=${encodeURIComponent(resource.name + (resource.address ? `, ${resource.address}` : ""))}`
      : null
    : resource.lat != null && resource.lon != null
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${resource.lon - 0.015}%2C${resource.lat - 0.012}%2C${resource.lon + 0.015}%2C${resource.lat + 0.012}&layer=mapnik&marker=${resource.lat}%2C${resource.lon}`
      : null;
  return (
    <div className="overflow-hidden rounded-[2rem] border border-border bg-paper shadow-lift">
      {mapSrc ? <iframe title={`Map showing ${resource.name}`} src={mapSrc} className="h-72 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /> : <div className="grid h-72 place-items-center bg-canvas px-8 text-center text-sm leading-6 text-haze">Map preview is not configured. Directions and place details still work.</div>}
      <div className="p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky">Selected place</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-ink">{resource.name}</h2>
        {resource.address && <p className="mt-3 text-sm leading-6 text-haze">{resource.address}</p>}
        {(resource.hours?.length ?? 0) > 0 && <details className="mt-4 rounded-xl bg-canvas p-4"><summary className="cursor-pointer text-sm font-bold text-ink">Opening hours</summary><ul className="mt-3 space-y-1 text-xs leading-5 text-haze">{(resource.hours ?? []).map((line) => <li key={line}>{line}</li>)}</ul></details>}
        {resource.directions_url && <Button asChild className="mt-5 w-full"><a href={resource.directions_url} target="_blank" rel="noreferrer">Open directions <ExternalLink /></a></Button>}
        <p className="mt-4 text-center text-[11px] text-haze">Details supplied by {resource.source}. Call ahead to confirm services.</p>
      </div>
    </div>
  );
}
