"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import DashboardHeader from "@/components/Dashboard/ui/DashboardHeader";
import PaginationControls from "@/components/Dashboard/ui/PaginationControls";
import ViewSwitcher, { ViewMode } from "@/components/ui/ViewSwitcher";
import api from "@/utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faEdit,
  faUsers,
  faSearch,
  faPlus,
  faFilter,
  faTimes,
  faPercent,
  faMoneyBill,
  faUserPlus,
  faFileExcel,
  faUser,
  faPhone,
  faEnvelope,
  faHandshake
} from "@fortawesome/free-solid-svg-icons";
import ExcelJS from 'exceljs';
import StandardDialog from "@/components/ui/dialog/StandardDialog";
import DialogActionButton from "@/components/ui/dialog/DialogActionButton";

// Enums
enum TypeIncome {
    PERCENT = "PERCENT",
    ORDER = "ORDER"
}

enum UserRole {
    ADMIN = "ADMIN",
    BOSS = "BOSS",
    USER = "USER"
}

// Interfaces
interface Income {
    _id: string;
    name: string;
    desc?: string;
    type_price: TypeIncome;
    price: number;
    userCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

interface IncomeResponse {
    income: Income[];
    total: number;
    condition: number;
    limit: number;
}

interface User {
    IncomInfo?: any;
    _id: string;
    name: string;
    phone: string;
    email: string;
    role: string;
    incom_id?: string;
}

interface IncomeFormData {
    name: string;
    desc: string;
    type_price: TypeIncome;
    price: number;
}

interface IncomeCondition {
    page: number;
    limit: number;
    query?: string;
    time_from?: string;
    time_to?: string;
    orderBy?: string;
}

interface UpdateUserIncome {
    role?: string;
    time_create?: string;
}

const IncomePage: React.FC = () => {
    // State for income list
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [limit] = useState<number>(10);

    // State for view mode
    const [viewMode, setViewMode] = useState<ViewMode>("table");

    // Check if on mobile device
    const [isMobileView, setIsMobileView] = useState<boolean>(false);

    // Check viewport size on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            const isMobile = window.innerWidth < 768;
            setIsMobileView(isMobile);
            // Force card view on mobile devices
            if (isMobile) {
                setViewMode("card");
            }
        };

        // Initial check
        checkMobile();

        // Add resize listener
        window.addEventListener("resize", checkMobile);

