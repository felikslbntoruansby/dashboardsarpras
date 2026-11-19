require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Sambungan ke Supabase Backend
const supabaseUrl = process.env.SUPABASE_URL || 'https://xlompxgjdifbthgpkphv.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_1Qpe36iF1lwCDmfOBHJmlg_hxJUSjJ4';

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// =============================================================
// STATIC ROUTING HALAMAN LOGIN, DASHBOARD & BIDANG UMUM
// (Diletakkan sebelum express.static agar '/' langsung membuka login.html)
// =============================================================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));

app.get('/index', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.get('/bidang-umum', (req, res) => res.sendFile(path.join(__dirname, 'bidang-umum.html')));
app.get('/bidang-umum.html', (req, res) => res.sendFile(path.join(__dirname, 'bidang-umum.html')));

app.get('/bmn', (req, res) => res.sendFile(path.join(__dirname, 'bmn.html')));
app.get('/bmn.html', (req, res) => res.sendFile(path.join(__dirname, 'bmn.html')));

app.get('/kepegawaian', (req, res) => res.sendFile(path.join(__dirname, 'kepegawaian.html')));
app.get('/kepegawaian.html', (req, res) => res.sendFile(path.join(__dirname, 'kepegawaian.html')));

app.get('/tata-usaha', (req, res) => res.sendFile(path.join(__dirname, 'tata-usaha.html')));
app.get('/tata-usaha.html', (req, res) => res.sendFile(path.join(__dirname, 'tata-usaha.html')));

app.get('/executive', (req, res) => res.sendFile(path.join(__dirname, 'executive.html')));
app.get('/executive.html', (req, res) => res.sendFile(path.join(__dirname, 'executive.html')));

app.get('/rumah-tangga', (req, res) => res.sendFile(path.join(__dirname, 'rumahtangga.html')));
app.get('/rumahtangga.html', (req, res) => res.sendFile(path.join(__dirname, 'rumahtangga.html')));

app.get('/ac', (req, res) => res.sendFile(path.join(__dirname, 'ac.html')));
app.get('/ac.html', (req, res) => res.sendFile(path.join(__dirname, 'ac.html')));

app.get('/unit-ac', (req, res) => res.sendFile(path.join(__dirname, 'unit-ac.html')));
app.get('/unit-ac.html', (req, res) => res.sendFile(path.join(__dirname, 'unit-ac.html')));

// Sajikan file statis seperti auth-audit.js, gambar, dan aset lainnya
app.use(express.static(path.join(__dirname), { index: false }));

// =============================================================
// API PREFERENSI FILTER BULAN (PERMANEN DI SUPABASE)
// =============================================================
app.get('/api/preferences/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const { data, error } = await supabase
            .from('user_preferences')
            .select('pref_value')
            .eq('pref_key', key)
            .single();
        if (error || !data) return res.json({ value: '' });
        res.json({ value: data.pref_value || '' });
    } catch (err) {
        res.json({ value: '' });
    }
});

