import React from "react";
import { Menu, MenuItem, ListItemIcon } from "@mui/material";
import Flag from "react-world-flags";

interface LanguageMenuProps {
    anchorEl: null | HTMLElement;
    onClose: () => void;
    setLanguage: (lang: string) => void;
}

export default function LanguageMenu({ anchorEl, onClose, setLanguage }: LanguageMenuProps) {
    const handleLanguageChange = (lang: string) => {
        setLanguage(lang); 
        onClose(); 
    };
    return (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            id="account-menu"
            onClose={onClose}
            autoFocus={false}
            slotProps={{
                paper: {
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 0.2,
                        '&::before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 18,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
            <MenuItem onClick={() => handleLanguageChange('VN')} className="text-[12px]" sx={{ '&:hover': { backgroundColor: 'var(--clr-bg-3)', color: 'var(--clr-txt-4)' }, }}>
                <ListItemIcon>
                    <Flag code="VN" style={{ objectFit: 'cover', borderRadius: '50%', width: '24px', height: '24px' }} />
                </ListItemIcon>
                Tiếng Việt
            </MenuItem>
            <MenuItem onClick={() => handleLanguageChange('GB')}className="text-[12px]" sx={{ '&:hover': {  backgroundColor: 'var(--clr-bg-3)', color: 'var(--clr-txt-4)'  }, }} >
                <ListItemIcon>
                    <Flag code="GB" style={{ objectFit: 'cover', borderRadius: '50%', width: '24px', height: '24px' }} />
                </ListItemIcon>
                English
            </MenuItem>
        </Menu>
    );
}
