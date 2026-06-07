"use client";

import { useState } from "react";
import {
  Scanner,
  useDevices,
  outline,
  boundingBox,
  centerText,
} from "@yudiel/react-qr-scanner";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQrcode } from "@fortawesome/free-solid-svg-icons";
import api from "@/utils/api";

const ScannerPage = () => {
  const router = useRouter();
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);
  const [tracker, setTracker] = useState<string | undefined>("centerText");
  const [pause, setPause] = useState(false);

  const devices = useDevices();

  function getTracker() {
    switch (tracker) {
      case "outline":
        return outline;
      case "boundingBox":
        return boundingBox;
      case "centerText":
        return centerText;
      default:
        return undefined;
    }
  }

  const handleScan = async (data: string) => {
    setPause(true);
    try {
        console.log('data', data);
        const res: any = await api.get('orders/GetMany?page=1&limit=10&query=' + data)
        console.log('res', res)
        router.push('/ve/' + res.data.orders[0]._id);
    } catch (error) {
        console.log('err', error)
        alert('Mã QR Không hợp lệ')
    }
    setPause(false);
  };

  return (
    <div className="container mx-auto mt-4 px-4">
      <title>Quét mã QR | Queen Acoustic</title>
      <meta name="description" content="Trang quét mã QR tại Queen Acoustic." />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-3 md:col-span-4">
          <DashboardSidebar />
        </div>
        
        {/* Main content */}
        <div className="col-span-1 lg:col-span-9 md:col-span-8">
          <div className="flex flex-col md:flex-row justify-between items-center md:mb-6 mb-2">
            <h1 className="text-3xl font-bold">Quét mã QR</h1>
          </div>
          
          {/* Scanner content area */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Sử dụng công cụ này để quét mã QR từ vé hoặc các tài liệu khác.
              </p>
              
              {/* Device selector and tracker options */}
              
              
              {/* Scanner component */}
              <div className="flex justify-center">
                <div className="relative border border-gray-200 rounded-lg overflow-hidden">
                  <Scanner
                    formats={[
                      "qr_code",
                      "micro_qr_code",
                      "rm_qr_code",
                      "maxi_code",
                      "pdf417",
                      "aztec",
                      "data_matrix",
                      "matrix_codes",
                      "dx_film_edge",
                      "databar",
                      "databar_expanded",
                      "codabar",
                      "code_39",
                      "code_93",
                      "code_128",
                      "ean_8",
                      "ean_13",
                      "itf",
                      "linear_codes",
                      "upc_a",
                      "upc_e",
                    ]}
                    constraints={{
                      deviceId: deviceId,
                    }}
                    onScan={(detectedCodes) => {
                      handleScan(detectedCodes[0].rawValue);
                    }}
                    onError={(error) => {
                      console.log(`onError: ${error}'`);
                    }}
                    styles={{ 
                      container: { 
                        height: "400px", 
                        width: "350px",
                        maxWidth: "100%"
                      } 
                    }}
                    components={{
                      // audio: true,
                      onOff: true,
                      torch: true,
                      zoom: true,
                      finder: true,
                      tracker: getTracker(),
                    }}
                    allowMultiple={true}
                    scanDelay={2000}
                    paused={pause}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4 mt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn thiết bị camera
                  </label>
                  <select 
                    onChange={(e) => setDeviceId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value={undefined}>Chọn thiết bị</option>
                    {devices.map((device, index) => (
                      <option key={index} value={device.deviceId}>
                        {device.label}
                      </option>
                    ))}
                  </select>
                </div>
              
              </div>
              {/* Instructions */}
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <FontAwesomeIcon icon={faQrcode} className="mr-2 text-gold-500" />
                  Hướng dẫn sử dụng
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Chọn thiết bị camera từ danh sách trên.</li>
                  <li>Đặt mã QR trong khung quét.</li>
                  <li>Hệ thống sẽ tự động nhận diện và xử lý mã QR.</li>
                  <li>Sau khi quét thành công, bạn sẽ được chuyển đến trang thông tin tương ứng.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerPage;