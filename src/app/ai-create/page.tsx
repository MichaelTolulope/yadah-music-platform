"use client";

import { Suspense } from "react";
import AiWorkspace from "./AiWorkspace";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10 text-white">Loading...</div>}>
      <AiWorkspace />
    </Suspense>
  );
}