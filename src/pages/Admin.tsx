import { useEffect, useState } from 'react';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { User } from '../types';
import { AddUserModal } from '../components/AddUserModal';
import { PageHeader } from '../components/PageHeader';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box } from '@mui/material';

export function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPassword, setEditingPassword] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState('');

  const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/users/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      toast.error('Error loading users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (newUser: {
    trNumber: string;
    password: string;
    role: 'admin' | 'student';
  }) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/users/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tr_number: newUser.trNumber,
          password: newUser.password,
          confirm_password: newUser.password,
          role: newUser.role,
        }),
      });
      if (!response.ok) throw new Error('Signup failed');
      toast.success('User added successfully');
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to add user');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (
    tr_number: string,
    updates: Partial<{ password: string; role: 'admin' | 'student' }>
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/users/${tr_number}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Update failed');
      toast.success('User updated');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user');
    } finally {
      setIsLoading(false);
      setEditingPassword(null);
    }
  };

  const handlePasswordEdit = (tr_number: string, currentPassword: string) => {
    setEditingPassword(tr_number);
    setTempPassword(currentPassword);
  };

  const handlePasswordSave = (tr_number: string) => {
    if (tempPassword.trim()) {
      updateUser(tr_number, { password: tempPassword });
    }
  };

  const handleRoleChange = (tr_number: string, newRole: 'admin' | 'student') => {
    updateUser(tr_number, { role: newRole });
  };

  const handleDeleteUser = async (tr_number: string) => {
    if (!confirm(`Delete user ${tr_number}?`)) return;
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/users/${tr_number}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Delete failed');
      toast.success(`User ${tr_number} deleted`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns: GridColDef[] = [
    { field: 'tr_number', headerName: 'TR Number', flex: 1 },
    {
      field: 'password',
      headerName: 'Password',
      flex: 1,
      renderCell: (params) =>
        editingPassword === params.row.tr_number ? (
          <input
            type="text"
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
            onBlur={() => handlePasswordSave(params.row.tr_number)}
            onKeyDown={(e) => e.key === 'Enter' && handlePasswordSave(params.row.tr_number)}
            className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            autoFocus
          />
        ) : (
          <button
            onClick={() => handlePasswordEdit(params.row.tr_number, params.row.password || '')}
            className="text-gray-300 hover:text-white"
          >
            ••••••••
          </button>
        ),
    },
    {
      field: 'role',
      headerName: 'Role',
      flex: 1,
      renderCell: (params) => (
        <select
          value={params.row.role}
          onChange={(e) =>
            handleRoleChange(params.row.tr_number, e.target.value as 'admin' | 'student')
          }
          className={`px-3 py-1 rounded-full text-sm font-medium ${params.row.role === 'admin' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
            } cursor-pointer`}
        >
          <option value="admin">Admin</option>
          <option value="student">Student</option>
        </select>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <button
          onClick={() => handleDeleteUser(params.row.tr_number)}
          className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Admin" />
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>
      <Box sx={{ height: 600, width: '100%', backgroundColor: '#1f2937', color: 'white' }}>
        <DataGrid
          rows={users.map((u, i) => ({ ...u, id: i }))}
          columns={columns}
          pageSizeOptions={[5, 10, 20]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          disableColumnMenu
          sx={{
            backgroundColor: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            borderColor: 'hsl(var(--border))',

            '& .MuiDataGrid-cell': {
              color: 'hsl(var(--foreground))',
              borderColor: 'hsl(var(--border))',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              borderBottom: '1px solid hsl(var(--border))',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              borderTop: '1px solid hsl(var(--border))',
            },
            '& .MuiDataGrid-row': {
              backgroundColor: 'hsl(var(--background))',
              '&:nth-of-type(even)': {
                backgroundColor: 'hsl(var(--muted))',
              },
            },
            '& .MuiDataGrid-sortIcon': {
              color: 'hsl(var(--muted-foreground))',
            },
            '& .MuiTablePagination-root': {
              color: 'hsl(var(--muted-foreground))',
            },
            '& .MuiCheckbox-root svg': {
              fill: 'hsl(var(--muted-foreground))',
            },
          }}
        />


      </Box>
      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddUser}
      />
    </div>
  );
}
