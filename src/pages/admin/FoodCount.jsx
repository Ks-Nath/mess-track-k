import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Utensils, Calendar, Users, Egg, Fish, Drumstick, Leaf } from 'lucide-react';
import { cn, getISTDate, getISTDateString } from '../../lib/utils';
import { useStudents } from '../../context/StudentContext';
import { useLeaves } from '../../context/LeaveContext';

export default function FoodCount() {
    const { students, loading: studentsLoading } = useStudents();
    const { isStudentOnLeave, loading: leavesLoading } = useLeaves();
    const [selectedDate, setSelectedDate] = useState(getISTDate());

    const loading = studentsLoading || leavesLoading;

    const formatDateKey = (date) => {
        if (!(date instanceof Date)) return getISTDateString();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const dateKey = formatDateKey(selectedDate);

    // Calculate Counts
    let counts = {
        vegBase: 0,
        nonVegBase: 0,
        chicken: 0,
        egg: 0,
        fish: 0,
        totalPresent: 0,
    };

    // Keep track of details for the table
    const details = {
        vegBase: [],
        nonVegBase: [],
        chicken: [],
        egg: [],
        fish: []
    };

    if (!loading) {
        students.forEach(student => {
            if (student.messStatus !== 'Active') return;
            if (isStudentOnLeave(student.messNumber, dateKey)) return;

            counts.totalPresent++;

            const t = student.messType || 'V';
            
            // Veg base meals
            if (t === 'V' || t === 'Veg' || t.startsWith('V+')) {
                counts.vegBase++;
                details.vegBase.push(student);
            }
            
            // Non-Veg base meals
            if (t === 'N' || t === 'Non-Veg' || t.startsWith('N-')) {
                counts.nonVegBase++;
                details.nonVegBase.push(student);
            }

            // Chicken portions
            if (t === 'V+C' || t === 'N' || t === 'Non-Veg' || t === 'N-E' || t === 'N-F') {
                counts.chicken++;
                details.chicken.push(student);
            }

            // Egg portions
            if (t === 'V+E' || t === 'N' || t === 'Non-Veg' || t === 'N-C' || t === 'N-F') {
                counts.egg++;
                details.egg.push(student);
            }

            // Fish portions
            if (t === 'V+F' || t === 'N' || t === 'Non-Veg' || t === 'N-C' || t === 'N-E') {
                counts.fish++;
                details.fish.push(student);
            }
        });
    }

    const StatCard = ({ title, count, icon: Icon, colorClass, bgClass }) => (
        <Card className={cn("overflow-hidden border-gray-200", bgClass)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                        <p className={cn("text-3xl font-bold", colorClass)}>{count}</p>
                    </div>
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center opacity-80", bgClass, colorClass)}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <Utensils className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Daily Food Count</h1>
                    </div>
                    <p className="text-gray-500 mt-2">Estimated food quantities based on active students present.</p>
                </div>
                
                {/* Date Selector */}
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <input
                        type="date"
                        className="text-sm font-medium outline-none text-gray-700 bg-transparent"
                        value={dateKey}
                        onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        <StatCard 
                            title="Total Present" 
                            count={counts.totalPresent} 
                            icon={Users} 
                            colorClass="text-gray-900" 
                            bgClass="bg-gray-50" 
                        />
                        <StatCard 
                            title="Veg Meals" 
                            count={counts.vegBase} 
                            icon={Leaf} 
                            colorClass="text-green-700" 
                            bgClass="bg-green-50" 
                        />
                        <StatCard 
                            title="Non-Veg Meals" 
                            count={counts.nonVegBase} 
                            icon={Utensils} 
                            colorClass="text-red-700" 
                            bgClass="bg-red-50" 
                        />
                        <StatCard 
                            title="Chicken Portions" 
                            count={counts.chicken} 
                            icon={Drumstick} 
                            colorClass="text-orange-700" 
                            bgClass="bg-orange-50" 
                        />
                        <StatCard 
                            title="Egg Portions" 
                            count={counts.egg} 
                            icon={Egg} 
                            colorClass="text-yellow-700" 
                            bgClass="bg-yellow-50" 
                        />
                        <StatCard 
                            title="Fish Portions" 
                            count={counts.fish} 
                            icon={Fish} 
                            colorClass="text-blue-700" 
                            bgClass="bg-blue-50" 
                        />
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                                    <Leaf className="w-5 h-5 text-green-600" /> Veg Meals Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 max-h-96 overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="sticky top-0 bg-white border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold text-gray-500">Mess No</th>
                                            <th className="px-6 py-3 font-semibold text-gray-500">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {details.vegBase.map(s => (
                                            <tr key={s.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-3 font-medium text-gray-900">{s.messNumber}</td>
                                                <td className="px-6 py-3 text-gray-600">{s.messType || 'Veg'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                                <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                                    <Utensils className="w-5 h-5 text-red-600" /> Non-Veg Meals Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 max-h-96 overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="sticky top-0 bg-white border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold text-gray-500">Mess No</th>
                                            <th className="px-6 py-3 font-semibold text-gray-500">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {details.nonVegBase.map(s => (
                                            <tr key={s.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-3 font-medium text-gray-900">{s.messNumber}</td>
                                                <td className="px-6 py-3 text-gray-600">{s.messType || 'Non-Veg'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
