import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';

export const Governance = () => {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgPrivileged, setNewOrgPrivileged] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Inspector states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOrgs = async () => {
    try {
      setLoading(true);
      const data = await api.organizations.list();
      const loadedOrgs = Array.isArray(data) ? data : [];
      setOrganizations(loadedOrgs);
      
      // Auto-select first org or default
      if (loadedOrgs.length > 0) {
        const firstOrg = loadedOrgs[0];
        setSelectedEntity({
          id: firstOrg.id,
          name: firstOrg.name,
          type: 'ORGANIZATION',
          status: firstOrg.privileged_tools ? 'PRIVILEGED' : 'ACTIVE',
          cpu: firstOrg.privileged_tools ? '18.4%' : '2.1%',
          mem: firstOrg.privileged_tools ? '12.8%' : '1.4%',
          policies: firstOrg.privileged_tools ? 45 : 12,
          active: 'ACTIVE NOW',
          icon: 'corporate_fare',
          color: firstOrg.privileged_tools ? 'text-tertiary' : 'text-primary',
          raw: firstOrg
        });
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    try {
      setIsCreating(true);
      const newOrg = await api.organizations.create({
        name: newOrgName,
        privileged_tools: newOrgPrivileged
      });
      
      // Refresh list
      const updatedData = await api.organizations.list();
      const loadedOrgs = Array.isArray(updatedData) ? updatedData : [];
      setOrganizations(loadedOrgs);
      
      // Select the newly created org
      const found = loadedOrgs.find(o => o.id === newOrg.id) || newOrg;
      setSelectedEntity({
        id: found.id,
        name: found.name,
        type: 'ORGANIZATION',
        status: found.privileged_tools ? 'PRIVILEGED' : 'ACTIVE',
        cpu: found.privileged_tools ? '18.4%' : '2.1%',
        mem: found.privileged_tools ? '12.8%' : '1.4%',
        policies: found.privileged_tools ? 45 : 12,
        active: 'ACTIVE NOW',
        icon: 'corporate_fare',
        color: found.privileged_tools ? 'text-tertiary' : 'text-primary',
        raw: found
      });
      
      setIsCreateModalOpen(false);
      setNewOrgName('');
      setNewOrgPrivileged(false);
    } catch (error) {
      console.error('Failed to create organization:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteOrg = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete this organization?`)) return;
    try {
      setIsDeleting(true);
      await api.organizations.delete(id);
      
      // Refresh list
      const updatedData = await api.organizations.list();
      const loadedOrgs = Array.isArray(updatedData) ? updatedData : [];
      setOrganizations(loadedOrgs);
      
      if (loadedOrgs.length > 0) {
        const firstOrg = loadedOrgs[0];
        setSelectedEntity({
          id: firstOrg.id,
          name: firstOrg.name,
          type: 'ORGANIZATION',
          status: firstOrg.privileged_tools ? 'PRIVILEGED' : 'ACTIVE',
          cpu: firstOrg.privileged_tools ? '18.4%' : '2.1%',
          mem: firstOrg.privileged_tools ? '12.8%' : '1.4%',
          policies: firstOrg.privileged_tools ? 45 : 12,
          active: 'ACTIVE NOW',
          icon: 'corporate_fare',
          color: firstOrg.privileged_tools ? 'text-tertiary' : 'text-primary',
          raw: firstOrg
        });
      } else {
        setSelectedEntity(null);
      }
    } catch (error) {
      console.error('Failed to delete organization:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePrivilege = async (org: any) => {
    try {
      const updated = await api.organizations.update(org.id, {
        privileged_tools: !org.privileged_tools
      });
      
      // Update local state list
      setOrganizations(prev => prev.map(o => o.id === org.id ? updated : o));
      
      // Update selectedEntity details
      setSelectedEntity({
        id: updated.id,
        name: updated.name,
        type: 'ORGANIZATION',
        status: updated.privileged_tools ? 'PRIVILEGED' : 'ACTIVE',
        cpu: updated.privileged_tools ? '18.4%' : '2.1%',
        mem: updated.privileged_tools ? '12.8%' : '1.4%',
        policies: updated.privileged_tools ? 45 : 12,
        active: 'ACTIVE NOW',
        icon: 'corporate_fare',
        color: updated.privileged_tools ? 'text-tertiary' : 'text-primary',
        raw: updated
      });
    } catch (error) {
      console.error('Failed to toggle privileged tools:', error);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Compile entities: dynamic database organizations + mock projects/service accounts
  const mockEntities = [
    { id: 'prj_neural_scan', name: 'PRJ-NEURAL-SCAN', type: 'PROJECT', status: 'PROVISIONED', cpu: '12.5%', mem: '8.4%', policies: 28, active: '4.5m AGO', icon: 'folder_managed', color: 'text-primary' },
    { id: 'svc_auth_router', name: 'SVC-AUTH-ROUTER', type: 'SVC_ACCOUNT', status: 'PEAK_LOAD', cpu: '92.1%', mem: '12.0%', policies: 8, active: 'SYNCED', icon: 'smart_toy', color: 'text-tertiary' },
    { id: 'prj_legacy_backup', name: 'PRJ-LEGACY-BACKUP', type: 'PROJECT', status: 'QUOTA_EXCD', cpu: '--', mem: '--', policies: 5, active: 'LOCKED', icon: 'lock_open', color: 'text-error' },
    { id: 'admin_core_root', name: 'ADMIN-CORE-ROOT', type: 'SVC_ACCOUNT', status: 'STABLE', cpu: '0.1%', mem: '2.0%', policies: 9999, active: 'STEADY', icon: 'shield_person', color: 'text-on-surface-variant' }
  ];

  const dbEntities = organizations.map(org => ({
    id: org.id,
    name: org.name,
    type: 'ORGANIZATION',
    status: org.privileged_tools ? 'PRIVILEGED' : 'ACTIVE',
    cpu: org.privileged_tools ? '18.4%' : '2.1%',
    mem: org.privileged_tools ? '12.8%' : '1.4%',
    policies: org.privileged_tools ? 45 : 12,
    active: 'ACTIVE NOW',
    icon: 'corporate_fare',
    color: org.privileged_tools ? 'text-tertiary' : 'text-primary',
    raw: org
  }));

  const allEntities = [...dbEntities, ...mockEntities];

  // Helper to generate the policy JSON
  const renderManifest = (entity: any) => {
    if (!entity) return '{}';
    if (entity.raw) {
      // Real database organization
      const actions = ["compute:v1:*", "iam:global:read"];
      if (entity.raw.privileged_tools) {
        actions.push("privileged:tool:*");
      }
      return JSON.stringify({
        Version: "2026-05-21",
        Statement: [
          {
            Effect: "Allow",
            Action: actions,
            Resource: `arn:dodo:iam::${entity.id}:*`
          }
        ]
      }, null, 2);
    } else {
      // Mock entities
      return JSON.stringify({
        Version: "2026-05-21",
        Statement: [
          {
            Effect: entity.status === 'LOCKED' ? "Deny" : "Allow",
            Action: entity.type === 'PROJECT' ? ["compute:project:*", "storage:project:*"] : ["iam:global:*"],
            Resource: `arn:dodo:iam::${entity.id}:*`
          }
        ]
      }, null, 2);
    }
  };

  return (
    <div className="flex h-full overflow-hidden -m-8">
      {/* Center Workspace */}
      <section className="flex-1 flex flex-col min-w-0 bg-surface-container-lowest overflow-y-auto no-scrollbar relative">
        {/* Header Section */}
        <div className="p-6 border-b border-outline-variant flex justify-between items-end bg-surface/50 backdrop-blur-md sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-bold text-on-surface mb-1 uppercase tracking-tight">IAM & Governance</h1>
            <p className="text-sm text-on-surface-variant">System-wide entity oversight and resource isolation control.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchOrgs}
              className="px-4 h-9 flex items-center gap-2 bg-surface-container border border-outline-variant hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Sync Grid</span>
            </button>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 h-9 flex items-center gap-2 bg-primary text-on-primary hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="text-[10px] font-bold uppercase tracking-widest font-mono">New Entity</span>
            </button>
          </div>
        </div>

        {/* Quota Management Bento Grid */}
        <div className="p-6 grid grid-cols-12 gap-6 border-b border-outline-variant">
          <div className="col-span-12">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4 font-mono">System Quota Aggregation</h2>
          </div>
          <QuotaCard label="COMPUTE_THREADS" percent={82} active="4.2k" limit="5.0k" color="bg-primary" />
          <QuotaCard label="MEM_PROVISIONED" percent={94} active="1.8TB" limit="2.0TB" color="bg-tertiary" />
          <QuotaCard label="IOPS_GLOBAL" percent={12} active="125k" limit="1.0M" color="bg-on-surface" />
        </div>

        {/* High-Density Entity Table */}
        <div className="flex-1 overflow-x-auto">
          {loading && allEntities.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="font-mono-label text-xs uppercase tracking-widest text-on-surface-variant">Querying entities...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-high border-b border-outline-variant sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono">Entity Name</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono">Type</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono">Status</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono text-right">CPU Util</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono text-right">Mem Util</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono text-right">Policies</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono">Last Active</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm text-on-surface divide-y divide-outline-variant/30">
                {allEntities.map((entity) => (
                  <EntityRow 
                    key={entity.id} 
                    name={entity.name} 
                    type={entity.type} 
                    status={entity.status} 
                    cpu={entity.cpu} 
                    mem={entity.mem} 
                    policies={String(entity.policies)} 
                    active={entity.active} 
                    icon={entity.icon} 
                    color={entity.color}
                    isSelected={selectedEntity?.id === entity.id}
                    onClick={() => setSelectedEntity(entity)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Right-Side Policy Inspector Panel */}
      <AnimatePresence mode="wait">
        {selectedEntity && (
          <aside className="w-[360px] h-full bg-surface-container flex flex-col z-20 shrink-0 border-l border-outline-variant">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">policy</span>
                <h3 className="text-[10px] font-bold uppercase tracking-widest font-mono">Policy Inspector</h3>
              </div>
              <button 
                onClick={() => setSelectedEntity(null)}
                className="material-symbols-outlined text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                close
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-6 flex-1 overflow-y-auto no-scrollbar">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono">Target Entity</span>
                <div className="text-xl font-bold text-primary flex items-center gap-2 truncate">
                  <span className="material-symbols-outlined text-lg">{selectedEntity.icon}</span>
                  {selectedEntity.name}
                </div>
                <div className="text-[9px] text-on-surface-variant uppercase font-mono">Type: {selectedEntity.type}</div>
              </div>

              {/* Identity and Management for DB entities */}
              {selectedEntity.raw && (
                <div className="bg-surface-container-low border border-outline-variant/50 p-4 rounded-lg space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant font-mono block">Actions & Controls</span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button 
                        onClick={() => handleTogglePrivilege(selectedEntity.raw)}
                        className={`px-3 py-1.5 rounded text-[9px] font-bold uppercase font-mono tracking-wider border transition-colors flex items-center gap-1 ${
                          selectedEntity.raw.privileged_tools 
                            ? 'bg-tertiary/10 border-tertiary text-tertiary hover:bg-tertiary/20' 
                            : 'bg-surface-container border-outline-variant text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs">vpn_key</span>
                        {selectedEntity.raw.privileged_tools ? 'Revoke Privilege' : 'Grant Privilege'}
                      </button>
                      <button 
                        onClick={() => handleDeleteOrg(selectedEntity.id)}
                        disabled={isDeleting}
                        className="px-3 py-1.5 rounded text-[9px] font-bold uppercase font-mono tracking-wider bg-error/10 border border-error text-error hover:bg-error/20 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">delete</span>
                        {isDeleting ? 'Deleting...' : 'Delete Entity'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono">Permission Manifest</span>
                  <button 
                    onClick={() => handleCopyId(selectedEntity.id)}
                    className="flex items-center gap-1 text-primary hover:underline text-[10px] font-mono cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">
                      {copiedId === selectedEntity.id ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedId === selectedEntity.id ? 'COPIED' : 'COPY ID'}</span>
                  </button>
                </div>
                <div className="flex-1 bg-surface-container-lowest border border-outline-variant p-4 overflow-hidden flex flex-col rounded-lg max-h-[220px]">
                  <pre className="font-mono text-[10px] text-on-surface-variant overflow-y-auto leading-relaxed select-all">
                    {renderManifest(selectedEntity)}
                  </pre>
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono">Identity Trace Logs</span>
                <div className="space-y-2">
                  <TraceLog label={selectedEntity.raw ? "DB_SYNC_OK" : "MOCK_SYNC_OK"} time="Just Now" color="text-primary" />
                  <TraceLog label="POLICY_VERIFICATION" time="0.1s Ago" color="text-primary" />
                  {selectedEntity.raw?.privileged_tools && (
                    <TraceLog label="PRIVILEGED_GRANT" time="Sync" color="text-tertiary" />
                  )}
                </div>
              </div>

              <div className="relative w-full h-24 border border-outline-variant bg-surface-container-low overflow-hidden group rounded-lg shrink-0">
                 <div className="absolute inset-0 bg-primary/10 opacity-30"></div>
                 <div className="absolute inset-0 bg-linear-to-t from-surface-container-low to-transparent"></div>
                 <div className="absolute bottom-3 left-3">
                   <div className="text-[9px] font-mono font-bold text-primary uppercase">Node Physical Location</div>
                   <div className="text-[11px] font-mono text-on-surface">RACK_A9 // DC_NORTH_02</div>
                 </div>
              </div>
            </div>
            <div className="p-6 mt-auto border-t border-outline-variant bg-surface-container-low">
              <div className="text-[9px] font-mono font-bold text-on-surface-variant uppercase mb-2">Entity ID</div>
              <div className="text-[10px] font-mono text-on-surface bg-surface-container-lowest p-2 border border-outline-variant rounded truncate">
                {selectedEntity.id}
              </div>
            </div>
          </aside>
        )}
      </AnimatePresence>

      {/* New Entity Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isCreating) {
                  setIsCreateModalOpen(false);
                  setNewOrgName('');
                  setNewOrgPrivileged(false);
                }
              }}
              className="absolute inset-0"
            />
            {/* Content Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-surface-container border border-outline-variant rounded-xl p-6 w-full max-w-md shadow-2xl relative z-10 font-mono"
            >
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_circle</span>
                Create New Entity (Org)
              </h3>
              
              <form onSubmit={handleCreateOrg} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                    Organization Name
                  </label>
                  <input 
                    type="text"
                    required
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="e.g. ORG-OMEGA-CORE"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-surface-container-low rounded border border-outline-variant/30">
                  <input 
                    type="checkbox"
                    id="privileged"
                    checked={newOrgPrivileged}
                    onChange={(e) => setNewOrgPrivileged(e.target.checked)}
                    className="w-4 h-4 accent-primary cursor-pointer mt-0.5"
                  />
                  <label htmlFor="privileged" className="cursor-pointer select-none">
                    <span className="text-[10px] font-bold text-on-surface uppercase block">
                      Privileged Tools
                    </span>
                    <span className="text-[9px] text-on-surface-variant leading-relaxed">
                      Grants system-wide execution of secure/destructive commands and advanced model capabilities.
                    </span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button"
                    disabled={isCreating}
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setNewOrgName('');
                      setNewOrgPrivileged(false);
                    }}
                    className="px-4 py-2 border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-on-surface-variant transition-colors uppercase text-[10px] font-bold tracking-wider rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-2 bg-primary text-on-primary hover:opacity-90 transition-opacity uppercase text-[10px] font-bold tracking-wider rounded flex items-center gap-1.5 cursor-pointer"
                  >
                    {isCreating ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></span>
                        Creating...
                      </>
                    ) : (
                      'Create Org'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const QuotaCard = ({ label, percent, active, limit, color }: { label: string, percent: number, active?: boolean | string, limit?: string | number, color: string }) => (
  <div className="col-span-4 p-4 bg-surface-container border border-outline-variant flex flex-col gap-4 rounded-lg">
    <div className="flex justify-between items-center">
      <span className="text-[11px] font-mono text-on-surface font-bold">{label}</span>
      <span className={`text-[11px] font-mono font-bold ${percent > 90 ? 'text-error' : percent > 75 ? 'text-primary' : 'text-on-surface'}`}>{percent}%</span>
    </div>
    <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden">
      <div className={`h-full transition-all duration-1000 ${color}`} style={{ width: `${percent}%` }}></div>
    </div>
    <div className="flex justify-between text-[9px] font-mono font-bold uppercase text-on-surface-variant">
      <span>{active} Actv</span>
      <span>{limit} Limit</span>
    </div>
  </div>
);

interface EntityRowProps {
  name: string;
  type: string;
  status: string;
  cpu: string;
  mem: string;
  policies: string;
  active?: boolean | string;
  icon: string;
  color: string;
  isSelected: boolean;
  onClick: () => void;
}

const EntityRow = ({ name, type, status, cpu, mem, policies, active, icon, color, isSelected, onClick }: EntityRowProps) => (
  <tr 
    onClick={onClick}
    className={`hover:bg-surface-container transition-colors group cursor-pointer ${isSelected ? 'bg-surface-container-high' : ''}`}
  >
    <td className="px-6 py-3 flex items-center gap-2">
      <span className={`material-symbols-outlined text-[16px] ${color}`}>{icon}</span>
      <span className="font-bold">{name}</span>
    </td>
    <td className="px-6 py-3 text-on-surface-variant text-[11px]">{type}</td>
    <td className="px-6 py-3">
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${
          status.includes('ACTIVE') || status.includes('SYNCED') || status.includes('STABLE') || status.includes('PRIVILEGED') 
            ? 'bg-emerald-500' 
            : status.includes('PEAK') 
              ? 'bg-tertiary' 
              : 'bg-error'
        }`}></div>
        <span className="text-[11px] font-bold">{status}</span>
      </div>
    </td>
    <td className={`px-6 py-3 text-right ${cpu.includes('9') ? 'text-tertiary' : ''}`}>{cpu}</td>
    <td className="px-6 py-3 text-right">{mem}</td>
    <td className="px-6 py-3 text-right font-bold">{policies}</td>
    <td className="px-6 py-3 text-on-surface-variant text-[11px] font-bold">{active}</td>
    <td className="px-6 py-3 text-right">
      <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-lg cursor-pointer">
        chevron_right
      </button>
    </td>
  </tr>
);

const TraceLog = ({ label, time, color }: { label: string, time: string, color: string }) => (
  <div className="flex items-center justify-between p-2 border-b border-outline-variant/30 hover:bg-surface-container transition-colors rounded">
    <span className={`text-[10px] font-mono font-bold ${color}`}>{label}</span>
    <span className="text-[10px] font-mono text-on-surface-variant">{time}</span>
  </div>
);
