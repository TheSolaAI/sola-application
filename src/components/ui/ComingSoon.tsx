function ComingSoon() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col justify-center items-center">
        <div className="bg-white p-12 rounded-2xl shadow-xl w-96 max-w-md text-center">
          <div className="flex justify-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-bodydark1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2v10m0 0v2m0-3a1 1 0 110-2 1 1 0 010 2zm6-3a1 1 0 110-2 1 1 0 010 2zm-12 0a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4 tracking-tight">
            Coming Soon!
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            We're working hard to bring you the best settings experience. This
            feature is coming soon!
          </p>
          <div className="flex justify-center">
            <button className="bg-boxdark-2 hover:bg-boxdark/90 text-white font-medium py-3 px-6 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-300">
              You will be notified When Available
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  export default ComingSoon;
  