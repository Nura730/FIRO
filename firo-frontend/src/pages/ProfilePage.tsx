import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-black p-4 text-white">
      <h1 className="mb-6 text-3xl font-bold">
        Profile
      </h1>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-4">
          <p className="text-sm text-zinc-400">
            Name
          </p>

          <h2 className="text-xl font-semibold">
            {user.name || "Unknown"}
          </h2>
        </div>

        <div>
          <p className="text-sm text-zinc-400">
            Email
          </p>

          <h2 className="text-lg">
            {user.email || "Unknown"}
          </h2>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 w-full rounded-2xl bg-red-500 p-4 font-semibold text-white"
      >
        Logout
      </button>
    </div>
  );
}