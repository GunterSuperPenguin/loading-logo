// app/page.tsx

"use client";

import { useEffect, useState } from "react";
import type { ReactNode, ElementType } from "react";
import {
  Shield,
  ShieldCheck,
  LockKeyhole,
  Fingerprint,
  Radio,
  Activity,
  Database,
  Download,
  CheckCircle2,
  Clock3,
  MapPin,
  UserRound,
  Wifi,
  FileLock2,
  Globe,
  Terminal,
  Eye,
  ChevronRight,
  CircleDot,
  Radar,
  Network,
  Server,
  MapPinned,
  RefreshCw,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Demo data (used only when the page is opened outside of GMod)       */
/* ------------------------------------------------------------------ */

const SERVER = {
  name: "FEDERAL BUREAU OF INVESTIGATION",
  map: "rp_downtown_v4c_v2",
  mode: "Serious Roleplay",
  players: 42,
  maxPlayers: 64,
  address: "192.168.1.100:27015",
};

const USER = {
  nickname: "Agent_047",
  realName: "John Anderson",
  steamId: "76561198000000000",
  avatar: "https://placehold.co/128x128/10251a/4ade80?text=AGENT",
  accountCreated: "12.04.2017",
  hours: 1842,
  profilePublic: true,
};

const ADDONS = [
  { name: "fbi_shared_assets.gma", size: "248 MB" },
  { name: "rp_downtown_content.gma", size: "184 MB" },
  { name: "tactical_gear_pack.gma", size: "96 MB" },
  { name: "realistic_weapons.gma", size: "312 MB" },
  { name: "police_vehicles_pack.gma", size: "156 MB" },
  { name: "advanced_sounds.gma", size: "84 MB" },
];

/* ------------------------------------------------------------------ */
/* GMod bridge (window.__GMOD is filled by the script in layout.tsx)   */
/* ------------------------------------------------------------------ */

type GmodWindow = Window & {
  __GMOD?: {
    details: {
      servername?: string;
      mapname?: string;
      maxplayers?: number;
      steamid?: string;
      gamemode?: string;
    };
    total: number;
    needed: number;
    file: string;
    status: string;
  };
};

type GmodInfo = {
  live: boolean;
  servername: string;
  mapname: string;
  maxplayers: number;
  steamid: string;
  gamemode: string;
  total: number;
  needed: number;
  file: string;
  status: string;
};

const EMPTY_GMOD: GmodInfo = {
  live: false,
  servername: "",
  mapname: "",
  maxplayers: 0,
  steamid: "",
  gamemode: "",
  total: 0,
  needed: 0,
  file: "",
  status: "",
};

function useGmod(): GmodInfo {
  const [info, setInfo] = useState<GmodInfo>(EMPTY_GMOD);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const sync = () => {
      const s = (window as GmodWindow).__GMOD;
      const d = s?.details ?? {};
      const steamid = d.steamid || params.get("steamid") || "";
      const mapname = d.mapname || params.get("map") || "";

      setInfo({
        live: Boolean(steamid || mapname || (s && s.total > 0)),
        servername: d.servername || "",
        mapname,
        maxplayers: d.maxplayers || 0,
        steamid,
        gamemode: d.gamemode || "",
        total: s?.total || 0,
        needed: s?.needed || 0,
        file: s?.file || "",
        status: s?.status || "",
      });
    };

    const t = setTimeout(sync, 0);
    window.addEventListener("gmod-update", sync);
    return () => {
      clearTimeout(t);
      window.removeEventListener("gmod-update", sync);
    };
  }, []);

  return info;
}

/* ------------------------------------------------------------------ */
/* Steam profile (public XML via CORS proxy, no API key)               */
/* ------------------------------------------------------------------ */

type SteamProfile = {
  nickname: string | null;
  realName: string | null;
  avatar: string | null;
  created: string | null;
  isPublic: boolean | null;
};

