import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLeaves } from '../context/LeaveContext';
import { useHostel } from '../context/HostelContext';
import { Calendar, Minus, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { getISTDate } from '../lib/utils';

export default function MessBill() {
    const { user } = useAuth();
    const { getLeavesByDate, loading: leavesLoading } = useLeaves();
    const { messRate, establishmentFee } = useHostel();

    const [currentDate, setCurrentDate] = useState(() => {
        const now = getISTDate();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });

    if (!user) return <div className="p-8 text-center">Please log in to view bill.</div>;

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const nowIST = getISTDate();
    const isCurrentMonth = currentYear === nowIST.getFullYear() && currentMonth === nowIST.getMonth();

    // Get total days in selected month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Calculate leaves taken this month
    let leaveCount = 0;
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const leavesOnDay = getLeavesByDate(dateKey) || [];
        if (leavesOnDay.some(l => l.messNumber === user.messNumber)) {
            leaveCount++;
        }
    }

    const activeDays = daysInMonth - leaveCount;
    const totalAmount = activeDays * messRate;
    const savings = leaveCount * messRate;
    const finalAmount = totalAmount + establishmentFee;

    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const handleNextMonth = () => {
        if (!isCurrentMonth) {
            setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
        }
    };

    return (
        <div className="space-y-8 animate-fade-in mx-auto max-w-4xl">
            {/* Header with Month Selector */}
            <div className="flex flex-col items-center justify-center gap-6 mb-8 pt-4">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Monthly Bill</h1>
                
                <div className="flex items-center gap-6">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={handlePrevMonth}
                        className="h-14 w-14 rounded-2xl border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm transition-all hover:shadow"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <span className="text-2xl font-bold text-gray-900 min-w-[160px] text-center">
                        {monthName} {currentYear}
                    </span>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={handleNextMonth}
                        disabled={isCurrentMonth}
                        className="h-14 w-14 rounded-2xl border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm transition-all hover:shadow disabled:opacity-40 disabled:hover:shadow-sm"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </Button>
                </div>
            </div>

            <Card className="border-gray-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Payable</p>
                            {leavesLoading ? (
                                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse mt-1" />
                            ) : (
                                <h2 className="text-4xl font-bold text-gray-900">₹{finalAmount.toLocaleString()}</h2>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                {isCurrentMonth ? 'Unpaid' : 'Generated'}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Due by 5th of next month</p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {/* Breakdown Table */}
                    <div className="divide-y divide-gray-100">
                        <div className="grid grid-cols-2 p-4 sm:px-6 hover:bg-gray-50/30 transition-colors">
                            <span className="text-sm text-gray-500 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Total Days
                            </span>
                            <span className="text-sm font-medium text-gray-900 text-right">{daysInMonth} days</span>
                        </div>

                        <div className="grid grid-cols-2 p-4 sm:px-6 hover:bg-gray-50/30 transition-colors">
                            <span className="text-sm text-gray-500 flex items-center gap-2">
                                <Minus className="w-4 h-4 text-red-500" /> Leave Days
                            </span>
                            <span className="text-sm font-medium text-red-600 text-right">
                                {leavesLoading ? <span className="inline-block h-4 w-12 bg-red-100 rounded animate-pulse" /> : `− ${leaveCount} days`}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 p-4 sm:px-6 hover:bg-gray-50/30 transition-colors bg-blue-50/10">
                            <span className="text-sm text-gray-500 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-primary-600" /> Billable Days
                            </span>
                            <span className="text-sm font-semibold text-primary-700 text-right">
                                {leavesLoading ? <span className="inline-block h-4 w-12 bg-blue-100 rounded animate-pulse" /> : `${activeDays} days`}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 p-4 sm:px-6 hover:bg-gray-50/30 transition-colors">
                            <span className="text-sm text-gray-500">Cost per day</span>
                            <span className="text-sm font-medium text-gray-900 text-right">₹{messRate}</span>
                        </div>

                        <div className="grid grid-cols-2 p-4 sm:px-6 hover:bg-gray-50/30 transition-colors bg-gray-50">
                            <span className="text-sm text-gray-500 font-medium">Mess Fee</span>
                            <span className="text-sm font-semibold text-gray-900 text-right">
                                {leavesLoading ? <span className="inline-block h-4 w-12 bg-gray-200 rounded animate-pulse" /> : `₹${totalAmount.toLocaleString()}`}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 p-4 sm:px-6 hover:bg-gray-50/30 transition-colors bg-gray-50">
                            <span className="text-sm text-gray-500 font-medium">Establishment Fee</span>
                            <span className="text-sm font-semibold text-gray-900 text-right">₹{establishmentFee?.toLocaleString() || 0}</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Calculation Footer */}
                    <div className="bg-gray-50/30 p-4 sm:px-6 text-center">
                        {leavesLoading ? (
                            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mx-auto" />
                        ) : (
                            <>
                                <p className="text-xs text-gray-400 font-mono">
                                    (({daysInMonth} Total − {leaveCount} Leave) × ₹{messRate}) + ₹{establishmentFee || 0} = ₹{finalAmount.toLocaleString()}
                                </p>
                                {savings > 0 && (
                                    <p className="text-xs text-emerald-600 font-medium mt-1">
                                        You saved ₹{savings.toLocaleString()} this month on leaves
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
