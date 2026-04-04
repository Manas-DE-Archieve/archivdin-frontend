import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { personsApi, adminApi } from '../api';
import { useAuth } from '../hooks/useAuth';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 20;
const USERS_PAGE_SIZE = 10;

// ── Similarity badge ───────────────────────────────────────────────────────────
function SimilarityBadge({ score }) {
  if (score == null) return null;
  const pct = Math.round(score * 100);
  const color = pct >= 70
    ? 'bg-red-100 text-red-700 border-red-200'
    : pct >= 50
    ? 'bg-orange-100 text-orange-700 border-orange-200'
    : 'bg-amber-100 text-amber-700 border-amber-200';
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${color}`}>
      {pct}% схожесть
    </span>
  );
}

// ── Documents moderation panel ─────────────────────────────────────────────────
function DocumentsModerationPanel() {
  const [docs, setDocs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [minSimilarity, setMinSimilarity] = useState(0);

  const load = useCallback(async (p = 1, minSim = 0) => {
    setLoading(true);
    try {
      const { data } = await adminApi.listPendingDocuments({
        page: p, limit: PAGE_SIZE, min_similarity: minSim
      });
      setDocs(data.items);
      setTotal(data.total);
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1, minSimilarity); }, [load, minSimilarity]);

  const verify = async (id, status) => {
    await adminApi.verifyDocument(id, status);
    load(page, minSimilarity);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Мин. схожесть:
        </span>
        {[0, 0.3, 0.5, 0.7].map(v => (
          <button
            key={v}
            onClick={() => setMinSimilarity(v)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              minSimilarity === v
                ? 'bg-primary-700 text-white border-primary-700'
                : 'border-slate-200 text-slate-500 hover:border-primary-300'
            }`}
          >
            {v === 0 ? 'Все' : `≥ ${Math.round(v * 100)}%`}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">{total} документов</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 skeleton w-1/2 rounded mb-2" />
              <div className="h-3 skeleton w-1/3 rounded" />
            </div>
          ))}
        </div>
      ) : docs.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-3 opacity-50">✓</p>
          <p className="font-serif text-slate-500">Нет документов на проверке</p>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map(doc => (
            <div key={doc.id} className="card p-5 flex items-center gap-5">
              {/* Sidebar color: red if high similarity */}
              <div className={`w-0.5 h-12 rounded-full shrink-0 ${
                (doc.similarity_score ?? 0) >= 0.7 ? 'bg-red-400' :
                (doc.similarity_score ?? 0) >= 0.5 ? 'bg-orange-300' : 'bg-amber-300'
              }`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-slate-800 text-sm truncate">
                    {doc.filename}
                  </span>
                  <SimilarityBadge score={doc.similarity_score} />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Загружен: {new Date(doc.uploaded_at).toLocaleDateString('ru-RU')}
                  {doc.duplicate_of_id && (
                    <span className="ml-2 text-orange-500">⚠ похож на другой документ</span>
                  )}
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => verify(doc.id, 'verified')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  ✓ Принять
                </button>
                <button
                  onClick={() => verify(doc.id, 'rejected')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors"
                >
                  ✗ Отклонить
                </button>
              </div>
            </div>
          ))}
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={p => load(p, minSimilarity)}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Persons moderation panel ───────────────────────────────────────────────────
function PersonsModerationPanel() {
  const { t } = useTranslation();
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await adminApi.listPendingPersons({ page: p, limit: PAGE_SIZE });
      setPersons(data.items);
      setTotal(data.total);
      setPage(p);
    } catch {
      // fallback to personsApi
      const { data } = await personsApi.list({ status: 'pending', page: p, limit: PAGE_SIZE });
      setPersons(data.items);
      setTotal(data.total);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1); }, [load]);

  const setStatus = async (id, status) => {
    try {
      await adminApi.verifyPerson(id, status);
    } catch {
      await personsApi.setStatus(id, status);
    }
    load(page);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <p className="text-xs text-slate-400 mb-4">{total} человек ожидают проверки</p>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 skeleton w-1/2 rounded mb-2" />
              <div className="h-3 skeleton w-1/3 rounded" />
            </div>
          ))}
        </div>
      ) : persons.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-3 opacity-50">✓</p>
          <p className="font-serif text-slate-500">Все записи проверены</p>
        </div>
      ) : (
        <div className="space-y-3">
          {persons.map(p => (
            <div key={p.id} className="card p-5 flex items-center gap-5">
              <div className="w-0.5 h-12 bg-amber-300 rounded-full shrink-0" />
              <div className="flex-1 min-w-0">
                <Link
                  to={`/persons/${p.id}`}
                  className="font-serif font-semibold text-slate-800 hover:text-primary-700 transition-colors"
                >
                  {p.full_name}
                </Link>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  {[p.birth_year, p.region, p.charge].filter(Boolean).join(' · ')}
                </p>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  Добавлено: {new Date(p.created_at).toLocaleDateString('ru-RU')}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setStatus(p.id, 'verified')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  ✓ {t('admin.verify')}
                </button>
                <button
                  onClick={() => setStatus(p.id, 'rejected')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors"
                >
                  ✗ {t('admin.reject')}
                </button>
              </div>
            </div>
          ))}
          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={load} />
          )}
        </div>
      )}
    </div>
  );
}

