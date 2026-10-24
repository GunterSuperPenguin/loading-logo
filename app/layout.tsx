import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "F.B.I. Secure Access Terminal",
  description: "GMod loading screen",
};

const gmodBridge = `
(function () {
  var s = window.__GMOD = window.__GMOD || {
    details: {}, total: 0, needed: 0, file: "", status: ""
  };

  function emit() {
    try {
      var ev;
      if (typeof Event === "function") {
        ev = new Event("gmod-update");
      } else {
        ev = document.createEvent("Event");
        ev.initEvent("gmod-update", true, true);
      }
      window.dispatchEvent(ev);
    } catch (e) {}
  }

  window.GameDetails = function (servername, serverurl, mapname, maxplayers, steamid, gamemode) {
    s.details = {
      servername: servername,
      serverurl: serverurl,
      mapname: mapname,
      maxplayers: Number(maxplayers) || 0,
      steamid: steamid,
      gamemode: gamemode
    };
    emit();
  };
  window.SetFilesTotal = function (t) { s.total = Number(t) || 0; emit(); };
  window.SetFilesNeeded = function (n) { s.needed = Number(n) || 0; emit(); };
  window.DownloadingFile = function (f) { s.file = f; emit(); };
  window.SetStatusChanged = function (st) { s.status = st; emit(); };

  // ---- Debug overlay (only with ?debug in the URL) ----
  if (location.search.indexOf("debug") !== -1) {
    var box = null;
    var log = function (t) {
      if (!box) {
        box = document.createElement("pre");
        box.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:99999;margin:0;background:#000;color:#0f0;font:11px monospace;padding:4px;white-space:pre-wrap;max-height:50%;overflow:auto";
        document.documentElement.appendChild(box);
      }
      box.textContent += t + "\\n";
    };
    window.onerror = function (m, src, line) {
      log("ERR: " + m + " @" + String(src || "").split("/").pop() + ":" + line);
    };
    log(navigator.userAgent);
    log("search: " + location.search);
    window.addEventListener("gmod-update", function () {
      log("gmod: " + JSON.stringify(window.__GMOD));
    });
    setTimeout(function () {
      log("after 3s: " + JSON.stringify(window.__GMOD));
    }, 3000);
  }
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: gmodBridge }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
