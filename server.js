require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Sambungan ke Supabase Backend (Menggunakan Key Publik)
const supabaseUrl = process.env.SUPABASE_URL || 'https://xlompxgjdifbthgpkphv.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_1Qpe36iF1lwCDmfOBHJmlg_hxJUSjJ4';

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Static Routing (Tetap seperti semula + Rute AC)
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/rumah-tangga', (req, res) => res.sendFile(path.join(__dirname, 'rumahtangga.html')));
app.get('/rumahtangga.html', (req, res) => res.sendFile(path.join(__dirname, 'rumahtangga.html')));
app.get('/ac', (req, res) => res.sendFile(path.join(__dirname, 'ac.html')));
app.get('/ac.html', (req, res) => res.sendFile(path.join(__dirname, 'ac.html')));

// =============================================================
// API MAINTENANCE AC (TAMBAHAN UTAMA)
// =============================================================

app.get('/api/maintenance-ac', async (req, res) => {
    try {
        const { data, error } = await supabase.from('maintenance_k3_ac').select('*').order('id', { ascending: false });
        if (error) return res.json([]);
        res.json(data || []);
    } catch (err) {
        res.json([]);
    }
});

app.post('/api/maintenance-ac', async (req, res) => {
    try {
        const { lokasi, kode_unit, tgl_servis, jenis_pekerjaan, teknisi, status } = req.body;
        const { data, error } = await supabase
            .from('maintenance_k3_ac')
            .insert([{ lokasi, kode_unit, tgl_servis, jenis_pekerjaan, teknisi, status: status || 'Selesai' }])
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
        const { lokasi, kode_unit, tgl_servis, jenis_pekerjaan, teknisi, status } = req.body;
        const { data, error } = await supabase
            .from('maintenance_k3_ac')
            .update({ lokasi, kode_unit, tgl_servis, jenis_pekerjaan, teknisi, status })
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
        const { id } = req.params;
        const { error } = await supabase.from('maintenance_k3_ac').delete().eq('id', id);
        if (error) throw error;
        res.json({ message: "Berhasil dihapus!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ROUTE IMPOR DATA DARI GOOGLE SPREADSHEET (Disesuaikan dengan header kolom Spreadsheet Anda)
app.post('/api/maintenance-ac/import-sheet', async (req, res) => {
    try {
        const inputUrl = req.body.sheetUrl || 'https://docs.google.com/spreadsheets/d/1JUfy4mrP90Afv2UDVRrkFpGxrEhzFNtU822LcoOxp9I/edit?gid=1651543328#gid=1651543328';
        
        const docIdMatch = inputUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
        const gidMatch = inputUrl.match(/[?&]gid=(\d+)/);

        if (!docIdMatch || !docIdMatch[1]) {
            return res.status(400).json({ error: "Format link Google Spreadsheet tidak valid!" });
        }

        const docId = docIdMatch[1];
        const gid = gidMatch ? gidMatch[1] : '0';
        const csvExportUrl = `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv&gid=${gid}`;

        const fetchRes = await fetch(csvExportUrl);
        if (!fetchRes.ok) {
            return res.status(400).json({ error: "Gagal mengambil data dari Google Sheet. Pastikan izin akses Share bernilai 'Anyone with the link can view'." });
        }

        const csvText = await fetchRes.text();
        const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        if (lines.length <= 1) {
            return res.status(400).json({ error: "Spreadsheet kosong atau hanya berisi baris header!" });
        }

        const parseCsvRow = (rowStr) => {
            const result = [];
            let insideQuote = false;
            let current = '';
            for (let char of rowStr) {
                if (char === '"') insideQuote = !insideQuote;
                else if (char === ',' && !insideQuote) {
                    result.push(current.trim().replace(/^"|"$/g, ''));
                    current = '';
                } else current += char;
            }
            result.push(current.trim().replace(/^"|"$/g, ''));
            return result;
        };

        const headers = parseCsvRow(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
        const rowsToInsert = [];

        for (let i = 1; i < lines.length; i++) {
            const cols = parseCsvRow(lines[i]);
            if (cols.length >= 2) {
                // Pencarian dinamis berdasarkan header spreadsheet (No, Kode, Gedung, Lantai, Ruang, Merk, Tanggal, dll)
                const getVal = (keyStr) => {
                    const idx = headers.findIndex(h => h.includes(keyStr));
                    return idx !== -1 ? cols[idx] : null;
                };

                const gedung = getVal('gedung') || cols[2] || '';
                const ruang = getVal('ruang') || cols[4] || '';
                const kode = getVal('kode') || cols[1] || '';
                const merk = getVal('merk') || cols[6] || '';
                const type = getVal('type') || cols[7] || '';
                const tgl = getVal('tanggal') || getVal('tgl') || cols[10] || new Date().toISOString().split('T')[0];
                const ket = getVal('keterangan') || cols[11] || 'Pemeliharaan AC';

                // Pemetaan otomatis ke kolom database Supabase (lokasi, kode_unit, tgl_servis, jenis_pekerjaan, teknisi, status)
                const lokasi = `${gedung} ${ruang ? '(' + ruang + ')' : ''}`.trim() || cols[0] || 'Ruangan Sarpras';
                const kode_unit = kode || `AC-UNIT-${i}`;
                const tgl_servis = tgl.match(/^\d{4}-\d{2}-\d{2}$/) ? tgl : new Date().toISOString().split('T')[0];
                const jenis_pekerjaan = `${merk} ${type} ${ket}`.trim() || 'Servis AC';
                const teknisi = 'Tim K3 Sarpras';
                const status = ket.toLowerCase().includes('rusak') ? 'Rusak' : 'Selesai';

                rowsToInsert.push({ lokasi, kode_unit, tgl_servis, jenis_pekerjaan, teknisi, status });
            }
        }

        const { data, error } = await supabase.from('maintenance_k3_ac').insert(rowsToInsert).select();
        if (error) throw error;

        res.json({ message: `Berhasil memasukkan ${rowsToInsert.length} data AC dari Google Spreadsheet!`, data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =============================================================
// API RUMAH TANGGA (CRUD LENGKAP SUPABASE) - KODE LAMA ANDA
// =============================================================

// --- PEMINJAMAN RUANGAN ---
app.get('/api/peminjaman-ruangan', async (req, res) => {
    try {
        const { data, error } = await supabase.from('peminjaman_ruangan').select('*').order('id', { ascending: false });
        if (error) return res.json([]);
        res.json(data || []);
    } catch (err) {
        res.json([]);
    }
});

app.post('/api/peminjaman-ruangan', async (req, res) => {
    try {
        const { nama_peminjam, ruangan, tgl_pinjam, jam_mulai, jam_selesai, keperluan, status } = req.body;
        const { data, error } = await supabase
            .from('peminjaman_ruangan')
            .insert([{ nama_peminjam, ruangan, tgl_pinjam, jam_mulai, jam_selesai, keperluan, status: status || 'Diproses' }])
            .select();
        if (error) throw error;
        res.json({ message: "Berhasil!", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/peminjaman-ruangan/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_peminjam, ruangan, tgl_pinjam, jam_mulai, jam_selesai, keperluan, status } = req.body;
        const { data, error } = await supabase
            .from('peminjaman_ruangan')
            .update({ nama_peminjam, ruangan, tgl_pinjam, jam_mulai, jam_selesai, keperluan, status })
            .eq('id', id)
            .select();
        if (error) throw error;
        res.json({ message: "Berhasil diubah!", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/peminjaman-ruangan/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('peminjaman_ruangan').delete().eq('id', id);
        if (error) throw error;
        res.json({ message: "Berhasil dihapus!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- PEMINJAMAN KENDARAAN ---
app.get('/api/peminjaman-kendaraan', async (req, res) => {
    try {
        const { data, error } = await supabase.from('peminjaman_kendaraan').select('*').order('id', { ascending: false });
        if (error) return res.json([]);
        res.json(data || []);
    } catch (err) {
        res.json([]);
    }
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
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/peminjaman-kendaraan/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_driver, kendaraan, tgl_pinjam, tujuan, status } = req.body;
        const { data, error } = await supabase
            .from('peminjaman_kendaraan')
            .update({ nama_driver, kendaraan, tgl_pinjam, tujuan, status })
            .eq('id', id)
            .select();
        if (error) throw error;
        res.json({ message: "Berhasil diubah!", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/peminjaman-kendaraan/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('peminjaman_kendaraan').delete().eq('id', id);
        if (error) throw error;
        res.json({ message: "Berhasil dihapus!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =============================================================
// API INVENTORY STOK BARANG - KODE LAMA ANDA
// =============================================================

app.get('/api/inventory', async (req, res) => {
    try {
        const { data, error } = await supabase.from('inventory').select('*').order('id', { ascending: true });
        if (error) return res.json([]);
        const formattedData = (data || []).map(item => ({
            id: item.id,
            code: item.code || '-',
            name: item.name || 'Tanpa Nama',
            initial: item.initial || 0,
            inQty: item.in_qty || 0,
            outQty: item.out_qty || 0
        }));
        res.json(formattedData);
    } catch (err) {
        res.json([]);
    }
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
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/inventory/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { code, name, initial, inQty, outQty } = req.body;
        const { data, error } = await supabase
            .from('inventory')
            .update({ code, name, initial, in_qty: inQty, out_qty: outQty })
            .eq('id', id)
            .select();
        if (error) throw error;
        res.json({ message: "Berhasil!", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/inventory/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('inventory').delete().eq('id', id);
        if (error) throw error;
        res.json({ message: "Dihapus!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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
    } catch (err) {
        res.json([]);
    }
});

app.delete('/api/logs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('inventory_logs').delete().eq('id', id);
        if (error) throw error;
        res.json({ message: "Dihapus!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/backup', async (req, res) => {
    try {
        const { data: inv } = await supabase.from('inventory').select('*');
        const { data: rgn } = await supabase.from('peminjaman_ruangan').select('*');
        const { data: kdr } = await supabase.from('peminjaman_kendaraan').select('*');
        const { data: ac } = await supabase.from('maintenance_k3_ac').select('*');
        res.setHeader('Content-disposition', 'attachment; filename=backup_sarpras.json');
        res.setHeader('Content-type', 'application/json');
        res.send(JSON.stringify({ inventory: inv || [], peminjaman_ruangan: rgn || [], peminjaman_kendaraan: kdr || [], maintenance_ac: ac || [] }, null, 2));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.use((req, res) => res.sendFile(path.join(__dirname, 'index.html')));

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
}