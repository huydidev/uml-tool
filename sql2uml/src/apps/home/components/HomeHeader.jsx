// import { tokens } from "../../../shared/constants/Tokens";
// import { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   // Navigation
//   ArrowLeft,
//   ArrowRight,
//   ChevronDown,

//   // Actions
//   Plus,
//   Trash2,
//   Edit2,
//   Share2,
//   Copy,
//   Download,
//   Upload,
//   Save,
//   RefreshCw,

//   // UI
//   X,
//   Check,
//   Search,
//   Settings,
//   Bell,
//   Eye,
//   EyeOff,
//   Lock,
//   Unlock,

//   // Diagram
//   Database,
//   Table,
//   Link,
//   GitBranch,

//   // User
//   User,
//   Users,
//   LogOut,
//   Shield,

//   // File
//   File,
//   FileText,
//   Folder,

//   // Editor
//   Undo2,
//   Redo2,
//   ZoomIn,
//   ZoomOut,
//   Maximize,
//   Minimize,
//   Layout,

//   // Status
//   AlertCircle,
//   CheckCircle,
//   Info,
//   Clock,
//   Calendar,
// } from "lucide-react";

// const NAV_ITEMS = ["Projects", "Workspaces", "Collaborators"];

// export default function HomeHeader({ activePage = "Projects", onNavChange }) {
//   const navigate = useNavigate();
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   const user = (() => {
//     try {
//       return JSON.parse(localStorage.getItem("user"));
//     } catch {
//       return null;
//     }
//   })();

//   const isAdmin = user?.roles?.includes("ROLE_ADMIN") ?? false;

//   const initial = user?.name
//     ? user.name
//         .split(" ")
//         .map((w) => w[0])
//         .slice(0, 2)
//         .join("")
//         .toUpperCase()
//     : "U";

//   useEffect(() => {
//     if (!dropdownOpen) return;
//     const handler = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target))
//         setDropdownOpen(false);
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, [dropdownOpen]);

//   const handleLogout = async () => {
//     const token = localStorage.getItem("token");
//     try {
//       await fetch("/api/auth/logout", {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//       });
//     } catch {}
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     navigate("/auth");
//   };

//   const handleNavClick = (item) => {
//     if (item === "Collaborators") {
//       navigate("/shared-with-me");
//       return;
//     }
//     if (item === "Workspaces") {
//       navigate("/workspaces");
//       return;
//     }
//     if (item === "Projects") {
//       navigate("/");
//       return;
//     }
//     onNavChange?.(item);
//   };

//   return (
//     <div
//       style={{
//         height: 52,
//         backgroundColor: tokens.color.white,
//         borderBottom: `1px solid ${tokens.color.border}`,
//         display: "flex",
//         alignItems: "center",
//         paddingLeft: tokens.space.xl,
//         paddingRight: tokens.space.lg,
//         flexShrink: 0,
//       }}
//     >
//       {/* Logo */}
//       <span
//         style={{
//           fontWeight: tokens.weight.extrabold,
//           fontSize: 30,
//           color: tokens.color.textBase,
//           letterSpacing: "-0.02em",
//           marginRight: 32,
//           flexShrink: 0,
//         }}
//       >
//         P<span style={{ color: tokens.color.primary }}>Uml</span>
//       </span>

//       {/* Nav */}
//       <nav style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
//         {NAV_ITEMS.map((item) => {
//           const isActive = activePage === item;
//           return (
//             <button
//               key={item}
//               onClick={() => handleNavClick(item)}
//               style={{
//                 padding: "6px 14px",
//                 borderRadius: tokens.radius.md,
//                 fontSize: tokens.font.md,
//                 fontWeight: isActive
//                   ? tokens.weight.semibold
//                   : tokens.weight.normal,
//                 color: isActive ? tokens.color.primary : tokens.color.textSub,
//                 backgroundColor: isActive
//                   ? tokens.color.primary + "12"
//                   : "transparent",
//                 border: "none",
//                 cursor: "pointer",
//                 transition: "all 0.15s",
//               }}
//             >
//               {item}
//             </button>
//           );
//         })}
//       </nav>

//       {/* Right actions */}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: tokens.space.sm,
//         }}
//       >
//         {/* Notification */}
//         <button
//           style={{
//             width: 34,
//             height: 34,
//             borderRadius: tokens.radius.md,
//             border: `1px solid ${tokens.color.border}`,
//             backgroundColor: tokens.color.surface,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             cursor: "pointer",
//             position: "relative",
//           }}
//         >
//           <svg
//             width="15"
//             height="15"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke={tokens.color.textSub}
//             strokeWidth="2"
//             strokeLinecap="round"
//           >
//             <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
//             <path d="M13.73 21a2 2 0 0 1-3.46 0" />
//           </svg>
//           <div
//             style={{
//               position: "absolute",
//               top: 6,
//               right: 6,
//               width: 6,
//               height: 6,
//               borderRadius: "50%",
//               backgroundColor: tokens.color.danger,
//               border: `1.5px solid ${tokens.color.white}`,
//             }}
//           />
//         </button>

//         {/* Avatar + dropdown */}
//         <div ref={dropdownRef} style={{ position: "relative" }}>
//           <button
//             onClick={() => setDropdownOpen((v) => !v)}
//             style={{
//               width: 32,
//               height: 32,
//               borderRadius: "50%",
//               backgroundColor: tokens.color.primary,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontSize: tokens.font.sm,
//               fontWeight: tokens.weight.bold,
//               color: tokens.color.white,
//               border: "none",
//               cursor: "pointer",
//             }}
//           >
//             {initial}
//           </button>

//           {dropdownOpen && (
//             <div
//               style={{
//                 position: "absolute",
//                 right: 0,
//                 top: "calc(100% + 8px)",
//                 width: 200,
//                 backgroundColor: tokens.color.white,
//                 border: `1px solid ${tokens.color.border}`,
//                 borderRadius: tokens.radius.lg,
//                 boxShadow: tokens.shadow.md,
//                 overflow: "hidden",
//                 zIndex: 100,
//               }}
//             >
//               {/* User info */}
//               <div
//                 style={{
//                   padding: "12px 14px",
//                   borderBottom: `1px solid ${tokens.color.surface}`,
//                 }}
//               >
//                 <p
//                   style={{
//                     fontSize: tokens.font.md,
//                     fontWeight: tokens.weight.semibold,
//                     color: tokens.color.textBase,
//                     marginBottom: 2,
//                   }}
//                 >
//                   {user?.name || "User"}
//                 </p>
//                 <p
//                   style={{
//                     fontSize: tokens.font.sm,
//                     color: tokens.color.textSub,
//                   }}
//                 >
//                   {user?.email || ""}
//                 </p>
//               </div>

//               {/* Profile */}
//               <button
//                 onClick={() => {
//                   setDropdownOpen(false);
//                   navigate("/profile");
//                 }}
//                 style={{
//                   width: "100%",
//                   padding: "10px 14px",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: tokens.space.sm,
//                   border: "none",
//                   backgroundColor: "transparent",
//                   fontSize: tokens.font.md,
//                   color: tokens.color.textBase,
//                   cursor: "pointer",
//                   textAlign: "left",
//                 }}
//                 onMouseEnter={(e) =>
//                   (e.currentTarget.style.backgroundColor = tokens.color.surface)
//                 }
//                 onMouseLeave={(e) =>
//                   (e.currentTarget.style.backgroundColor = "transparent")
//                 }
//               >
//                 <svg
//                   width="14"
//                   height="14"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                 >
//                   <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
//                   <circle cx="12" cy="7" r="4" />
//                 </svg>
//                 Hồ sơ cá nhân
//               </button>

//               {/* Admin Dashboard */}
//               {isAdmin && (
//                 <button
//                   onClick={() => {
//                     setDropdownOpen(false);
//                     navigate("/admin");
//                   }}
//                   style={{
//                     width: "100%",
//                     padding: "10px 14px",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: tokens.space.sm,
//                     border: "none",
//                     backgroundColor: "transparent",
//                     fontSize: tokens.font.md,
//                     color: tokens.color.textBase,
//                     cursor: "pointer",
//                     textAlign: "left",
//                   }}
//                   onMouseEnter={(e) =>
//                     (e.currentTarget.style.backgroundColor =
//                       tokens.color.surface)
//                   }
//                   onMouseLeave={(e) =>
//                     (e.currentTarget.style.backgroundColor = "transparent")
//                   }
//                 >
//                   <svg
//                     width="14"
//                     height="14"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                   >
//                     <rect x="3" y="3" width="7" height="7" />
//                     <rect x="14" y="3" width="7" height="7" />
//                     <rect x="3" y="14" width="7" height="7" />
//                     <rect x="14" y="14" width="7" height="7" />
//                   </svg>
//                   Admin Dashboard
//                 </button>
//               )}

//               {/* Logout */}
//               <button
//                 onClick={handleLogout}
//                 style={{
//                   width: "100%",
//                   padding: "10px 14px",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: tokens.space.sm,
//                   border: "none",
//                   backgroundColor: "transparent",
//                   fontSize: tokens.font.md,
//                   color: tokens.color.danger,
//                   cursor: "pointer",
//                   textAlign: "left",
//                   borderTop: `1px solid ${tokens.color.surface}`,
//                 }}
//                 onMouseEnter={(e) =>
//                   (e.currentTarget.style.backgroundColor = "#fff1f2")
//                 }
//                 onMouseLeave={(e) =>
//                   (e.currentTarget.style.backgroundColor = "transparent")
//                 }
//               >
//                 <svg
//                   width="14"
//                   height="14"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                 >
//                   <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
//                   <polyline points="16 17 21 12 16 7" />
//                   <line x1="21" y1="12" x2="9" y2="12" />
//                 </svg>
//                 Đăng xuất
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useNavigate } from "react-router-dom";
import { tokens } from "../../../shared/constants/Tokens";
import Logo from "../../../shared/components/Logo";
import NavBar from "./NavBar";
import UserDropdown from "./UserDropdown";

export default function HomeHeader({ activePage = "Projects", onNavChange }) {
  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const isAdmin = user?.roles?.includes("ROLE_ADMIN") ?? false;

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  return (
    <div
      style={{
        height: 52,
        backgroundColor: tokens.color.white,
        borderBottom: `1px solid ${tokens.color.border}`,
        display: "flex",
        alignItems: "center",
        paddingLeft: tokens.space.xl,
        paddingRight: tokens.space.lg,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ marginRight: 32 }}>
        <Logo size={22} />
      </div>

      {/* Nav */}
      <NavBar activePage={activePage} />

      {/* Right */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: tokens.space.sm,
        }}
      >
        {/* Bell — ẩn chấm đỏ vì chưa có logic */}
        {/* <button
          style={{
            ...tokens.button.icon,
            position: "relative",
          }}
        >
          <Bell size={15} color={tokens.color.textSub} />
        </button> */}

        {/* Avatar + Dropdown */}
        <UserDropdown user={user} isAdmin={isAdmin} onLogout={handleLogout} />
      </div>
    </div>
  );
}
