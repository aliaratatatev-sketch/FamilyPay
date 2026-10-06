'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import NotificationBell from '../../components/NotificationBell';

interface Family {
  id: string;
  name: string;
  currency: string;
  createdBy?: {
    id: string;
    name: string | null;
    email: string | null;
  };
  members: {
    id: string;
    role: string;
    joinedAt: string;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  }[];
  accounts: any[];
  _count: {
    transactions: number;
    budgets: number;
    goals: number;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  expires: string;
}

interface Member {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export default function FamilyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
    
    if (status === 'authenticated') {
      loadFamilies();
    }
  }, [status, router]);

  const loadFamilies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/families?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      const data = await response.json();
      
      if (response.ok && data.families) {
        setFamilies(data.families);
        
        if (data.families.length > 0) {
          const firstFamily = data.families[0];
          setSelectedFamily(firstFamily);
          
          const currentUserMember = firstFamily.members.find(
            (m: any) => m.user.id === session?.user?.id
          );
          if (currentUserMember) {
            setUserRole(currentUserMember.role);
          }
          
          loadInvitations(firstFamily.id);
        } else {
          setFamilies([]);
        }
      } else {
        setFamilies([]);
      }
    } catch (error) {
      console.error('Error loading families:', error);
      setFamilies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInvitations = async (familyId: string) => {
    try {
      const response = await fetch(`/api/families/${familyId}/invite`);
      const data = await response.json();
      
      if (response.ok) {
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const getRoleName = (role: string) => {
    const roles: Record<string, string> = {
      ADMIN: 'Администратор',
      PARENT: 'Родитель',
      TEEN: 'Подросток',
      VIEWER: 'Наблюдатель',
    };
    return roles[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      PARENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      TEEN: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      VIEWER: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[role] || colors.VIEWER;
  };

  const handleDeleteFamily = async () => {
    if (!selectedFamily) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/families/${selectedFamily.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        const data = await response.json();
        alert(data.error || 'Ошибка при удалении семьи');
      }
    } catch (error) {
      console.error('Error deleting family:', error);
      alert('Ошибка при удалении семьи');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedFamily || !selectedMember) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/families/${selectedFamily.id}/members/${selectedMember.user.id}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        await loadFamilies();
        setShowRemoveMemberModal(false);
        setSelectedMember(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Ошибка при удалении участника');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Ошибка при удалении участника');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangeRole = async (newRole: string) => {
    if (!selectedFamily || !selectedMember) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/families/${selectedFamily.id}/members/${selectedMember.user.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (response.ok) {
        await loadFamilies();
        setShowChangeRoleModal(false);
        setSelectedMember(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Ошибка при изменении роли');
      }
    } catch (error) {
      console.error('Error changing role:', error);
      alert('Ошибка при изменении роли');
    } finally {
      setIsDeleting(false);
    }
  };

  const canManageMember = (member: Member) => {
    if (!selectedFamily || !session?.user?.id) return false;
    
    // Нельзя управлять создателем семьи
    if (selectedFamily.createdBy?.id === member.user.id) return false;
    
    // Нельзя управлять самим собой
    if (member.user.id === session.user.id) return false;
    
    // Только админы могут управлять участниками
    return userRole === 'ADMIN';
  };

  const canLeaveFamily = () => {
    if (!selectedFamily || !session?.user?.id) return false;
    
    // Создатель не может покинуть семью, только удалить её
    return selectedFamily.createdBy?.id !== session.user.id;
  };

  const isCreator = selectedFamily && selectedFamily.createdBy && session?.user?.id === selectedFamily.createdBy.id;

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400 text-xl">Загрузка...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (!selectedFamily) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            У вас нет семей
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Создайте семью на главной странице, чтобы начать управлять финансами
          </p>
          
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg transition"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center text-white font-bold">
              FP
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] bg-clip-text text-transparent">
              FamilyPay
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <NotificationBell />
            
            <Link 
              href="/dashboard"
              className="text-gray-600 dark:text-gray-400 hover:text-[#0D6D6E] dark:hover:text-[#4FD1C5] transition"
            >
              ← Назад
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {selectedFamily.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Управление семьёй и участниками
          </p>
        </div>

        {/* Family Info */}
        <div className="bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] rounded-2xl shadow-lg p-8 text-white mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm opacity-90 mb-1">Участников</h3>
              <p className="text-3xl font-bold">👥 {selectedFamily.members.length}</p>
            </div>
            <div>
              <h3 className="text-sm opacity-90 mb-1">Счетов</h3>
              <p className="text-3xl font-bold">💳 {selectedFamily.accounts.length}</p>
            </div>
            <div>
              <h3 className="text-sm opacity-90 mb-1">Транзакций</h3>
              <p className="text-3xl font-bold">💰 {selectedFamily._count.transactions}</p>
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Участники семьи
            </h2>
            <div className="flex items-center gap-3">
              {(userRole === 'ADMIN' || userRole === 'PARENT') && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg transition flex items-center gap-2"
                >
                  <span>+</span>
                  <span>Пригласить</span>
                </button>
              )}
              {isCreator && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                  title="Только создатель может удалить семью"
                >
                  <span>🗑️</span>
                  <span>Удалить семью</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {selectedFamily.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {member.user.name?.charAt(0) || member.user.email?.charAt(0) || '?'}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {member.user.name || 'Без имени'}
                    {selectedFamily.createdBy?.id === member.user.id && (
                      <span className="ml-2 text-xs px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full">
                        👑 Создатель
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {member.user.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    В семье с {new Date(member.joinedAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getRoleBadgeColor(member.role)}`}>
                    {getRoleName(member.role)}
                  </span>

                  {canManageMember(member) && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setShowChangeRoleModal(true);
                        }}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                        title="Изменить роль"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setShowRemoveMemberModal(true);
                        }}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        title="Удалить участника"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {member.user.id === session?.user?.id && canLeaveFamily() && (
                    <button
                      onClick={() => {
                        setSelectedMember(member);
                        setShowRemoveMemberModal(true);
                      }}
                      className="px-3 py-1 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition"
                    >
                      Покинуть
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Invitations */}
        {invitations.length > 0 && (userRole === 'ADMIN' || userRole === 'PARENT') && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Активные приглашения
            </h2>

            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl flex-shrink-0">
                      📧
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {invitation.email}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Роль: {getRoleName(invitation.role)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Истекает: {new Date(invitation.expires).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full text-xs font-medium">
                    Ожидается
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Invite Modal */}
      {showInviteModal && selectedFamily && (
        <InviteModal
          familyId={selectedFamily.id}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
            loadFamilies();
          }}
        />
      )}

      {/* Change Role Modal */}
      {showChangeRoleModal && selectedMember && (
        <ChangeRoleModal
          member={selectedMember}
          onClose={() => {
            setShowChangeRoleModal(false);
            setSelectedMember(null);
          }}
          onConfirm={handleChangeRole}
          isLoading={isDeleting}
        />
      )}

      {/* Remove Member Modal */}
      {showRemoveMemberModal && selectedMember && (
        <RemoveMemberModal
          member={selectedMember}
          isCurrentUser={selectedMember.user.id === session?.user?.id}
          onClose={() => {
            setShowRemoveMemberModal(false);
            setSelectedMember(null);
          }}
          onConfirm={handleRemoveMember}
          isLoading={isDeleting}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedFamily && (
        <DeleteFamilyModal
          familyName={selectedFamily.name}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteFamily}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}

// Компонент модального окна приглашения
function InviteModal({ 
  familyId, 
  onClose, 
  onSuccess 
}: { 
  familyId: string; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [inviteMethod, setInviteMethod] = useState<'email' | 'id'>('id');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('VIEWER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  const roles = [
    { value: 'ADMIN', label: 'Администратор', description: 'Полный доступ к управлению', icon: '👑' },
    { value: 'PARENT', label: 'Родитель', description: 'Управление финансами', icon: '👨‍💼' },
    { value: 'TEEN', label: 'Подросток', description: 'Ограниченный доступ', icon: '👦' },
    { value: 'VIEWER', label: 'Наблюдатель', description: 'Только просмотр', icon: '👀' },
  ];

  const handleSubmitByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !email.includes('@')) {
      setError('Введите корректный email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/families/${familyId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при создании приглашения');
      }

      setInviteLink(data.invitation.inviteLink);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании приглашения');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitById = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId.trim()) {
      setError('Введите ID пользователя');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/families/${familyId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId.trim(), role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при добавлении участника');
      }

      setSuccess('Участник успешно добавлен в семью!');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при добавлении участника');
    } finally {
      setIsLoading(false);
    }
  };

  if (inviteLink) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            ×
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✉️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Приглашение создано!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Отправьте эту ссылку пользователю {email}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ссылка-приглашение
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                  alert('Ссылка скопирована!');
                }}
                className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                📋
              </button>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 Ссылка действительна 7 дней. Пользователь должен быть зарегистрирован с email <strong>{email}</strong>
            </p>
          </div>

          <button
            onClick={() => {
              onSuccess();
              onClose();
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg transition"
          >
            Готово
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Успешно!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {success}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl disabled:opacity-50"
        >
          ×
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0D6D6E] to-[#4FD1C5] flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👥</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Пригласить участника
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Добавьте нового члена семьи
          </p>
        </div>

        {/* Toggle Method */}
        <div className="mb-6">
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setInviteMethod('id');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                inviteMethod === 'id'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              По ID (быстро)
            </button>
            <button
              type="button"
              onClick={() => {
                setInviteMethod('email');
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                inviteMethod === 'email'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              По Email
            </button>
          </div>
        </div>

        <form onSubmit={inviteMethod === 'id' ? handleSubmitById : handleSubmitByEmail} className="space-y-4">
          {inviteMethod === 'id' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID пользователя *
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setError('');
                }}
                placeholder="Вставьте ID пользователя"
                disabled={isLoading}
                className="w-full px-4 py-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoFocus
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                💡 Попросите пользователя скопировать ID из его профиля
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email участника *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="user@example.com"
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0D6D6E] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoFocus
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                ⚠️ Будет создана ссылка-приглашение (действует 7 дней)
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Роль
            </label>
            <div className="space-y-2">
              {roles.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                    role === r.value
                      ? 'border-[#0D6D6E] bg-[#0D6D6E]/10 dark:bg-[#0D6D6E]/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-[#0D6D6E]/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={isLoading}
                    className="mr-3"
                  />
                  <span className="text-2xl mr-2">{r.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{r.label}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{r.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading || (inviteMethod === 'email' ? !email.trim() : !userId.trim())}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Отправка...
                </>
              ) : (
                inviteMethod === 'id' ? 'Добавить' : 'Пригласить'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Компонент изменения роли
function ChangeRoleModal({
  member,
  onClose,
  onConfirm,
  isLoading,
}: {
  member: Member;
  onClose: () => void;
  onConfirm: (newRole: string) => void;
  isLoading: boolean;
}) {
  const [selectedRole, setSelectedRole] = useState(member.role);

  const roles = [
    { value: 'ADMIN', label: 'Администратор', description: 'Полный доступ к управлению', icon: '👑' },
    { value: 'PARENT', label: 'Родитель', description: 'Управление финансами', icon: '👨‍💼' },
    { value: 'TEEN', label: 'Подросток', description: 'Ограниченный доступ', icon: '👦' },
    { value: 'VIEWER', label: 'Наблюдатель', description: 'Только просмотр', icon: '👀' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl disabled:opacity-50"
        >
          ×
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👤</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Изменить роль
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {member.user.name || member.user.email}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Выберите новую роль
          </label>
          <div className="space-y-2">
            {roles.map((r) => (
              <label
                key={r.value}
                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                  selectedRole === r.value
                    ? 'border-[#0D6D6E] bg-[#0D6D6E]/10 dark:bg-[#0D6D6E]/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-[#0D6D6E]/50'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={r.value}
                  checked={selectedRole === r.value}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  disabled={isLoading}
                  className="mr-3"
                />
                <span className="text-2xl mr-2">{r.icon}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{r.label}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{r.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selectedRole)}
            disabled={isLoading || selectedRole === member.role}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-[#0D6D6E] to-[#4FD1C5] text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Изменение...
              </>
            ) : (
              'Сохранить'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Компонент удаления участника
function RemoveMemberModal({
  member,
  isCurrentUser,
  onClose,
  onConfirm,
  isLoading,
}: {
  member: Member;
  isCurrentUser: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl disabled:opacity-50"
        >
          ×
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isCurrentUser ? 'Покинуть семью?' : 'Удалить участника?'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isCurrentUser 
              ? 'Вы уверены, что хотите покинуть эту семью?'
              : `Вы уверены, что хотите удалить ${member.user.name || member.user.email}?`
            }
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800 dark:text-red-200 font-semibold mb-2">
            ⚠️ Внимание!
          </p>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
            {isCurrentUser ? (
              <>
                <li>Вы потеряете доступ ко всем данным семьи</li>
                <li>Вам потребуется новое приглашение для возврата</li>
              </>
            ) : (
              <>
                <li>Участник потеряет доступ ко всем данным семьи</li>
                <li>Это действие можно отменить только новым приглашением</li>
              </>
            )}
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Удаление...
              </>
            ) : (
              <>
                <span>🗑️</span>
                <span>{isCurrentUser ? 'Покинуть' : 'Удалить'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Компонент удаления семьи
function DeleteFamilyModal({
  familyName,
  onClose,
  onConfirm,
  isLoading,
}: {
  familyName: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl disabled:opacity-50"
        >
          ×
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Удалить семью?
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Вы уверены, что хотите удалить семью <strong>"{familyName}"</strong>?
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800 dark:text-red-200 font-semibold mb-2">
            ⚠️ Это действие нельзя отменить!
          </p>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
            <li>Все данные семьи будут удалены</li>
            <li>Все участники потеряют доступ</li>
            <li>Все счета, транзакции и цели будут удалены</li>
            <li>Восстановить данные будет невозможно</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Удаление...
              </>
            ) : (
              <>
                <span>🗑️</span>
                <span>Удалить навсегда</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
