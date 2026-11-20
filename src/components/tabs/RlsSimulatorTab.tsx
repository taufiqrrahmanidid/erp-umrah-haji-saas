import React from 'react';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck,
  Building,
  Users,
  Lock,
  Unlock,
  CheckCircle2,
  Terminal,
  Shield,
  Layers,
} from 'lucide-react';
import { Customer, GeneralMaster, RoleCode, User } from '../../types/erp.ts';

interface RlsSimulatorTabProps {
  currentRole: RoleCode;
  onRoleChange: (role: RoleCode) => void;
  customers: Customer[];
  generalMasters: GeneralMaster[];
  users: User[];
  currentBranchCode: string;
}

export const RlsSimulatorTab: React.FC<RlsSimulatorTabProps> = ({
  currentRole,
  onRoleChange,
  customers,
  generalMasters,
  users,
  currentBranchCode,
}) => {
  // Determine current simulated user based on role
  const simulatedUser = React.useMemo(() => {
    switch (currentRole) {
      case 'ADMIN_HQ':
        return users.find((u) => u.username === 'admin_pusat') || users[0];
      case 'ADMIN_BRANCH':
        return users.find((u) => u.username === 'admin_kediri') || users[1];
      case 'AGENT_COORDINATOR':
        return users.find((u) => u.username === 'gus_miftah_coord') || users[2];
      case 'BRANCH_AGENT':
        return users.find((u) => u.username === 'zainal_agen') || users[3];
      case 'JAMAAH':
        return users.find((u) => u.username === 'siti_aminah') || users[6];
      case 'MUTHAWIF':
        return users.find((u) => u.username === 'ust_fatih_muthawif') || users[4];
      case 'MUKIBIN':
        return users.find((u) => u.username === 'thoriq_mukibin') || users[5];
      default:
        return users[0];
    }
  }, [currentRole, users]);

  // Downline helper simulation (mirroring fn_is_user_downline)
  const isDownline = (targetAgentId: string | undefined, callerUserId: string) => {
    if (!targetAgentId) return false;
    if (targetAgentId === callerUserId) return true;
    // Gus Miftah is upline of Zainal Arifin ('usr-downline-01')
    if (callerUserId === 'usr-upline-pondok' && targetAgentId === 'usr-downline-01') {
      return true;
    }
    return false;
  };

  // Filter Customers based on RLS Policy p_customers_isolation
  const rlsFilteredCustomers = React.useMemo(() => {
    return customers.filter((cust) => {
      // 1. Admin HQ sees all
      if (currentRole === 'ADMIN_SAAS' || currentRole === 'ADMIN_HQ') {
        return true;
      }

      // 2. Admin Cabang sees only their branch
      if (currentRole === 'ADMIN_BRANCH') {
        return cust.owner_branch_id === currentBranchCode;
      }

      // 3. Koordinator Agen sees own and downline
      if (currentRole === 'AGENT_COORDINATOR') {
        return isDownline(cust.agent_id, simulatedUser.user_id);
      }

      // 4. Branch Agent sees only own registered
      if (currentRole === 'BRANCH_AGENT') {
        return cust.agent_id === simulatedUser.user_id;
      }

      // 5. Jamaah sees only own self
      if (currentRole === 'JAMAAH') {
        return cust.user_id === simulatedUser.user_id;
      }

      // 6. Field Staff (Muthawif / Mukibin / TL) sees current branch / manifest
      if (['MUTHAWIF', 'TOUR_LEADER', 'MUKIBIN'].includes(currentRole)) {
        return cust.owner_branch_id === currentBranchCode;
      }

      return false;
    });
  }, [customers, currentRole, currentBranchCode, simulatedUser]);

  // Pricing Catalog demonstration (PKG01) showing HPP masking for KSO
  const packageMasters = generalMasters.filter(
    (gm) => gm.head_code === 'PKG01' && gm.child_code !== '*'
  );

  const canSeeRealHpp = currentRole === 'ADMIN_SAAS' || currentRole === 'ADMIN_HQ';

  return (
    <div className="space-y-6">
      {/* Simulation Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Simulasi PostgreSQL Row-Level Security (RLS) &amp; Masking HPP KSO
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Di PostgreSQL native, RLS menyaring baris secara vertikal dan kolom secara horizontal berdasarkan
                session parameter <code className="font-mono text-cyan-400">current_setting(&apos;app.current_role&apos;)</code>.
                Ganti role di bawah ini untuk melihat pergeseran data secara instan!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Ganti Role:</span>
            <select
              aria-label="Pilih Role Simulasi RLS"
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as RoleCode)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="ADMIN_HQ" className="bg-slate-900 text-white">1. ADMIN_HQ (Direktur Pusat)</option>
              <option value="ADMIN_BRANCH" className="bg-slate-900 text-white">2. ADMIN_BRANCH (Kepala Cabang KSO)</option>
              <option value="AGENT_COORDINATOR" className="bg-slate-900 text-white">3. AGENT_COORDINATOR (Gus Miftah / Upline)</option>
              <option value="BRANCH_AGENT" className="bg-slate-900 text-white">4. BRANCH_AGENT (Zainal Arifin / Downline)</option>
              <option value="JAMAAH" className="bg-slate-900 text-white">5. JAMAAH (Hj. Siti Aminah / Self)</option>
              <option value="MUTHAWIF" className="bg-slate-900 text-white">6. MUTHAWIF (Saudi Lapangan)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Current Active Session Info & SQL Statement Preview */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800 text-xs font-bold text-slate-300">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>PostgreSQL Active Session Context (SET LOCAL Variables)</span>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/90 rounded-lg p-3 font-mono text-xs text-emerald-300 border border-slate-800 leading-relaxed">
            <span className="text-slate-400">-- Parameter Session Aktif:</span>
            <br />
            SET LOCAL app.current_tenant_id = <span className="text-amber-300">&apos;11111111-1111-1111-1111-111111111111&apos;</span>;
            <br />
            SET LOCAL app.current_role = <span className="text-amber-300">&apos;{currentRole}&apos;</span>;
            <br />
            SET LOCAL app.current_branch_id = <span className="text-amber-300">&apos;{currentBranchCode}&apos;</span>;
            <br />
            SET LOCAL app.current_user_id = <span className="text-amber-300">&apos;{simulatedUser.user_id}&apos;</span>;
          </div>

          <div className="bg-slate-900/90 rounded-lg p-3 text-xs text-slate-300 border border-slate-800 space-y-1.5">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              Pengguna Aktif: {simulatedUser.full_name}
            </div>
            <p className="text-slate-400 text-[11px]">
              Username: <span className="font-mono text-slate-200">{simulatedUser.username}</span> • Cabang:{' '}
              <span className="font-mono text-slate-200">{simulatedUser.branch_id}</span>
            </p>
            <div className="text-[11px] text-amber-300/90 bg-amber-950/30 p-2 rounded border border-amber-800/40">
              {currentRole === 'ADMIN_HQ' && 'Hak Istimewa: Melihat seluruh cabang, laporan konsolidasi & HPP asli.'}
              {currentRole === 'ADMIN_BRANCH' && 'Hak Terbatas: Terisolasi pada Cabang Kediri (C01). HPP asli HQ disembunyikan.'}
              {currentRole === 'AGENT_COORDINATOR' && 'Pohon Agen: Melihat jamaah binaan sendiri & seluruh downline (Zainal).'}
              {currentRole === 'BRANCH_AGENT' && 'Hak Tunggal: Hanya melihat jamaah yang didaftarkan langsung oleh dirinya.'}
              {currentRole === 'JAMAAH' && 'Privasi Jamaah: Hanya dapat melihat 1 baris miliknya sendiri (Hj. Siti Aminah).'}
              {currentRole === 'MUTHAWIF' && 'Operasional Saudi: Melihat daftar jamaah kloter untuk pelaksanaan ibadah.'}
            </div>
          </div>
        </div>
      </div>

      {/* Part A: KSO Pricing & HPP Masking Demonstration */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-white text-sm">
              Proteksi Rahasia Dagang: Masking HPP Asli HQ vs Harga Nett KSO
            </h4>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              VIEW v_kso_package_pricing_secured
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {canSeeRealHpp ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800">
                <Unlock className="w-3.5 h-3.5" /> HPP Asli Terbuka (Admin HQ)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400 font-semibold bg-rose-950/40 px-2 py-1 rounded border border-rose-800">
                <Lock className="w-3.5 h-3.5" /> HPP Asli Disembunyikan (Cabang KSO)
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-2">Kode Paket</th>
                <th className="px-4 py-2">Nama Paket Umrah</th>
                <th className="px-4 py-2 text-right">
                  HPP Asli HQ <span className="text-slate-500 font-normal">(cd1)</span>
                </th>
                <th className="px-4 py-2 text-right text-cyan-300">
                  Harga Nett KSO <span className="text-slate-500 font-normal">(cd2)</span>
                </th>
                <th className="px-4 py-2 text-right text-emerald-300">
                  Harga Publish Jamaah <span className="text-slate-500 font-normal">(cd3)</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono">
              {packageMasters.map((pkg) => {
                const hppNumber = Number(pkg.cd1 || 0);
                const nettKso = Number(pkg.cd2 || 0);
                const publishPrice = Number(pkg.cd3 || 0);

                return (
                  <tr key={pkg.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-bold text-cyan-400">{pkg.child_code}</td>
                    <td className="px-4 py-3 font-sans font-medium text-white">{pkg.description}</td>
                    <td className="px-4 py-3 text-right">
                      {canSeeRealHpp ? (
                        <span className="text-amber-400 font-bold">
                          Rp {hppNumber.toLocaleString('id-ID')}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic flex items-center justify-end gap-1 font-sans">
                          <EyeOff className="w-3.5 h-3.5 text-rose-400" /> [DISEMBUNYIKAN HQ]
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-cyan-300 font-bold">
                      Rp {nettKso.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-bold">
                      Rp {publishPrice.toLocaleString('id-ID')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Part B: Customer Row-Level Security Output */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Hasil Eksekusi Query <code className="text-emerald-400 font-mono">SELECT * FROM customers</code>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Menampilkan {rlsFilteredCustomers.length} dari total {customers.length} baris data jamaah
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-300 border border-slate-700">
            RLS Active Policy: <span className="text-emerald-400 font-mono">p_customers_isolation</span>
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-3 py-2">Nama Jamaah</th>
                <th className="px-3 py-2">Cabang Pemilik</th>
                <th className="px-3 py-2">Agen Pendaftar</th>
                <th className="px-3 py-2">No. Paspor</th>
                <th className="px-3 py-2">Alasan Lolos Filter RLS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/60">
              {rlsFilteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Tidak ada baris data yang lolos filter kebijakan RLS untuk role{' '}
                    <span className="text-amber-400 font-mono">{currentRole}</span>.
                  </td>
                </tr>
              ) : (
                rlsFilteredCustomers.map((cust) => {
                  let reasonText = '';
                  if (currentRole === 'ADMIN_HQ') {
                    reasonText = 'Admin HQ memiliki izin global SELECT seluruh cabang';
                  } else if (currentRole === 'ADMIN_BRANCH') {
                    reasonText = `Sesuai owner_branch_id = '${currentBranchCode}'`;
                  } else if (currentRole === 'AGENT_COORDINATOR') {
                    reasonText = cust.agent_id === simulatedUser.user_id
                      ? 'Jamaah binaan langsung koordinator'
                      : 'Jamaah binaan downline (Zainal Arifin) via Downline Tree CTE';
                  } else if (currentRole === 'BRANCH_AGENT') {
                    reasonText = `Tercatat dengan agent_id = '${simulatedUser.user_id}'`;
                  } else if (currentRole === 'JAMAAH') {
                    reasonText = `Tercatat dengan user_id = '${simulatedUser.user_id}' (Self Portal)`;
                  } else {
                    reasonText = `Terdaftar dalam kloter penugasan lapangan ${currentBranchCode}`;
                  }

                  return (
                    <tr key={cust.customer_id} className="hover:bg-slate-800/40">
                      <td className="px-3 py-2 font-bold text-white">{cust.full_name}</td>
                      <td className="px-3 py-2 font-mono text-cyan-400">{cust.owner_branch_id}</td>
                      <td className="px-3 py-2 text-slate-300">
                        {cust.agent_name || <span className="text-slate-500">Pusat Mandiri</span>}
                      </td>
                      <td className="px-3 py-2 font-mono text-amber-300">{cust.passport_number}</td>
                      <td className="px-3 py-2 text-emerald-400 flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{reasonText}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
