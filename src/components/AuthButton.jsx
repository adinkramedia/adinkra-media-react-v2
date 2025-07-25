import { useAuth0 } from "@auth0/auth0-react";

export default function AuthButton() {
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0();

  if (isLoading) return <p className="text-sm text-adinkra-gold/70">Loading...</p>;

  return isAuthenticated ? (
    <div className="flex items-center gap-3">
      <p className="text-sm text-adinkra-gold/80">Welcome, {user.name || user.email}</p>
      <button
        onClick={() => logout({ returnTo: window.location.origin })}
        className="bg-adinkra-highlight px-4 py-2 rounded-full text-adinkra-bg text-sm font-semibold hover:bg-adinkra-highlight/80 transition"
      >
        Log Out
      </button>
    </div>
  ) : (
    <button
      onClick={() => loginWithRedirect()}
      className="bg-adinkra-highlight px-4 py-2 rounded-full text-adinkra-bg text-sm font-semibold hover:bg-adinkra-highlight/80 transition"
    >
      Log In
    </button>
  );
}
