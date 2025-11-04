// src/app/(dapp)/admin/waitlist/page.tsx
import { redirect } from 'next/navigation'

interface WaitlistEntry {
  _id: string;
  walletAddress: string;
  email?: string;
  source: 'denied_access' | 'landing_page';
  joinedAt: string;
  position: number;
}

interface WaitlistStats {
  total: number;
  sources: {
    denied_access: number;
    landing_page: number;
  };
  withEmail: number;
  withoutEmail: number;
}

export default function WaitlistAdminPage() { redirect('/swap') }
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">From Denied Access</p>
                  <p className="text-3xl font-bold text-yellow-500">{stats.sources.denied_access}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <FiUsers className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">With Email</p>
                  <p className="text-3xl font-bold text-green-500">{stats.withEmail}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <FiMail className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Email Rate</p>
                  <p className="text-3xl font-bold text-purple-500">
                    {stats.total > 0 ? Math.round((stats.withEmail / stats.total) * 100) : 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <FiMail className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Waitlist Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Waitlist Entries</h2>
              
              <button
                onClick={() => setShowEmails(!showEmails)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                {showEmails ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                {showEmails ? 'Hide Emails' : 'Show Emails'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">#</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Wallet Address</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Email</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Source</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Joined</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={entry._id} className="border-b border-gray-700 hover:bg-gray-700/30">
                    <td className="py-4 px-6">
                      <span className="text-white font-medium">#{entry.position}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <code className="text-gray-300 text-sm bg-gray-700 px-2 py-1 rounded">
                          {entry.walletAddress.slice(0, 8)}...{entry.walletAddress.slice(-8)}
                        </code>
                        <button
                          onClick={() => copyToClipboard(entry.walletAddress)}
                          className="text-gray-400 hover:text-white"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {entry.email ? (
                        <span className="text-gray-300">
                          {showEmails ? entry.email : '***@***'}
                        </span>
                      ) : (
                        <span className="text-gray-500">No email</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.source === 'denied_access' 
                          ? 'bg-yellow-500/20 text-yellow-500' 
                          : 'bg-blue-500/20 text-blue-500'
                      }`}>
                        {entry.source === 'denied_access' ? 'Denied Access' : 'Landing Page'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      export default function WaitlistAdminPage() { redirect('/swap') }
                        <FiCalendar className="w-4 h-4" />
