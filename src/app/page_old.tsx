
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Yadah Music AI
        </h1>
        <nav className="flex gap-4">
          <a href="/about" className="text-indigo-600 hover:underline">
            About
          </a>
        </nav>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          Generate Your Music
        </h2>
        <p className="mb-6 max-w-lg text-center text-gray-600 dark:text-gray-300">
          Describe a genre, mood, or style and let our AI compose a full track for you.
        </p>
        <textarea
          placeholder="e.g. A mellow acoustic ballad about sunrise"
          className="w-full max-w-xl rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-100"
          rows={4}
        />
        <button className="mt-4 rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700">
          Generate
        </button>
      </main>
      <footer className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        © 2026 Yadah Music AI
      </footer>
    </div>
  );
}
