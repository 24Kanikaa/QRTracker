import { Scanner } from "@yudiel/react-qr-scanner";
import { X } from "lucide-react";

export default function QRScannerModal({
  open,
  onClose,
  onScan,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">

      <div className="bg-white rounded-3xl p-5 w-[95%] max-w-md">

        <div className="flex justify-between items-center mb-4">

          <h2 className="font-bold text-lg">
            Scan Desk QR
          </h2>

          <button onClick={onClose}>
            <X />
          </button>

        </div>

        <Scanner
          onScan={(result) => {
            if (result?.length) {
              onScan(result[0].rawValue);
            }
          }}
          onError={(err) => console.log(err)}
          constraints={{
            facingMode: "environment",
          }}
        />

      </div>

    </div>
  );
}