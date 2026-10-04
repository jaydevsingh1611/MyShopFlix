import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  X,
  Loader2,
  ArrowLeft,
  Mail,
  ShieldCheck,
  User,
  Eye,
  EyeOff,
  UserSearch,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ManageUsers() {
  const [viewMode, setViewMode] = useState("search"); // 'search' | 'list' | 'details'
  const [searchEmail, setSearchEmail] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const token = localStorage.getItem("jwtToken");

  const handleApiResponse = async (res) => {
    if (res.status === 401 || res.status === 403) {
      // toast("somthing happen wrong...","text-Red-500");
      // localStorage.removeItem("jwtToken");
      // window.location.href = "/login";
      return null;
    }
    return await res.json();
  };

  const updateRecentSearches = (user) => {
    const key = "recentSearchUsers";
    let recent = JSON.parse(localStorage.getItem(key)) || [];

    // Remove any existing entry for this user
    recent = recent.filter((u) => u.id !== user.id);
    // Add to front
    recent.unshift(user);
    // Trim to top 5
    if (recent.length > 5) recent = recent.slice(0, 5);

    localStorage.setItem(key, JSON.stringify(recent));
  };

  const fetchTotalUsers = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8080/api/user/totaluser", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await handleApiResponse(res);
      if (data !== null) setTotalUsers(data);
    } catch (err) {
      console.error("Error fetching total users:", err);
    }
  }, [token]);

  const fetchRecentUsers = useCallback(() => {
    setIsLoading(true);
    try {
      const stored = JSON.parse(localStorage.getItem("recentSearchUsers")) || [];
      setUsers(stored);
      setViewMode("list");
    } catch (err) {
      console.error("Error loading recent users:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = async () => {
    if (!searchEmail) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/user/${searchEmail}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await handleApiResponse(res);
      if (data) {
        setUserDetails(data);
        setViewMode("details");
        updateRecentSearches(data);
      } else {
        setMessage({ type: "error", text: "User not found." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error fetching user." });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (role) => {
    if (!userDetails) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/user/${userDetails.id}/role?role=${role}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setUserDetails({ ...userDetails, role });
        setMessage({ type: "success", text: "User role updated successfully." });
      } else {
        setMessage({ type: "error", text: "Failed to update user role." });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async () => {
    if (!userDetails) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/user/${userDetails.id}/status`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setUserDetails({
          ...userDetails,
          status: userDetails.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
        });
        setMessage({ type: "success", text: "User status updated successfully." });
      } else {
        setMessage({ type: "error", text: "Failed to update status." });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSearchEmail("");
    setViewMode("search");
    setUserDetails(null);
    setMessage({ type: "", text: "" });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    fetchTotalUsers();
  }, [fetchTotalUsers]);

  useEffect(() => {
    // Auto-dismiss success messages after 3 seconds
    if (message.type === "success") {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const renderStatusBadge = (status) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center
        ${status === "ACTIVE" 
          ? "bg-green-100 text-green-800" 
          : "bg-red-100 text-red-800"}
      `}>
        <span className={`w-2 h-2 mr-1 rounded-full ${status === "ACTIVE" ? "bg-green-500" : "bg-red-500"}`}></span>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div className="flex items-center">
          <UserSearch className="h-6 w-6 mr-2 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        </div>
        <div className="flex items-center bg-blue-50 px-3 py-1 rounded-lg">
          <User className="h-5 w-5 mr-1 text-blue-700" />
          <span className="font-semibold text-blue-700">{totalUsers}</span>
          <span className="text-blue-600 ml-1">users</span>
        </div>
      </div>

      {message.text && (
        <div
          className={`p-3 mb-4 rounded-lg shadow-sm flex items-start
            ${message.type === "error"
              ? "bg-red-50 text-red-800 border border-red-200"
              : "bg-green-50 text-green-800 border border-green-200"
          }`}
        >
          <div className="mr-2 mt-0.5">
            {message.type === "error" ? (
              <AlertCircle className="h-5 w-5 text-red-600" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
          </div>
          <div className="flex-grow">{message.text}</div>
          <button 
            onClick={() => setMessage({ type: "", text: "" })}
            className="ml-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {viewMode === "search" && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Find User</h2>
          <div className="flex gap-2 mb-6">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search by email address"
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center font-medium shadow-sm"
              disabled={isLoading || !searchEmail}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Search className="h-5 w-5 mr-1" /> Search
                </>
              )}
            </button>
          </div>
          <button
            onClick={fetchRecentUsers}
            className="w-full flex items-center justify-center px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Clock className="h-5 w-5 mr-2 text-gray-500" />
            View Recent Searches
          </button>
        </div>
      )}

      {viewMode === "list" && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Recent Users</h2>
            <button
              onClick={handleReset}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Search
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : users.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setUserDetails(u);
                    setViewMode("details");
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 mr-3 font-medium">
                        {u.email.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <div className="font-medium text-gray-800">{u.email}</div>
                        <div className="text-xs text-gray-500">{u.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {renderStatusBadge(u.status)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No recent users found.
            </div>
          )}
        </div>
      )}

      {viewMode === "details" && userDetails && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">User Details</h2>
            <button
              onClick={handleReset}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Search
            </button>
          </div>
          
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 text-blue-800 rounded-full h-12 w-12 flex items-center justify-center text-xl font-semibold mr-4">
                {userDetails.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{userDetails.email}</h3>
                <div className="mt-1">{renderStatusBadge(userDetails.status)}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Email Address</div>
                <div className="flex items-center text-gray-900">
                  <Mail className="h-4 w-4 mr-1 text-gray-500" /> 
                  {userDetails.email}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Current Role</div>
                <div className="flex items-center text-gray-900">
                  <ShieldCheck className="h-4 w-4 mr-1 text-gray-500" /> 
                  <span className="font-medium">{userDetails.role}</span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-600 mb-2">User Role</h4>
              <div className="flex gap-2">
                {["USER", "MODERATOR", "ADMIN"].map((role) => (
                  <button
                    key={role}
                    onClick={() => updateUserRole(role)}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      userDetails.role === role
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <button
                onClick={toggleUserStatus}
                disabled={isLoading}
                className={`w-full px-4 py-3 rounded-md flex items-center justify-center font-medium transition-colors ${
                  userDetails.status === "ACTIVE"
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : userDetails.status === "ACTIVE" ? (
                  <EyeOff className="h-5 w-5 mr-2" />
                ) : (
                  <Eye className="h-5 w-5 mr-2" />
                )}
                {userDetails.status === "ACTIVE" ? "Disable User" : "Enable User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}