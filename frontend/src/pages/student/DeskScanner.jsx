import { QrReader } from "react-qr-reader";
import { scanDesk } from "../../services/deskService";

export default function DeskScanner() {

    const studentId=localStorage.getItem("studentId");

    const handleScan=async(result)=>{

        if(!result) return;

        const qr=JSON.parse(result?.text);

        await scanDesk({

            studentId,

            deskId:qr.deskId

        });

        alert("Desk scanned successfully.");

    }

    return(

        <div className="max-w-lg mx-auto py-10">

            <h1 className="text-2xl font-bold mb-6">
                Scan Desk QR
            </h1>

            <QrReader

                constraints={{
                    facingMode:"environment"
                }}

                onResult={(result)=>{

                    if(result){

                        handleScan(result);

                    }

                }}

            />

        </div>

    )

}