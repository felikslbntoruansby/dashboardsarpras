// auth-audit.js
const AUTH_SUPABASE_URL = 'https://xlompxgjdifbthgpkphv.supabase.co';
const AUTH_SUPABASE_KEY = 'sb_publishable_1Qpe36iF1lwCDmfOBHJmlg_hxJUSjJ4';

let authDb = null;
if (window.supabase && typeof window.supabase.createClient === 'function') {
  authDb = window.supabase.createClient(AUTH_SUPABASE_URL, AUTH_SUPABASE_KEY);
}
window.currentUserProfile = null;

function getLoginUrl(isLogout = false) {
  const base = window.location.protocol === 'file:' ? 'login.html' : '/login.html';
  return isLogout ? `${base}?logout=1` : base;
}

// Fungsi Logout Utama (Bisa dipanggil dari tombol mana saja)
window.logoutMonsarpras = window.logoutSistem = async function (event) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
    event.stopPropagation();
  }

  // 1. Panggil signOut Supabase (scope local agar instan tanpa macet jaringan)
  if (authDb && authDb.auth) {
    try {
      await Promise.race([
        authDb.auth.signOut({ scope: 'local' }),
        new Promise(resolve => setTimeout(resolve, 600))
      ]);
    } catch (err) {
      console.warn('SignOut warning:', err);
    }
  }

  // 2. Bersihkan seluruh token sesi Supabase di localStorage & sessionStorage
  try {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('sb-') || k.includes('supabase')) localStorage.removeItem(k);
    });
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {}

  // 3. Paksa pindah langsung ke halaman login
  window.location.href = getLoginUrl(true);
};

// Inisialisasi Sesi & Hak Akses
async function initRoleAccess() {
  renderLogoutBelowKiosk();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('kiosk') === '1') {
    return;
  }

  if (!authDb) {
    console.error('Library @supabase/supabase-js belum dimuat sebelum auth-audit.js');
    return;
  }

  const { data: { session }, error: sessionErr } = await authDb.auth.getSession();

  if (sessionErr || !session) {
    window.location.replace(getLoginUrl(false));
    return;
  }

  const { data: profile, error: profErr } = await authDb
    .from('user_profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (profErr || !profile) {
    alert('Profil peran tidak ditemukan di user_profiles. Silakan hubungi Super Admin.');
    await authDb.auth.signOut({ scope: 'local' });
    window.location.replace(getLoginUrl(true));
    return;
  }

  window.currentUserProfile = profile;
  renderUserBadgeSidebar(profile, session.user.email);
  applyRolePermissions(profile.role);

  const observer = new MutationObserver(() => applyRolePermissions(profile.role));
  observer.observe(document.body, { childList: true, subtree: true });
}

function renderLogoutBelowKiosk() {
  if (document.getElementById('btn-sidebar-logout') || document.querySelector('aside button[onclick*="logoutMonsarpras"]')) {
    return;
  }

  // Mendukung link kiosk=1, tombol enterKioskMode, maupun tombol toggleKioskMode
  const kioskBtn = document.querySelector(
    'aside a[href*="kiosk=1"], aside button[onclick*="enterKioskMode"], aside button[onclick*="toggleKioskMode"]'
  );

  if (kioskBtn) {
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'btn-sidebar-logout';
    logoutBtn.type = 'button';
    logoutBtn.addEventListener('click', (e) => window.logoutMonsarpras(e));
    logoutBtn.className = 'w-full py-2.5 px-3.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer mt-2';
    logoutBtn.innerHTML = `
      <i class="fa-solid fa-right-from-bracket"></i>
      <span>Keluar / Logout</span>
    `;
    kioskBtn.insertAdjacentElement('afterend', logoutBtn);
  }
}

function applyRolePermissions(role) {
  if (role !== 'super_admin') {
    document.querySelectorAll('.role-admin-only').forEach(el => {
      el.style.display = 'none';
    });
  }

  if (role === 'viewer') {
    document.querySelectorAll('.role-operator-action').forEach(el => {
      el.disabled = true;
      el.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
      el.title = 'Mode Pimpinan / Viewer (Hanya Lihat)';
    });
  }
}

