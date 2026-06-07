/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import api from "@/utils/api";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faChevronDown,
  faChevronUp, 
  faEdit, 
  faEye, 
  faPlus, 
  faSearch, 
  faSortAmountDown,
  faChair,
  faTrashAlt,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import { formatDateTime } from "@/utils/date";
import Link from "next/link";

export default function EventManager() {
  const [eventList, setEventList] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' | null }>({
    key: 'title',
    direction: 'ascending'
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{show: boolean, id: string | null}>({
    show: false,
    id: null
  });

  const getEventList = async () => {
    setIsLoading(true);
    try {
      const eventResponse = await api.get('/events/getEventByCondition');
      const events = eventResponse.data.events || [];
      
      // Add formatted date for display
      const eventsWithFormattedDate = events.map((evt: any) => {
        const startTime = evt.showsTimeData && evt.showsTimeData.length > 0 
          ? evt.showsTimeData[0].time_start 
          : null;
        
        return {
          ...evt,
          formattedDate: startTime ? formatDateTime(startTime) : 'Chưa có lịch'
        };
      });
      
      setEventList(eventsWithFormattedDate);
      setFilteredEvents(eventsWithFormattedDate);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getEventList();
  }, []);

  useEffect(() => {
    // Filter events based on search term and status filter
    let results = [...eventList];
    
    if (searchTerm) {
      results = results.filter(evt => 
        evt.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      results = results.filter(evt => evt.status === statusFilter);
    }
    
    // Apply sorting
    if (sortConfig.key && sortConfig.direction) {
      results.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredEvents(results);
  }, [eventList, searchTerm, sortConfig, statusFilter]);

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' | null = 'ascending';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'ascending') {
        direction = 'descending';
      } else if (sortConfig.direction === 'descending') {
        direction = 'ascending';
      }
    }
    
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: string) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? 
        <FontAwesomeIcon icon={faChevronUp} className="ml-1 text-xs" /> : 
        <FontAwesomeIcon icon={faChevronDown} className="ml-1 text-xs" />;
    }
    return null;
  };

  const handleDeleteClick = (id: string) => {
    setShowDeleteConfirm({show: true, id});
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm.id) return;
    
    try {
      await api.delete(`/events/Delete?id=${showDeleteConfirm.id}`);
      // Refresh list after deletion
      getEventList();
      setShowDeleteConfirm({show: false, id: null});
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Không thể xóa sự kiện, vui lòng thử lại sau.');
    }
  };

  // Status badge color mapping
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'ARCHIVED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Status text mapping
  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Đã kích hoạt';
      case 'INACTIVE':
        return 'Chưa kích hoạt';
      case 'ARCHIVED':
        return 'Đã lưu trữ';
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <title>Quản lý sự kiện | Queen Acoustic</title>
      <meta name="description" content="Trang quản lý sự kiện tại Queen Acoustic." />
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header with stats */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Quản lý sự kiện</h1>
            <Link href="/to-chuc/tao-su-kien">
              <button className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-md flex items-center transition-colors">
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Tạo sự kiện mới
              </button>
            </Link>
          </div>
          
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600">Tổng số sự kiện</p>
                  <p className="text-2xl font-bold text-blue-800">{eventList.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-600">Sự kiện đã kích hoạt</p>
                  <p className="text-2xl font-bold text-green-800">
                    {eventList.filter(evt => evt.status === 'ACTIVE').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-center">
                <div className="bg-gray-100 p-3 rounded-full mr-4">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sự kiện chưa kích hoạt</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {eventList.filter(evt => evt.status === 'INACTIVE').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-300 focus:border-gold-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
            </div>
            <select
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-300 focus:border-gold-500 transition-all"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="ACTIVE">Đã kích hoạt</option>
              <option value="INACTIVE">Chưa kích hoạt</option>
              <option value="ARCHIVED">Đã lưu trữ</option>
            </select>
          </div>
        </div>
        
        {/* Events Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      Tên sự kiện
                      {getSortIcon('title')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('formattedDate')}
                  >
                    <div className="flex items-center">
                      Thời gian
                      {getSortIcon('formattedDate')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Trạng thái
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((evt, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{evt.title}</div>
                          <div className="text-sm text-gray-500">ID: {evt._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {evt.formattedDate}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadgeClass(evt.status)}`}>
                        {getStatusText(evt.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <Link href={`/to-chuc/cap-nhat-su-kien/${evt._id}`}>
                          <button className="px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors" title="Chỉnh sửa">
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        </Link>
                        <Link href={`/to-chuc/quan-ly-cho/${evt._id}`}>
                          <button className="px-3 py-1 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors" title="Quản lý chỗ">
                            <FontAwesomeIcon icon={faChair} />
                          </button>
                        </Link>
                        <button 
                          className="px-3 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                          onClick={() => handleDeleteClick(evt._id)}
                          title="Xóa"
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-4xl text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">Không tìm thấy sự kiện nào</p>
            <Link href="/to-chuc/tao-su-kien">
              <button className="px-4 py-2 bg-gold-500 text-white rounded-md hover:bg-gold-600 transition-colors">
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Tạo sự kiện mới
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm.show && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity bg-gray-800 bg-opacity-50" aria-hidden="true"></div>
            
            {/* Modal content */}
            <div className="z-50 w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Xác nhận xóa sự kiện
              </h3>
              
              <div className="mt-2">
                <p className="text-sm text-red-600 mb-4">
                  Thao tác này sẽ xóa vĩnh viễn sự kiện và không thể khôi phục. Bạn có chắc chắn muốn tiếp tục?
                </p>
                
                <div className="mt-6 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm({show: false, id: null})}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none"
                  >
                    Xác nhận xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}