"use client";
import { Button } from "@/components/ui/button";
import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const createFile = useMutation(api.files.createFiles);
  const files = useQuery(api.files.getFiles);

  console.log(files);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <SignedIn>
        <SignOutButton />
      </SignedIn>

      <SignedOut>
        <SignInButton mode="modal" />
      </SignedOut>

      {files?.map(({ _id, name }) => <div key={_id}>{name}</div>)}

      <Button
        type="button"
        onClick={() => {
          createFile({
            name: "Hello, World!",
          });
        }}
      >
        Do something
      </Button>
    </main>
  );
}
