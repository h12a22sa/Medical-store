import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Activity,
  User,
  Lock,
  Key,
  CheckCircle2,
  Trash2,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { User as UserType, UserRole } from '../types';
import { formatDateTime } from '../utils/helpers';

export const StaffView: React.FC = () => {
  const {
    users,
    currentUser,
    setCurrentUser,
    addUser,
    auditLogs,
  } = usePharmacy();

  const [activeTab, setActiveTab] = useState<'staff' | 'audit'>('staff');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // New User Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('CASHIER');
  const [pin, setPin] = useState('');

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !pin) return;

    addUser({
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@awanpharma.com`,
      role,
      pin,
      isActive: true,
    });

    setShowAddUserModal(false);
    setName('');
    setEmail('');
    setPin('');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                Staff Roles & System Audit Logs
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage user accounts, switch active cashier profiles, and track all operations in the immutable audit trail
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex rounded-2xl bg-slate-100/80 p-1 dark:bg-slate-800">
            <button
              onClick={() => setActiveTab('staff')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Staff Accounts ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Audit Trail ({auditLogs.length})
            </button>
          </div>

          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-colors cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Staff User</span>
          </button>
        </div>
      </div>

      {activeTab === 'staff' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map(u => {
            const isCurrent = currentUser?.id === u.id;
            return (
              <div
                key={u.id}
                className={`flex flex-col justify-between rounded-3xl border p-5 shadow-xs transition-all ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-50/20 dark:border-emerald-500 dark:bg-emerald-950/20 ring-1 ring-emerald-500/20'
                    : 'border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={`rounded-lg px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                          u.role === 'ADMIN'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : u.role === 'PHARMACIST'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : u.role === 'MANAGER'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {u.role}
                      </span>
                      <h3 className="mt-2 font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        {u.name}
                        {isCurrent && (
                          <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-black text-white">
                            Active
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-xs">
                      {u.name[0]}
                    </div>
                  </div>

                  <div className="mt-4 space-y-1 text-xs text-slate-500 font-medium">
                    <p>Security PIN: ••••</p>
                    <p>Status: Active Account</p>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800 flex justify-end">
                  {!isCurrent ? (
                    <button
                      onClick={() => setCurrentUser(u)}
                      className="rounded-xl bg-slate-100/80 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-600 transition-all cursor-pointer"
                    >
                      Switch to this User
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Current Session
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Audit Trail Table */
        <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden dark:border-slate-800/80 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">Timestamp</th>
                  <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Action Performed</th>
                  <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[10px]">Details & Record</th>
                  <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[10px]">User Account</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      <p className="font-bold text-xs text-slate-600 dark:text-slate-300">No audit trail records found.</p>
                    </td>
                  </tr>
                ) : (
                  auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-900 dark:text-white font-medium">{log.details}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">{log.userName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Create Staff Member</h3>

            <form onSubmit={handleSaveUser} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Bilal Awan"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Role / Permissions *</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="CASHIER">Cashier (POS Billing & Returns)</option>
                  <option value="PHARMACIST">Pharmacist (Inventory & Batches)</option>
                  <option value="MANAGER">Store Manager (Purchases & Finance)</option>
                  <option value="ADMIN">Administrator (Full System Access)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email / Username</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="bilal@awanpharma.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">POS Login PIN (4 Digits) *</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="1234"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-mono font-bold text-center tracking-widest text-base dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="rounded-2xl px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-600 px-5 py-2 font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-colors cursor-pointer"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
