'use client';
import { AppContext } from '@/context/AppContext';
import api from '@/utils/api';
import { faEye, faEyeSlash, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useState, useMemo, useCallback, useRef, memo, startTransition } from 'react';
import { FaGoogle } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { FaChevronLeft, FaCheckCircle } from 'react-icons/fa';
import { browserName } from 'react-device-detect';

// Small utility components, memoized for performance
const ErrorMessage = memo(({ message }: { message: string }) => (
    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
        <p className="text-sm text-red-600">{message}</p>
    </div>
));
ErrorMessage.displayName = 'ErrorMessage';

const LoadingSpinner = memo(() => (
    <span className="flex items-center justify-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Đang xử lý...
    </span>
));
LoadingSpinner.displayName = 'LoadingSpinner';

// Animation CSS extracted outside of component
const animationStyles = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
    @keyframes backdropFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes backdropFadeOut { from { opacity: 1; } to { opacity: 0; } }

    .animate-fadeIn {
        animation: fadeIn 0.18s ease-out forwards;
        will-change: transform, opacity;
        transform: translateZ(0);
    }
    .animate-fadeOut {
        animation: fadeOut 0.12s ease-in forwards;
        will-change: opacity;
    }
    .animate-backdropFadeIn {
        animation: backdropFadeIn 0.18s ease-out forwards;
        will-change: opacity;
    }
    .animate-backdropFadeOut {
        animation: backdropFadeOut 0.12s ease-in forwards;
        will-change: opacity;
    }
