"use client";
import { useEffect, useRef, useState } from "react";
import TiltleDashboardPages from "../dashboard/component/TiltleDashboardPages";
import { useUsers } from "./hooks/useuserApi";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelectedUser } from "./action/store";
import gsap from "gsap";
import { Icon } from "@/constants/icons";

const UserDashboard = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useUsers();
  const router = useRouter().push;
  const { selectUser } = useSelectedUser();
  const loader = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const node = loader.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );
    if (node) observer.observe(node);
    return () => {
      if (node) observer.unobserve(node);
    };
  }, [hasNextPage, fetchNextPage]);

  useEffect(() => {}, []);
  // Animate cards on data load
  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(
      ".user-card",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out",
      }
    );
  }, [data, isLoading]);

  const handleSearchBarber = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  // Flatten all pages into one list
  const allUsers = data?.pages.flat() || [];
  const filteredUsers = allUsers.filter((user) =>
    user.fullName.toLowerCase().includes(searchTerm)
  );

  return (
    <div className=" w-full">
      <TiltleDashboardPages title="Users">
        <div className="flex items-center w-full justify-end gap-2">
          <input
            type="search"
            name="search_barber"
            onChange={handleSearchBarber}
            className="border-0 max-w-full min-w-[320px]  px-4 py-2 bg-white rounded-lg focus:outline-0 focus:bg-gray-200 transition-all duration-200 hidden sm:block"
            placeholder="Search for a user"
          />
          <div
            className={`flex items-center ${
              showSearch ? "w-full" : "w-fit"
            } justify-between`}
          >
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="sm:hidden text-dark-purple text-xl px-3"
            >
              <Icon
                name={showSearch ? "close" : "search"}
                className="w-6 h-6"
              />
            </button>
            {showSearch && (
              <input
                type="search"
                onChange={handleSearchBarber}
                autoFocus
                className="border-0 max-w-[90%] min-w-10/12 sm:hidden px-4 py-2 bg-white rounded-lg focus:outline-0 focus:bg-gray-200 transition-all duration-200"
                placeholder="Search..."
              />
            )}
          </div>
        </div>
      </TiltleDashboardPages>

      {/* Error */}
      {error && (
        <div className="text-center mt-4 text-red-500">
          Error loading users: {(error as Error).message}
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="grid w-full overflow-hidden grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <UserCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div
          ref={cardRef}
          className="sm:gap-3 gap-3 overflow-hidden  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-center justify-center xl:grid-cols-4 mt-4"
        >
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => {
                router(`/dashboard/users/${user.id}`);
                selectUser(user);
              }}
              className="user-card border sm:p-4 px-4 py-3 rounded-sm w-full shadow-sm bg-dark-purple text-white flex items-center cursor-pointer hover:opacity-90 transition"
            >
              <Image
                alt=""
                src={user.image || ""}
                width={40}
                height={40}
                className="w-16 h-16 rounded-full object-cover mr-4"
              />
              <div className="flex flex-col justify-center flex-1">
                <p className="font-medium">{user.fullName}</p>
                <p className="text-sm text-gray-200">{user.email}</p>
                <p className="text-sm mt-2 text-gray-200">{user.role}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div ref={loader} className="py-4 text-center text-gray-500">
        {isFetchingNextPage
          ? "Loading more users..."
          : hasNextPage
          ? "Scroll to load more"
          : "No more users"}
      </div>
    </div>
  );
};

export default UserDashboard;
const UserCardSkeleton = () => {
  return (
    <div className="animate-pulse border sm:p-4 px-4 py-3 rounded-sm w-full shadow-sm bg-dark-purple text-white flex items-center gap-4">
      <div className="w-16 h-16 bg-gray-400 rounded-full" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-4 w-3/4 bg-gray-400 rounded" />
        <div className="h-3 w-1/2 bg-gray-400 rounded" />
        <div className="h-3 w-1/3 bg-gray-400 rounded mt-1" />
      </div>
    </div>
  );
};
