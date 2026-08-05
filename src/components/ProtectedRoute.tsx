import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import Loading from "./Loading";
import { useAuth } from "../hooks/useAuth";

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}
