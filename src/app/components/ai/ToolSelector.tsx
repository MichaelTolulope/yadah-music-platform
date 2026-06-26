"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AI_TOOLS } from "@/lib/ai/tools/config";

export default function ToolSelector() {
  const router = useRouter();
  const params = useSearchParams();

  const current = params.get("tool") ?? "lyrics";

  return (
    <div className="flex gap-2 flex-wrap">
      {Object.values(AI_TOOLS).map(tool => (
        <button
          key={tool.id}
          onClick={() => router.push(`/ai?tool=${tool.id}`)}
          className={`px-4 py-2 rounded-lg ${
            current === tool.id
              ? "bg-violet-600 text-white"
              : "bg-neutral-800 text-gray-300"
          }`}
        >
          {tool.name}
        </button>
      ))}
    </div>
  );
}