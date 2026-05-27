import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Search, MoreHorizontal, Users, UserPlus, X, Loader2, Trash2 } from 'lucide-react';
import { cn, getISTDate, getISTDateString } from '../lib/utils';
import { useStudents } from '../context/StudentContext';
import { useLeaves } from '../context/LeaveContext';

export default function ManageStudents() {
    const { students, loading: studentsLoading, addStudent, updateStudent, removeStudent } = useStudents();
    const { isStudentOnLeave, loading: leavesLoading } = useLeaves();

    const loading = studentsLoading || leavesLoading;

    const [selectedDate, setSelectedDate] = useState(getISTDate());
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');

    // Add/Edit Student Modal state
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [studentForm, setStudentForm] = useState({ name: '', messNumber: '', phone: '', messType: 'V' });
    const [modalError, setModalError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatDateKey = (date) => {
        if (!(date instanceof Date)) return getISTDateString();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Derive students with dynamic status
    const studentsWithStatus = students.map(student => {
        const onLeave = isStudentOnLeave(student.messNumber, formatDateKey(selectedDate));
        return { ...student, status: onLeave ? 'On Leave' : 'Active' };
    });

    const filteredStudents = studentsWithStatus.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.messNumber.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'All' || s.status === filter;
        return matchesSearch && matchesFilter;
    });

    const handleOpenAdd = () => {
        setIsEditing(false);
        setStudentForm({ name: '', messNumber: '', phone: '', messType: 'V' });
        setModalError('');
        setShowModal(true);
    };

    const handleOpenEdit = (student) => {
        setIsEditing(true);
        setStudentForm({ 
            name: student.name, 
            messNumber: student.messNumber, 
            phone: student.phone || '', 
            messType: student.messType || 'V' 
        });
        setModalError('');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setModalError('');

        if (!studentForm.name.trim() || !studentForm.messNumber.trim() || !studentForm.phone.trim()) {
            setModalError('All fields are required.');
            return;
        }

        setIsSubmitting(true);
        
        let result;
        if (isEditing) {
            result = await updateStudent(studentForm.messNumber.trim().toUpperCase(), {
                name: studentForm.name.trim(),
                phone: studentForm.phone.trim(),
                messType: studentForm.messType,
            });
        } else {
            result = await addStudent({
                name: studentForm.name.trim(),
                messNumber: studentForm.messNumber.trim().toUpperCase(),
                phone: studentForm.phone.trim(),
                messType: studentForm.messType,
                roomNo: '',
                messStatus: 'Active',
            });
        }
        
        setIsSubmitting(false);

        if (result.success) {
            setShowModal(false);
        } else {
            setModalError(result.error || `Failed to ${isEditing ? 'update' : 'add'} student.`);
        }
    };

    const handleRemoveStudent = async (messNumber) => {
        if (window.confirm(`Are you sure you want to remove student ${messNumber}? This cannot be undone.`)) {
            const result = await removeStudent(messNumber);
            if (!result.success) {
                alert('Failed to remove student: ' + result.error);
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Registry</h1>
                    <p className="text-gray-500 mt-2">Manage student access and mess status.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                        <span className="text-sm text-gray-500">View Status For:</span>
                        <input
                            type="date"
                            className="text-sm outline-none text-gray-700"
                            value={formatDateKey(selectedDate)}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                        />
                    </div>
                    <Button onClick={handleOpenAdd} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                        <UserPlus className="w-4 h-4" /> Add Student
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-1 items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent max-w-sm transition-all">
                    <Search className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
                    <input
                        type="text"
                        placeholder="Search students (Name, Mess No)..."
                        className="w-full bg-transparent outline-none text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['All', 'Active', 'On Leave'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                                filter === f
                                    ? "bg-gray-900 text-white border-gray-900"
                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    <span className="ml-2 text-gray-500">Loading students...</span>
                </div>
            ) : (
                /* Table */
                <Card className="border-gray-200 shadow-sm overflow-hidden">
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-left text-sm min-w-[800px]">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Mess No</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Name</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Phone</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Type</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
                                    <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{student.messNumber}</td>
                                        <td className="px-6 py-4 text-gray-700 font-medium">{student.name}</td>
                                        <td className="px-6 py-4 text-gray-500">{student.phone}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={student.messType === 'Veg' || student.messType?.startsWith('V') ? 'text-green-600 border-green-200 bg-green-50' : 'text-red-600 border-red-200 bg-red-50'}>
                                                {student.messType || 'V'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={student.status === 'Active' ? 'success' : 'warning'} className="rounded-full">
                                                {student.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={() => handleOpenEdit(student)}
                                                    title="Edit Student"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleRemoveStudent(student.messNumber)}
                                                    title="Remove Student"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredStudents.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>No students found matching your criteria.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Add/Edit Student Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                                    <UserPlus className="w-4 h-4 text-indigo-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">{isEditing ? 'Edit Student' : 'Add New Student'}</h2>
                            </div>
                            <button onClick={() => { setShowModal(false); setModalError(''); }} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {!isEditing && (
                                <p className="text-sm text-gray-500">
                                    The student will log in with their <strong>Mess Number</strong> as username and <strong>Phone Number</strong> as password.
                                </p>
                            )}

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Student Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Arjun Kumar"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                    value={studentForm.name}
                                    onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                                    autoFocus
                                />
                            </div>

                            {/* Mess Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mess Number</label>
                                <input
                                    type="text"
                                    placeholder="e.g. MESS-001"
                                    className={cn("w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm uppercase", isEditing && "bg-gray-100 text-gray-500 cursor-not-allowed")}
                                    value={studentForm.messNumber}
                                    onChange={(e) => setStudentForm(prev => ({ ...prev, messNumber: e.target.value }))}
                                    disabled={isEditing}
                                />
                                {!isEditing && <p className="text-xs text-gray-400 mt-1">This will be the login username</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="e.g. 9876543210"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                    value={studentForm.phone}
                                    onChange={(e) => setStudentForm(prev => ({ ...prev, phone: e.target.value }))}
                                />
                                {!isEditing && <p className="text-xs text-gray-400 mt-1">This will be the login password</p>}
                            </div>

                            {/* Mess Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mess Type</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {[
                                        { id: 'V', label: 'Veg' },
                                        { id: 'N', label: 'Non-Veg' },
                                        { id: 'V+C', label: 'V + Chicken' },
                                        { id: 'V+E', label: 'V + Egg' },
                                        { id: 'V+F', label: 'V + Fish' },
                                        { id: 'N-C', label: 'N (No Chicken)' },
                                        { id: 'N-E', label: 'N (No Egg)' },
                                        { id: 'N-F', label: 'N (No Fish)' },
                                    ].map(type => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setStudentForm(prev => ({ ...prev, messType: type.id }))}
                                            className={cn(
                                                "px-2 py-2 rounded-lg text-xs font-medium border transition-all",
                                                studentForm.messType === type.id
                                                    ? type.id.startsWith('V')
                                                        ? "bg-green-50 text-green-700 border-green-300 ring-2 ring-green-200"
                                                        : "bg-red-50 text-red-700 border-red-300 ring-2 ring-red-200"
                                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                            )}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Error Message */}
                            {modalError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                    {modalError}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="button" variant="outline" onClick={() => { setShowModal(false); setModalError(''); }}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Student')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
