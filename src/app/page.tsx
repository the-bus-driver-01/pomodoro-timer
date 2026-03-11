import Timer from '@/components/Timer';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Pomodoro Timer
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Boost your productivity with the Pomodoro Technique. Work for 25 minutes, then take a 5-minute break.
          After 4 rounds, enjoy a longer 15-minute break.
        </p>
      </div>

      <Timer />
    </main>
  );
}