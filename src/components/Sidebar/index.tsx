import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import SidebarLinkGroup from './SidebarLinkGroup';
import { usePrivy } from '@privy-io/react-auth';
import {
  Users,
  MoreVertical,
  DollarSign,
  MessageSquare,
  CreditCard,
} from 'react-feather';
import useChatState from '../../store/zustand/ChatState';
import useAppState from '../../store/zustand/AppState';
import { Switch } from '@headlessui/react';
import { ThemeType } from '../../types/app';
import useUser from '../../hooks/useUser';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const { user, logout, getAccessToken } = usePrivy();
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true',
  );
  const [isLogoutVisible, setLogoutVisible] = useState(false);

  const {
    getPeerConnection,
    dataChannel,
    setPeerConnection,
    setIsSessionActive,
    setDataChannel,
  } = useChatState();

  const { updateSettings, setAccessToken } = useUser();

  const { theme } = useAppState();

  const toggleTheme = async () => {
    const newTheme: ThemeType = theme === 'dark' ? 'light' : 'dark';
    await updateSettings({ theme: newTheme });
  };

  const toggleLogout = () => {
    setLogoutVisible(!isLogoutVisible);
  };

  const logoutHandler = () => {
    const pc = getPeerConnection();

    if (dataChannel) {
      dataChannel.close();
    }
    if (pc) {
      pc.close();
      setPeerConnection(null);
    }

    setIsSessionActive(false);
    setDataChannel(null);

    logout();
  };

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  useEffect(() => {
    const fetchAccessToken = async () => {
      const token = await getAccessToken();
      setAccessToken(token);
    };

    fetchAccessToken();
  }, []);

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-[#F9F9F9] duration-300 ease-linear dark:bg-bodydark1 lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <NavLink
          to="/"
          className="text-bodydark1 font-semibold dark:text-purple-300"
        >
          Sola AI
        </NavLink>
        <div className="bg-bodydark1 text-gray-2 py-2 px-4 text-sm rounded-lg dark:bg-purple-300 dark:text-bodydark1 dark:font-medium">
          CLOSED BETA
        </div>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block  lg:hidden bg-black"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}

      <div className="no-scrollbar flex flex-col justify-between h-screen overflow-y-auto duration-300 ease-linear">
        {/* <!-- Sidebar Menu --> */}
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          {/* <!-- Menu Group --> */}
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2 dark:text-purple-300">
              MENU
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              {/* <!-- Menu Item Conversation --> */}
              <li>
                <NavLink
                  to="/home"
                  className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-small text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 dark:text-bodydark2 ${
                    pathname.includes('home') && 'bg-graydark dark:bg-meta-4 '
                  }`}
                >
                  <MessageSquare />
                  Main Conversation
                </NavLink>
              </li>
              {/* <!-- Menu Item Conversation --> */}

              {/* <!-- Menu Item Wallet --> */}
              <li>
                <NavLink
                  to="/wallet"
                  className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-small text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 dark:text-bodydark2 ${
                    pathname.includes('wallet') && 'bg-graydark dark:bg-meta-4'
                  }`}
                >
                  <CreditCard className="" />
                  Wallet Management
                </NavLink>
              </li>
              {/* <!-- Menu Item Wallet --> */}

              {/* <!-- Menu OnRamp --> */}
              <li>
                <NavLink
                  to="/onramp"
                  className={`group relative flex items-center gap-2.5 rounded-lg py-2 px-4 font-small text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 dark:text-bodydark2 ${
                    pathname.includes('onramp') && 'bg-graydark dark:bg-meta-4'
                  }`}
                >
                  <DollarSign />
                  On Ramp
                </NavLink>
              </li>
              {/* <!-- Menu Menu OnRamp --> */}
            </ul>
          </div>

          {/* <!-- Others Group --> */}
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2 dark:text-purple-300">
              OTHERS
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              <li>
                {/* <!-- Menu Item Ui Elements --> */}
                <SidebarLinkGroup
                  activeCondition={
                    pathname === '/settings' || pathname.includes('settings')
                  }
                >
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <NavLink
                          to="#"
                          className={`group relative flex items-center gap-2.5 rounded-lg px-4 py-2 font-small text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 dark:text-bodydark2 ${
                            (pathname === '/settings' ||
                              pathname.includes('settings')) &&
                            'bg-graydark dark:bg-meta-4'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            sidebarExpanded
                              ? handleClick()
                              : setSidebarExpanded(true);
                          }}
                        >
                          <svg
                            className="fill-current"
                            width="18"
                            height="19"
                            viewBox="0 0 18 19"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g clipPath="url(#clip0_130_9807)">
                              <path
                                d="M15.7501 0.55835H2.2501C1.29385 0.55835 0.506348 1.34585 0.506348 2.3021V7.53335C0.506348 8.4896 1.29385 9.2771 2.2501 9.2771H15.7501C16.7063 9.2771 17.4938 8.4896 17.4938 7.53335V2.3021C17.4938 1.34585 16.7063 0.55835 15.7501 0.55835ZM16.2563 7.53335C16.2563 7.8146 16.0313 8.0396 15.7501 8.0396H2.2501C1.96885 8.0396 1.74385 7.8146 1.74385 7.53335V2.3021C1.74385 2.02085 1.96885 1.79585 2.2501 1.79585H15.7501C16.0313 1.79585 16.2563 2.02085 16.2563 2.3021V7.53335Z"
                                fill=""
                              />
                              <path
                                d="M6.13135 10.9646H2.2501C1.29385 10.9646 0.506348 11.7521 0.506348 12.7083V15.8021C0.506348 16.7583 1.29385 17.5458 2.2501 17.5458H6.13135C7.0876 17.5458 7.8751 16.7583 7.8751 15.8021V12.7083C7.90322 11.7521 7.11572 10.9646 6.13135 10.9646ZM6.6376 15.8021C6.6376 16.0833 6.4126 16.3083 6.13135 16.3083H2.2501C1.96885 16.3083 1.74385 16.0833 1.74385 15.8021V12.7083C1.74385 12.4271 1.96885 12.2021 2.2501 12.2021H6.13135C6.4126 12.2021 6.6376 12.4271 6.6376 12.7083V15.8021Z"
                                fill=""
                              />
                              <path
                                d="M15.75 10.9646H11.8688C10.9125 10.9646 10.125 11.7521 10.125 12.7083V15.8021C10.125 16.7583 10.9125 17.5458 11.8688 17.5458H15.75C16.7063 17.5458 17.4938 16.7583 17.4938 15.8021V12.7083C17.4938 11.7521 16.7063 10.9646 15.75 10.9646ZM16.2562 15.8021C16.2562 16.0833 16.0312 16.3083 15.75 16.3083H11.8688C11.5875 16.3083 11.3625 16.0833 11.3625 15.8021V12.7083C11.3625 12.4271 11.5875 12.2021 11.8688 12.2021H15.75C16.0312 12.2021 16.2562 12.4271 16.2562 12.7083V15.8021Z"
                                fill=""
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_130_9807">
                                <rect
                                  width="18"
                                  height="18"
                                  fill="white"
                                  transform="translate(0 0.052124)"
                                />
                              </clipPath>
                            </defs>
                          </svg>
                          Settings
                          <svg
                            className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                              open && 'rotate-180'
                            }`}
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                              fill=""
                            />
                          </svg>
                        </NavLink>
                        {/* <!-- Dropdown Menu Start --> */}
                        <div
                          className={`translate transform overflow-hidden ${
                            !open && 'hidden'
                          }`}
                        >
                          <ul className="mb-5.5 flex flex-col gap-2.5 pl-6">
                            <li>
                              <NavLink
                                to="/settings/configuration"
                                className={({ isActive }) =>
                                  `group relative flex items-center gap-2.5 rounded-md p-2 m-2 font-medium text-bodydark2 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                                    isActive ? 'bg-graydark dark:bg-meta-4' : ''
                                  }`
                                }
                              >
                                Configuration
                              </NavLink>
                            </li>
                          </ul>
                        </div>
                        {/* <!-- Dropdown Menu End --> */}
                      </React.Fragment>
                    );
                  }}
                </SidebarLinkGroup>
                {/* <!-- Menu Item Ui Elements --> */}
              </li>

              <li>
                {/* <!-- Toggle Theme Element --> */}
                <div
                  className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out dark:text-bodydark2`}
                >
                  App Theme{' '}
                  <Switch
                    checked={theme === 'light' ? false : true}
                    onChange={toggleTheme}
                    className="group relative flex h-7 w-14 cursor-pointer rounded-full bg-bodydark2 p-1 transition-colors duration-200 ease-in-out focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white data-[checked]:bg-purple-300"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none inline-block size-5 translate-x-0 rounded-full bg-white ring-0 shadow-lg transition duration-200 ease-in-out group-data-[checked]:translate-x-7"
                    />
                  </Switch>
                </div>
                {/* <!-- Toggle Theme Element --> */}
              </li>
            </ul>
          </div>
        </nav>
        {/* <!-- Sidebar Menu --> */}

        {/* <!-- Sidebar Footer --> */}
        <div className=" relative flex flex-col items-center w-full gap-2 px-6 py-5.5 lg:py-6.5 ">
          {isLogoutVisible && (
            <div className="flex items-center justify-between w-full gap-2 p-2 text-base font-bold bg-boxdark-2 rounded-md hover:bg-boxdark dark:bg-purple-300 ease-in-out ">
              <button
                onClick={logoutHandler}
                className="text-center text-bodydark w-full dark:text-bodydark1"
              >
                Logout
              </button>
            </div>
          )}
          <div
            className={`flex items-center justify-between w-full gap-2 p-2 cursor-pointer rounded-lg hover:bg-graydark dark:bg-bodydark1 dark:hover:bg-meta-4  ${
              isLogoutVisible && 'bg-graydark '
            }`}
            onClick={toggleLogout}
          >
            <div className="flex-shrink-0">
              <Users className="text-bodydark1 w-6 h-6 dark:text-bodydark2" />
            </div>
            <div className="flex-1 text-sm font-medium text-bodydark2 overflow-hidden text-ellipsis whitespace-nowrap">
              @{user?.email ? user.email.address.split('@')[0] : 'Anonymous'}
            </div>
            <MoreVertical className="text-bodydark2 text-sm flex-shrink-0" />
          </div>
        </div>
        {/* <!-- Sidebar Footer --> */}
      </div>
    </aside>
  );
};

export default Sidebar;
