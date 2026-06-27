"use client";

import { Suspense } from "react";
import AiWorkspace from "./AiWorkspace";
import RoleGuard from "../components/RoleGuide";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10 text-white">Loading...</div>}>
      <RoleGuard allowedRoles={["producer"]}>
        <AiWorkspace />
      </RoleGuard>
    </Suspense>
  );
}