app.post('/api/preferences/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;
        const { error } = await supabase
            .from('user_preferences')
            .upsert(
                { pref_key: key, pref_value: value || '', updated_at: new Date().toISOString() },
                { onConflict: 'pref_key' }
            );
        if (error) throw error;
        res.json({ message: 'Preferensi tersimpan', value: value || '' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =============================================================
// FUNGSI KONVERSI FORMAT TANGGAL ISO (YYYY-MM-DD)
// =============================================================
function formatToIsoDate(val) {
    if (!val) return new Date().toISOString().split('T')[0];
    const strVal = String(val).trim();

    if (strVal.includes('/')) {
        const parts = strVal.split(' ')[0].split('/');
        if (parts.length === 3) {
            let day = parts[0].padStart(2, '0');
            let month = parts[1].padStart(2, '0');
            let year = parts[2];
            if (year.length === 2) year = '20' + year;
            return `${year}-${month}-${day}`;
        }
    }

    if (strVal.includes('-')) {
        const parts = strVal.split(' ')[0].split('-');
        if (parts.length === 3) {
            if (parts[0].length === 4) return strVal.split(' ')[0];
            let day = parts[0].padStart(2, '0');
            let month = parts[1].padStart(2, '0');
            let year = parts[2];
            if (year.length === 2) year = '20' + year;
            return `${year}-${month}-${day}`;
        }
    }

    return new Date().toISOString().split('T')[0];
}

// =============================================================
// API MAINTENANCE AC
// =============================================================
app.get('/api/maintenance-ac', async (req, res) => {
    try {
        let allData = [];
        let from = 0;
        const step = 1000;

        while (true) {
            const { data, error } = await supabase
                .from('maintenance_k3_ac')
                .select('*')
                .order('id', { ascending: true })
                .range(from, from + step - 1);

            if (error) break;
            if (!data || data.length === 0) break;

            allData = allData.concat(data);
            if (data.length < step) break;
            from += step;
        }

        res.json(allData);
    } catch (err) {
        res.json([]);
    }
});

app.post('/api/maintenance-ac/bulk', async (req, res) => {
    try {
        const { items, append } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Data array 'items' kosong atau tidak valid!" });
        }

        if (!append) {
            await supabase.from('maintenance_k3_ac').delete().not('id', 'is', null);
        }

        const rowsToInsert = items.map(item => ({
            kategori_gedung: item.kategori_gedung || 'G. UMUM',
            kode_unit: item.kode_unit || 'AC-UNIT',
            gedung: item.gedung || '',
            lantai: item.lantai || '',
            ruang: item.ruang || '',
            no_urut: item.no_urut || '',
            merk_ac: item.merk_ac || '',
            type_ac: item.type_ac || '',
            kapasitas: item.kapasitas || '',
            freon: item.freon || '',
            tgl_servis: formatToIsoDate(item.tgl_servis),
            status: item.status || 'BAIK',
            catatan: item.catatan || '',
            lokasi: item.lokasi || `${item.gedung || ''} ${item.ruang ? '(' + item.ruang + ')' : ''}`.trim() || 'Ruangan Sarpras',
            jenis_pekerjaan: item.jenis_pekerjaan || `${item.merk_ac || ''} ${item.type_ac || ''} ${item.kapasitas || ''}`.trim() || 'Pemeliharaan AC',
            teknisi: item.teknisi || 'Tim K3 Sarpras'
        }));

        const BATCH_SIZE = 250;
        let insertedTotal = 0;

        for (let i = 0; i < rowsToInsert.length; i += BATCH_SIZE) {
            const chunk = rowsToInsert.slice(i, i + BATCH_SIZE);
            const { error: insertErr } = await supabase.from('maintenance_k3_ac').insert(chunk);
            if (insertErr) throw insertErr;
            insertedTotal += chunk.length;
        }

        res.json({ message: `Berhasil menyimpan ${insertedTotal} data AC!`, total: insertedTotal });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/maintenance-ac', async (req, res) => {
    try {
        const {
            kategori_gedung, kode_unit, gedung, lantai, ruang, no_urut,
            merk_ac, type_ac, kapasitas, freon, tgl_servis, status,
            catatan, lokasi, jenis_pekerjaan, teknisi
        } = req.body;

        const computedLokasi = lokasi || `${gedung || ''} ${lantai ? 'Lt.' + lantai : ''} ${ruang ? '(' + ruang + ')' : ''}`.trim();
        const computedPekerjaan = jenis_pekerjaan || `${merk_ac || ''} ${type_ac || ''} ${kapasitas || ''} ${freon ? '(' + freon + ')' : ''}`.trim();

        const { data, error } = await supabase
            .from('maintenance_k3_ac')
            .insert([{
                kategori_gedung: kategori_gedung || 'G. UMUM',
                kode_unit, gedung: gedung || '', lantai: lantai || '', ruang: ruang || '', no_urut: no_urut || '',
                merk_ac: merk_ac || '', type_ac: type_ac || '', kapasitas: kapasitas || '', freon: freon || '',
                tgl_servis: formatToIsoDate(tgl_servis), status: status || 'BAIK', catatan: catatan || '',
                lokasi: computedLokasi, jenis_pekerjaan: computedPekerjaan, teknisi: teknisi || 'Tim K3 Sarpras'
            }])
            .select();
        if (error) throw error;
        res.json({ message: "Berhasil!", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/maintenance-ac/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            kategori_gedung, kode_unit, gedung, lantai, ruang, no_urut,
            merk_ac, type_ac, kapasitas, freon, tgl_servis, status,
            catatan, lokasi, jenis_pekerjaan, teknisi
        } = req.body;

        const computedLokasi = lokasi || `${gedung || ''} ${lantai ? 'Lt.' + lantai : ''} ${ruang ? '(' + ruang + ')' : ''}`.trim();
        const computedPekerjaan = jenis_pekerjaan || `${merk_ac || ''} ${type_ac || ''} ${kapasitas || ''} ${freon ? '(' + freon + ')' : ''}`.trim();

        const { data, error } = await supabase
            .from('maintenance_k3_ac')
            .update({
                kategori_gedung, kode_unit, gedung, lantai, ruang, no_urut,
                merk_ac, type_ac, kapasitas, freon, tgl_servis: formatToIsoDate(tgl_servis),
                status, catatan, lokasi: computedLokasi, jenis_pekerjaan: computedPekerjaan, teknisi
            })
            .eq('id', id)
            .select();
        if (error) throw error;
        res.json({ message: "Berhasil diubah!", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/maintenance-ac/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('maintenance_k3_ac').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: "Berhasil dihapus!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =============================================================
// API RUMAH TANGGA (PEMINJAMAN RUANGAN & KENDARAAN)
// =============================================================
app.get('/api/peminjaman-ruangan', async (req, res) => {
    try {
        const { data, error } = await supabase.from('peminjaman_ruangan').select('*').order('id', { ascending: false });
        if (error) return res.json([]);
        res.json(data || []);
    } catch (err) { res.json([]); }
});

app.post('/api/peminjaman-ruangan', async (req, res) => {
    try {
        const { nama_peminjam, ruangan, tgl_pinjam, tgl_selesai, jam_mulai, keperluan, status } = req.body;
        const { data, error } = await supabase
            .from('peminjaman_ruangan')
            .insert([{ nama_peminjam, ruangan, tgl_pinjam, tgl_selesai, jam_mulai, keperluan, status: status || 'Diproses' }])
            .select();
        if (error) throw error;
        res.json({ message: "Berhasil!", data });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/peminjaman-ruangan/:id', async (req, res) => {
    try {
        const { nama_peminjam, ruangan, tgl_pinjam, tgl_selesai, jam_mulai, keperluan, status } = req.body;
        const { data, error } = await supabase
            .from('peminjaman_ruangan')
            .update({ nama_peminjam, ruangan, tgl_pinjam, tgl_selesai, jam_mulai, keperluan, status })
            .eq('id', req.params.id)
            .select();
        if (error) throw error;
        res.json({ message: "Berhasil diubah!", data });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/peminjaman-ruangan/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('peminjaman_ruangan').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: "Berhasil dihapus!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/peminjaman-kendaraan', async (req, res) => {
    try {
        const { data, error } = await supabase.from('peminjaman_kendaraan').select('*').order('id', { ascending: false });
        if (error) return res.json([]);
        res.json(data || []);
    } catch (err) { res.json([]); }
});

app.post('/api/peminjaman-kendaraan', async (req, res) => {
    try {
        const { nama_driver, kendaraan, tgl_pinjam, tujuan, status } = req.body;
        const { data, error } = await supabase
            .from('peminjaman_kendaraan')
            .insert([{ nama_driver, kendaraan, tgl_pinjam, tujuan, status: status || 'Diproses' }])
            .select();
        if (error) throw error;
        res.json({ message: "Berhasil!", data });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/peminjaman-kendaraan/:id', async (req, res) => {
    try {
        const { nama_driver, kendaraan, tgl_pinjam, tujuan, status } = req.body;
        const { data, error } = await supabase
            .from('peminjaman_kendaraan')
            .update({ nama_driver, kendaraan, tgl_pinjam, tujuan, status })
            .eq('id', req.params.id)
            .select();
        if (error) throw error;
        res.json({ message: "Berhasil diubah!", data });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/peminjaman-kendaraan/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('peminjaman_kendaraan').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: "Berhasil dihapus!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// =============================================================
// API INVENTORY & TRANSAKSI LOG
// =============================================================
app.get('/api/inventory', async (req, res) => {
    try {
        const { data, error } = await supabase.from('inventory').select('*').order('id', { ascending: true });
        if (error) return res.json([]);
        const formattedData = (data || []).map(item => ({
            id: item.id, code: item.code || '-', name: item.name || 'Tanpa Nama',
            initial: item.initial || 0, inQty: item.in_qty || 0, outQty: item.out_qty || 0
        }));
        res.json(formattedData);
    } catch (err) { res.json([]); }
});

app.post('/api/inventory', async (req, res) => {
    try {
        const { code, name, initial, inQty, outQty } = req.body;
        const { data, error } = await supabase
            .from('inventory')
            .insert([{ code, name, initial: initial || 0, in_qty: inQty || 0, out_qty: outQty || 0 }])
            .select();
        if (error) throw error;
        res.json({ message: "Berhasil!", data });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/inventory/:id', async (req, res) => {
    try {
        const { code, name, initial, inQty, outQty } = req.body;
        const { data, error } = await supabase
            .from('inventory')
            .update({ code, name, initial, in_qty: inQty, out_qty: outQty })
            .eq('id', req.params.id)
            .select();
        if (error) throw error;
        res.json({ message: "Berhasil!", data });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/inventory/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('inventory').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: "Dihapus!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/inventory/transaction', async (req, res) => {
    try {
        const { inventoryId, type, quantity, picName, notes } = req.body;
        const itemIntId = parseInt(inventoryId);
        const qty = parseInt(quantity);

        const { data: item, error: fetchErr } = await supabase.from('inventory').select('*').eq('id', itemIntId).single();
        if (fetchErr || !item) return res.status(404).json({ error: "Barang tidak ditemukan" });

        let updatedIn = item.in_qty || 0;
        let updatedOut = item.out_qty || 0;
        const currentAvailableStock = (item.initial || 0) + updatedIn - updatedOut;

        if (type === 'IN') {
            updatedIn += qty;
        } else if (type === 'OUT') {
            if (qty > currentAvailableStock) {
                return res.status(400).json({ error: `Stok kurang! Sisa: ${currentAvailableStock}` });
            }
            updatedOut += qty;
        }

        await supabase.from('inventory').update({ in_qty: updatedIn, out_qty: updatedOut }).eq('id', itemIntId);
        await supabase.from('inventory_logs').insert([{ inventory_id: itemIntId, type, quantity: qty, pic_name: picName, notes: notes || '-' }]);

        res.json({ message: "Transaksi berhasil!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/logs', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('inventory_logs')
            .select('*, inventory!left(code, name)')
            .order('id', { ascending: false });
        if (error) {
            const { data: fallbackLogs } = await supabase.from('inventory_logs').select('*').order('id', { ascending: false });
            return res.json(fallbackLogs || []);
        }
        res.json(data || []);
    } catch (err) { res.json([]); }
});

app.delete('/api/logs/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('inventory_logs').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: "Dihapus!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// =============================================================
// API SUB-BAGIAN BMN (BARANG MILIK NEGARA)
// =============================================================
app.get('/api/bmn', async (req, res) => {
    try {
        const { data, error } = await supabase.from('bmn_aset').select('*').order('id', { ascending: false });
        if (error) return res.json([]);
        res.json(data || []);
    } catch (err) { res.json([]); }
});

app.post('/api/bmn', async (req, res) => {
    try {
        const { kode_barang, nup, nama_barang, merk_tipe, tahun_perolehan, nilai_perolehan, kondisi, lokasi_ruang, keterangan } = req.body;
        const { data, error } = await supabase
            .from('bmn_aset')
            .insert([{
                kode_barang, nup: nup || '1', nama_barang, merk_tipe: merk_tipe || '',
                tahun_perolehan: tahun_perolehan || '', nilai_perolehan: Number(nilai_perolehan) || 0,
                kondisi: kondisi || 'Baik', lokasi_ruang: lokasi_ruang || '', keterangan: keterangan || ''
            }])
            .select();
        if (error) throw error;
        res.json({ message: "Data BMN tersimpan!", data });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/bmn/:id', async (req, res) => {
    try {
        const { kode_barang, nup, nama_barang, merk_tipe, tahun_perolehan, nilai_perolehan, kondisi, lokasi_ruang, keterangan } = req.body;
        const { data, error } = await supabase
            .from('bmn_aset')
            .update({
                kode_barang, nup, nama_barang, merk_tipe, tahun_perolehan,
                nilai_perolehan: Number(nilai_perolehan) || 0, kondisi, lokasi_ruang, keterangan
            })
            .eq('id', req.params.id)
            .select();
        if (error) throw error;
        res.json({ message: "Data BMN diperbarui!", data });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/bmn/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('bmn_aset').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: "Data BMN dihapus!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// =============================================================
// API SUB-BAGIAN KEPEGAWAIAN
// =============================================================
app.get('/api/kepegawaian', async (req, res) => {
    try {
        const { data, error } = await supabase.from('kepegawaian_data').select('*').order('id', { ascending: false });
        if (error) return res.json([]);
        res.json(data || []);
    } catch (err) { res.json([]); }
});

app.post('/api/kepegawaian', async (req, res) => {
    try {
        const { nip_nik, nama_pegawai, pangkat_golongan, jabatan, unit_kerja, status_kepegawaian, status_kehadiran, keterangan } = req.body;
        const { data, error } = await supabase
            .from('kepegawaian_data')
            .insert([{
                nip_nik, nama_pegawai, pangkat_golongan: pangkat_golongan || '',
                jabatan: jabatan || '', unit_kerja: unit_kerja || 'Bidang Umum',
                status_kepegawaian: status_kepegawaian || 'PNS',
                status_kehadiran: status_kehadiran || 'Aktif', keterangan: keterangan || ''
            }])
            .select();
        if (error) throw error;
        res.json({ message: "Data Kepegawaian tersimpan!", data });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/kepegawaian/:id', async (req, res) => {
    try {
        const { nip_nik, nama_pegawai, pangkat_golongan, jabatan, unit_kerja, status_kepegawaian, status_kehadiran, keterangan } = req.body;
        const { data, error } = await supabase
            .from('kepegawaian_data')
            .update({ nip_nik, nama_pegawai, pangkat_golongan, jabatan, unit_kerja, status_kepegawaian, status_kehadiran, keterangan })
            .eq('id', req.params.id)
            .select();
        if (error) throw error;
        res.json({ message: "Data Kepegawaian diperbarui!", data });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/kepegawaian/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('kepegawaian_data').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: "Data Kepegawaian dihapus!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// =============================================================
// API SUB-BAGIAN TATA USAHA (PERSURATAN & DISPOSISI)
// =============================================================
app.get('/api/tata-usaha', async (req, res) => {
    try {
        const { data, error } = await supabase.from('tata_usaha_surat').select('*').order('id', { ascending: false });
        if (error) return res.json([]);
        res.json(data || []);
    } catch (err) { res.json([]); }
});

app.post('/api/tata-usaha', async (req, res) => {
    try {
        const { nomor_surat, jenis_surat, tanggal_surat, asal_tujuan, perihal, status_disposisi, keterangan } = req.body;
        const { data, error } = await supabase
            .from('tata_usaha_surat')
            .insert([{
                nomor_surat, jenis_surat: jenis_surat || 'Surat Masuk',
                tanggal_surat: formatToIsoDate(tanggal_surat),
                asal_tujuan, perihal, status_disposisi: status_disposisi || 'Menunggu Disposisi',
                keterangan: keterangan || ''
            }])
            .select();
        if (error) throw error;
        res.json({ message: "Agenda surat tersimpan!", data });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/tata-usaha/:id', async (req, res) => {
    try {
        const { nomor_surat, jenis_surat, tanggal_surat, asal_tujuan, perihal, status_disposisi, keterangan } = req.body;
        const { data, error } = await supabase
            .from('tata_usaha_surat')
            .update({
                nomor_surat, jenis_surat, tanggal_surat: formatToIsoDate(tanggal_surat),
                asal_tujuan, perihal, status_disposisi, keterangan
            })
            .eq('id', req.params.id)
            .select();
        if (error) throw error;
        res.json({ message: "Agenda surat diperbarui!", data });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/tata-usaha/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('tata_usaha_surat').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: "Agenda surat dihapus!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// =============================================================
// API BACKUP DATA TERPADU
// =============================================================
app.get('/api/backup', async (req, res) => {
    try {
        const { data: inv } = await supabase.from('inventory').select('*');
        const { data: rgn } = await supabase.from('peminjaman_ruangan').select('*');
        const { data: kdr } = await supabase.from('peminjaman_kendaraan').select('*');
        const { data: ac } = await supabase.from('maintenance_k3_ac').select('*');
        const { data: bmn } = await supabase.from('bmn_aset').select('*');
        const { data: peg } = await supabase.from('kepegawaian_data').select('*');
        const { data: tu } = await supabase.from('tata_usaha_surat').select('*');
        res.setHeader('Content-disposition', 'attachment; filename=backup_bidang_umum.json');
        res.setHeader('Content-type', 'application/json');
        res.send(JSON.stringify({
            inventory: inv || [],
            peminjaman_ruangan: rgn || [],
            peminjaman_kendaraan: kdr || [],
            maintenance_ac: ac || [],
            bmn_aset: bmn || [],
            kepegawaian_data: peg || [],
            tata_usaha_surat: tu || []
        }, null, 2));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Fallback ke login.html jika rute tidak ditemukan
app.use((req, res) => res.sendFile(path.join(__dirname, 'login.html')));

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server MONSARPRAS Bidang Umum berjalan di: http://localhost:${PORT}`));
}