'use client';
import WalletLensButton from '@/app/dashboard/_components/wallet/WalletLensButton';
import { useLayoutContext } from '@/providers/LayoutProvider';
import useKeyboardHeight from '@/hooks/useKeyboardHeight';
import useThemeManager from '@/store/ThemeManager';
import { hexToRgb } from '@/utils/hexToRGB';
import { SessionControls } from '@/app/dashboard/chat/_components/SessionControls';
import InfoText from '@/app/dashboard/chat/_components/InfoText';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { ScaleLoader } from 'react-spinners';

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /**
   * Global State Management
   */
  const { handleWalletLensOpen, walletLensOpen, audioIntensity } =
    useLayoutContext();
  const { theme } = useThemeManager();
  const { isPWA, keyboardHeight } = useKeyboardHeight();
  const { state } = useChatMessageHandler();

  /**
   * Local State
   */
  const primaryRGB = hexToRgb(theme.primary);
  const primaryDarkRGB = hexToRgb(theme.primaryDark);

  return (
    <div className="relative flex flex-col w-full h-screen overflow-hidden p-4">
      {/* Wallet Lens Button */}
      <div className="absolute top-4 right-4 z-20">
        <WalletLensButton
          onClick={() => handleWalletLensOpen(!walletLensOpen)}
        />
      </div>

      {/* Empty state message */}
      {state === 'loading' && (
        <div
          className={
            'absolute inset-0 flex flex-col gap-4 items-center justify-center'
          }
        >
          <ScaleLoader color={theme.textColor} height={80} width={20} />
        </div>
      )}

      {children}

      {/* Session Controls (Fixed at Bottom) */}
      <div
        className={`absolute left-0 right-0 z-20 p-4 pb-8 ${
          isPWA
            ? keyboardHeight > 0
              ? `bottom-[${keyboardHeight}px]`
              : 'bottom-0'
            : 'bottom-0'
        }`}
        style={{
          backgroundImage: `
            linear-gradient(to top, 
            rgba(${primaryDarkRGB.r}, ${primaryDarkRGB.g}, ${primaryDarkRGB.b}, ${audioIntensity * 1.2}),
            transparent 80%)`,
          transition: 'background 0.1s linear',
        }}
      >
        <SessionControls />
        <InfoText />
      </div>
    </div>
  );
}