// ── User management ────────────────────────────────────────────────────────────
function UserManagementPanel() {
  const { user: currentUser } = useAuth();
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const searchTimeoutRef    = useRef(null);

  const loadUsers = useCallback(async (p = 1, q = '') => {
    setLoading(true);
    try {
      const { data } = await adminApi.listUsers({ page: p, limit: USERS_PAGE_SIZE, q });
      setUsers(data.items);
      setTotal(data.total);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(1, search); }, [loadUsers, search]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch {
      alert('Не удалось изменить роль.');
    }
  };

  const handleSearchChange = (e) => {
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setSearch(e.target.value), 500);
  };

  const totalPages = Math.ceil(total / USERS_PAGE_SIZE);

  return (
    <div className="card p-6 mt-8">
      <h2 className="font-serif text-xl font-bold text-primary-800 mb-1">Управление пользователями</h2>
      <p className="text-sm text-slate-400 mb-4">Назначение ролей модераторов.</p>
      <input type="text" placeholder="Поиск по email..." onChange={handleSearchChange} className="input mb-4" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50">
            <tr>
              <th className="px-6 py-3">Пользователь</th>
              <th className="px-6 py-3">Роль</th>
              <th className="px-6 py-3">Дата регистрации</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{user.email}</td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={user.id === currentUser.id || user.role === 'super_admin'}
                    className="input !py-1 !px-2 text-xs disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <option value="user">Пользователь</option>
                    <option value="moderator">Модератор</option>
                    {user.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                  </select>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {new Date(user.created_at).toLocaleDateString('ru-RU')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={p => loadUsers(p, search)} />
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tab, setTab] = useState('documents'); // documents | persons

  if (!user || !['moderator', 'super_admin'].includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-4xl mb-3 opacity-30">🔒</div>
        <p className="font-serif text-lg text-slate-400">Доступ запрещён</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-primary-800">{t('admin.title')}</h1>
        <p className="text-sm text-slate-400 mt-1">
          Проверка и верификация загруженных документов и персон
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {[
          { key: 'documents', label: '📄 Документы' },
          { key: 'persons',   label: '👤 Люди' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === key
                ? 'border-primary-700 text-primary-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Panel */}
      {tab === 'documents' && <DocumentsModerationPanel />}
      {tab === 'persons'   && <PersonsModerationPanel />}

      {/* User management — super_admin only */}
      {user?.role === 'super_admin' && <UserManagementPanel />}
    </div>
  );
}