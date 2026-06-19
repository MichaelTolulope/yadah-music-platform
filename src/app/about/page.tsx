export default function AboutPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4">
          About Yadah Music AI
        </h1>
        <p className="max-w-md text-lg leading-8 text-gray-600 dark:text-gray-300 mb-6">
          Yadah Music AI lets you generate original songs using simple text prompts. Choose a genre, mood, or style, and the AI composes vocals, instruments, and lyrics for you. You can then download high‑quality stems or a ready‑to‑share track.
        </p>
        <p className="max-w-md text-lg leading-8 text-gray-600 dark:text-gray-300 mb-4">
          Built with Next.js, Tailwind CSS, and modern AI models, the platform aims to make music creation accessible to everyone.
        </p>
        <div className="mt-8">
          <a href="/" className="text-indigo-600 hover:underline">
            ← Back to Home
          </a>
        </div>
      </main>
    </div>
  );
}
