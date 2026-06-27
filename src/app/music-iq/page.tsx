"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@/app/components/ai/ui-components"; // Adjust this path to your layout
import Sidebar from "@/app/components/Sidebar"; // Adjust this path to your Sidebar component

export default function MusicIqPage() {
  // Simple fake sign-out function for layout demonstration
  const handleSignOut = () => console.log("Signing out...");

  return (
    <div className="flex min-h-screen bg-[#0e0e0e] text-white overflow-hidden">
      
      {/* ── 1. SIDEBAR ── */}
      <Sidebar onSignOut={handleSignOut} />

      {/* ── MAIN CONTENT WRAPPER (Header + Viewport) ── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* ── 2. HEADER ── */}
        <header 
          className="h-20 border-b flex items-center justify-between px-6 lg:px-8 flex-shrink-0"
          style={{ borderColor: "rgba(73,68,85,0.25)", backgroundColor: "#0e0e0e" }}
        >
          <div className="flex items-center gap-3">
            <h1 
              className="text-xl font-bold tracking-tight text-[#e3dbfa]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Music IQ Portal
            </h1>
            <span 
              className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#7c4dff]/20 text-[#cdbdff] border border-[#7c4dff]/30"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              Beta
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg text-[#948ea1] hover:text-white hover:bg-white/[0.05] transition-all">
              <Icon name="notifications" style={{ fontSize: "20px" }} />
            </button>
            <div className="h-5 w-[1px] bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#7c4dff] flex items-center justify-center text-xs font-bold text-white">
                U
              </div>
            </div>
          </div>
        </header>

        {/* ── 3. MAIN SECTION WITH BOXED OVERLAY ── */}
        <main className="flex-1 p-6 lg:p-8 relative max-h-screen">
          
          {/* Boxed Centered Overlay Card */}
          <div 
            className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-[3px] bg-black/40 px-4"
          >
            <div 
              className="p-8 rounded-2xl border text-center max-w-sm w-full shadow-2xl"
              style={{
                background: "rgba(20, 19, 19, 0.94)",
                borderColor: "rgba(124, 77, 255, 0.4)",
                boxShadow: "0 0 50px -10px rgba(124, 77, 255, 0.5)",
              }}
            >
              <div 
                className="w-12 h-12 rounded-full bg-[#7c4dff]/20 flex items-center justify-center mx-auto mb-4 text-[#cdbdff]"
              >
                <Icon name="analytics" style={{ fontSize: "24px" }} />
              </div>
              <h2 
                className="text-3xl font-bold text-white mb-2 tracking-tight"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Coming Soon
              </h2>
              <p 
                className="text-sm text-[#cac3d8] leading-relaxed mb-4"
                style={{ fontFamily: "var(--font-hanken)" }}
              >
                Advanced analytics, market sentiment, and AI-driven insights are currently tuning up. Stay tuned!
              </p>
            </div>
          </div>

          {/* ── SNEAK PEEK DASHBOARD CONTENT (Safe & Unclickable behind overlay) ── */}
          <div className="max-w-6xl mx-auto space-y-6 pointer-events-none select-none opacity-80">
            
            {/* Top Row Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Global Gospel Reach Card */}
              <div 
                className="md:col-span-2 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[220px]"
                style={{ backgroundColor: "rgba(32,31,31,0.4)", border: "1px solid rgba(73,68,85,0.2)" }}
              >
                <div>
                  <span 
                    className="text-[10px] uppercase font-bold tracking-widest text-[#00e5ff]"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    Market Sentiment
                  </span>
                  <h2 
                    className="text-3xl font-bold mt-2" 
                    style={{ fontFamily: "var(--font-playfair)", color: "#e3dbfa" }}
                  >
                    Global Gospel Reach
                  </h2>
                </div>
                
                <div className="flex items-baseline gap-3 mt-4">
                  <span className="text-5xl font-bold tracking-tight">2.8M</span>
                  <span 
                    className="text-xs font-semibold text-[#00e5ff]"
                    style={{ fontFamily: "var(--font-jetbrains)" }}
                  >
                    ↗ +14.2% This Month
                  </span>
                </div>

                <div className="absolute right-6 bottom-4 text-white/[0.03] text-9xl">
                  🌍
                </div>
              </div>

              {/* AI Strategy Advisor Card */}
              <div 
                className="p-6 rounded-2xl flex flex-col justify-between"
                style={{ backgroundColor: "rgba(32,31,31,0.4)", border: "1px solid rgba(73,68,85,0.2)" }}
              >
                <div>
                  <div className="flex items-center gap-1.5 text-[#e9c400]">
                    ✨ 
                    <h3 className="text-base font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>
                      AI Strategy Advisor
                    </h3>
                  </div>
                  <p className="text-xs text-[#cac3d8] mt-3 leading-relaxed" style={{ fontFamily: "var(--font-hanken)" }}>
                    Based on market gaps in the African diaspora, your next release has the highest success potential on:
                  </p>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/[0.05]">
                  <span className="text-[10px] uppercase text-[#e9c400]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                    Recommended Date
                  </span>
                  <p className="text-sm font-bold text-white mt-0.5">Oct 24, 2024</p>
                  <p className="text-[11px] text-[#948ea1]">Pre-Holiday Worship Wave</p>
                </div>

                <button className="w-full mt-4 py-2 bg-[#7c4dff] text-white text-xs font-semibold rounded-xl">
                  Generate Campaign Plan
                </button>
              </div>
            </div>

            {/* Bottom Row Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Regional Traction Card */}
              <div 
                className="md:col-span-2 p-6 rounded-2xl"
                style={{ backgroundColor: "rgba(32,31,31,0.4)", border: "1px solid rgba(73,68,85,0.2)" }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-playfair)" }}>
                    Regional Traction
                  </h3>
                  <div className="flex bg-black/40 rounded-lg p-1 text-[11px] font-medium border border-white/[0.05]">
                    <button className="px-3 py-1 rounded-md text-[#948ea1]">Weekly</button>
                    <button className="px-3 py-1 rounded-md bg-[#7c4dff]/20 text-[#cdbdff]">Monthly</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                  <div className="aspect-square bg-black/30 rounded-xl border border-white/[0.05] relative flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full opacity-20 bg-[radial-gradient(#494455_1px,transparent_1px)] [background-size:16px_16px]" />
                    <div className="absolute w-3 h-3 bg-[#00e5ff] rounded-full animate-ping" />
                    <div className="absolute w-2.5 h-2.5 bg-[#00e5ff] rounded-full border border-white" />
                  </div>

                  <div className="space-y-4 text-xs font-medium" style={{ fontFamily: "var(--font-jetbrains)" }}>
                    {[
                      { city: "Lagos", val: "42%", color: "#cdbdff" },
                      { city: "Accra", val: "28%", color: "#00e5ff" },
                      { city: "London", val: "18%", color: "#cac3d8" },
                      { city: "Houston", val: "12%", color: "#e9c400" },
                    ].map((item) => (
                      <div key={item.city} className="space-y-1.5">
                        <div className="flex justify-between text-[#cac3d8]">
                          <span>{item.city}</span>
                          <span>{item.val}</span>
                        </div>
                        <div className="h-1.5 bg-black/40 rounded-full w-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: item.val, backgroundColor: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trending Genres Card */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-playfair)" }}>
                  Trending Genres
                </h3>

                <div 
                  className="p-3.5 rounded-xl flex items-center justify-between"
                  style={{ backgroundColor: "rgba(32,31,31,0.4)", border: "1px solid rgba(73,68,85,0.2)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-amber-600 to-indigo-900 flex-shrink-0" />
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#948ea1]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                        #1 Trending
                      </span>
                      <p className="text-sm font-semibold text-white">Afro-Fusion Worship</p>
                      <p className="text-[11px] text-[#948ea1]">High engagement in Sunday playlists</p>
                    </div>
                  </div>
                  <span className="text-[#948ea1]">&gt;</span>
                </div>

                <div 
                  className="p-3.5 rounded-xl flex items-center justify-between"
                  style={{ backgroundColor: "rgba(32,31,31,0.4)", border: "1px solid rgba(73,68,85,0.2)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-purple-800 to-rose-900 flex-shrink-0" />
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#00e5ff]" style={{ fontFamily: "var(--font-jetbrains)" }}>
                        Rising Star
                      </span>
                      <p className="text-sm font-semibold text-white">Highlife Praise</p>
                      <p className="text-[11px] text-[#948ea1]">Growing demand for instrumental tracks</p>
                    </div>
                  </div>
                  <span className="text-[#948ea1]">&gt;</span>
                </div>

              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}