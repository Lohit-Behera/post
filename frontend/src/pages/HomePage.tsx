import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchUserDetails } from "@/redux/feature/userSlice";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function HomePage() {
  const dispatch = useAppDispatch();
  const { user, userStatus, userError } = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUserDetails());
  }, [dispatch]);

  if (userStatus === "loading") return <div>Loading user details...</div>;
  if (userStatus === "failed") return <div>{userError}</div>;
  if (!user || !user._id) return <div>No user data found.</div>;

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Welcome, {user.fullName}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={user.avatar} alt={user.fullName} />
            <AvatarFallback>{user.fullName?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <div className="font-semibold">{user.username}</div>
            <div className="text-muted-foreground">{user.email}</div>
            <div className="mt-2 text-xs">
              Role: {user.role} <br />
              Verified: {user.isVerified ? "Yes" : "No"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HomePage;
