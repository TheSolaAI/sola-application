'use client';
import React, { FC, useState } from 'react';
import { normalizeCommandName, saveCustomBotCommand } from '@/utils/botCommands';
import { toast } from 'sonner';

interface CreateBotCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export const CreateBotCommandModal: FC<CreateBotCommandModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = normalizeCommandName(name);

    if (!cleanName) {
      toast.error('Please enter a command name (e.g. update-me)');
      return;
    }
    if (!prompt.trim()) {
      toast.error('Please enter the prompt template to execute');
      return;
    }

    setIsSubmitting(true);
    try {
      saveCustomBotCommand({
        name: cleanName,
        description: description.trim() || `Custom shortcut /${cleanName}`,
        prompt: prompt.trim(),
      });
      toast.success(`Command /${cleanName} created successfully!`);
      setName('');
      setDescription('');
      setPrompt('');
      if (onCreated) onCreated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save command');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#121218] border border-[#2b2b3a] rounded-3xl shadow-2xl p-6 text-white animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#252535]">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span className="text-blue-400 font-mono">/</span> Create Bot Command
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Command Trigger
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 font-mono font-bold text-blue-400 text-sm">
                /
              </span>
              <input
                type="text"
                placeholder="update-me"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-7 pr-3 py-2.5 bg-[#1b1b26] border border-[#2d2d3f] rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Type this command in chat to quickly trigger the prompt.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Get current price of SOL and market overview"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#1b1b26] border border-[#2d2d3f] rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Expanded Prompt for AI
            </label>
            <textarea
              rows={3}
              placeholder="e.g. get current price of sola, 24h trading volume and summary"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#1b1b26] border border-[#2d2d3f] rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
              required
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Tip: Use <span className="font-mono text-blue-400">{'{args}'}</span> to insert parameters passed to the command (e.g. <span className="font-mono">/price SOL</span>).
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#252535]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Command'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
