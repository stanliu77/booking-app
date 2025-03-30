import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (
      <div className="flex justify-center items-start pt-20 min-h-screen">
        <SignIn />
      </div>
    );
  }

  