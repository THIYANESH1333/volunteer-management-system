import { useState, useEffect } from 'react';
import api from '@/utils/api.js';
import Modal from '@/components/Modal';
import './Admin.css';

const emptyUser = { name: '', email: '', password: '', role: 'volunteer' };

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [date, setDate] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [formData, setFormData] = useState(emptyUser);
    const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users');
            setUsers(res.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    };

    // Date filter logic
    const filteredUsers = users.filter(user => {
        if (filter !== 'volunteer') return filter === 'all' ? true : user.role === filter;
        if (!date) return user.role === 'volunteer';
        const created = new Date(user.createdAt);
        const selected = new Date(date);
        return user.role === 'volunteer' &&
            created.getFullYear() === selected.getFullYear() &&
            created.getMonth() === selected.getMonth() &&
            created.getDate() === selected.getDate();
    });

    const openCreateModal = () => {
        setFormData(emptyUser);
        setModalType('create');
        setIsModalOpen(true);
    };
    const openEditModal = (user) => {
        setFormData({ ...user, password: '' });
        setEditUser(user);
        setModalType('edit');
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setEditUser(null);
        setFormData(emptyUser);
        setSuccess('');
        setError('');
    };
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            if (modalType === 'create') {
                await api.post('/users', formData);
                setSuccess('User created!');
            } else {
                await api.put(`/users/${editUser._id}`, formData);
                setSuccess('User updated!');
            }
            fetchUsers();
            setTimeout(closeModal, 1000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save user.');
        }
    };
    const deleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/users/${userId}`);
                fetchUsers();
            } catch (err) {
                alert('Failed to delete user.');
            }
        }
    };
    if (loading) return <div>Loading users...</div>;
    if (error) return <div className="error-message">{error}</div>;
    return (
        <div className="admin-page">
            <div className="admin-users-card animate-fade-in">
                <h2 className="admin-users-title">Manage Users</h2>
                <div className="admin-users-filters">
                    <button className={`btn-secondary${filter==='all' ? ' active' : ''}`} onClick={() => setFilter('all')}>All</button>
                    <button className={`btn-secondary${filter==='volunteer' ? ' active' : ''}`} onClick={() => setFilter('volunteer')} style={{marginLeft:8}}>Volunteers</button>
                    <button className={`btn-secondary${filter==='admin' ? ' active' : ''}`} onClick={() => setFilter('admin')} style={{marginLeft:8}}>Admins</button>
                    {filter === 'volunteer' && (
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="admin-users-date"
                        />
                    )}
                </div>
                <div className="admin-users-table-wrapper">
                    <table className="admin-table glass-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <tr key={user._id}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.phone}</td>
                                        <td>{user.role}</td>
                                        <td>
                                            <button onClick={() => openEditModal(user)} className="btn-secondary">Edit</button>
                                            <button onClick={() => deleteUser(user._id)} className="btn-danger">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center' }}>No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={modalType === 'create' ? 'Create User' : 'Edit User'}>
                <form onSubmit={handleSubmit} className="modal-form">
                    <label>Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} required />
                    <label>Email</label>
                    <input name="email" value={formData.email} onChange={handleChange} required />
                    <label>Password{modalType === 'edit' && ' (leave blank to keep unchanged)'}</label>
                    <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder={modalType === 'edit' ? 'New password (optional)' : ''} />
                    <label>Role</label>
                    <select name="role" value={formData.role} onChange={handleChange} required>
                        <option value="volunteer">Volunteer</option>
                        <option value="admin">Admin</option>
                    </select>
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    <button type="submit" className="btn-primary">{modalType === 'create' ? 'Create' : 'Update'}</button>
                </form>
            </Modal>
        </div>
    );
};

export default AdminUsers;
