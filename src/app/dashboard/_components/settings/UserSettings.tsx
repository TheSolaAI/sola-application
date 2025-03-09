'use client';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { toast } from 'sonner';
import { FaDiscord, FaLink, FaUnlink } from 'react-icons/fa';
import { useSessionHandler } from '@/store/SessionHandler';
import { useSettingsHandler } from '@/store/SettingsHandler';
import { useUserHandler } from '@/store/UserHandler';

interface UserSettingsProps {}

export interface UserSettingsRef {
  onSubmit: () => void;
}

export const UserSettings = forwardRef<UserSettingsRef, UserSettingsProps>(
  (_, ref) => {
    const {
      ready,
      authenticated,
      user,
      linkEmail,
      unlinkEmail,
      linkDiscord,
      unlinkDiscord,
      linkTwitter,
      unlinkTwitter,
    } = usePrivy();

    // Local state
    const [name, setName] = useState<string>(useUserHandler.getState().name);
    const [isLinkingEmail, setIsLinkingEmail] = useState<boolean>(false);
    const [isLinkingDiscord, setIsLinkingDiscord] = useState<boolean>(false);
    const [isLinkingTwitter, setIsLinkingTwitter] = useState<boolean>(false);

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

    /**
     * Saves the user name and their profile to our settings in case the user never blurred the input
     */
    const handleSubmit = () => {
      useUserHandler.getState().setUserName(name);
      useUserHandler.getState().setProfilePic({
        color: getAvatarColor(),
        initials: getInitials(),
      });
      useSessionHandler.getState().updateSession('name');
      useSettingsHandler.getState().updateSettings('name');
    };

    useImperativeHandle(ref, () => ({
      onSubmit: handleSubmit,
    }));

    // Handle Email linking
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
        await unlinkEmail(user.email.address);
        toast.success('Email unlinked successfully');
      } catch (error) {
        toast.error('Failed to unlink email');
        console.error(error);
      }
    };

    // Handle Discord linking
    const handleLinkDiscord = async () => {
      setIsLinkingDiscord(true);
      try {
        await linkDiscord();
        toast.success('Discord linking initiated');
      } catch (error) {
        toast.error('Failed to initiate Discord linking');
        console.error(error);
      } finally {
        setIsLinkingDiscord(false);
      }
    };

    // Handle Discord unlinking
    const handleUnlinkDiscord = async () => {
      if (!user?.discord?.username) return;
      try {
        await unlinkDiscord(user.discord.subject);
        toast.success('Discord account unlinked successfully');
      } catch (error) {
        toast.error('Failed to unlink Discord account');
        console.error(error);
      }
    };

    // Handle Twitter/X linking
    const handleLinkTwitter = async () => {
      setIsLinkingTwitter(true);
      try {
        await linkTwitter();
        toast.success('X/Twitter linking initiated');
      } catch (error) {
        toast.error('Failed to initiate X/Twitter linking');
        console.error(error);
      } finally {
        setIsLinkingTwitter(false);
      }
    };

    // Handle Twitter/X unlinking
    const handleUnlinkTwitter = async () => {
      if (!user?.twitter?.username) return;
      try {
        await unlinkTwitter(user.twitter.subject);
        toast.success('X/Twitter account unlinked successfully');
      } catch (error) {
        toast.error('Failed to unlink X/Twitter account');
        console.error(error);
      }
    };

    if (!(ready && authenticated) || !user) {
      return <div className="animate-pulse p-4">Loading user settings...</div>;
    }

    return (
      <div className="flex flex-col w-full items-start justify-center gap-y-8">
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
            <p className="font-regular text-secText hidden md:block">
              Your avatar is automatically generated based on your name
            </p>
          </div>
        </div>

        {/* Name Area */}
        <div className="w-full">
          <h1 className="font-semibold text-textColor">Your Name</h1>
          <p className="font-regular text-secText hidden sm:block">
            This name will be used by Sola AI to address you in conversations
          </p>
          <input
            type="text"
            className="border border-border rounded-md p-2 mt-2 bg-sec_background w-fit text-textColor"
            placeholder="Your Name"
            maxLength={30}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              // save the name on blur
              useUserHandler.getState().setUserName(name);
              useUserHandler.getState().setProfilePic({
                color: getAvatarColor(),
                initials: getInitials(),
              });
              useSessionHandler.getState().updateSession('name');
              useSettingsHandler.getState().updateSettings('name');
            }}
          />
          <p className="text-xs text-secText mt-1">Maximum 30 characters</p>
        </div>

        {/* Email Area */}
        <div className="w-full">
          <h1 className="font-semibold text-textColor">Email</h1>
          <p className="font-regular text-secText">
            Your email is used for sign-in on mobile and desktop clients
          </p>

          {user.email?.address ? (
            <div className="mt-2">
              <div className="flex flex-col gap-4 items-start sm:flex-row sm:items-center">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-md">
                  {user.email.address}
                </div>
                <button
                  className="text-red-500 hover:text-red-700 bg-surface p-2 rounded-lg text-sm flex items-center gap-1"
                  onClick={handleUnlinkEmail}
                >
                  <FaUnlink size={14} />
                  <span>Unlink Email</span>
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
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 flex items-center gap-2"
                  onClick={handleLinkEmail}
                >
                  <FaLink size={14} />
                  <span>Link Email</span>
                </button>
              )}
              <p className="text-xs text-secText mt-1">
                You&#39;ll be guided through the process to link your email
              </p>
            </div>
          )}
        </div>

        {/* Connected Accounts Area */}
        <div className="w-full">
          <h1 className="font-semibold text-textColor mb-3">
            Connected Accounts
          </h1>

          {/* Discord Account */}
          <div className="mb-4 border border-border rounded-md p-3 bg-sec_background/50">
            <div className="flex items-center mb-2">
              <FaDiscord className="text-indigo-500" size={20} />
              <h2 className="font-medium text-textColor ml-2">Discord</h2>
            </div>

            {user.discord ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center p-2 bg-indigo-100 rounded-md text-indigo-800">
                  <span className="text-sm font-medium">
                    {user.discord.username}
                  </span>
                </div>
                <button
                  className="text-red-500 hover:text-red-700 bg-surface p-2 rounded-lg text-sm flex items-center gap-1"
                  onClick={handleUnlinkDiscord}
                >
                  <FaUnlink size={14} />
                  <span>Unlink Discord</span>
                </button>
              </div>
            ) : (
              <div>
                {isLinkingDiscord ? (
                  <div className="animate-pulse text-secText">
                    Initiating Discord linking...
                  </div>
                ) : (
                  <button
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
                    onClick={handleLinkDiscord}
                  >
                    <FaLink size={14} />
                    <span>Link Discord Account</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Twitter/X Account */}
          <div className="mb-4 border border-border rounded-md p-3 bg-sec_background/50">
            <div className="flex items-center mb-2">
              <h2 className="font-medium text-textColor ml-2">X (Twitter)</h2>
            </div>

            {user.twitter ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center p-2 bg-blue-100 rounded-md text-blue-800">
                  <span className="text-sm font-medium">
                    {user.twitter.username}
                  </span>
                </div>
                <button
                  className="text-red-500 hover:text-red-700 bg-surface p-2 rounded-lg text-sm flex items-center gap-1"
                  onClick={handleUnlinkTwitter}
                >
                  <FaUnlink size={14} />
                  <span>Unlink X Account</span>
                </button>
              </div>
            ) : (
              <div>
                {isLinkingTwitter ? (
                  <div className="animate-pulse text-secText">
                    Initiating X/Twitter linking...
                  </div>
                ) : (
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
                    onClick={handleLinkTwitter}
                  >
                    <FaLink size={14} />
                    <span>Link X Account</span>
                  </button>
                )}
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
            className="mt-2 text-red-500 hover:text-red-700 flex items-center gap-1"
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
  }
);

UserSettings.displayName = 'UserSettings';
