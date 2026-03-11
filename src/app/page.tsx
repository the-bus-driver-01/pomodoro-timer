import Timer from '@/components/Timer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Pomodoro Timer
        </h1>
        <Timer />

        <div className="mt-12 max-w-2xl mx-auto text-center text-gray-600">
          <h2 className="text-xl font-semibold mb-4">How it works:</h2>
          <ul className="text-left space-y-2">
            <li>🍅 Default work sessions: 25 minutes</li>
            <li>☕ Default break sessions: 5 minutes</li>
            <li>🔄 Sessions automatically alternate</li>
            <li>⚙️ Customize intervals in localStorage:</li>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• Set 'work-interval' (in minutes)</li>
              <li>• Set 'break-interval' (in minutes)</li>
            </ul>
          </ul>
        </div>
      </div>
    </main>
  );
}