        // Cleanup
        return () => window.removeEventListener("resize", checkMobile);
    }, [setViewMode]);

    // State for dialogs
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [editingIncome, setEditingIncome] = useState<Income | null>(null);
    const [snackbarMsg, setSnackbarMsg] = useState<string>("");
    const [openAssignDialog, setOpenAssignDialog] = useState<boolean>(false);
    const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);

    // State for search/filter
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [timeFrom, setTimeFrom] = useState<string>("");
    const [timeTo, setTimeTo] = useState<string>("");

    // State for user assignment
    const [users, setUsers] = useState<any>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [assignMethod, setAssignMethod] = useState<"manual" | "auto">("manual");
    const [userRole, setUserRole] = useState<string>("USER");
    const [timeCreate, setTimeCreate] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // State for user list dialog
    const [openUsersDialog, setOpenUsersDialog] = useState<boolean>(false);
    const [incomeUsers, setIncomeUsers] = useState<User[]>([]);
    const [searchKeyword, setSearchKeyword] = useState<string>("");
    const [assignUserSearchQuery, setAssignUserSearchQuery] = useState<string>("");
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    console.log(users);

    useEffect(() => {
        let filtered = users;

        // Lọc theo trạng thái
        if (assignUserSearchQuery !== "all") {
            filtered = users.filter((user: any) => {
                const hasIncome = user.IncomInfo && user.IncomInfo[0];

                if (assignUserSearchQuery === "applied") {
                    return hasIncome && user.IncomInfo[0]._id === selectedIncome?._id;
                }

                if (assignUserSearchQuery === "notApplied") {
                    return !hasIncome;
                }

                if (assignUserSearchQuery === "other" && hasIncome !== selectedIncome?._id) {
                    return hasIncome && user.IncomInfo[0]._id !== selectedIncome?._id;
                }

                return true; // Trường hợp "all"
            });
        }

        // Lọc theo từ khóa tìm kiếm (name, email, phone)
        if (searchKeyword.trim() !== "") {
            const query = searchKeyword.toLowerCase();

            filtered = filtered.filter(
                (user: any) => {
                    const name = user.name ? user.name.toLowerCase() : '';
                    const email = user.email ? user.email.toLowerCase() : '';
                    const phone = user.phone ? user.phone.toLowerCase() : '';
                    
                    return name.includes(query) || 
                           email.includes(query) || 
                           phone.includes(query);
                }
            );
        }

        setFilteredUsers(filtered);
    }, [users, assignUserSearchQuery, searchKeyword, selectedIncome]);

    // Fetch incomes - wrapped in useCallback to avoid dependency issues
    const fetchIncomes = useCallback(async () => {
        setIsLoading(true);
        try {
            const condition: IncomeCondition = {
                page,
                limit,
            };

            if (searchQuery) {
                condition.query = searchQuery;
            }

            if (timeFrom && timeTo) {
                condition.time_from = timeFrom;
                condition.time_to = timeTo;
            }

            const res = await api.get("income/getIncomesByCondition", { params: condition });
            const data: IncomeResponse = res.data;
            setIncomes(data.income);
            setTotal(data.total);
        } catch (error) {
            console.error("Error fetching incomes", error);
            setSnackbarMsg("Có lỗi xảy ra khi tải danh sách chính sách CTV!");
        } finally {
            setIsLoading(false);
        }
    }, [page, limit, searchQuery, timeFrom, timeTo, setIsLoading, setIncomes, setTotal, setSnackbarMsg]);

    // Fetch users for assignment
    // Sửa hàm fetchUsers để nhận incomeId và trả về dữ liệu users
    const fetchUsers = async (incomeIdToSelect?: string) => {
        setAssignUserSearchQuery("")
        try {
            const res = await api.get("users/getUserByQuery", {
                params: {
                    page: 1,
                    limit: 1000000
                }
            });

            const userList = res.data.userModels || [];
            setUsers(userList);

            // Nếu cần pre-select users cho một income cụ thể
            if (incomeIdToSelect) {
                const preSelectedUsers = userList
                    .filter((user: any) => user.IncomInfo && user.IncomInfo[0] && user.IncomInfo[0]._id === incomeIdToSelect)
                    .map((user: any) => user._id);

                setSelectedUsers(preSelectedUsers);
            }

            return userList;
        } catch (error) {
            console.error("Error fetching users", error);
            return [];
        }
    };

    // Fetch users associated with an income
    const fetchIncomeUsers = async (incomeId: string) => {
        setIsLoading(true);
        try {
            const res = await api.get("users/getUserByQuery", {
                params: {
                    page: 1,
                    limit: 1000,
                    incom_id: incomeId
                }
            });
            setIncomeUsers(res.data.userModels || []);
            setOpenUsersDialog(true);
        } catch (error) {
            console.error("Error fetching income users", error);
            setSnackbarMsg("Có lỗi xảy ra khi tải danh sách người dùng!");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchIncomes();
    }, [page, limit, fetchIncomes]);

    const handleDialogClose = () => {
        setOpenDialog(false);
        setEditingIncome(null);
    };

    const handleAssignDialogClose = () => {
        setOpenAssignDialog(false);
        setSelectedIncome(null);
        setSelectedUsers([]);
        setAssignMethod("manual");
        setUserRole("USER");
        setTimeCreate("");
        setAssignUserSearchQuery(""); // Reset search query
    };

    const handleSearch = () => {
        setPage(1);
        fetchIncomes();
    };

    const resetSearchQuery = () => {
        setSearchQuery("");
    };
    // Handle form submission for creating/updating income
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const form = e.currentTarget;
        const formData = new FormData(form);

        const incomeData: IncomeFormData = {
            name: formData.get('name') as string,
            desc: formData.get('desc') as string,
            type_price: formData.get('type_price') as TypeIncome,
            price: parseFloat(formData.get('price') as string),
        };

        try {
            if (editingIncome) {
                // Update existing income
                await api.put(`income/updateIncome?id=${editingIncome._id}`, incomeData);
                setSnackbarMsg("Chính sách thu nhập đã được cập nhật thành công!");
            } else {
                // Create new income
                await api.post("income/createIncome", incomeData);
                setSnackbarMsg("Chính sách thu nhập đã được tạo thành công!");
            }

            handleDialogClose();
            fetchIncomes();
        } catch (error) {
            console.error("Error saving income", error);
            setSnackbarMsg("Có lỗi xảy ra. Vui lòng thử lại!");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle assigning income to users
    const handleAssignIncome = async () => {
        if (!selectedIncome) return;

        setIsLoading(true);
        try {
            if (assignMethod === "manual") {
                // Manually assign to selected users
                await api.put(`income/updateIncomeForUser/${selectedIncome._id}`, selectedUsers);
            } else {
                // Auto assign based on criteria
                const query: UpdateUserIncome = {};

                if (userRole) {
                    query.role = userRole;
                }

                if (timeCreate) {
                    query.time_create = timeCreate;
                }

                await api.put(`income/updateIncomeForUser/${selectedIncome._id}`, [], { params: query });
            }

            setSnackbarMsg("Chính sách thu nhập đã được gán thành công!");
            handleAssignDialogClose();
            fetchIncomes();
        } catch (error) {
            console.error("Error assigning income", error);
            setSnackbarMsg("Có lỗi xảy ra khi gán chính sách thu nhập!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (income: Income) => {
        setEditingIncome(income);
        setOpenDialog(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa chính sách thu nhập này?")) {
            setIsLoading(true);
            try {
                // API doesn't have a delete endpoint based on the provided code
                // We'll use update to change status or other properties instead
                await api.put(`income/updateIncome?id=${id}`, { isDelete: true });
                setSnackbarMsg("Chính sách thu nhập đã được xóa thành công!");
                fetchIncomes();
            } catch (error) {
                console.error("Error deleting income", error);
                setSnackbarMsg("Có lỗi xảy ra khi xóa chính sách thu nhập!");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleOpenAssignDialog = (income: Income) => {
        setSelectedIncome(income);
        setOpenAssignDialog(true);
        fetchUsers(income._id); // Truyền income._id để pre-select users
    };

    const handleUserSelection = (userId: string) => {
        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    // Thêm hàm xử lý xóa chính sách thu nhập cho người dùng
    const handleRemoveIncomeFromUser = async (userId: any) => {
        if (!selectedIncome) return;

        if (confirm("Bạn có chắc chắn muốn xóa chính sách thu nhập này khỏi người dùng?")) {
            setIsLoading(true);
            try {
                await api.delete(`income/deleteIncome`, {
                    data: [userId], // Truyền mảng chứa ID người dùng cần xóa
                });

                // Cập nhật lại danh sách người dùng đã chọn
                setSelectedUsers(prev => prev.filter(id => id !== userId));

                // Cập nhật lại trạng thái người dùng trong danh sách
                const updatedUsers = [...users];
                const userIndex = updatedUsers.findIndex(user => user._id === userId);
                if (userIndex !== -1) {
                    updatedUsers[userIndex] = {
                        ...updatedUsers[userIndex],
                        IncomInfo: [] // Xóa thông tin chính sách thu nhập
                    };
                    setUsers(updatedUsers);
                }

                setSnackbarMsg("Đã xóa chính sách thu nhập khỏi người dùng thành công!");
            } catch (error) {
                console.error("Error removing income from user", error);
                setSnackbarMsg("Có lỗi xảy ra khi xóa chính sách thu nhập khỏi người dùng!");
            } finally {
                setIsLoading(false);
            }
        }
    };
    const handleExportExcel = async () => {
        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users');

        // Set the headers
        worksheet.columns = [
            { header: 'Tên', key: 'name', width: 30 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Số điện thoại', key: 'phone', width: 30 },
            { header: 'Trạng thái', key: 'status', width: 20 }
        ];

        // Add the filtered users' data to the worksheet
        filteredUsers.forEach(user => {
            let status = 'all'; // Default to 'all'

            // Check if IncomInfo exists and has at least one element
            const hasIncome = user.IncomInfo && Array.isArray(user.IncomInfo) && user.IncomInfo.length > 0;

            // Apply filtering logic
            if (assignUserSearchQuery === "all") {
                // Check each case individually when "all" is selected
                if (hasIncome) {
                    if (user.IncomInfo[0]?._id === selectedIncome?._id) {
                        status = 'Đã áp dụng';
                    } else {
                        status = 'Áp dụng khác';
                    }
                } else {
                    status = 'Chưa áp dụng';
                }
            } else if (assignUserSearchQuery === "applied" && hasIncome && user.IncomInfo[0]?._id === selectedIncome?._id) {
                status = 'Đã áp dụng';
            } else if (assignUserSearchQuery === "notApplied" && !hasIncome) {
                status = 'Chưa áp dụng';
            } else if (assignUserSearchQuery === "other" && hasIncome && user.IncomInfo[0]?._id !== selectedIncome?._id) {
                status = 'Áp dụng khác';
            }

            worksheet.addRow({
                name: user.name,
                email: user.email,
                phone: user.phone,
                status: status
            });
        });

        // Create a Blob object and generate the file for download
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

            // Create a link element to download the Blob as an Excel file
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'Danh-sach-nguoi-dung.xlsx';  // Download with .xlsx extension
            link.click();
        });
    };

    return (
        <div className="container mx-auto mt-4 px-4">
            <title>Quản lý chính sách CTV | Queen Acoustic</title>
            <meta name="description" content="Trang quản lý chính sách CTV tại Queen Acoustic." />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Sidebar */}
                <div className="lg:col-span-3 md:col-span-4">
                    <DashboardSidebar />
                </div>

                {/* Main content */}
                <div className="col-span-1 lg:col-span-9 md:col-span-8">
                    {/* Dashboard Header */}
                    <DashboardHeader
                        title="Quản lý chính sách CTV"
                        searchEnabled={true}
                        showSearch={false}
                        searchQuery={searchQuery}
                        onSearchToggle={() => {}}
                        onSearchChange={(e) => setSearchQuery(e.target.value)}
                        onSearchClear={() => setSearchQuery("")}
                        onSearchSubmit={handleSearch}
                        addEnabled={true}
                        onAddClick={() => setOpenDialog(true)}
                        addButtonLabel="Thêm chính sách"
                        addIcon={faPlus}
                        className="mb-6"
                    />


                    {/* Filter and Stats section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {/* Stats Card 1 */}
                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                    <FontAwesomeIcon icon={faUsers} className="text-blue-500 h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tổng số chính sách</p>
                                    <p className="text-xl font-bold text-gray-800">{total}</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Card 2 */}
                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                    <FontAwesomeIcon icon={faPercent} className="text-green-500 h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Chính sách phần trăm</p>
                                    <p className="text-xl font-bold text-gray-800">
                                        {incomes.filter(income => income.type_price === TypeIncome.PERCENT).length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Card 3 */}
                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                                    <FontAwesomeIcon icon={faMoneyBill} className="text-purple-500 h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Chính sách cố định</p>
                                    <p className="text-xl font-bold text-gray-800">
                                        {incomes.filter(income => income.type_price === TypeIncome.ORDER).length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* View Switcher */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center text-amber-600 text-xs xl:hidden z-10 animate-pulse opacity-80">
                            <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4 animate-pulse" />
                            <span className="ml-1">Kéo sang phải để xem thêm</span>
                        </div>
                        <div className="ml-auto hidden md:block">
                            <ViewSwitcher
                                value={viewMode}
                                onChange={setViewMode}
                            />
                        </div>
                    </div>

                    {/* Table View */}
                    {viewMode === "table" && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-left">STT</th>
                                        <th className="py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-left whitespace-nowrap">Tên chính sách</th>
                                        <th className="py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-left">Mô tả</th>
                                        <th className="py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-left">Loại</th>
                                        <th className="py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-right whitespace-nowrap">Giá trị</th>
                                        <th className="py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-center whitespace-nowrap">Số người dùng</th>
                                        <th className="py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {isLoading && incomes.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-10 text-center text-gray-500">
                                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gold-500 mr-2"></div>
                                                Đang tải dữ liệu...
                                            </td>
                                        </tr>
                                    ) : incomes.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-10 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                                        <FontAwesomeIcon icon={faUsers} className="text-gray-400 h-6 w-6" />
                                                    </div>
                                                    <p className="text-gray-600 font-medium">Không có chính sách thu nhập nào</p>
                                                    <p className="text-gray-500 text-sm mt-1">Thêm chính sách mới để bắt đầu</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        incomes.map((income, index) => (
                                            <tr key={income._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4 text-gray-700">{(page - 1) * limit + index + 1}</td>
                                                <td className="py-3 px-4 font-medium text-gray-800 whitespace-nowrap">{income.name}</td>
                                                <td className="py-3 px-4 text-gray-600 min-w-[200px]">{income.desc || "-"}</td>
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${income.type_price === TypeIncome.PERCENT
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-green-100 text-green-800"
                                                        }`}>
                                                        {income.type_price === TypeIncome.PERCENT ? (
                                                            <>
                                                                <FontAwesomeIcon icon={faPercent} className="mr-1 h-3 w-3" />
                                                                Phần trăm
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FontAwesomeIcon icon={faMoneyBill} className="mr-1 h-3 w-3" />
                                                                Cố định
                                                            </>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right font-medium">
                                                    <span className={`${income.type_price === TypeIncome.PERCENT ? "text-blue-600" : "text-green-600"}`}>
                                                        {income.price.toLocaleString()}
                                                        {income.type_price === TypeIncome.PERCENT ? "%" : "đ"}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <button
                                                        onClick={() => fetchIncomeUsers(income._id)}
                                                        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                                                    >
                                                        <span className="font-medium">{income.userCount || 0}</span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex justify-center">
                                                        <div className="flex space-x-1.5">
                                                            <button
                                                                onClick={() => handleEdit(income)}
                                                                className="p-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded transition-all duration-200"
                                                                title="Chỉnh sửa"
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenAssignDialog(income)}
                                                                className="p-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded transition-all duration-200"
                                                                title="Gán cho người dùng"
                                                            >
                                                                <FontAwesomeIcon icon={faUsers} className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <PaginationControls
                            page={page - 1} // Convert to 0-based for the component
                            limit={limit}
                            total={total}
                            onPageChange={(newPage) => setPage(newPage + 1)} // Convert back to 1-based
                            className="border-t border-gray-100"
                        />
                    </div>
                    )}

                    {/* Card View */}
                    {viewMode === "card" && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {isLoading && incomes.length === 0 ? (
                                    <div className="col-span-full py-10 text-center text-gray-500">
                                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gold-500 mr-2"></div>
                                        Đang tải dữ liệu...
                                    </div>
                                ) : incomes.length === 0 ? (
                                    <div className="col-span-full py-10 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                                <FontAwesomeIcon icon={faUsers} className="text-gray-400 h-6 w-6" />
                                            </div>
                                            <p className="text-gray-600 font-medium">Không có chính sách thu nhập nào</p>
                                            <p className="text-gray-500 text-sm mt-1">Thêm chính sách mới để bắt đầu</p>
                                        </div>
                                    </div>
                                ) : (
                                    incomes.map((income) => (
                                        <div key={income._id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                            <div className="bg-gradient-to-r from-gold-500 to-gold-400 p-3 text-white">
                                                <h3 className="font-medium truncate">{income.name}</h3>
                                            </div>
                                            <div className="p-4">
                                                <div className="mb-3">
                                                    <p className="text-sm text-gray-600 line-clamp-2 h-10">{income.desc || "-"}</p>
                                                </div>

                                                <div className="flex justify-between items-center mb-3">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${income.type_price === TypeIncome.PERCENT
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-green-100 text-green-800"
                                                        }`}>
                                                        {income.type_price === TypeIncome.PERCENT ? (
                                                            <>
                                                                <FontAwesomeIcon icon={faPercent} className="mr-1 h-3 w-3" />
                                                                Phần trăm
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FontAwesomeIcon icon={faMoneyBill} className="mr-1 h-3 w-3" />
                                                                Cố định
                                                            </>
                                                        )}
                                                    </span>

                                                    <span className={`font-medium ${income.type_price === TypeIncome.PERCENT ? "text-blue-600" : "text-green-600"}`}>
                                                        {income.price.toLocaleString()}
                                                        {income.type_price === TypeIncome.PERCENT ? "%" : "đ"}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <button
                                                        onClick={() => fetchIncomeUsers(income._id)}
                                                        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm"
                                                    >
                                                        <span className="font-medium">{income.userCount || 0}</span>
                                                        <span className="ml-1">người dùng</span>
                                                    </button>

                                                    <div className="flex space-x-1.5">
                                                        <button
                                                            onClick={() => handleEdit(income)}
                                                            className="p-1.5 bg-amber-50 border border-amber-300 hover:bg-amber-100 text-amber-700 rounded transition-all duration-200"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <FontAwesomeIcon icon={faEdit} className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenAssignDialog(income)}
                                                            className="p-1.5 bg-blue-50 border border-blue-300 hover:bg-blue-100 text-blue-700 rounded transition-all duration-200"
                                                            title="Gán cho người dùng"
                                                        >
                                                            <FontAwesomeIcon icon={faUsers} className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Pagination for Card View */}
                            <div className="mt-6">
                                <PaginationControls
                                    page={page - 1} // Convert to 0-based for the component
                                    limit={limit}
                                    total={total}
                                    onPageChange={(newPage) => setPage(newPage + 1)} // Convert back to 1-based
                                    className="border border-gray-100"
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Create/Edit Dialog */}
            {openDialog && (
                <StandardDialog
                    open={openDialog}
                    onClose={handleDialogClose}
                    disableBackdropClick={true}
                    title={editingIncome ? "Cập nhật chính sách thu nhập" : "Thêm chính sách thu nhập"}
                    maxWidth="md"
                    className="rounded-xl overflow-hidden w-full max-w-screen-md mx-auto"
                    headerClassName="bg-gradient-to-r from-gold-50 to-white border-b py-4"
                    contentClassName="p-6"
                    actions={
                        <div className="flex gap-3 justify-end w-full">
                            <DialogActionButton
                                onClick={handleDialogClose}
                                variant="outline"
                                className="px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-gray-100"
                                disabled={isLoading}
                            >
                                Hủy
                            </DialogActionButton>
                            <DialogActionButton
                                onClick={() => {
                                    const form = document.getElementById("income-form") as HTMLFormElement;
                                    if (form) form.requestSubmit();
                                }}
                                variant="primary"
                                className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 transition-all duration-200 shadow-sm hover:shadow flex items-center"
                                disabled={isLoading}
                            >
                                {isLoading && (
                                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                                )}
                                {editingIncome ? "Cập nhật" : "Thêm mới"}
                            </DialogActionButton>
                        </div>
                    }
                >
                    <div className="relative">
                        {/* Decorative elements */}
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-gold-200 to-gold-100 rounded-full opacity-20 -z-10"></div>
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-gold-300 to-gold-100 rounded-full opacity-10 -z-10"></div>

                        {/* Header with icon */}
                        <div className="mb-6 flex items-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 flex items-center justify-center shadow-md mr-4">
                                <FontAwesomeIcon icon={editingIncome ? faEdit : faPlus} className="text-white h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{editingIncome ? "Chỉnh sửa chính sách" : "Tạo chính sách mới"}</h3>
                                <p className="text-sm text-gray-500">{editingIncome ? "Cập nhật thông tin chính sách thu nhập" : "Nhập thông tin để tạo chính sách thu nhập mới"}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6" id="income-form">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                                    <span className="w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center text-xs mr-2">1</span>
                                    Thông tin cơ bản
                                </h4>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Tên chính sách <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="name"
                                                defaultValue={editingIncome?.name || ""}
                                                placeholder="Nhập tên chính sách"
                                                className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm"
                                                required
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FontAwesomeIcon icon={faHandshake} className="text-gray-400 h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                                        <textarea
                                            name="desc"
                                            defaultValue={editingIncome?.desc || ""}
                                            placeholder="Mô tả ngắn gọn về chính sách"
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                                    <span className="w-6 h-6 rounded-full bg-gold-500 text-white flex items-center justify-center text-xs mr-2">2</span>
                                    Thiết lập giá trị
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Loại <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <select
                                                name="type_price"
                                                defaultValue={editingIncome?.type_price || TypeIncome.PERCENT}
                                                className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm appearance-none"
                                                required
                                            >
                                                <option value={TypeIncome.PERCENT}>Phần trăm (%)</option>
                                                <option value={TypeIncome.ORDER}>Cố định (VND)</option>
                                            </select>
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FontAwesomeIcon icon={faPercent} className="text-gray-400 h-4 w-4" />
                                            </div>
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Giá trị <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="price"
                                                defaultValue={editingIncome?.price || ""}
                                                min="0"
                                                step="0.01"
                                                placeholder="Nhập giá trị"
                                                className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-200 focus:border-gold-400 transition-all shadow-sm"
                                                required
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FontAwesomeIcon icon={faMoneyBill} className="text-gray-400 h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </StandardDialog>
            )}

            {/* Assign Dialog */}
            {openAssignDialog && selectedIncome && (
                <StandardDialog
                    open={openAssignDialog}
                    onClose={handleAssignDialogClose}
                    title={`Gán chính sách thu nhập: ${selectedIncome.name}`}
                    maxWidth="xl"
                    className="rounded-xl overflow-hidden w-full max-w-screen-xl mx-auto"
                    headerClassName="bg-gradient-to-r from-blue-50 to-white border-b py-4"
                    contentClassName="p-6"
                    actions={
                        <div className="flex gap-3 justify-end w-full">
                            <DialogActionButton
                                onClick={handleAssignDialogClose}
                                variant="outline"
                                className="px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-gray-100"
                                disabled={isLoading}
                            >
                                Hủy
                            </DialogActionButton>
                            <DialogActionButton
                                onClick={handleAssignIncome}
                                variant="primary"
                                className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 transition-all duration-200 shadow-sm hover:shadow flex items-center"
                                disabled={isLoading || (assignMethod === "manual" && selectedUsers.length === 0)}
                            >
                                {isLoading && (
                                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                                )}
                                {assignMethod === "manual" ? (
                                    <>
                                        Gán cho {selectedUsers.length} người dùng
                                    </>
                                ) : (
                                    <>Gán tự động</>
                                )}
                            </DialogActionButton>
                        </div>
                    }
                >
                    <div className="relative">
                        {/* Decorative elements */}
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-200 to-blue-100 rounded-full opacity-20 -z-10"></div>
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-blue-300 to-blue-100 rounded-full opacity-10 -z-10"></div>

                        {/* Header with icon */}
                        <div className="mb-6 flex items-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center shadow-md mr-4">
                                <FontAwesomeIcon icon={faUsers} className="text-white h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Gán chính sách cho người dùng</h3>
                                <p className="text-sm text-gray-500">Chọn người dùng để áp dụng chính sách thu nhập</p>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                    <FontAwesomeIcon icon={faPercent} className="text-blue-500 h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">{selectedIncome.name}</p>
                                    <p className="text-sm text-gray-600">
                                        {selectedIncome.type_price === TypeIncome.PERCENT ? "Phần trăm" : "Cố định"}:
                                        <span className="font-medium">
                                            {selectedIncome.price.toLocaleString()}{selectedIncome.type_price === TypeIncome.PERCENT ? "%" : "đ"}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="border-b border-gray-200 mb-4">
                                <div className="flex flex-wrap -mb-px">
                                    <button
                                        className={`mr-2 inline-block py-2 px-4 border-b-2 font-medium text-sm ${assignMethod === "manual"
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                            }`}
                                        onClick={() => setAssignMethod("manual")}
                                    >
                                        Chọn thủ công
                                    </button>
                                    <button
                                        className={`mr-2 inline-block py-2 px-4 border-b-2 font-medium text-sm ${assignMethod === "auto"
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                            }`}
                                        onClick={() => setAssignMethod("auto")}
                                    >
                                        Gán tự động
                                    </button>
                                </div>
                            </div>

                            {assignMethod === "manual" ? (
                                <div className="space-y-4">


                                    {/* Summary section */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        {/* Total users */}
                                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                                    <FontAwesomeIcon icon={faUsers} className="text-blue-500 h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Tổng số người dùng</p>
                                                    <p className="text-xl font-bold text-gray-800">{users.length}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Applied users */}
                                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                                    <FontAwesomeIcon icon={faUserPlus} className="text-green-500 h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Đã áp dụng</p>
                                                    <p className="text-xl font-bold text-gray-800">
                                                        {users.filter((user: any) => user.IncomInfo && user.IncomInfo[0] && user.IncomInfo[0]._id === selectedIncome?._id).length}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Selected users */}
                                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                                                    <FontAwesomeIcon icon={faUserPlus} className="text-amber-500 h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Đã chọn</p>
                                                    <p className="text-xl font-bold text-gray-800">{selectedUsers.length}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        {/* Lọc theo trạng thái */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Lọc theo trạng thái</label>
                                            <div className="relative">
                                                <select
                                                    value={assignUserSearchQuery}
                                                    onChange={(e) => setAssignUserSearchQuery(e.target.value)}
                                                    className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all shadow-sm appearance-none"
                                                >
                                                    <option value="all">Tất cả người dùng</option>
                                                    <option value="applied">Đã áp dụng chính sách này</option>
                                                    <option value="notApplied">Chưa áp dụng chính sách</option>
                                                    <option value="other">Áp dụng chính sách khác</option>
                                                </select>
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FontAwesomeIcon icon={faFilter} className="text-gray-400 h-4 w-4" />
                                                </div>
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tìm kiếm người dùng */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Tìm kiếm người dùng</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={searchKeyword}
                                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                                    placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                                                    className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all shadow-sm"
                                                />
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FontAwesomeIcon icon={faSearch} className="text-gray-400 h-4 w-4" />
                                                </div>
                                                {searchKeyword && (
                                                    <button
                                                        onClick={() => setSearchKeyword('')}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mb-4">
                                        <button
                                            onClick={() => {
                                                if (selectedUsers.length === filteredUsers.length) {
                                                    setSelectedUsers([]);
                                                } else {
                                                    setSelectedUsers(filteredUsers.map(user => user._id));
                                                }
                                            }}
                                            className="px-4 py-2.5 bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 rounded-md shadow-sm transition-all duration-200 flex items-center"
                                        >
                                            <FontAwesomeIcon icon={selectedUsers.length === filteredUsers.length ? faTimes : faUsers} className="mr-2 h-4 w-4" />
                                            {selectedUsers.length === filteredUsers.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                                        </button>

                                        <button
                                            onClick={handleExportExcel}
                                            className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white rounded-md shadow-sm transition-all duration-200 flex items-center"
                                        >
                                            <FontAwesomeIcon icon={faFileExcel} className="mr-2 h-4 w-4" />
                                            Xuất Excel
                                        </button>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                        <div className="p-3 bg-blue-50 border-b border-gray-200 flex items-center justify-between">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="form-checkbox h-5 w-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                                                    checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                                                    onChange={() => {
                                                        if (selectedUsers.length === filteredUsers.length) {
                                                            setSelectedUsers(prev => prev.filter(id => !filteredUsers.some(user => user._id === id)));
                                                        } else {
                                                            setSelectedUsers(prev => {
                                                                const newSelected = [...prev];
                                                                filteredUsers.forEach(user => {
                                                                    if (!newSelected.includes(user._id)) {
                                                                        newSelected.push(user._id);
                                                                    }
                                                                });
                                                                return newSelected;
                                                            });
                                                        }
                                                    }}
                                                />
                                                <label className="ml-2 text-sm font-medium text-gray-700">
                                                    {assignUserSearchQuery.trim() === ""
                                                        ? "Chọn tất cả"
                                                        : `Chọn tất cả kết quả tìm kiếm (${filteredUsers.length})`}
                                                </label>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {users.length > 0 &&
                                                    <span>Hiển thị {filteredUsers.length} / {users.length} người dùng</span>
                                                }
                                            </div>
                                        </div>

                                        <div className="max-h-[400px] overflow-y-auto bg-white">
                                            {isLoading ? (
                                                <div className="p-8 text-center">
                                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                                                    <p className="text-gray-600">Đang tải danh sách người dùng...</p>
                                                </div>
                                            ) : filteredUsers.length === 0 ? (
                                                <div className="p-8 text-center">
                                                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                                        <FontAwesomeIcon icon={faUser} className="text-gray-400 h-6 w-6" />
                                                    </div>
                                                    <p className="text-gray-600 font-medium">
                                                        {assignUserSearchQuery.trim() !== ""
                                                            ? `Không tìm thấy người dùng nào phù hợp với "${assignUserSearchQuery}"`
                                                            : "Không có người dùng nào"}
                                                    </p>
                                                    <p className="text-gray-500 text-sm mt-1">
                                                        {assignUserSearchQuery.trim() !== "" ? "Thử tìm kiếm với từ khóa khác" : "Thêm người dùng mới để bắt đầu"}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-100">
                                                    {filteredUsers.map((user: any) => (
                                                        <div key={user._id} className="p-4 flex items-center hover:bg-gray-50 transition-colors">
                                                            <div className="mr-3">
                                                                {user.IncomInfo && user.IncomInfo[0] && user.IncomInfo[0]._id === selectedIncome?._id ? (
                                                                    <button
                                                                        onClick={() => handleRemoveIncomeFromUser(user._id)}
                                                                        className="h-8 w-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                                                                        title="Xóa chính sách"
                                                                        disabled={isLoading}
                                                                    >
                                                                        <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                                                                    </button>
                                                                ) : (
                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-checkbox h-5 w-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                                                                        checked={selectedUsers.includes(user._id)}
                                                                        onChange={() => handleUserSelection(user._id)}
                                                                    />
                                                                )}
                                                            </div>

                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-800">{user.name}</p>
                                                                <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 mt-1">
                                                                    <span className="flex items-center">
                                                                        <FontAwesomeIcon icon={faPhone} className="h-3 w-3 mr-1 text-gray-400" />
                                                                        {user.phone}
                                                                    </span>
                                                                    <span className="flex items-center">
                                                                        <FontAwesomeIcon icon={faEnvelope} className="h-3 w-3 mr-1 text-gray-400" />
                                                                        {user.email}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${user.IncomInfo && user.IncomInfo[0]
                                                                        ? user.IncomInfo[0]._id === selectedIncome?._id
                                                                            ? "bg-green-100 text-green-800"
                                                                            : "bg-yellow-100 text-yellow-800"
                                                                        : "bg-gray-100 text-gray-800"
                                                                        }`}
                                                                >
                                                                    {user.IncomInfo && user.IncomInfo[0]
                                                                        ? user.IncomInfo[0]._id === selectedIncome?._id
                                                                            ? "Đã áp dụng"
                                                                            : "Áp dụng khác"
                                                                        : "Chưa áp dụng"
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {users.length > 0 && assignUserSearchQuery.trim() !== "" && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Hiển thị {filteredUsers.length} / {users.length} người dùng
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Phần giao diện "Gán tự động" vẫn giữ nguyên
                                <div className="space-y-6">
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                                        <div className="flex items-start">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1">
                                                <FontAwesomeIcon icon={faUserPlus} className="text-blue-500 h-4 w-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-800 mb-1">Tự động gán chính sách</h4>
                                                <p className="text-sm text-gray-600">
                                                    Tự động gán chính sách thu nhập cho người dùng dựa trên các tiêu chí bên dưới. Hệ thống sẽ tìm kiếm và gán chính sách cho tất cả người dùng phù hợp.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                                            <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-2">1</span>
                                            Tiêu chí gán chính sách
                                        </h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Vai trò người dùng</label>
                                                <div className="relative">
                                                    <select
                                                        value={userRole}
                                                        onChange={(e) => setUserRole(e.target.value)}
                                                        className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all shadow-sm appearance-none"
                                                    >
                                                        <option value="">-- Tất cả vai trò --</option>
                                                        <option value="USER">Người dùng</option>
                                                        <option value="ADMIN">Quản trị viên</option>
                                                    </select>
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <FontAwesomeIcon icon={faUser} className="text-gray-400 h-4 w-4" />
                                                    </div>
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Đăng ký trước ngày</label>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        value={timeCreate}
                                                        onChange={(e) => setTimeCreate(e.target.value)}
                                                        className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all shadow-sm"
                                                    />
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                        <div className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-sm text-yellow-700">
                                                Lưu ý: Hành động này sẽ gán chính sách cho tất cả người dùng phù hợp với tiêu chí đã chọn.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </StandardDialog>
            )}

            {/* Income Users Dialog */}
            {openUsersDialog && (
                <StandardDialog
                    open={openUsersDialog}
                    onClose={() => setOpenUsersDialog(false)}
                    title="Danh sách người dùng áp dụng chính sách thu nhập"
                    maxWidth="lg"
                    className="rounded-xl overflow-hidden w-full max-w-screen-lg mx-auto"
                    headerClassName="bg-gradient-to-r from-blue-50 to-white border-b py-4"
                    contentClassName="p-6"
                    actions={
                        <DialogActionButton
                            onClick={() => setOpenUsersDialog(false)}
                            variant="outline"
                            className="px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-gray-100"
                        >
                            Đóng
                        </DialogActionButton>
                    }
                >
                    <div className="relative">
                        {/* Decorative elements */}
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-200 to-blue-100 rounded-full opacity-20 -z-10"></div>
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-blue-300 to-blue-100 rounded-full opacity-10 -z-10"></div>

                        {/* Header with icon */}
                        <div className="mb-6 flex items-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center shadow-md mr-4">
                                <FontAwesomeIcon icon={faUsers} className="text-white h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Danh sách người dùng</h3>
                                <p className="text-sm text-gray-500">Người dùng đang áp dụng chính sách thu nhập này</p>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                                <span className="text-gray-600">Đang tải danh sách người dùng...</span>
                            </div>
                        ) : incomeUsers.length > 0 ? (
                            <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gradient-to-r from-blue-500 to-blue-400 text-white">
                                        <tr>
                                            <th className="py-3 px-4 text-left text-xs font-medium">Họ tên</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium">Liên hệ</th>
                                            <th className="py-3 px-4 text-center text-xs font-medium">Vai trò</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {incomeUsers.map((user) => (
                                            <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-gray-800">{user.name}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center text-gray-600">
                                                        <FontAwesomeIcon icon={faPhone} className="h-3 w-3 mr-1 text-gray-400" />
                                                        {user.phone}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                                        <FontAwesomeIcon icon={faEnvelope} className="h-3 w-3 mr-1 text-gray-400" />
                                                        {user.email}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${user.role === "USER"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : user.role === "ADMIN"
                                                            ? "bg-purple-100 text-purple-800"
                                                            : "bg-gray-100 text-gray-800"
                                                        }`}>
                                                        {user.role === "USER" ? (
                                                            <>
                                                                <FontAwesomeIcon icon={faUser} className="mr-1 h-3 w-3" />
                                                                Người dùng
                                                            </>
                                                        ) : user.role === "ADMIN" ? (
                                                            <>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                                </svg>
                                                                Quản trị viên
                                                            </>
                                                        ) : user.role}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                    <FontAwesomeIcon icon={faUsers} className="text-gray-400 h-6 w-6" />
                                </div>
                                <p className="text-gray-600 font-medium">Không có người dùng nào áp dụng chính sách này</p>
                                <p className="text-gray-500 text-sm mt-1">Gán chính sách cho người dùng để xem danh sách tại đây</p>
                            </div>
                        )}
                    </div>
                </StandardDialog>
            )}

            {/* Snackbar */}
            {snackbarMsg && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gold-500 to-gold-400 text-white px-4 py-3 rounded-lg shadow-lg flex items-center z-50 animate-fadeIn">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="flex-1">{snackbarMsg}</span>
                    <button
                        onClick={() => setSnackbarMsg("")}
                        className="ml-4 p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default IncomePage;
