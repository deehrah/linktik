export default function ScannerPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4">LinkTik Scanner</h1>
        <p className="text-gray-600 mb-8">
          Offline-capable QR code ticket scanner for events
        </p>
        <div className="bg-gray-100 p-8 rounded-lg mb-8">
          <p className="text-gray-500">Scanner interface coming soon...</p>
        </div>
        <div className="space-y-4">
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Start Scanning
          </button>
          <button className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
            Download Event Data
          </button>
        </div>
      </div>
    </main>
  );
}
