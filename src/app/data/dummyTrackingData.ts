/**
 * DUMMY DATA UNTUK FITUR TRACKING
 * 
 * PERHATIAN:
 * File ini hanya berisi data sementara (dummy) untuk kebutuhan UI/UX.
 * Saat Backend sudah siap, ganti pemanggilan data ini dengan fetching dari REST API.
 * 
 * STRUKTUR DATA BACKEND YANG DISARANKAN:
 * 
 * 1. SPPG Model
 * interface SppgData {
 *   id: string;
 *   name: string;
 *   address: string;
 *   city: string;
 *   status: "Beroperasi" | "Belum Beroperasi";
 *   capacity_packages: number;
 *   lat: number;
 *   lng: number;
 * }
 * 
 * 2. Vehicle Model & Status
 * interface VehicleData {
 *   id: string;
 *   plate_number: string;
 *   driver_name: string;
 *   status: "Dalam Perjalanan" | "Tiba di SPPG" | "Kembali" | "Standby" | "Delay";
 *   target_sppg_id: string; // Foreign key ke SppgData
 *   eta: string; // Estimasi tiba
 *   last_update: string; // Waktu terakhir koordinat diperbarui
 *   current_lat: number;
 *   current_lng: number;
 * }
 * 
 * 3. Contoh Response API (GET /api/v1/tracking/live)
 * {
 *   "success": true,
 *   "timestamp": "2026-07-15T08:00:00Z",
 *   "data": {
 *     "vehicles": [ ...VehicleData... ],
 *     "summary": {
 *       "total_active": 45,
 *       "in_transit": 30,
 *       "arrived": 15
 *     }
 *   }
 * }
 */

// Menggunakan data dari constants.ts sebagai dasar, ditambahkan ID untuk relasi
export const DUMMY_SPPG_LIST = [
  { id: "S-001", name: "SPPG IPOCOB2V", city: "KOTA BANDUNG", address: "Jl. Soekarno Hatta No. 12, Bandung", packages: 3500, status: "Belum Beroperasi", lat: -6.9175, lng: 107.6191 },
  { id: "S-002", name: "SPPG XOQ7N3UQ", city: "KAB. SUKOHARJO", address: "Jl. Raya Solo-Baki Km. 5, Sukoharjo", packages: 2800, status: "Belum Beroperasi", lat: -7.6833, lng: 110.8333 },
  { id: "S-003", name: "SPPG BJLZRAWN", city: "KAB. BANTUL", address: "Jl. Parangtritis Km. 7, Bantul", packages: 4200, status: "Beroperasi", lat: -7.8863, lng: 110.3283 },
  { id: "S-004", name: "SPPG GDEDQP4M", city: "KAB. BOGOR", address: "Jl. Tegar Beriman, Cibinong, Bogor", packages: 5100, status: "Beroperasi", lat: -6.5971, lng: 106.7932 },
  { id: "S-005", name: "SPPG PWA2ECX3", city: "KOTA TANGERANG SEL.", address: "Jl. Raya Serpong No. 8, Tangsel", packages: 4800, status: "Beroperasi", lat: -6.2886, lng: 106.7179 },
  { id: "S-006", name: "SPPG WMQ1CVMU", city: "KOTA MAKASSAR", address: "Jl. Perintis Kemerdekaan, Makassar", packages: 6200, status: "Belum Beroperasi", lat: -5.1477, lng: 119.4327 },
  { id: "S-007", name: "SPPG AHHENWN4", city: "KOTA SEMARANG", address: "Jl. Pemuda No. 45, Semarang", packages: 5900, status: "Beroperasi", lat: -6.9932, lng: 110.4203 },
  { id: "S-008", name: "SPPG BUGFZEQB", city: "KOTA SURABAYA", address: "Jl. Ahmad Yani, Surabaya", packages: 7200, status: "Beroperasi", lat: -7.2504, lng: 112.7688 },
];

export type VehicleStatus = "Dalam Perjalanan" | "Tiba di SPPG" | "Delay";

export interface DummyVehicle {
  id: string;
  plate: string;
  driver: string;
  status: VehicleStatus;
  targetSppgId: string;
  eta: string;
  lastUpdate: string;
  lat: number;
  lng: number;
  // Untuk simulasi pergerakan:
  baseLat: number;
  baseLng: number;
  headingLat: number;
  headingLng: number;
  progress: number;
}

// Generate kendaraan di sekitar SPPG untuk simulasi
const generateVehicles = (): DummyVehicle[] => {
  const vehicles: DummyVehicle[] = [];
  let vId = 1;

  DUMMY_SPPG_LIST.forEach((sppg, i) => {
    // 2-4 kendaraan per SPPG
    const count = 2 + (i % 3); 
    
    for (let j = 0; j < count; j++) {
      // Posisi acak di sekitar SPPG (radius ~10-50km)
      const latOffset = (Math.random() - 0.5) * 0.5;
      const lngOffset = (Math.random() - 0.5) * 0.5;
      
      const isArrived = j === 0; // 1 kendaraan pasti tiba
      const isDelayed = j === 1 && i % 2 === 0; // Beberapa delay
      
      let status: VehicleStatus = "Dalam Perjalanan";
      if (isArrived) status = "Tiba di SPPG";
      else if (isDelayed) status = "Delay";

      const startLat = sppg.lat + latOffset;
      const startLng = sppg.lng + lngOffset;

      vehicles.push({
        id: `TRK-10${vId}`,
        plate: `B ${1000 + vId * 7} XYZ`,
        driver: `Driver ${vId}`,
        status,
        targetSppgId: sppg.id,
        eta: isArrived ? "Tiba" : `10:${10 + j * 15} WIB`,
        lastUpdate: "Baru saja",
        lat: isArrived ? sppg.lat : startLat,
        lng: isArrived ? sppg.lng : startLng,
        baseLat: startLat,
        baseLng: startLng,
        headingLat: sppg.lat,
        headingLng: sppg.lng,
        progress: isArrived ? 1 : Math.random() * 0.5, // 0 to 1
      });
      vId++;
    }
  });

  return vehicles;
};

export const DUMMY_VEHICLES = generateVehicles();
