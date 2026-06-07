"use client";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";

interface SearchBarProps {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    handleSearch: (e?: React.FormEvent) => void;
}

export default function SearchBar({ searchQuery, setSearchQuery, handleSearch }: SearchBarProps) {
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const isClient = typeof window !== 'undefined';
    const [isMobile, setIsMobile] = useState(isClient ? window.innerWidth <= 768 : false);

    useEffect(() => {
        if (!isClient) return;

        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isClient]);
    return (
        <Box>
            {/* Ô tìm kiếm trên desktop */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center rounded-md px-3" style={{ backgroundColor: 'var(--clr-bg-8)' }}>
                {/* Icon tìm kiếm */}
                <span>
                    <FontAwesomeIcon icon={faSearch} style={{ color: 'var(--clr-txt-3)', width: '20px', height: '20px' }} />
                </span>

                {/* Ô nhập liệu */}
                <input
                    type="text"
                    placeholder="Bạn tìm gì hôm nay?"
                    className="flex-1 py-2 px-3 text-md text-black border-none outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                {/* Thanh phân cách */}
                <span className="px-2 text-gray-400">|</span>

                {/* Nút tìm kiếm */}
                <button type="submit" className="px-4 py-2 cursor-pointer rounded-md text-md text-black">
                    Tìm kiếm
                </button>
            </form>

            {/* Mobile View: Icon tìm kiếm */}
            <div className="flex-grow mx-4 col-span-2 lg:hidden flex justify-end">
                <div className="relative rounded-md lg:hidden">
                    <button
                        className="px-2 py-2 cursor-pointer rounded-md lg:hidden"
                        style={{ color: "#fff" }}
                        onClick={() => setIsPopupVisible(!isPopupVisible)}
                    >
                        <FontAwesomeIcon icon={faSearch}
                            style={{
                                borderRadius: '50%',
                                border: isMobile ? '1px solid #ccc' : 'none',
                                padding: isMobile ? '7px' : '0',
                            }} />
                    </button>
                </div>
                {/* Popup tìm kiếm trên mobile */}
                {isPopupVisible && (
                    <div className="fixed top-0 left-0 right-0 bg-black bg-opacity-50 z-50 p-4">
                        <div className="relative bg-white rounded-md w-full max-w-lg mx-auto pt-10 pb-4 px-4">
                            <button className="absolute top-0 right-2 text-gray-500 hover:text-gray-800 text-3xl" onClick={() => setIsPopupVisible(false)}>
                                &times;
                            </button>
                            <form onSubmit={handleSearch}>
                                <input
                                    type="text"
                                    placeholder="Bạn tìm gì hôm nay?"
                                    className="w-full py-3 px-3 mb-4 rounded-md text-md border border-gray-500 text-black"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md w-full">Tìm kiếm</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Box>
    );
}
