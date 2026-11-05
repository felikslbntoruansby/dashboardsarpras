require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Sambungan ke Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(cors());
app.use(express.json());

// -------------------------------------------------------------
// 1. ROUTING HALAMAN HTML (UTAMAKAN RUTE KHUSUS DI ATAS STATIC)
// -------------------------------------------------------------
app.get('/rumah-tangga', (req, res) => {
    res.sendFile(path.join(__dirname, 'rumahtangga.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Middleware static folder diletakkan setelah rute HTML khusus
app.use(express.static(path.join(__dirname)));

// -------------------------------------------------------------
// 2. MODULE RUMAH TANGGA (PEMINJAMAN RUANGAN, KENDARAAN, AC & K3)
// -------------------------------------------------------------

// API Peminjaman Ruangan
app.get('/api/peminjaman-ruangan', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('peminjaman_ruangan')
            .select('*')
            .order('id', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
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
        res.json({ message: "Peminjaman ruangan berhasil ditambahkan!", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Peminjaman Kendaraan
app.get('/api/peminjaman-kendaraan', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('peminjaman_kendaraan')
            .select('*')
            .order('id', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
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
        res.json({ message: "Peminjaman kendaraan berhasil ditambahkan!", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Maintenance AC & K3 (APAR / Hydrant)
app.get('/api/maintenance', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('maintenance_k3_ac')
            .select('*')
            .order('id', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/maintenance', async (req, res) => {
    try {
        const { kategori, lokasi, tgl_service_terakhir, tgl_service_berikutnya, status } = req.body;
        const { data, error } = await supabase
            .from('maintenance_k3_ac')
            .insert([{ kategori, lokasi, tgl_service_terakhir, tgl_service_berikutnya, status: status || 'Baik' }])
            .select();
        if (error) throw error;
        res.json({ message: "Data maintenance berhasil disimpan!", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -------------------------------------------------------------
// 3. MODULE INVENTORY STOK BARANG SARPRAS (EXISTING)
// -------------------------------------------------------------

// Get seluruh data barang
app.get('/api/inventory', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .order('id', { ascending: true })
            .range(0, 999);

        if (error) throw error;

        const formattedData = data.map(item => ({
            id: item.id,
            code: item.code,
            name: item.name,
            initial: item.initial,
            inQty: item.in_qty,
            outQty: item.out_qty
        }));

        res.json(formattedData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Tambah Master Barang
app.post('/api/inventory', async (req, res) => {
    try {
        const { code, name, initial, inQty, outQty } = req.body;
        const { data, error } = await supabase
            .from('inventory')
            .insert([{ 
                code, 
                name, 
                initial: parseInt(initial) || 0, 
                in_qty: parseInt(inQty) || 0, 
                out_qty: parseInt(outQty) || 0 
            }])
            .select();

        if (error) throw error;
        res.json({ message: "Barang berhasil ditambah!", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Edit Master Barang
app.put('/api/inventory/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { code, name, initial, inQty, outQty } = req.body;

        const { data, error } = await supabase
            .from('inventory')
            .update({ 
                code, 
                name, 
                initial: parseInt(initial) || 0, 
                in_qty: parseInt(inQty) || 0, 
                out_qty: parseInt(outQty) || 0 
            })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json({ message: "Barang berhasil dikemas kini!", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Hapus Master Barang
app.delete('/api/inventory/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('inventory').delete().eq('id', id);
        if (error) throw error;
        res.json({ message: "Barang berhasil dipadam!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Transaksi Stok
app.post('/api/inventory/transaction', async (req, res) => {
    try {
        const { inventoryId, type, quantity, picName, notes } = req.body;
        const itemIntId = parseInt(inventoryId);
        const qty = parseInt(quantity);

        if (!itemIntId || !type || !qty || !picName) {
            return res.status(400).json({ error: "Data transaksi tidak lengkap" });
        }

        const { data: item, error: fetchErr } = await supabase
            .from('inventory')
            .select('*')
            .eq('id', itemIntId)
            .single();

        if (fetchErr || !item) return res.status(404).json({ error: "Barang tidak ditemukan" });

        let updatedIn = item.in_qty || 0;
        let updatedOut = item.out_qty || 0;

        const currentAvailableStock = item.initial + updatedIn - updatedOut;

        if (type === 'IN') {
            updatedIn += qty;
        } else if (type === 'OUT') {
            if (qty > currentAvailableStock) {
                return res.status(400).json({ error: `Stok tidak mencukupi! Stok sisa: ${currentAvailableStock}` });
            }
            updatedOut += qty;
        }

        const { error: updateErr } = await supabase
            .from('inventory')
            .update({ in_qty: updatedIn, out_qty: updatedOut })
            .eq('id', itemIntId);

        if (updateErr) throw updateErr;

        const { error: logErr } = await supabase
            .from('inventory_logs')
            .insert([{
                inventory_id: itemIntId,
                type: type,
                quantity: qty,
                pic_name: picName,
                notes: notes || '-'
            }]);

        if (logErr) throw logErr;

        res.json({ message: "Transaksi berhasil dicatat!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Histori Log
app.get('/api/logs', async (req, res) => {
    try {
        const { month, year } = req.query;
        const now = new Date();
        const selectedMonth = month ? parseInt(month) : now.getMonth() + 1;
        const selectedYear = year ? parseInt(year) : now.getFullYear();

        const startDate = new Date(Date.UTC(selectedYear, selectedMonth - 1, 1, 0, 0, 0)).toISOString();
        const endDate = new Date(Date.UTC(selectedYear, selectedMonth, 0, 23, 59, 59, 999)).toISOString();

        const { data, error } = await supabase
            .from('inventory_logs')
            .select('*, inventory(code, name)')
            .gte('created_at', startDate)
            .lte('created_at', endDate)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Hapus Log
app.delete('/api/logs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('inventory_logs').delete().eq('id', id);
        if (error) throw error;
        res.json({ message: "Log transaksi berhasil dihapus!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Backup Data JSON
app.get('/api/backup', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .order('id', { ascending: true })
            .range(0, 999);

        if (error) throw error;

        const dateStr = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=backup_inventory_${dateStr}.json`);
        res.send(JSON.stringify(data, null, 4));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export untuk Serverless Vercel
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server berjalan di http://localhost:${PORT}`);
    });
}