/* ------------------------------------------------------------------ */
/* Geolocation types                                                   */
/* ------------------------------------------------------------------ */

type GeoData = {
  ip: string;
  ipv4: string | null;
  ipv6: string | null;
  city: string;
  region: string;
  country_name: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  org: string;
  asn: string;
  postal: string;
};

const EMPTY_GEO: GeoData = {
  ip: "",
  ipv4: null,
  ipv6: null,
  city: "",
  region: "",
  country_name: "",
  latitude: null,
  longitude: null,
  timezone: "",
  org: "",
  asn: "",
  postal: "",
};

/* ------------------------------------------------------------------ */
/* Small UI components                                                 */
/* ------------------------------------------------------------------ */

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: ElementType;
  children: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-2 border-b border-emerald-500/20 pb-3">
      <Icon size={15} className="text-emerald-400" />
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
        {children}
      </span>
      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/[0.05] py-3 last:border-0">
      <span className="shrink-0 text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <span className="min-w-0 break-all text-right text-xs text-zinc-200">
        {value}
      </span>
    </div>
  );
}

function DataTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: ReactNode;
  icon: ElementType;
}) {
  return (
    <div className="min-w-0 border border-white/[0.07] bg-black/30 p-3">
      <div className="mb-3 flex items-center gap-2 text-[9px] tracking-widest text-zinc-500">
        <Icon size={13} className="shrink-0 text-emerald-500" />
        {label}
      </div>
      <div className="break-all text-xs font-bold text-zinc-200">{value}</div>
    </div>
  );
}

