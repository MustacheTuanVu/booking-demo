import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box } from '@mui/material';
import React, { useState } from 'react';

// Fake seat data per area
const seatOptions: Record<string, string[]> = {
    J: ['J1', 'J2', 'J3', 'J4'],
    Q: ['Q1', 'Q2', 'Q3'],
    K: ['K1', 'K2', 'K3', 'K4', 'K5'],
};

export default function UpdateSeat({ openDialog, setOpenDialog }: any) {
    const [selectedArea, setSelectedArea] = useState<string | null>(null);
    const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

    const handleDialogClose = () => {
        setOpenDialog(false);
        setSelectedArea(null);
        setSelectedSeat(null);
    };

    const handleAreaClick = (area: string) => {
        setSelectedArea(area);
        setSelectedSeat(null);
    };

    const handleSeatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSeat(e.target.value);
    };

    return (
        <Box
            sx={{
                maxWidth: '1280px',
                width: '100%',
                margin: '0 auto',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'var(--clr-bg)',
            }}
        >
            {openDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="relative bg-white rounded-lg w-full lg:w-1/2 max-w-2xl p-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex flex-col md:flex-row justify-between md:justify-center items-center relative rounded-lg bg-gradient-to-r from-gold-100 to-white p-4 shadow-md">
                            <h2 className="text-2xl md:text-3xl font-semibold text-gold-700 text-center md:text-left pr-10">
                                Chọn khu vực để xếp chỗ
                            </h2>
                            <button
                                className="absolute top-6 right-4 text-gray-600 hover:text-gray-900"
                                onClick={handleDialogClose}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Area selection buttons */}
                        <div className="mt-4 flex flex-col text-left">
                            <label htmlFor="seat-select" className="mb-2 font-medium text-gray-800">
                                Chọn khu vực cần xếp chỗ
                            </label>
                            <div className="flex justify-center gap-4 w-full">

                                {Object.keys(seatOptions).map(area => (
                                    <button
                                        key={area}
                                        onClick={() => handleAreaClick(area)}
                                        className={`px-4 py-2 rounded-lg border w-full ${selectedArea === area ? 'bg-gold-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        Khu {area}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Seat selector */}
                        {selectedArea && (
                            <div className="mt-4 flex flex-col text-left">
                                <label htmlFor="seat-select" className="mb-2 font-medium text-gray-800">
                                    Chọn bàn trong khu {selectedArea}
                                </label>
                                <select
                                    id="seat-select"
                                    value={selectedSeat || ''}
                                    onChange={handleSeatChange}
                                    className="p-2 border border-gray-300 rounded-lg focus:ring-gold-200 focus:border-gold-400 w-full"
                                >
                                    <option value="" disabled>
                                        -- Chọn bàn --
                                    </option>
                                    {seatOptions[selectedArea].map(seat => (
                                        <option key={seat} value={seat}>
                                            {seat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="flex justify-end space-x-2 sm:space-x-3 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t">
                            <button
                                type="button"
                                onClick={handleDialogClose}
                                // disabled={isLoading}
                                className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                            >
                                <FontAwesomeIcon icon={faTimes} className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                                Hủy
                            </button>
                            <button

                                // disabled={isLoading || (imageFile && !croppedImage) || false}
                                className={`px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm text-white rounded-lg flex items-center transition-colors bg-gold-500 hover:bg-gold-600
                                    }`}
                            >
                                <FontAwesomeIcon icon={faCheck} className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                                Lưu thông tin
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Box>
    );
}