function renderUserBadgeSidebar(profile, email) {
  const sidebar = document.querySelector('aside');
  if (!sidebar || document.getElementById('user-profile-box')) return;

  const roleLabels = {
    super_admin: { text: 'Super Admin', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    teknisi: { text: 'Teknisi', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
    viewer: { text: 'Pimpinan', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' }
  };

  const badge = roleLabels[profile.role] || roleLabels.viewer;
  const canViewAudit = profile.role === 'super_admin' || profile.role === 'viewer';

  const box = document.createElement('div');
  box.id = 'user-profile-box';
  box.className = 'p-3 mx-3 mb-2 rounded-xl bg-slate-800/95 border border-slate-700 text-slate-200 space-y-2 shrink-0';
  box.innerHTML = `
    <div class="flex items-center justify-between gap-2">
      <div class="min-w-0">
        <p class="text-xs font-semibold text-white truncate">${profile.nama_lengkap}</p>
        <p class="text-[11px] text-slate-400 truncate">${profile.jabatan || email}</p>
      </div>
      <span class="px-2 py-0.5 text-[10px] font-medium rounded-full border ${badge.color} shrink-0">
        ${badge.text}
      </span>
    </div>
    ${canViewAudit ? `
      <button type="button" onclick="bukaModalAuditLog()" class="w-full py-1.5 px-3 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-200 border border-slate-600/60 text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer">
        <span>📋 Jejak Audit (Log)</span>
      </button>
    ` : ''}
  `;

  const footerSidebar = sidebar.lastElementChild;
  if (footerSidebar) {
    sidebar.insertBefore(box, footerSidebar);
  } else {
    sidebar.appendChild(box);
  }
}

window.catatLogAktivitas = async function ({ modul, aksi, targetData, detail = {} }) {
  if (!window.currentUserProfile || !authDb) return;

  const { error } = await authDb.from('activity_logs').insert([{
    user_id: window.currentUserProfile.id,
    user_name: window.currentUserProfile.nama_lengkap,
    user_role: window.currentUserProfile.role,
    modul: modul,
    aksi: aksi,
    target_data: targetData,
    detail: detail
  }]);

  if (error) console.error('Gagal mencatat log aktivitas:', error.message);
};

window.bukaModalAuditLog = async function () {
  if (!authDb) return;
  let modal = document.getElementById('modal-audit-log');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-audit-log';
    modal.className = 'fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 class="text-base font-bold text-slate-800">Jejak Audit & Riwayat Aktivitas Sistem</h3>
            <p class="text-xs text-slate-500">Menampilkan 50 aktivitas perubahan data terbaru di MONSARPRAS</p>
          </div>
          <button type="button" onclick="document.getElementById('modal-audit-log').classList.add('hidden')" class="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold">
            Tutup ✕
          </button>
        </div>
        <div id="audit-log-body" class="p-6 overflow-y-auto flex-1 text-sm text-slate-600">
          Memuat riwayat aktivitas...
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    modal.classList.remove('hidden');
  }

  const container = document.getElementById('audit-log-body');
  container.innerHTML = '<p class="text-center py-8 text-slate-400">Memuat data log dari Supabase...</p>';

  const { data: logs, error } = await authDb
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    container.innerHTML = `<p class="text-rose-600">Gagal memuat log: ${error.message}</p>`;
    return;
  }

  if (!logs || logs.length === 0) {
    container.innerHTML = '<p class="text-center py-8 text-slate-400">Belum ada aktivitas yang tercatat.</p>';
    return;
  }

  container.innerHTML = `
    <div class="overflow-x-auto border border-slate-200 rounded-xl">
      <table class="w-full text-left border-collapse text-xs">
        <thead class="bg-slate-100 text-slate-600 uppercase font-semibold border-b border-slate-200">
          <tr>
            <th class="py-3 px-4">Waktu</th>
            <th class="py-3 px-4">Petugas</th>
            <th class="py-3 px-4">Modul</th>
            <th class="py-3 px-4">Aksi</th>
            <th class="py-3 px-4">Data yang Diubah</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${logs.map(log => {
            const waktu = new Date(log.created_at).toLocaleString('id-ID', {
              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            return `
              <tr class="hover:bg-slate-50">
                <td class="py-2.5 px-4 whitespace-nowrap text-slate-500">${waktu}</td>
                <td class="py-2.5 px-4 font-medium text-slate-800">
                  ${log.user_name}
                  <span class="block text-[10px] text-slate-400 uppercase">${log.user_role}</span>
                </td>
                <td class="py-2.5 px-4 text-slate-700">${log.modul}</td>
                <td class="py-2.5 px-4">
                  <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                    ${log.aksi}
                  </span>
                </td>
                <td class="py-2.5 px-4 text-slate-700">${log.target_data}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRoleAccess);
} else {
  initRoleAccess();
}