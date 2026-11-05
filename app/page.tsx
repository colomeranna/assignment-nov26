export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-gray-200 font-sans dark:bg-gray-800">
      <main className="flex flex-col items-center gap-4 px-16 py-32 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Hello, world
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Prototype in progress.
        </p>
      </main>
    </div>
  );
}
