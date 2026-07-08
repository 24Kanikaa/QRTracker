import { X, Download, QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import { useRef } from "react";
import { toPng } from "html-to-image";

export default function DeskQRModal({
  open,
  onClose,
  desk,
}) {
  const qrRef = useRef();

  if (!open || !desk) return null;

  // This is what the student scanner will read
  const qrValue = JSON.stringify({
    deskId: desk.id,
    slug: desk.qr_slug,
  });

  const downloadQR = async () => {
    const dataUrl = await toPng(qrRef.current);

    const link = document.createElement("a");
    link.download = `${desk.qr_slug}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">

      <div className="bg-white rounded-3xl w-[430px] overflow-hidden shadow-xl">

        <div className="bg-teal-600 px-6 py-5 flex justify-between items-center">

          <div>
            <h2 className="text-xl text-white font-semibold">
              {desk.desk_name}
            </h2>

            <p className="text-teal-100 text-sm">
              {desk.location}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-white"
          >
            <X />
          </button>

        </div>

        <div className="p-8">

          <div
            ref={qrRef}
            className="bg-white rounded-2xl p-8 border flex flex-col items-center"
          >
            <QRCode
              value={qrValue}
              size={240}
            />

            <div className="mt-5 text-center">

              <h3 className="font-semibold text-lg">
                {desk.desk_name}
              </h3>

              <p className="text-slate-500 text-sm">
                {desk.location}
              </p>

              <p className="text-xs mt-3 text-slate-400">
                {desk.qr_slug}
              </p>

            </div>
          </div>

          <button
            onClick={downloadQR}
            className="mt-6 w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-3 flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Download QR
          </button>

        </div>

      </div>

    </div>
  );
}