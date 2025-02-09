import { SessionControls } from '../components/SessionControls.tsx';

const Conversation = () => {
  return (
    <div className="relative flex flex-col w-full h-full">
      <div className="flex-1 min-h-[calc(100vh-1rem)] overflow-y-auto w-full"></div>

      {/* Session Controls wrapper */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center w-full p-4 pb-6 bg-gradient-to-t from-primaryDark/20  to-transparent">
        <SessionControls />
      </div>
    </div>
  );
};

export default Conversation;
