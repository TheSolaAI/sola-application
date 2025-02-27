import { forwardRef, useImperativeHandle, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { toast } from 'sonner';

interface UserSettingsProps {}

export interface UserSettingsRef {
  onSubmit: () => void;
}

export const UserSettings = forwardRef<UserSettingsRef, UserSettingsProps>(
  (_, ref) => {
    const { ready, authenticated, user, linkEmail, unlinkEmail } = usePrivy();

    // Local state
    const [name, setName] = useState<string>('');
    const [isLinkingEmail, setIsLinkingEmail] = useState<boolean>(false);

    // Generate avatar initials from name
    const getInitials = () => {
      if (!name) return '?';
      return name.substring(0, 2).toUpperCase();
    };

    // Generate a color based on name string
    const getAvatarColor = () => {
      if (!name) return '#6366f1'; // Default indigo

      // Simple hash function for string
      const hash = name
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);

      // TODO: Find a better way to generate colors
      const colors = [
        '#60a5fa',
        '#34d399',
        '#a78bfa',
        '#f97316',
        '#ec4899',
        '#14b8a6',
        '#f59e0b',
        '#6366f1',
      ];

      return colors[hash % colors.length];
    };

    const handleSubmit = () => {
      return;
    };

    useImperativeHandle(ref, () => ({
      onSubmit: handleSubmit,
    }));

    const handleLinkEmail = async () => {
      setIsLinkingEmail(true);

      try {
        await linkEmail();
        toast.success('Email linking initiated');
      } catch (error) {
        toast.error('Failed to initiate email linking');
        console.error(error);
      } finally {
        setIsLinkingEmail(false);
      }
    };

    // Handle email unlinking
    const handleUnlinkEmail = async () => {
      if (!user?.email?.address) return;
      try {
        await unlinkEmail(user?.email?.address);
        toast.success('Email unlinked successfully');
      } catch (error) {
        toast.error('Failed to unlink email');
        console.error(error);
      }
    };

    if (!(ready && authenticated) || !user) {
      return <div className="animate-pulse p-4">Loading user settings...</div>;
    }

    return (
      <div className="flex flex-col items-start justify-center gap-y-8">
        {/* Profile Image Area */}
        <div className="w-full flex items-center gap-x-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-textColor font-bold text-xl"
            style={{ backgroundColor: getAvatarColor() }}
          >
            {getInitials()}
          </div>
          <div>
            <h1 className="font-semibold text-textColor">Profile Avatar</h1>
            <p className="font-regular text-secText">
              Your avatar is automatically generated based on your name
            </p>
          </div>
        </div>

        {/* Name Area */}
        <div className="w-full">
          <h1 className="font-semibold text-textColor">Your Name</h1>
          <p className="font-regular text-secText">
            This name will be used by Sola AI to address you in conversations
          </p>
          <input
            type="text"
            className="border border-border rounded-md p-2 mt-2 bg-sec_background w-full text-textColor"
            placeholder="Your Name"
            maxLength={30}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <p className="text-xs text-secText mt-1">Maximum 30 characters</p>
        </div>

        {/* Email Area */}
        <div className="w-full">
          <h1 className="font-semibold text-textColor">Email :</h1>
          <p className="font-regular text-secText">
            Your email is used for sign-in on mobile and desktop clients
          </p>

          {user.email?.address ? (
            <div className="mt-2">
              <div className="flex items-center">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-md">
                  {user.email.address}
                </div>
                <button
                  className="ml-4 text-red-500 hover:text-red-700 text-sm"
                  onClick={handleUnlinkEmail}
                >
                  Unlink Email
                </button>
              </div>
              <p className="text-xs text-secText mt-1">
                Warning: Unlinking your email may affect your ability to log in
                on other devices
              </p>
            </div>
          ) : (
            <div className="mt-2">
              {isLinkingEmail ? (
                <div className="animate-pulse text-secText">
                  Initiating email linking...
                </div>
              ) : (
                <button
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                  onClick={handleLinkEmail}
                >
                  Link Email
                </button>
              )}
              <p className="text-xs text-secText mt-1">
                You'll be guided through the process to link your email
              </p>
            </div>
          )}
        </div>

        {/* Connected Accounts Area*/}
        <div className="w-full">
          {user.discord && user.twitter && (
            <h1 className="font-semibold text-textColor">
              Connected Accounts :
            </h1>
          )}
          <div className="grid grid-cols-2 gap-2">
            {user.discord && (
              <div className="flex items-center p-2 border border-border rounded-md">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                  D
                </div>
                <span className="ml-2 text-sm truncate">
                  {user.discord.username}
                </span>
              </div>
            )}
            {user.twitter && (
              <div className="flex items-center p-2 border border-border rounded-md">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  T
                </div>
                <span className="ml-2 text-sm truncate">
                  {user.twitter.username}
                </span>
              </div>
            )}
          </div>
        </div>
        {/* Delete Account Section */}
        <div className="w-full">
          <h1 className="font-semibold text-textColor">Delete Account</h1>
          <p className="font-regular text-secText">
            If you wish to permanently delete your account, please contact us.
          </p>
          <p className="text-xs text-secText mt-1">
            Account deletion requires verification that your embedded wallet is
            clear.
          </p>
          <button
            className="mt-2 text-red-500 hover:text-red-700"
            onClick={() => {
              // open discord invite link for now
              window.open('https://discord.gg/urGaDxKnTR', '_blank');
            }}
          >
            Contact Us to Delete Account
          </button>
        </div>
      </div>
    );
  },
);

UserSettings.displayName = 'UserSettings';

