require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// -------------------------------------------------------------
// DATA 1: 150 BARANG INVENTARIS SARPRAS (EXISTING)
// -------------------------------------------------------------
const items = [
    {"code": "A001", "name": "Otomatis Closet", "initial": 15, "inQty": 0, "outQty": 0},
    {"code": "A002", "name": "Selang Fleksibel 40cm", "initial": 1, "inQty": 0, "outQty": 1},
    {"code": "A003", "name": "Tusen Klep 3/4\" Besi", "initial": 5, "inQty": 0, "outQty": 0},
    {"code": "A004", "name": "Tusen Klep 1\" Besi", "initial": 2, "inQty": 0, "outQty": 0},
    {"code": "A005", "name": "Tusen Klep 1,1/2\" Besi", "initial": 4, "inQty": 0, "outQty": 0},
    {"code": "A006", "name": "Tusen Klep 2\" Besi", "initial": 7, "inQty": 0, "outQty": 0},
    {"code": "A007", "name": "Radar Otomatic", "initial": 15, "inQty": 0, "outQty": 2},
    {"code": "A008", "name": "Otomatic Pompa", "initial": 4, "inQty": 0, "outQty": 0},
    {"code": "A009", "name": "Stop Kontak Tanam", "initial": 4, "inQty": 0, "outQty": 0},
    {"code": "A010", "name": "Handel Pintu", "initial": 0, "inQty": 0, "outQty": 0},
    {"code": "A011", "name": "Double Neppel 1/2\"", "initial": 10, "inQty": 0, "outQty": 0},
    {"code": "A012", "name": "Kran Angsa Cuci Piring", "initial": 8, "inQty": 0, "outQty": 0},
    {"code": "A013", "name": "Kran Tanam Showar", "initial": 4, "inQty": 0, "outQty": 0},
    {"code": "A014", "name": "Neppel T-Duss 1/2\"", "initial": 12, "inQty": 0, "outQty": 0},
    {"code": "A015", "name": "Seal Tape", "initial": 50, "inQty": 0, "outQty": 5},
    {"code": "A016", "name": "Fiting Gantung", "initial": 25, "inQty": 0, "outQty": 0},
    {"code": "A017", "name": "Fiting Plapon", "initial": 30, "inQty": 0, "outQty": 0},
    {"code": "A018", "name": "Stop Kontak Broco", "initial": 20, "inQty": 0, "outQty": 0},
    {"code": "A019", "name": "Saklar Engkel Broco", "initial": 15, "inQty": 0, "outQty": 0},
    {"code": "A020", "name": "Saklar Seri Broco", "initial": 15, "inQty": 0, "outQty": 0},
    {"code": "A021", "name": "Lampu LED 10W Philips", "initial": 40, "inQty": 0, "outQty": 5},
    {"code": "A022", "name": "Lampu LED 15W Philips", "initial": 35, "inQty": 0, "outQty": 2},
    {"code": "A023", "name": "Lampu LED 20W Philips", "initial": 30, "inQty": 0, "outQty": 3},
    {"code": "A024", "name": "Lampu TL LED 16W", "initial": 20, "inQty": 0, "outQty": 0},
    {"code": "A025", "name": "Kabel NYM 2x1.5mm (Roll)", "initial": 3, "inQty": 0, "outQty": 0},
    {"code": "A026", "name": "Kabel NYM 2x2.5mm (Roll)", "initial": 2, "inQty": 0, "outQty": 0},
    {"code": "A027", "name": "Isolasi Listrik 3M", "initial": 25, "inQty": 0, "outQty": 2},
    {"code": "A028", "name": "MCB 6A Schneider", "initial": 10, "inQty": 0, "outQty": 0},
    {"code": "A029", "name": "MCB 10A Schneider", "initial": 10, "inQty": 0, "outQty": 0},
    {"code": "A030", "name": "MCB 16A Schneider", "initial": 8, "inQty": 0, "outQty": 0},
    {"code": "A031", "name": "MCB 20A Schneider", "initial": 5, "inQty": 0, "outQty": 0},
    {"code": "A032", "name": "Pipa PVC 1/2\" Maspion", "initial": 15, "inQty": 0, "outQty": 0},
    {"code": "A033", "name": "Pipa PVC 3/4\" Maspion", "initial": 12, "inQty": 0, "outQty": 0},
    {"code": "A034", "name": "Pipa PVC 1\" Maspion", "initial": 10, "inQty": 0, "outQty": 0},
    {"code": "A035", "name": "Pipa PVC 2\" Maspion", "initial": 8, "inQty": 0, "outQty": 0},
    {"code": "A036", "name": "Pipa PVC 3\" Maspion", "initial": 6, "inQty": 0, "outQty": 0},
    {"code": "A037", "name": "Pipa PVC 4\" Maspion", "initial": 5, "inQty": 0, "outQty": 0},
    {"code": "A038", "name": "Knee PVC 1/2\"", "initial": 40, "inQty": 0, "outQty": 0},
    {"code": "A039", "name": "Knee PVC 3/4\"", "initial": 35, "inQty": 0, "outQty": 0},
    {"code": "A040", "name": "Knee PVC 1\"", "initial": 30, "inQty": 0, "outQty": 0},
    {"code": "A041", "name": "Socket PVC 1/2\"", "initial": 40, "inQty": 0, "outQty": 0},
    {"code": "A042", "name": "Socket PVC 3/4\"", "initial": 35, "inQty": 0, "outQty": 0},
    {"code": "A043", "name": "Tee PVC 1/2\"", "initial": 30, "inQty": 0, "outQty": 0},
    {"code": "A044", "name": "Tee PVC 3/4\"", "initial": 25, "inQty": 0, "outQty": 0},
    {"code": "A045", "name": "Lem Pipa PVC Isarplas", "initial": 15, "inQty": 0, "outQty": 1},
    {"code": "A046", "name": "Saringan Got Stainless", "initial": 12, "inQty": 0, "outQty": 0},
    {"code": "A047", "name": "Kran Air Taman 1/2\"", "initial": 20, "inQty": 0, "outQty": 2},
    {"code": "A048", "name": "Kran Air Tembok 1/2\"", "initial": 18, "inQty": 0, "outQty": 1},
    {"code": "A049", "name": "Jet Shower Toilet Set", "initial": 10, "inQty": 0, "outQty": 1},
    {"code": "A050", "name": "Gantungan Baju Stainless", "initial": 15, "inQty": 0, "outQty": 0},
    {"code": "A051", "name": "Engsel Pintu 4 Inch", "initial": 30, "inQty": 0, "outQty": 0},
    {"code": "A052", "name": "Engsel Jendela 3 Inch", "initial": 25, "inQty": 0, "outQty": 0},
    {"code": "A053", "name": "Grendel Pintu Stainless", "initial": 20, "inQty": 0, "outQty": 0},
    {"code": "A054", "name": "Grendel Jendela", "initial": 20, "inQty": 0, "outQty": 0},
    {"code": "A055", "name": "Hak Angin Jendela", "initial": 20, "inQty": 0, "outQty": 0},
    {"code": "A056", "name": "Kunci Tanam Pintu", "initial": 8, "inQty": 0, "outQty": 0},
    {"code": "A057", "name": "Gembok 40mm Leher Pendek", "initial": 12, "inQty": 0, "outQty": 0},
    {"code": "A058", "name": "Gembok 50mm Leher Panjang", "initial": 10, "inQty": 0, "outQty": 0},
    {"code": "A059", "name": "Sapu Ijuk Standard", "initial": 15, "inQty": 0, "outQty": 3},
    {"code": "A060", "name": "Sapu Lidi Taman", "initial": 10, "inQty": 0, "outQty": 2},
    {"code": "A061", "name": "Pel Lantai Set", "initial": 12, "inQty": 0, "outQty": 1},
    {"code": "A062", "name": "Kain Pel Refill", "initial": 20, "inQty": 0, "outQty": 2},
    {"code": "A063", "name": "Ember Plastik 3 Gallon", "initial": 10, "inQty": 0, "outQty": 0},
    {"code": "A064", "name": "Gayung Air Plastik", "initial": 15, "inQty": 0, "outQty": 0},
    {"code": "A065", "name": "Pengki / Serok Sampah", "initial": 10, "inQty": 0, "outQty": 1},
    {"code": "A066", "name": "Sikat Lantai Gagang", "initial": 8, "inQty": 0, "outQty": 0},
    {"code": "A067", "name": "Sikat WC Set", "initial": 10, "inQty": 0, "outQty": 0},
    {"code": "A068", "name": "Wiper Kaca Gagang", "initial": 6, "inQty": 0, "outQty": 0},
    {"code": "A069", "name": "Wiper Lantai Karet", "initial": 8, "inQty": 0, "outQty": 0},
    {"code": "A070", "name": "Tempat Sampah 20L", "initial": 12, "inQty": 0, "outQty": 0},
    {"code": "A071", "name": "Kantong Sampah Hitam (Pack)", "initial": 30, "inQty": 0, "outQty": 5},
    {"code": "A072", "name": "Pembersih Lantai 800ml", "initial": 24, "inQty": 0, "outQty": 4},
    {"code": "A073", "name": "Pembersih Kaca 440ml", "initial": 20, "inQty": 0, "outQty": 2},
    {"code": "A074", "name": "Karbol Wangi 800ml", "initial": 18, "inQty": 0, "outQty": 3},
    {"code": "A075", "name": "Sabun Cuci Tangan 400ml", "initial": 25, "inQty": 0, "outQty": 5},
    {"code": "A076", "name": "Hand Sanitizer 500ml", "initial": 15, "inQty": 0, "outQty": 2},
    {"code": "A077", "name": "Tisu Toilet Roll", "initial": 100, "inQty": 0, "outQty": 15},
    {"code": "A078", "name": "Tisu Kotak Facial", "initial": 40, "inQty": 0, "outQty": 5},
    {"code": "A079", "name": "Kamper Toilet Pack", "initial": 30, "inQty": 0, "outQty": 4},
    {"code": "A080", "name": "Sticker Peringatan Dilarang Merokok", "initial": 50, "inQty": 0, "outQty": 0},
    {"code": "A081", "name": "Cat Tembok Putih 5kg", "initial": 8, "inQty": 0, "outQty": 0},
    {"code": "A082", "name": "Cat Tembok Biru 5kg", "initial": 4, "inQty": 0, "outQty": 0},
    {"code": "A083", "name": "Cat Kayu & Besi Hitam 1kg", "initial": 6, "inQty": 0, "outQty": 0},
    {"code": "A084", "name": "Cat Kayu & Besi Putih 1kg", "initial": 6, "inQty": 0, "outQty": 0},
    {"code": "A085", "name": "Thinner A Special 1L", "initial": 10, "inQty": 0, "outQty": 1},
    {"code": "A086", "name": "Kuas Cat 2 Inch", "initial": 20, "inQty": 0, "outQty": 0},
    {"code": "A087", "name": "Kuas Cat 3 Inch", "initial": 15, "inQty": 0, "outQty": 0},
    {"code": "A088", "name": "Roller Cat Set", "initial": 8, "inQty": 0, "outQty": 0},
    {"code": "A089", "name": "Isi Roller Cat Refill", "initial": 12, "inQty": 0, "outQty": 0},
    {"code": "A090", "name": "Amplas Lembaran No. 120", "initial": 50, "inQty": 0, "outQty": 2},
    {"code": "A091", "name": "Amplas Lembaran No. 240", "initial": 50, "inQty": 0, "outQty": 2},
    {"code": "A092", "name": "Semen Portland 40kg", "initial": 5, "inQty": 0, "outQty": 0},
    {"code": "A093", "name": "Semen Putih 1kg", "initial": 15, "inQty": 0, "outQty": 0},
    {"code": "A094", "name": "Compound Plafon 20kg", "initial": 2, "inQty": 0, "outQty": 0},
    {"code": "A095", "name": "Kain Kasa Plafon Roll", "initial": 5, "inQty": 0, "outQty": 0},
    {"code": "A096", "name": "Paku Kayu 2 Inch (kg)", "initial": 5, "inQty": 0, "outQty": 0},
    {"code": "A097", "name": "Paku Kayu 3 Inch (kg)", "initial": 5, "inQty": 0, "outQty": 0},
    {"code": "A098", "name": "Paku Beton 2 Inch (Kotak)", "initial": 8, "inQty": 0, "outQty": 0},
    {"code": "A099", "name": "Paku Beton 3 Inch (Kotak)", "initial": 8, "inQty": 0, "outQty": 0},
    {"code": "A100", "name": "Sekrup Gypsum 6x1 (Kotak)", "initial": 10, "inQty": 0, "outQty": 0},
    {"code": "A101", "name": "Fisher & Sekrup Set S6", "initial": 15, "inQty": 0, "outQty": 0},
    {"code": "A102", "name": "Fisher & Sekrup Set S8", "initial": 15, "inQty": 0, "outQty": 0},
    {"code": "A103", "name": "Tang Potong 6 Inch", "initial": 4, "inQty": 0, "outQty": 0},
    {"code": "A104", "name": "Tang Kombinasi 7 Inch", "initial": 5, "inQty": 0, "outQty": 0},
    {"code": "A105", "name": "Tang Lancip 6 Inch", "initial": 4, "inQty": 0, "outQty": 0},
    {"code": "A106", "name": "Obeng Plus (+)", "initial": 10, "inQty": 0, "outQty": 0},
    {"code": "A107", "name": "Obeng Minus (-)", "initial": 10, "inQty": 0, "outQty": 0},
    {"code": "A108", "name": "Tespen Listrik Digital", "initial": 8, "inQty": 0, "outQty": 0},
    {"code": "A109", "name": "Palu Besi 0.5kg", "initial": 6, "inQty": 0, "outQty": 0},
    {"code": "A110", "name": "Palu Karet 300g", "initial": 4, "inQty": 0, "outQty": 0},
    {"code": "A111", "name": "Gergaji Kayu 18 Inch", "initial": 4, "inQty": 0, "outQty": 0},
    {"code": "A112", "name": "Gergaji Besi Frame Set", "initial": 4, "inQty": 0, "outQty": 0},
    {"code": "A113", "name": "Mata Gergaji Besi Sandflex", "initial": 20, "inQty": 0, "outQty": 1},
    {"code": "A114", "name": "Meteran 5 Meter", "initial": 8, "inQty": 0, "outQty": 0},
    {"code": "A115", "name": "Meteran 30 Meter", "initial": 2, "inQty": 0, "outQty": 0},
    {"code": "A116", "name": "Waterpass Aluminum 40cm", "initial": 3, "inQty": 0, "outQty": 0},
    {"code": "A117", "name": "Kunci Inggris 10 Inch", "initial": 4, "inQty": 0, "outQty": 0},
    {"code": "A118", "name": "Kunci Pipa 12 Inch", "initial": 3, "inQty": 0, "outQty": 0},
    {"code": "A119", "name": "Kunci Ring Pas Set 8-24mm", "initial": 2, "inQty": 0, "outQty": 0},
    {"code": "A120", "name": "Kunci L Set 1.5-10mm", "initial": 3, "inQty": 0, "outQty": 0},
    {"code": "A121", "name": "Cutter Besar Heavy Duty", "initial": 10, "inQty": 0, "outQty": 0},
    {"code": "A122", "name": "Isi Ulang Cutter Besar", "initial": 20, "inQty": 0, "outQty": 1},
    {"code": "A123", "name": "Gunting Seng 8 Inch", "initial": 3, "inQty": 0, "outQty": 0},
    {"code": "A124", "name": "Silikon Sealant Bening", "initial": 12, "inQty": 0, "outQty": 0},
    {"code": "A125", "name": "Silikon Sealant Putih", "initial": 12, "inQty": 0, "outQty": 0},
    {"code": "A126", "name": "Tembakan Lem Silikon", "initial": 4, "inQty": 0, "outQty": 0},
    {"code": "A127", "name": "Kabel Ties 20cm (Pack)", "initial": 15, "inQty": 0, "outQty": 1},
    {"code": "A128", "name": "Kabel Ties 30cm (Pack)", "initial": 15, "inQty": 0, "outQty": 1},
    {"code": "A129", "name": "Solasi Bening 2 Inch", "initial": 20, "inQty": 0, "outQty": 2},
    {"code": "A130", "name": "Lakban Cokelat 2 Inch", "initial": 20, "inQty": 0, "outQty": 2},
    {"code": "A131", "name": "Lakban Hitam Kain 2 Inch", "initial": 15, "inQty": 0, "outQty": 1},
    {"code": "A132", "name": "Double Tape Foam 1 Inch", "initial": 10, "inQty": 0, "outQty": 0},
    {"code": "A133", "name": "Sarung Tangan Karet (Pasang)", "initial": 30, "inQty": 0, "outQty": 3},
    {"code": "A134", "name": "Sarung Tangan Kain Bintik", "initial": 40, "inQty": 0, "outQty": 4},
    {"code": "A135", "name": "Masker Medis 3ply (Box)", "initial": 10, "inQty": 0, "outQty": 1},
    {"code": "A136", "name": "Kacamata Safety Bening", "initial": 8, "inQty": 0, "outQty": 0},
    {"code": "A137", "name": "Helm Safety Proyek Kuning", "initial": 6, "inQty": 0, "outQty": 0},
    {"code": "A138", "name": "Rompi Safety Hijau Fosfor", "initial": 10, "inQty": 0, "outQty": 0},
    {"code": "A139", "name": "Sepatu Boots Karet Size 41", "initial": 3, "inQty": 0, "outQty": 0},
    {"code": "A140", "name": "Sepatu Boots Karet Size 42", "initial": 3, "inQty": 0, "outQty": 0},
    {"code": "A141", "name": "Apar Powder 3kg", "initial": 4, "inQty": 0, "outQty": 0},
    {"code": "A142", "name": "Refill Apar Powder 3kg", "initial": 4, "inQty": 0, "outQty": 0},
    {"code": "A143", "name": "Tangga Aluminum 2 Meter", "initial": 2, "inQty": 0, "outQty": 0},
    {"code": "A144", "name": "Tangga Aluminum Lipat 4 Meter", "initial": 1, "inQty": 0, "outQty": 0},
    {"code": "A145", "name": "Kabel Roll Extension 10M", "initial": 4, "inQty": 0, "outQty": 0},
    {"code": "A146", "name": "Kabel Roll Extension 25M", "initial": 2, "inQty": 0, "outQty": 0},
    {"code": "A147", "name": "Lampu Sorot LED 50W", "initial": 4, "inQty": 0, "outQty": 0},
    {"code": "A148", "name": "Lampu Sorot LED 100W", "initial": 2, "inQty": 0, "outQty": 0},
    {"code": "A149", "name": "Pompa Air Celup Drainase", "initial": 1, "inQty": 0, "outQty": 0},
    {"code": "A150", "name": "Mesin Rumput Potong Gendong", "initial": 2, "inQty": 0, "outQty": 0}
];

