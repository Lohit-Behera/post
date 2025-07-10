import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useDispatchWithToast } from "@/hooks/useDispatch";
import { fetchLogout } from "@/redux/feature/authSlice";
import { useAppSelector } from "@/redux/store";

function Header() {
  const navigate = useNavigate();
  const auth = useAppSelector((state) => state.auth.auth);
  const logout = useDispatchWithToast(fetchLogout, {
    onSuccess: () => {
      navigate("/login");
    },
  });
  return (
    <header className="z-20 w-full sticky top-0 p-2 backdrop-blur bg-background/80 ">
      <nav className="flex justify-between space-x-1">
        {auth ? (
          <Button onClick={() => navigate("/")}>Home</Button>
        ) : (
          <Button onClick={() => logout()}>Logout</Button>
        )}
      </nav>
    </header>
  );
}

export default Header;
