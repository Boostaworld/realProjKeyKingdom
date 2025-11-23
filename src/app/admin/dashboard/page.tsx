"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface ApiKey {
  id: string;
  name: string | null;
  type: string;
  keyPreview: string;
  totalRequests: number;
  lastUsedAt: Date | null;
  createdAt: Date;
  revoked: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);

  // Check auth
  useEffect(() => {
    if (!localStorage.getItem("admin_logged_in")) {
      router.push("/admin/login");
    }
  }, [router]);

  // Fetch API keys
  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      // For now, fetch directly - in production, this would use proper auth
      const response = await fetch("/api/admin/api-keys", {
        headers: {
          Authorization: "Bearer demo_token", // Placeholder
          "X-Admin-Secret": process.env.NEXT_PUBLIC_ADMIN_SECRET || "demo",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.data?.apiKeys || []);
      }
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    localStorage.removeItem("admin_email");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#0B0E11]">
      {/* Header */}
      <header className="bg-[#151A21] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Key Kingdom Admin
              </h1>
              <p className="text-sm text-gray-400">API Key Management</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#151A21] rounded-xl p-6 border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">Total API Keys</p>
            <p className="text-3xl font-bold text-white">{apiKeys.length}</p>
          </div>
          <div className="bg-[#151A21] rounded-xl p-6 border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">Active Keys</p>
            <p className="text-3xl font-bold text-green-400">
              {apiKeys.filter((k) => !k.revoked).length}
            </p>
          </div>
          <div className="bg-[#151A21] rounded-xl p-6 border border-gray-800">
            <p className="text-sm text-gray-400 mb-1">Total Requests</p>
            <p className="text-3xl font-bold text-[#5865F2]">
              {apiKeys.reduce((sum, k) => sum + k.totalRequests, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* API Keys Table */}
        <div className="bg-[#151A21] rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">API Keys</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-semibold rounded-lg transition-colors"
            >
              + New Key
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">
              Loading...
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No API keys yet. Create one to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1E2329]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Requests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Last Used
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {apiKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-[#1E2329] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-white">
                          {key.name || "Unnamed Key"}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#5865F2]/10 text-[#5865F2]">
                          {key.type === "discord_bot" ? "Discord" : "Admin"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-xs text-gray-400 font-mono">
                          {key.keyPreview}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {key.totalRequests.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {key.lastUsedAt
                          ? formatDistanceToNow(new Date(key.lastUsedAt), {
                              addSuffix: true,
                            })
                          : "Never"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {key.revoked ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-400">
                            Revoked
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-400">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {!key.revoked && (
                          <button
                            onClick={() => {
                              setSelectedKey(key);
                              setShowRevokeModal(true);
                            }}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Create Key Modal */}
      {showCreateModal && (
        <CreateKeyModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchApiKeys();
          }}
        />
      )}

      {/* Revoke Key Modal */}
      {showRevokeModal && selectedKey && (
        <RevokeKeyModal
          apiKey={selectedKey}
          onClose={() => {
            setShowRevokeModal(false);
            setSelectedKey(null);
          }}
          onSuccess={() => {
            setShowRevokeModal(false);
            setSelectedKey(null);
            fetchApiKeys();
          }}
        />
      )}
    </div>
  );
}

// Create Key Modal Component
function CreateKeyModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("discord_bot");
  const [loading, setLoading] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer demo_token",
          "X-Admin-Secret": process.env.NEXT_PUBLIC_ADMIN_SECRET || "demo",
        },
        body: JSON.stringify({ name, type }),
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedKey(data.data.key);
      }
    } catch (error) {
      console.error("Failed to create key:", error);
    } finally {
      setLoading(false);
    }
  };

  if (createdKey) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-[#151A21] rounded-xl p-6 max-w-lg w-full border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-4">
            ✅ API Key Created!
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            ⚠️ Save this key securely - it won't be shown again!
          </p>
          <div className="bg-[#1E2329] rounded-lg p-4 mb-4 border border-gray-700">
            <code className="text-sm text-green-400 break-all font-mono">
              {createdKey}
            </code>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(createdKey);
              onSuccess();
            }}
            className="w-full py-2 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-lg transition-colors"
          >
            Copy & Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#151A21] rounded-xl p-6 max-w-md w-full border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Create New API Key</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-[#1E2329] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
              placeholder="My Discord Bot"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 bg-[#1E2329] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#5865F2]"
            >
              <option value="discord_bot">Discord Bot</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-[#1E2329] hover:bg-[#252B33] text-gray-300 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Key"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Revoke Key Modal Component
function RevokeKeyModal({
  apiKey,
  onClose,
  onSuccess,
}: {
  apiKey: ApiKey;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRevoke = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/api-keys/${apiKey.id}?reason=${encodeURIComponent(reason)}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer demo_token",
          "X-Admin-Secret": process.env.NEXT_PUBLIC_ADMIN_SECRET || "demo",
        },
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to revoke key:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#151A21] rounded-xl p-6 max-w-md w-full border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">⚠️ Revoke API Key</h3>
        <p className="text-sm text-gray-400 mb-4">
          Are you sure you want to revoke <strong className="text-white">{apiKey.name}</strong>?
          This action cannot be undone.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Reason (optional)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-2 bg-[#1E2329] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Security concern, no longer needed, etc."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-[#1E2329] hover:bg-[#252B33] text-gray-300 font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRevoke}
            disabled={loading}
            className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Revoking..." : "Revoke Key"}
          </button>
        </div>
      </div>
    </div>
  );
}
