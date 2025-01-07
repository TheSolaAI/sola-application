import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

function Disclaimer({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  return (
    <Dialog
      open={isOpen}
      as="div"
      className="relative z-999999 focus:outline-none"
      onClose={() => {}}
    >
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10"></div>
      )}

      <div className="fixed inset-0 z-20 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-md rounded-xl bg-black p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
          >
            <DialogTitle as="h3" className="text-base/7 font-medium text-white">
              Disclaimer
            </DialogTitle>
            <DialogTitle className="font-bold text-bodydark">
              Closed Beta Announcement.
            </DialogTitle>
            <p className="mt-2 text-sm/6 text-white/50">
              Sola AI is in closed beta, meaning that the platform is still
              under development and is prone to bugs and errors. Please use our
              Discord channel to report any issues you may encounter. We are
              grateful for your support and patience in helping us build a
              better voice assistant on Solana. <br />
              If you want to test out the wallet feature please use minimal
              funds.
            </p>
            <div className="mt-4">
              <Button
                className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                I Understand
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

export default Disclaimer;
