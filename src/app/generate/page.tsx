import Image from "next/image";

export default function GeneratePage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-start py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4">
          Generate Your Music
        </h1>
        <p className="max-w-md text-lg leading-8 text-gray-600 dark:text-gray-300 mb-6 text-center sm:text-left">
          Enter a prompt describing the style, genre, and mood you want, then let the AI compose a unique track for you.
        </p>
        <textarea
          placeholder="e.g. A upbeat pop song about sunrise"
          className="w-full max-w-xl h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-100"
        />
        <button
          className="mt-4 flex h-12 items-center justify-center rounded-md bg-indigo-600 px-6 text-white hover:bg-indigo-700"
        >
          Generate
        </button>
        <div className="mt-8">
          <a href="/" className="text-indigo-600 hover:underline">
            ← Back to Home
          </a>
        </div>
      </main>
    </div>
  );
}
