require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Nomor WhatsApp Tujuan Notifikasi (Fonnte API)
const TARGET_WA_PHONE = '082333206815';

// Sambungan ke Supabase Backend
const supabaseUrl = process.env.SUPABASE_URL || 'https://xlompxgjdifbthgpkphv.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SECRET_KEY;

const supabase = createClient(
    supabaseUrl, 
    supabaseKey || 'dummy_key_for_build', 
    { auth: { persistSession: false } }
);

app.use(cors());
app.use(express.json());

// Helper Notifikasi WA
async function sendWhatsAppAlert(targetPhone, message) {
    try {
        const token = process.env.FONNTE_TOKEN;
        if (!token) return;
        await axios.post('https://api.fonnte.com/send', {
            target: targetPhone,
            message: message,
        }, {
            headers: { 'Authorization': token }
        });
        console.log(`Notifikasi WA Berhasil Terkirim ke: ${targetPhone}`);
    } catch (err) {
        console.error('Gagal mengirim Notifikasi WA:', err.message);
    }
}

// Static Routes
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/rumah-tangga', (req, res) => res.sendFile(path.join(__dirname, 'rumahtangga.html')));
app.get('/rumahtangga.html', (req, res) => res.sendFile(path.join(__dirname, 'rumahtangga.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));

// API Rumah Tangga
app.get('/api/peminjaman-ruangan', async (req, res) => {
    try {
        const { data, error } = await supabase.from('peminjaman_ruangan').select('*').order('id', { ascending: false });
        if (error) throw error;
        res.json(data || []);
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

        const waMsg = `🏢 *PERMOHONAN PEMINJAMAN RUANGAN BARU*\n\nNama Peminjam: *${nama_peminjam}*\nRuangan: *${ruangan}*\nTanggal: *${tgl_pinjam}*\nJam: *${jam_mulai || '-'} s/d ${jam_selesai || '-'}*\nKeperluan: *${keperluan || '-'}*`;
        sendWhatsAppAlert(TARGET_WA_PHONE, waMsg);

        res.json({ message: "Berhasil!", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/peminjaman-kendaraan', async (req, res) => {
    try {
        const { data, error } = await supabase.from('peminjaman_kendaraan').select('*').order('id', { ascending: false });
        if (error) throw error;
        res.json(data || []);
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

        const waMsg = `🚗 *PERMOHONAN OPERASIONAL KENDARAAN BARU*\n\nDriver: *${nama_driver}*\nKendaraan: *${kendaraan}*\nTanggal: *${tgl_pinjam}*\nTujuan: *${tujuan}*`;
        sendWhatsAppAlert(TARGET_WA_PHONE, waMsg);

        res.json({ message: "Berhasil!", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/backup', async (req, res) => {
    try {
        const { data: inv } = await supabase.from('inventory').select('*');
        const { data: rgn } = await supabase.from('peminjaman_ruangan').select('*');
        const { data: kdr } = await supabase.from('peminjaman_kendaraan').select('*');
        res.setHeader('Content-disposition', 'attachment; filename=backup_sarpras.json');
        res.setHeader('Content-type', 'application/json');
        res.send(JSON.stringify({ inventory: inv || [], peminjaman_ruangan: rgn || [], peminjaman_kendaraan: kdr || [] }, null, 2));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Inventory & Logs
app.get('/api/inventory', async (req, res) => {
    try {
        const { data, error } = await supabase.from('inventory').select('*').order('id', { ascending: true });
        if (error) throw error;
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
        res.status(500).json({ error: err.message });
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

        const finalStockAfter = (item.initial || 0) + updatedIn - updatedOut;

        if (finalStockAfter < 10) {
            const waMsg = `⚠️ *STOK MINIMUM*\n\nBarang: *${item.name}*\nSisa Stok: *${finalStockAfter} unit*`;
            sendWhatsAppAlert(TARGET_WA_PHONE, waMsg);
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
        res.status(500).json({ error: err.message });
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

app.use((req, res) => res.sendFile(path.join(__dirname, 'index.html')));

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
}