function MapFrame({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const delta = 0.06;

  const bbox = [
    longitude - delta,
    latitude - delta,
    longitude + delta,
    latitude + delta,
  ].join(",");

  const mapUrl =
    "https://www.openstreetmap.org/export/embed.html" +
    `?bbox=${bbox}` +
    `&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <iframe
      key={`${latitude}-${longitude}`}
      title="Approximate IP geolocation map"
      src={mapUrl}
      className="h-full min-h-[270px] w-full border-0"
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  const gmod = useGmod();
  const live = gmod.live;

  const [profile, setProfile] = useState<SteamProfile | null>(null);

  const [geo, setGeo] = useState<GeoData>(EMPTY_GEO);
  const [geoStatus, setGeoStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  const [demoProgress, setDemoProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([
    "INITIALIZING SECURE TERMINAL...",
    "REQUESTING NETWORK GEOLOCATION...",
    "WAITING FOR API RESPONSE...",
  ]);

  // Note: no synchronous setState before the first await,
  // so it is safe to call from useEffect on mount.
  async function loadGeo() {
    try {
      // IP-based location, not GPS.
      const response = await fetch("https://ipapi.co/json/", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Geolocation API unavailable");
      }

      const data = await response.json();

      if (data.error || !data.ip) {
        throw new Error("Invalid geolocation response");
      }

      // Query IPv4 and IPv6 independently.
      // A failed request means that protocol was not detected.
      const [v4Result, v6Result] = await Promise.allSettled([
        fetch("https://api.ipify.org?format=json").then((r) => {
          if (!r.ok) throw new Error("IPv4 unavailable");
          return r.json();
        }),
        fetch("https://api6.ipify.org?format=json").then((r) => {
          if (!r.ok) throw new Error("IPv6 unavailable");
          return r.json();
        }),
      ]);

      const ipv4 =
        v4Result.status === "fulfilled" &&
        /^\d{1,3}(\.\d{1,3}){3}$/.test(v4Result.value.ip)
          ? v4Result.value.ip
          : null;

      const ipv6 =
        v6Result.status === "fulfilled" && v6Result.value.ip.includes(":")
          ? v6Result.value.ip
          : null;

      setGeo({
        ip: String(data.ip || ""),
        ipv4,
        ipv6,
        city: String(data.city || ""),
        region: String(data.region || ""),
        country_name: String(data.country_name || ""),
        latitude:
          Number.isFinite(Number(data.latitude)) && data.latitude !== null
            ? Number(data.latitude)
            : null,
        longitude:
          Number.isFinite(Number(data.longitude)) && data.longitude !== null
            ? Number(data.longitude)
            : null,
        timezone: String(data.timezone || ""),
        org: String(data.org || ""),
        asn: String(data.asn || ""),
        postal: String(data.postal || ""),
      });

      setGeoStatus("success");
      setLogs((previous) => [
        ...previous.slice(-4),
        "GEOLOCATION DATA RECEIVED",
        "NETWORK IDENTIFICATION COMPLETE",
      ]);
    } catch {
      setGeoStatus("error");
      setLogs((previous) => [
        ...previous.slice(-4),
        "GEOLOCATION REQUEST FAILED",
        "CHECK NETWORK OR API AVAILABILITY",
      ]);
    }
  }

  // Manual refresh from the button: set "loading" here, not inside loadGeo.
  function refreshGeo() {
    setGeoStatus("loading");
    void loadGeo();
  }

  // Initial geolocation request on mount.
  useEffect(() => {
    const t = setTimeout(() => {
      void loadGeo();
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Steam profile by SteamID (public profile XML, no API key).
  useEffect(() => {
    if (!/^\d{17}$/.test(gmod.steamid)) return;

    let cancelled = false;
    const url = `https://steamcommunity.com/profiles/${gmod.steamid}?xml=1`;

    fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`)
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;
        const xml = new DOMParser().parseFromString(text, "text/xml");
        const get = (tag: string) =>
          xml.querySelector(tag)?.textContent?.trim() || null;
        const privacy = get("privacyState");

        setProfile({
          nickname: get("steamID"),
          realName: get("realname"),
          avatar: get("avatarFull"),
          created: get("memberSince"),
          isPublic: privacy ? privacy === "public" : null,
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [gmod.steamid]);

  // DEMO ONLY: runs only when the page is NOT opened from GMod.
  useEffect(() => {
    if (live) return;
    const interval = setInterval(() => {
      setDemoProgress((previous) =>
        Math.min(previous + Math.random() * 1.4 + 0.25, 100)
      );
    }, 180);

    return () => clearInterval(interval);
  }, [live]);

  useEffect(() => {
    const messages = [
      "VERIFYING CLIENT RESOURCES...",
      "CHECKING SERVER CONFIGURATION...",
      "MOUNTING CLIENT ASSETS...",
      "VERIFYING ADDON INTEGRITY...",
      "SYNCING PLAYER PROFILE...",
      "PREPARING GAME SESSION...",
    ];

    const interval = setInterval(() => {
      setLogs((previous) => [
        ...previous.slice(-4),
        `[${new Date().toLocaleTimeString("en-GB")}] ${
          messages[Math.floor(Math.random() * messages.length)]
        }`,
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  /* ----- Derived values ----- */

  const progress =
    live && gmod.total > 0
      ? Math.min(100, ((gmod.total - gmod.needed) / gmod.total) * 100)
      : live
        ? 0
        : demoProgress;

  const complete = progress >= 100;

  const loaded = Math.min(
    Math.floor((progress / 100) * ADDONS.length),
    ADDONS.length
  );

  const addonIndex = Math.min(
    Math.floor((progress / 100) * ADDONS.length),
    ADDONS.length - 1
  );

  const server = {
    name: (live && gmod.servername) || SERVER.name,
    map: live ? gmod.mapname || "UNKNOWN" : SERVER.map,
    mode: live ? gmod.gamemode || "UNKNOWN" : SERVER.mode,
    maxPlayers: (live && gmod.maxplayers) || SERVER.maxPlayers,
  };

  const user = live
    ? {
        nickname: profile?.nickname || "UNKNOWN",
        realName: profile?.realName || "NOT DISCLOSED",
        steamId: gmod.steamid || "UNKNOWN",
        avatar: profile?.avatar || USER.avatar,
        accountCreated: profile?.created || "UNKNOWN",
        hours: "UNKNOWN",
        profileLabel:
          profile?.isPublic === null || profile === null
            ? "UNKNOWN"
            : profile.isPublic
              ? "PUBLIC"
              : "PRIVATE",
      }
    : {
        nickname: USER.nickname,
        realName: USER.realName,
        steamId: USER.steamId,
        avatar: USER.avatar,
        accountCreated: USER.accountCreated,
        hours: `${USER.hours.toLocaleString()} H`,
        profileLabel: USER.profilePublic ? "PUBLIC" : "PRIVATE",
      };

  const mapImage = `https://placehold.co/900x500/101a17/59e6a0?text=${encodeURIComponent(
    server.map.toUpperCase()
  )}`;

  const currentFile = live
    ? gmod.file || gmod.status || "WAITING FOR SERVER..."
    : ADDONS[addonIndex].name;

  const filesLabel =
    live && gmod.total > 0
      ? `${Math.max(gmod.total - gmod.needed, 0)} / ${gmod.total}`
      : `${loaded} / ${ADDONS.length}`;

  const locationLabel = [geo.city, geo.region, geo.country_name]
    .filter(Boolean)
    .join(", ");

  const hasCoordinates = geo.latitude !== null && geo.longitude !== null;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#080b0a] font-mono text-zinc-200 selection:bg-emerald-500/30">
      {/* Tactical background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            "linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_60%)]" />

      {/* Header */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-emerald-500/20 bg-black/40 px-5 py-4 md:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-emerald-500/40 bg-emerald-500/[0.08]">
            <Shield size={23} className="text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-black tracking-[0.24em] text-white">
              F.B.I.
            </div>
            <div className="mt-1 text-[9px] tracking-[0.18em] text-emerald-500/70">
              SECURE ACCESS TERMINAL
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[9px] tracking-widest">
          <span className="flex items-center gap-2 text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            SYSTEM ONLINE
          </span>
          <span className="hidden border-l border-white/10 pl-3 text-zinc-500 sm:block">
            BUILD 2.6.04
          </span>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 pb-64 pt-8 md:px-8 md:pt-10">
        {/* Operation heading */}
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] tracking-[0.3em] text-emerald-500">
              <LockKeyhole size={13} />
              CLASSIFIED // LEVEL 04 ACCESS
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
              OPERATION <span className="text-emerald-400">DOWNTOWN</span>
            </h1>
            <p className="mt-3 max-w-xl text-xs leading-6 text-zinc-500">
              Establishing secure connection to the federal network. Preparing
              operational environment.
            </p>
          </div>

          <div className="flex items-center gap-3 border border-emerald-500/20 bg-emerald-500/[0.04] px-4 py-3">
            <Activity size={17} className="animate-pulse text-emerald-400" />
            <div>
              <div className="text-[9px] tracking-widest text-zinc-500">
                CONNECTION STATUS
              </div>
              <div className="mt-1 text-xs font-bold text-emerald-400">
                {complete ? "READY FOR DEPLOYMENT" : "LOADING RESOURCES"}
              </div>
            </div>
          </div>
        </div>

        {/* Three-column layout */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.9fr_1.3fr_0.9fr]">
          {/* LEFT: Server */}
          <section className="min-w-0 border border-white/10 bg-[#0c100e]/95 p-5">
            <SectionTitle icon={Database}>SERVER INTELLIGENCE</SectionTitle>

            <div className="relative mb-5 aspect-video overflow-hidden border border-emerald-500/20 bg-[#111b16]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mapImage}
                alt="Server map preview"
                className="h-full w-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080b0a] to-transparent" />
              <div className="absolute left-3 top-3 border border-emerald-500/30 bg-black/70 px-2 py-1 text-[9px] text-emerald-400">
                MAP PREVIEW
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <div className="text-[9px] tracking-widest text-emerald-400">
                  CURRENT MAP
                </div>
                <div className="mt-1 break-all text-sm font-bold text-white">
                  {server.map}
                </div>
              </div>
            </div>

            <InfoRow label="Server" value={server.name} />
            <InfoRow label="Game mode" value={server.mode} />
            <InfoRow
              label="Players"
              value={
                <span className="text-emerald-400">
                  {live ? "—" : SERVER.players} / {server.maxPlayers}
                </span>
              }
            />
            <InfoRow label="Map" value={server.map} />
            <InfoRow
              label="Network"
              value={
                <span className="flex items-center justify-end gap-2 text-emerald-400">
                  <Wifi size={12} />
                  CONNECTED
                </span>
              }
            />

            <div className="mt-5 border border-white/[0.07] bg-black/30 p-3">
              <div className="mb-2 flex items-center gap-2 text-[9px] tracking-widest text-zinc-500">
                <Globe size={12} />
                SERVER ENDPOINT
              </div>
              <div className="break-all text-[10px] text-zinc-300">
                {live ? "CLASSIFIED" : SERVER.address}
              </div>
            </div>
          </section>

          {/* CENTER: Geolocation and network data */}
          <section className="min-w-0 border border-emerald-500/25 bg-[#0a0e0c]/95 p-5">
            <SectionTitle icon={Radar}>SUBJECT TRACKING</SectionTitle>

            <div className="mb-4 flex items-center gap-3 border border-emerald-500/20 bg-emerald-500/[0.04] p-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-emerald-500/30 bg-emerald-500/[0.08]">
                <Fingerprint size={25} className="text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[9px] tracking-widest text-zinc-500">
                  GEOLOCATION SYSTEM
                </div>
                <div className="mt-1 text-xs font-bold text-emerald-400">
                  {geoStatus === "loading"
                    ? "ESTABLISHING TRACE..."
                    : geoStatus === "success"
                      ? "NETWORK IDENTIFIED"
                      : "TRACE UNAVAILABLE"}
                </div>
              </div>
              <button
                onClick={refreshGeo}
                aria-label="Refresh geolocation"
                className="border border-white/10 p-2 text-zinc-400 transition hover:border-emerald-500/40 hover:text-emerald-400"
              >
                <RefreshCw
                  size={14}
                  className={geoStatus === "loading" ? "animate-spin" : ""}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <DataTile
                icon={Network}
                label="PUBLIC IPv4"
                value={geo.ipv4 || "NOT DETECTED"}
              />
              <DataTile
                icon={Globe}
                label="PUBLIC IPv6"
                value={geo.ipv6 || "NOT DETECTED"}
              />
              <DataTile
                icon={LockKeyhole}
                label="MAC ADDRESS"
                value="NOT ACCESSIBLE"
              />
              <DataTile
                icon={Server}
                label="ISP / ORGANIZATION"
                value={geo.org || "UNKNOWN"}
              />
              <DataTile
                icon={Database}
                label="ASN"
                value={geo.asn || "UNKNOWN"}
              />
              <DataTile
                icon={Clock3}
                label="TIMEZONE"
                value={geo.timezone || "UNKNOWN"}
              />
            </div>

            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[10px] tracking-widest text-emerald-400">
                  <MapPinned size={14} />
                  SUBJECT GEOLOCATION
                </div>
                <span className="text-[9px] text-zinc-500">IP-BASED</span>
              </div>

              <div className="mb-3 border border-white/[0.07] bg-black/30 p-3">
                <div className="flex items-start gap-3">
                  <MapPin
                    size={18}
                    className="mt-0.5 shrink-0 text-emerald-400"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white">
                      {geoStatus === "loading"
                        ? "SEARCHING LOCATION..."
                        : locationLabel || "LOCATION UNKNOWN"}
                    </div>
                    <div className="mt-1 text-[9px] leading-5 text-zinc-500">
                      {hasCoordinates
                        ? `${geo.latitude!.toFixed(5)}, ${geo.longitude!.toFixed(5)}`
                        : "COORDINATES UNAVAILABLE"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[270px] overflow-hidden border border-emerald-500/20 bg-[#0b1510]">
                {hasCoordinates ? (
                  <MapFrame
                    latitude={geo.latitude!}
                    longitude={geo.longitude!}
                  />
                ) : (
                  <div className="flex min-h-[270px] flex-col items-center justify-center gap-3 p-5 text-center">
                    <Radar size={38} className="text-emerald-500/50" />
                    <div className="text-[10px] tracking-widest text-zinc-400">
                      {geoStatus === "loading"
                        ? "ACQUIRING COORDINATES"
                        : "MAP DATA UNAVAILABLE"}
                    </div>
                    <div className="text-[10px] leading-5 text-zinc-600">
                      {geoStatus === "error"
                        ? "Check your internet connection and retry."
                        : "Waiting for geolocation service..."}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-2 flex items-start gap-2 text-[9px] leading-5 text-amber-400/80">
                <Eye size={12} className="mt-0.5 shrink-0" />
                <span>
                  Approximate location based on public IP. This is not a GPS
                  position and may identify the ISP gateway rather than the
                  user.
                </span>
              </div>
            </div>

            <div className="mt-5 border border-white/[0.07] bg-black/30 p-3">
              <div className="mb-3 flex items-center gap-2 text-[9px] tracking-widest text-zinc-500">
                <Terminal size={12} />
                NETWORK EVENT LOG
              </div>
              <div className="space-y-2">
                {logs.slice(-4).map((log, index) => (
                  <div
                    key={`${log}-${index}`}
                    className="flex items-start gap-2 text-[9px] leading-4 text-zinc-400"
                  >
                    <ChevronRight
                      size={12}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />
                    <span className="break-words">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT: Player */}
          <section className="min-w-0 border border-white/10 bg-[#0c100e]/95 p-5">
            <SectionTitle icon={UserRound}>PERSONNEL DOSSIER</SectionTitle>

            <div className="mb-5 flex items-center gap-4">
              <div className="relative h-[76px] w-[76px] shrink-0 border border-emerald-500/40 bg-black p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatar}
                  alt="Player avatar"
                  className="h-full w-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 h-3 w-3 border border-black bg-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="mb-2 text-[9px] tracking-widest text-zinc-500">
                  IDENTIFIED USER
                </div>
                <div className="break-words text-lg font-black text-white">
                  {user.nickname}
                </div>
                <div className="mt-1 text-[10px] text-emerald-400">
                  PLAYER CLEARANCE
                </div>
              </div>
            </div>

            <InfoRow label="Real name" value={user.realName} />
            <InfoRow label="Steam ID" value={user.steamId} />
            <InfoRow label="Account created" value={user.accountCreated} />
            <InfoRow label="GMod hours" value={user.hours} />
            <InfoRow
              label="Profile"
              value={
                <span className="text-emerald-400">{user.profileLabel}</span>
              }
            />

            <div className="mt-5 border border-emerald-500/15 bg-emerald-500/[0.035] p-3">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={17}
                  className="mt-0.5 shrink-0 text-emerald-400"
                />
                <div>
                  <div className="text-[9px] font-bold tracking-widest text-zinc-300">
                    PLAYER IDENTIFICATION
                  </div>
                  <div className="mt-2 text-[10px] leading-5 text-zinc-500">
                    {live
                      ? "Identity verified against the federal registry."
                      : "Demo profile. Open the page from GMod to see real data."}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Addon downloads */}
        <section className="mt-5 border border-white/10 bg-[#0c100e]/95 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionTitle icon={Download}>CONTENT ACQUISITION</SectionTitle>
            <span className="text-[9px] tracking-widest text-zinc-500">
              {live ? `${filesLabel} FILES` : `${loaded} / ${ADDONS.length} ADDONS`}
            </span>
          </div>

          {live ? (
            <div className="flex min-w-0 items-center gap-3 border border-emerald-500/40 bg-emerald-500/[0.06] p-3">
              {complete ? (
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
              ) : (
                <Download
                  size={16}
                  className="shrink-0 animate-bounce text-emerald-400"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-[10px] text-zinc-200">
                  {currentFile}
                </div>
                <div className="mt-1 text-[9px] text-zinc-600">
                  {gmod.status || "DOWNLOADING"}
                </div>
              </div>
              <span className="shrink-0 text-[9px] text-amber-400">
                {complete ? "READY" : "FETCHING"}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
              {ADDONS.map((addon, i) => {
                const finished = progress >= ((i + 1) / ADDONS.length) * 100;
                const active = i === addonIndex && !complete;

                return (
                  <div
                    key={addon.name}
                    className={`flex min-w-0 items-center gap-3 border p-3 ${
                      active
                        ? "border-emerald-500/40 bg-emerald-500/[0.06]"
                        : "border-white/[0.06] bg-black/20"
                    }`}
                  >
                    {finished ? (
                      <CheckCircle2
                        size={16}
                        className="shrink-0 text-emerald-400"
                      />
                    ) : active ? (
                      <Download
                        size={16}
                        className="shrink-0 animate-bounce text-emerald-400"
                      />
                    ) : (
                      <FileLock2
                        size={16}
                        className="shrink-0 text-zinc-600"
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[10px] text-zinc-200">
                        {addon.name}
                      </div>
                      <div className="mt-1 text-[9px] text-zinc-600">
                        {addon.size}
                      </div>
                    </div>

                    <span
                      className={`shrink-0 text-[9px] ${
                        finished
                          ? "text-emerald-400"
                          : active
                            ? "text-amber-400"
                            : "text-zinc-600"
                      }`}
                    >
                      {finished ? "READY" : active ? "FETCHING" : "QUEUED"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Bottom loading bar */}
      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-emerald-500/30 bg-[#080b0a]/[0.97] shadow-[0_-15px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="mx-auto max-w-[1600px] px-4 py-4 md:px-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-emerald-500/30 bg-emerald-500/[0.08]">
                {complete ? (
                  <ShieldCheck size={19} className="text-emerald-400" />
                ) : (
                  <Activity
                    size={19}
                    className="animate-pulse text-emerald-400"
                  />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold tracking-[0.16em] text-white">
                  {complete ? "DEPLOYMENT READY" : "LOADING GAME CONTENT"}
                </div>
                <div className="mt-1 truncate text-[9px] text-zinc-500">
                  {complete ? "All assets processed." : currentFile}
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="text-2xl font-black tabular-nums text-emerald-400">
                {Math.floor(progress)}%
              </div>
              <div className="text-[9px] tracking-widest text-zinc-600">
                PROGRESS
              </div>
            </div>
          </div>

          <div className="relative h-2 overflow-hidden bg-white/[0.06]">
            <div
              className="h-full bg-emerald-400 transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            >
              <div className="h-full bg-gradient-to-r from-emerald-700 via-emerald-300 to-white/70" />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[9px] tracking-wider text-zinc-600">
            <span className="flex items-center gap-2">
              <CircleDot size={10} className="text-emerald-400" />
              {complete ? "ALL SYSTEMS NOMINAL" : "ESTABLISHING CONNECTION"}
            </span>
            <span className="flex items-center gap-2">
              <Clock3 size={11} />
              {filesLabel} FILES
            </span>
            <span className="hidden items-center gap-2 sm:flex">
              <Radio size={11} />
              FBI NETWORK // ENCRYPTED
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