// -------------------------------------------------------------
// FUNGSI UTAMA SEEDING
// -------------------------------------------------------------
async function seedData() {
    console.log("🚀 Memulai pengisian data awal Supabase...");

    // 1. Seed Inventory Stock Barang
    const formattedItems = items.map(item => ({
        code: item.code,
        name: item.name,
        initial: item.initial,
        in_qty: item.inQty,
        out_qty: item.outQty
    }));

    await supabase.from('inventory').delete().neq('id', 0);
    const { error: errInventory } = await supabase.from('inventory').insert(formattedItems);
    if (errInventory) console.error("❌ Gagal memasukkan 150 inventory:", errInventory.message);
    else console.log("✅ Berhasil memasukkan 150 data barang inventaris!");

    // 2. Seed Data Peminjaman Ruangan
    const { error: errRuangan } = await supabase.from('peminjaman_ruangan').insert([
        { nama_peminjam: 'Budi Santoso', ruangan: 'Aula Utama', tgl_pinjam: '2026-03-25', jam_mulai: '08:00', jam_selesai: '12:00', keperluan: 'Rapat Koordinasi Sarpras', status: 'Diproses' },
        { nama_peminjam: 'Dr. Ahmad', ruangan: 'Ruang Rapat Gedung A', tgl_pinjam: '2026-03-26', jam_mulai: '13:00', jam_selesai: '15:00', keperluan: 'Seminar Akademik', status: 'Disetujui' }
    ]);
    if (errRuangan) console.error("❌ Error Ruangan:", errRuangan.message);
    else console.log("✅ Data Peminjaman Ruangan berhasil ditambahkan!");

    // 3. Seed Data Peminjaman Kendaraan
    const { error: errKendaraan } = await supabase.from('peminjaman_kendaraan').insert([
        { nama_driver: 'Siti Aminah', kendaraan: 'Bus Operasional 01', tgl_pinjam: '2026-03-26', tujuan: 'Kunjungan Lapangan Juanda', status: 'Diproses' },
        { nama_driver: 'Eko Prasetyo', kendaraan: 'Mobil Dinas Innova', tgl_pinjam: '2026-03-27', tujuan: 'Dinas Luar Kota', status: 'Disetujui' }
    ]);
    if (errKendaraan) console.error("❌ Error Kendaraan:", errKendaraan.message);
    else console.log("✅ Data Peminjaman Kendaraan berhasil ditambahkan!");

    // 4. Seed Data Maintenance AC & K3
    const { error: errMaint } = await supabase.from('maintenance_k3_ac').insert([
        { kategori: 'AC Split', lokasi: 'Gedung Rektorat Lt. 2', tgl_service_terakhir: '2026-01-10', tgl_service_berikutnya: '2026-04-10', status: 'Baik' },
        { kategori: 'APAR Powder 6kg', lokasi: 'Koridor Hanggar A', tgl_service_terakhir: '2025-11-05', tgl_service_berikutnya: '2026-11-05', status: 'Baik' }
    ]);
    if (errMaint) console.error("❌ Error Maintenance:", errMaint.message);
    else console.log("✅ Data Maintenance berhasil ditambahkan!");

    console.log("🎉 Seeding seluruh data selesai!");
}

seedData();