`;

// Memoized dialog backdrop
const DialogBackdrop = memo(({ show, onClose, isClosing }: { show: boolean; onClose: () => void; isClosing: boolean }) => {
    if (!show) return null;

    return (
        <div
            className={`fixed inset-0 bg-black/50 z-40 ${isClosing ? "animate-backdropFadeOut" : "animate-backdropFadeIn"}`}
            onClick={onClose}
            aria-hidden="true"
        />
    );
});
DialogBackdrop.displayName = 'DialogBackdrop';

// Optimized Dialog component
const Dialog = memo(({
    open,
    onClose,
    children,
    maxWidth = "md",
    isClosing = false
}: {
    open: boolean;
    onClose?: () => void;
    children: React.ReactNode;
    maxWidth?: "xs" | "sm" | "md" | "lg";
    isClosing?: boolean;
}) => {
    if (!open) return null;

    const widthClasses = {
        xs: "max-w-md",
        sm: "max-w-lg",
        md: "max-w-2xl",
        lg: "max-w-4xl"
    };

    return (
        <>
            <DialogBackdrop show={open} onClose={onClose || (() => { })} isClosing={isClosing} />
            <div
                className="fixed z-50 inset-0 overflow-y-auto"
                aria-labelledby="dialog-title"
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-center justify-center min-h-screen p-4">
                    <div
                        className={`${widthClasses[maxWidth]} w-full ${isClosing ? "animate-fadeOut" : "animate-fadeIn"} bg-white rounded-xl shadow-2xl overflow-hidden`}
                        onClick={e => e.stopPropagation()}
                        style={{
                            transform: 'translateZ(0)',
                            backfaceVisibility: 'hidden'
                        }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
});
Dialog.displayName = 'Dialog';

export default function Login() {
    const { saveUserInfo, saveIsLogin } = useContext(AppContext);
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [errorPhone, setErrorPhone] = useState("");
    const [errorEmail, setErrorEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showWebKitDialog, setShowWebKitDialog] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
    const [isDialogClosing, setIsDialogClosing] = useState(false);

    // Refs for optimized focus handling and validation debouncing
    const emailInputRef = useRef<HTMLInputElement>(null);
    const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hasInteractedWithPhoneRef = useRef(false);

    // Effect for Webkit dialog
    useEffect(() => {
        if (browserName === 'WebKit' && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
            try {
                const timer = setTimeout(() => setShowWebKitDialog(true), 500);
                return () => clearTimeout(timer);
            } catch (error) {
                // Silent catch
            }
        }
    }, []);

    // Optimized validation with debounce - reduced delay for better UX
    const validateEmail = useCallback((value: string) => {
        if (validationTimeoutRef.current) {
            clearTimeout(validationTimeoutRef.current);
        }

        validationTimeoutRef.current = setTimeout(() => {
            if (!value) {
                setErrorEmail("Vui lòng nhập email của bạn");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            setErrorEmail(!emailRegex.test(value)
                ? "Sai định dạng email. Ví dụ: example@gmail.com"
                : "");
        }, 300);
    }, []);

    const validatePhone = useCallback((value: string) => {
        if (validationTimeoutRef.current) {
            clearTimeout(validationTimeoutRef.current);
        }

        // Only validate if there's been interaction or the field has content
        if (!hasInteractedWithPhoneRef.current && !value) {
            return;
        }

        // Faster validation timing (150ms instead of 300ms)
        validationTimeoutRef.current = setTimeout(() => {
            startTransition(() => {
                setErrorPhone(value.length < 10 && value.length > 0
                    ? "Sai định dạng số điện thoại. Ví dụ: 0123456789"
                    : "");
            });
        }, 150);
    }, []);

    // Optimized input handlers
    const handleChange = useCallback((field: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (field === "phone") {
            setPhone(value);
            validatePhone(value);
        }

        if (field === "email") {
            setEmail(value);
            validateEmail(value);
        }
    }, [validatePhone, validateEmail]);

    // Dedicated handlers for specific inputs to avoid field parameter and conditionals
    const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        hasInteractedWithPhoneRef.current = true;

        // Update the value immediately for a responsive feel
        setPhone(value);

        // Validate with debounce to avoid excessive validation
        validatePhone(value);
    }, [validatePhone]);

    // Memoize phone input className to avoid recalculation on every render
    const phoneInputClassName = useMemo(() => {
        return `w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gold-500 ${errorPhone ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-gold-500"
            }`;
    }, [errorPhone]);

    const handleClickShowPassword = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    // Form submission handler
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.target as HTMLFormElement);
        const phone = formData.get('phone') as string;
        const password = formData.get('password') as string;

        try {
            const response = await api.post('/auth/login', { phone, password });
            if (response.status === 200) {
                const userInfo = response.data.infoUser;
                const token = response.data.token;

                saveUserInfo(userInfo);
                localStorage.setItem('token', token);
                saveIsLogin(true);

                // Điều hướng theo trạng thái tài khoản
                if (userInfo.isDelete === 'ACTIVE') {
                    window.location.href = '/';
                } else if (userInfo.isDelete === 'NOT_VERIFY') {
                    router.replace('/verify-account');
                } else {
                    setError('Tài khoản chưa được xác thực hoặc không hợp lệ.');
                }
            } else {
                setError('Vui lòng kiểm tra lại số điện thoại hoặc mật khẩu.');
            }
        } catch (error: any) {
            if (error.response?.status === 400) {
                setError('Số điện thoại hoặc mật khẩu không đúng.');
            } else {
                setError('Có lỗi xảy ra, vui lòng thử lại.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [router, saveIsLogin, saveUserInfo]);

    // Forgot password submission handler
    const handleForgotPassword = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotPasswordLoading(true);
        setError("");

        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get('email') as string;

        try {
            const response = await api.post('/auth/forgotPassword?email=' + email);
            if (response.status === 200) {
                setForgotPasswordSuccess(true);
            } else {
                setError('Vui lòng kiểm tra lại địa chỉ Email.');
            }
        } catch (error: any) {
            if (error.response?.status === 400) {
                setError("Email này chưa đăng ký!");
            } else {
                setError('Có lỗi xảy ra, vui lòng thử lại.');
            }
        } finally {
            setForgotPasswordLoading(false);
        }
    }, []);

    // Optimized dialog controls with animation sequence
    const openForgotPasswordDialog = useCallback(() => {
        setIsDialogClosing(false);
        setShowForgotPassword(true);

        // Use requestAnimationFrame for better performance when focusing
        requestAnimationFrame(() => {
            if (emailInputRef.current) {
                emailInputRef.current.focus();
            }
        });
    }, []);

    const startDialogClose = useCallback(() => {
        setIsDialogClosing(true);

        // Use shorter timeout for faster animation completion
        setTimeout(() => {
            setShowForgotPassword(false);
            setForgotPasswordSuccess(false);
            setError("");
            setEmail("");
            setIsDialogClosing(false);
        }, 120);
    }, []);

    // Memoized content for WebKit dialog - this rarely changes
    const webKitDialogContent = useMemo(() => (
        <div className="text-center p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Lỗi: Google không cho phép đăng nhập trên trình duyệt Zalo IOS</h2>
            <p className="mb-4 text-gray-600">Hãy chọn <strong>Mở bằng Safari</strong> theo hướng dẫn dưới</p>
            <div className="relative w-full pb-[56.25%] mt-4">
                <video
                    src="/videos/zalo-guide.mp4"
                    autoPlay
                    muted
                    playsInline
                    controls
                    className="absolute inset-0 w-full h-full rounded-lg"
                />
            </div>
        </div>
    ), []);

    // Memoized form UI for password reset dialog
    const forgotPasswordForm = useMemo(() => (
        <form onSubmit={handleForgotPassword} className="w-full p-6">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-semibold text-gray-800">
                    Khôi phục mật khẩu
                </h2>
                <button
                    type="button"
                    onClick={startDialogClose}
                    className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    style={{ transition: 'background-color 0.15s ease, color 0.15s ease' }}
                    aria-label="Đóng hộp thoại"
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>

            <p className="text-gray-600 text-sm mb-5">
                Nhập địa chỉ email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu.
            </p>

            {error && <ErrorMessage message={error} />}

            <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email-reset">
                    Email
                </label>
                <div className="relative">
                    <input
                        id="email-reset"
                        name="email"
                        type="email"
                        ref={emailInputRef}
                        value={email}
                        onChange={(e) => handleChange("email", e)}
                        placeholder="example@gmail.com"
                        className={`w-full p-3 border ${errorEmail ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-gold-500 focus:outline-none ${email ? 'pr-10' : ''}`}
                        style={{
                            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                            transform: 'translateZ(0)'
                        }}
                        required
                    />
                    {email && (
                        <button
                            type="button"
                            onClick={() => setEmail('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            style={{ transition: 'color 0.15s ease' }}
                            aria-label="Xóa email"
                        >
                            <FontAwesomeIcon icon={faTimes} size="sm" />
                        </button>
                    )}
                </div>
                {errorEmail && (
                    <p className="mt-1 text-sm text-red-600">{errorEmail}</p>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                    type="button"
                    onClick={startDialogClose}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500"
                    style={{ transition: 'background-color 0.15s ease' }}
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    disabled={!!errorEmail || !email || forgotPasswordLoading}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500
                        ${!!errorEmail || !email || forgotPasswordLoading
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gold-500 text-white hover:bg-gold-600'}`}
                    style={{ transition: 'background-color 0.15s ease' }}
                >
                    {forgotPasswordLoading ? <LoadingSpinner /> : "Gửi yêu cầu"}
                </button>
            </div>
        </form>
    ), [email, error, errorEmail, forgotPasswordLoading, handleChange, handleForgotPassword, startDialogClose]);

    // Memoized success UI for the forgotten password dialog
    const forgotPasswordSuccessContent = useMemo(() => (
        <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="h-10 w-10 text-green-500" />
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                Yêu cầu đã được gửi
            </h2>

            <p className="text-gray-600 mb-6">
                Vui lòng kiểm tra hộp thư email <strong>{email}</strong> để thực hiện các bước tiếp theo đặt lại mật khẩu của bạn.
            </p>

            <button
                type="button"
                onClick={startDialogClose}
                className="w-full px-4 py-2.5 bg-gold-500 text-white rounded-lg font-medium transition-all duration-200 hover:bg-gold-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500"
            >
                Đóng
            </button>
        </div>
    ), [email, startDialogClose]);

    // Low priority background image component, preloaded
    const BackgroundImage = useMemo(() => (
        <div className="absolute inset-0 z-0">
            <Image
                src="/images/background.jpg"
                alt="Background"
                fill
                priority
                className="object-cover"
                style={{ filter: 'blur(4px)' }}
                sizes="100vw"
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJeAFK5GOzSgAAAABJRU5ErkJggg=="
            />
            <div className="absolute inset-0 bg-black/40"></div>
        </div>
    ), []);

    // Memoized phone input to prevent unnecessary re-renders
    const PhoneInput = useMemo(() => {
        return (
            <div className="relative">
                <input
                    id="phone"
                    type="text"
                    name="phone"
                    placeholder="Nhập số điện thoại hoặc email"
                    className={phoneInputClassName}
                    required
                    value={phone}
                    onChange={handlePhoneChange}
                    aria-invalid={errorPhone ? "true" : "false"}
                    aria-describedby={errorPhone ? "phone-error" : undefined}
                    // Allow for both phone and email input
                    autoComplete="username"
                />
                {errorPhone && (
                    <p id="phone-error" className="mt-1 text-sm text-red-500">
                        {errorPhone}
                    </p>
                )}
            </div>
        );
    }, [phone, errorPhone, phoneInputClassName, handlePhoneChange]);

    return (
        <>
            <style jsx global>{animationStyles}</style>

            <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
                {BackgroundImage}

                <title>Đăng nhập | Queen Acoustic</title>
                <meta name="description" content="Trang đăng nhập tại Queen Acoustic." />

                <div className="w-full max-w-md z-10">
                    <div className="bg-white/95 rounded-2xl shadow-2xl p-8 relative">
                        {/* Navigation header inside the form card */}
                        <div className="flex items-center justify-between mb-6">
                            <Link
                                href="/"
                                className="flex items-center text-gray-700 hover:text-gold-600 transition-colors group"
                                aria-label="Quay về trang chủ"
                            >
                                <FaChevronLeft
                                    className="mr-1.5 group-hover:-translate-x-1"
                                    style={{ transitionProperty: 'transform', transitionDuration: '200ms' }}
                                />
                                <span className="text-sm font-medium">Trang Chủ</span>
                            </Link>
                        </div>

                        <div className="text-center mb-8">
                            <div className="relative w-28 h-28 mx-auto mb-6">
                                <Image
                                    src="/images/logo_queen.png"
                                    alt="Logo Queen Acoustic"
                                    fill
                                    priority
                                    className="object-contain"
                                    sizes="112px"
                                    placeholder="blur"
                                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJeAFK5GOzSgAAAABJRU5ErkJggg=="
                                />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng Nhập</h1>
                            <p className="text-gray-600 text-sm">Chào mừng bạn quay trở lại!</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1">
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                    Số điện thoại hoặc email
                                </label>
                                {PhoneInput}
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Nhập mật khẩu"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                                        style={{
                                            transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                                        }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={handleClickShowPassword}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                                        style={{ transition: 'color 0.15s ease' }}
                                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    >
                                        <FontAwesomeIcon
                                            icon={showPassword ? faEye : faEyeSlash}
                                            className="w-5 h-5"
                                        />
                                    </button>
                                </div>
                            </div>

                            {error && <ErrorMessage message={error} />}

                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={openForgotPasswordDialog}
                                    className="inline-block text-sm text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-sm"
                                    style={{
                                        transition: 'color 0.15s ease',
                                        padding: '2px 4px',
                                        marginRight: '-4px'
                                    }}
                                >
                                    Quên mật khẩu?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-gold-500 hover:bg-gold-600 text-white py-3 rounded-lg font-medium text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 shadow-lg ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
                                style={{
                                    minHeight: '48px',
                                    transform: 'translateZ(0)',
                                    transition: 'background-color 0.15s ease'
                                }}
                            >
                                {isLoading ? <LoadingSpinner /> : "Đăng nhập"}
                            </button>

                            <div className="relative py-3">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">hoặc</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => { window.location.href = process.env.NEXT_PUBLIC_API_URL + '/auth/google'; }}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500"
                                style={{
                                    minHeight: '48px',
                                    transition: 'background-color 0.15s ease'
                                }}
                            >
                                <FaGoogle className="text-red-500 w-5 h-5" />
                                <span className="font-medium">Đăng nhập với Google</span>
                            </button>
                        </form>
                    </div>
                </div>

                {/* WebKit Dialog with Image - optimized dialog */}
                <Dialog
                    open={showWebKitDialog}
                    maxWidth="md"
                >
                    {webKitDialogContent}
                </Dialog>

                {/* Forgot Password Dialog - optimized dialog */}
                <Dialog
                    open={showForgotPassword}
                    onClose={startDialogClose}
                    maxWidth="xs"
                    isClosing={isDialogClosing}
                >
                    {!forgotPasswordSuccess ? forgotPasswordForm : forgotPasswordSuccessContent}
                </Dialog>
            </div>
        </>
    );
}
